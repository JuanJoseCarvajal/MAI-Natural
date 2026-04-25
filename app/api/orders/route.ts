import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAllProducts } from "@/lib/products.server";
import { evaluateDiscountCode } from "@/lib/discounts.server";
import { bancolombiaConfig } from "@/lib/bank-transfer";
import { sendOrderPendingConfirmationEmail } from "@/lib/orders";

type CreateOrderBody = {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  items?: Array<{ id: string; quantity: number }>;
  discountCode?: string;
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = (await request.json()) as CreateOrderBody;

    const customerName = body.customerName?.trim();
    const customerEmail = body.customerEmail?.trim().toLowerCase();
    const customerPhone = body.customerPhone?.trim();
    const rawItems = body.items ?? [];

    if (!customerName || !customerEmail || !customerPhone || rawItems.length === 0) {
      return NextResponse.json(
        { error: "Completa tus datos y agrega al menos un producto antes de crear la orden." },
        { status: 400 }
      );
    }

    const products = await getAllProducts();
    const orderItems = rawItems
      .map((item) => {
        const product = products.find((product) => product.id === item.id);
        if (!product) return null;
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          amountInCents: product.amountInCents,
          quantity: Math.max(1, Number(item.quantity) || 1),
        };
      })
      .filter(
        (
          item
        ): item is {
          id: string;
          name: string;
          price: string;
          amountInCents: number;
          quantity: number;
        } => Boolean(item)
      );

    if (orderItems.length === 0) {
      return NextResponse.json(
        { error: "No encontramos productos validos para crear la orden." },
        { status: 400 }
      );
    }

    let totalInCents = orderItems.reduce(
      (sum, item) => sum + item.amountInCents * item.quantity,
      0
    );
    let appliedDiscountCode: string | undefined;

    if (body.discountCode?.trim()) {
      const discount = await evaluateDiscountCode(body.discountCode.trim(), rawItems);
      if (discount.valid) {
        totalInCents = discount.discountedSubtotalInCents;
        appliedDiscountCode = discount.code;
      }
    }

    const existingUser =
      (session?.user?.email ? await db.user.findUnique({ where: { email: session.user.email } }) : null) ??
      (await db.user.findUnique({ where: { email: customerEmail } }));

    const user = existingUser
      ? await db.user.update({
          where: existingUser.id ? { id: existingUser.id } : { email: customerEmail },
          data: {
            name: customerName,
            phone: customerPhone,
          },
        })
      : await db.user.create({
          data: {
            email: customerEmail,
            name: customerName,
            phone: customerPhone,
            password: "",
          },
        });

    if (!user) {
      return NextResponse.json({ error: "No fue posible preparar el cliente." }, { status: 500 });
    }

    const order = await db.order.create({
      data: {
        userId: user.id,
        customerName,
        customerEmail,
        customerPhone,
        items: orderItems,
        total: totalInCents,
        status: "pending_confirmation",
        paymentStatus: "pending_confirmation",
        paymentMethod: "bank_transfer_bancolombia",
        shippingStatus: "pending_confirmation",
        discountCode: appliedDiscountCode,
        proofInstructions: `Enviar comprobante a ${bancolombiaConfig.proofEmail} o al WhatsApp ${bancolombiaConfig.proofWhatsapp}.`,
        notes: "Orden creada. Pendiente de consignacion Bancolombia y confirmacion manual.",
      },
    });

    let emailSent = false;

    try {
      const result = await sendOrderPendingConfirmationEmail({
        customerEmail,
        customerName,
        orderId: order.id,
        totalInCents,
        items: orderItems,
      });
      emailSent = result.sent;
    } catch (error) {
      console.error("Error enviando correo de orden:", error);
    }

    return NextResponse.json({
      success: true,
      order,
      emailSent,
    });
  } catch (error) {
    console.error("Error creando orden:", error);
    return NextResponse.json(
      { error: "No fue posible crear la orden en este momento." },
      { status: 500 }
    );
  }
}
