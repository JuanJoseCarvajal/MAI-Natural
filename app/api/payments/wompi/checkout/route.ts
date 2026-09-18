import { NextRequest, NextResponse } from "next/server";
import { getWompiConfiguration } from "@/lib/wompi-server";
import { db } from "@/lib/db";
import { buildWompiCheckoutUrl, buildWompiIntegritySignature } from "@/lib/wompi";

// The current order adapter is volatile. Live payments must remain blocked until
// durable orders, shipping quotes and webhook reconciliation are implemented.
export async function POST(request: NextRequest) {
  const config = getWompiConfiguration();
  if (!config.configured) return NextResponse.json({ error: "Wompi de pruebas aún no está configurado." }, { status: 503 });
  const { publicKey, integritySecret: secret } = config;
  const body = await request.json().catch(() => null);
  if (typeof body?.orderId !== "string" || !/^[a-f0-9-]{36}$/.test(body.orderId)) return NextResponse.json({ error: "Pedido requerido." }, { status: 400 });
  const order = await db.order.findUnique({ where: { id: body.orderId } });
  if (!order || order.paymentMethod !== "wompi_sandbox" || order.paymentStatus === "confirmed" || order.wompiStatus === "APPROVED" || order.status === "cancelled") return NextResponse.json({ error: "Pedido no disponible para pago." }, { status: 409 });
  const reference = `mai-${order.id}`;
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";
  const checkoutUrl = buildWompiCheckoutUrl({ publicKey, currency: "COP", amountInCents: order.total, reference, redirectUrl: `${origin}/checkout/result?orderId=${encodeURIComponent(order.id)}`, signature: buildWompiIntegritySignature(reference, order.total, "COP", secret) });
  return NextResponse.json({ checkoutUrl, sandbox: true });
}
