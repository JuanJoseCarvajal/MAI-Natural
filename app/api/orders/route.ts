import { getWompiConfiguration, wompiReady } from "@/lib/wompi-server";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { checkoutSchema } from "@/lib/validators/checkout";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAllProducts } from "@/lib/products.server";
import { evaluateDiscountCode } from "@/lib/discounts.server";
import { bancolombiaConfig } from "@/lib/bank-transfer";
import { sendOrderPendingConfirmationEmail } from "@/lib/orders";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Revisa tus datos." }, { status: 400 });
    const body = parsed.data;
    if (body.paymentMethod.startsWith("wompi") && (!await wompiReady() || body.paymentMethod !== (getWompiConfiguration().mode === "production" ? "wompi" : "wompi_sandbox"))) return NextResponse.json({ error: "Wompi no está disponible para este entorno. Elige transferencia." }, { status: 503 });
    const { customerName, customerEmail, customerPhone } = body;
    const rawItems = body.items;

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
          quantity: item.quantity,
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

    if (orderItems.length !== rawItems.length) {
      return NextResponse.json(
        { error: "No encontramos productos validos para crear la orden." },
        { status: 400 }
      );
    }

    if (rawItems.some(item => { const product = products.find(p => p.id === item.id); return product?.stock !== undefined && product.stock < item.quantity; })) {
      return NextResponse.json({ error: "La cantidad supera la disponibilidad. Revisa tu carrito." }, { status: 409 });
    }
    let totalInCents = orderItems.reduce(
      (sum, item) => sum + item.amountInCents * item.quantity,
      0
    );
    let appliedDiscountCode: string | undefined;

    if (body.discountCode?.trim()) {
      const discount = await evaluateDiscountCode(body.discountCode.trim(), rawItems);
      if (!discount.valid) return NextResponse.json({ error: discount.message }, { status: 400 });
      if (discount.valid) {
        totalInCents = discount.discountedSubtotalInCents;
        appliedDiscountCode = discount.code;
      }
    }

    if (!Number.isSafeInteger(totalInCents) || totalInCents <= 0) return NextResponse.json({ error: "No pudimos validar el total." }, { status: 400 });
    // Guest checkout never modifies or links an account by an unverified email.
    const user = session?.user?.email ? await db.user.findUnique({ where: { email: session.user.email } }) : null;

    const order = await db.order.create({
      data: {
        userId: user?.id ?? `guest-${randomUUID()}`,
        customerName,
        customerEmail,
        customerPhone,
        items: orderItems,
        total: totalInCents,
        subtotalInCents: totalInCents,
        status: "pending_confirmation",
        paymentStatus: "pending_confirmation",
        paymentMethod: body.paymentMethod,
        shippingStatus: "pending_confirmation",
        discountCode: appliedDiscountCode,
        proofInstructions: `Enviar comprobante a ${bancolombiaConfig.proofEmail} o al WhatsApp ${bancolombiaConfig.proofWhatsapp}.`,
        notes: `Entrega: ${body.city}. Dirección: ${body.address}. Envío por cotizar y aceptar antes del pago.`,
      },
    });

    let emailSent = false;

    try {
      const result = body.paymentMethod.startsWith("wompi") ? { sent: false } : await sendOrderPendingConfirmationEmail({
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
      order: { id: order.id, total: order.total, status: order.status },
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
