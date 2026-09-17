import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildWompiCheckoutUrl, buildWompiIntegritySignature } from "@/lib/wompi";

// The current order adapter is volatile. Live payments must remain blocked until
// durable orders, shipping quotes and webhook reconciliation are implemented.
export async function POST(request: NextRequest) {
  const publicKey = process.env.WOMPI_PUBLIC_KEY;
  const secret = process.env.WOMPI_INTEGRITY_SECRET;
  if (process.env.WOMPI_SANDBOX_ENABLED !== "true" || !publicKey?.startsWith("pub_test_") || !secret?.startsWith("test_integrity_")) {
    return NextResponse.json({ error: "Los pagos en línea todavía no están disponibles. Continúa con el pedido por transferencia." }, { status: 503 });
  }
  const body = await request.json().catch(() => null);
  if (typeof body?.orderId !== "string") return NextResponse.json({ error: "Pedido requerido." }, { status: 400 });
  const order = await db.order.findUnique({ where: { id: body.orderId } });
  if (!order || order.paymentStatus === "confirmed") return NextResponse.json({ error: "Pedido no disponible para pago." }, { status: 409 });
  const reference = `mai-${order.id}`;
  const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const checkoutUrl = buildWompiCheckoutUrl({ publicKey, currency: "COP", amountInCents: order.total, reference, redirectUrl: `${origin}/checkout/result?orderId=${encodeURIComponent(order.id)}`, signature: buildWompiIntegritySignature(reference, order.total, "COP", secret) });
  return NextResponse.json({ checkoutUrl, sandbox: true });
}
