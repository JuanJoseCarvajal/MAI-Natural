import { NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/lib/products";
import {
  buildWompiCheckoutUrl,
  buildWompiIntegritySignature,
  createWompiReference,
} from "@/lib/wompi";

type CartItemInput = { id: string; quantity: number };

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      productId?: string;
      items?: CartItemInput[];
    };

    const publicKey = process.env.WOMPI_PUBLIC_KEY;
    const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;

    if (!publicKey || !integritySecret) {
      return NextResponse.json(
        { error: "Faltan variables WOMPI_PUBLIC_KEY o WOMPI_INTEGRITY_SECRET" },
        { status: 500 }
      );
    }

    const currency = "COP";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

    // Cart mode: array of { id, quantity }
    if (body.items && body.items.length > 0) {
      let totalInCents = 0;
      for (const item of body.items) {
        const product = getProductById(item.id);
        if (!product) {
          return NextResponse.json({ error: `Producto ${item.id} no encontrado` }, { status: 404 });
        }
        totalInCents += product.amountInCents * item.quantity;
      }

      const reference = createWompiReference("cart");
      const signature = buildWompiIntegritySignature(reference, totalInCents, currency, integritySecret);
      const redirectUrl = `${appUrl}/checkout/result`;

      const checkoutUrl = buildWompiCheckoutUrl({
        publicKey,
        currency,
        amountInCents: totalInCents,
        reference,
        redirectUrl,
        signature,
      });

      return NextResponse.json({ checkoutUrl });
    }

    // Single product mode: { productId }
    const productId = body?.productId;
    if (!productId) {
      return NextResponse.json({ error: "productId o items requerido" }, { status: 400 });
    }

    const product = getProductById(productId);
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const reference = createWompiReference(product.id);
    const signature = buildWompiIntegritySignature(
      reference,
      product.amountInCents,
      currency,
      integritySecret
    );
    const redirectUrl = `${appUrl}/checkout/result?product=${encodeURIComponent(product.id)}`;

    const checkoutUrl = buildWompiCheckoutUrl({
      publicKey,
      currency,
      amountInCents: product.amountInCents,
      reference,
      redirectUrl,
      signature,
    });

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    return NextResponse.json(
      { error: "No fue posible iniciar el pago con Wompi" },
      { status: 500 }
    );
  }
}
