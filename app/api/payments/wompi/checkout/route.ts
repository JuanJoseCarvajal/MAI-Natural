import { NextRequest, NextResponse } from "next/server";
import { getWompiConfiguration, wompiReady } from "@/lib/wompi-server";
import { db, databaseTransaction } from "@/lib/db";
import { buildWompiCheckoutUrl, buildWompiIntegritySignature } from "@/lib/wompi";

// Production requires a migrated database and an explicitly accepted shipping quote.
export async function POST(request: NextRequest) {
  const config = getWompiConfiguration();
  if (!await wompiReady()) return NextResponse.json({ error: "Wompi no está disponible. Tu pedido se conserva; consulta con el equipo." }, { status: 503 });
  const { publicKey, integritySecret: secret } = config;
  const body = await request.json().catch(() => null);
  if (typeof body?.orderId !== "string" || !/^[a-f0-9-]{36}$/.test(body.orderId)) return NextResponse.json({ error: "Pedido requerido." }, { status: 400 });
  return databaseTransaction(async () => {
  const order = await db.order.findUnique({ where: { id: body.orderId } });
  if (!order || order.paymentMethod !== (config.mode === "production" ? "wompi" : "wompi_sandbox") || order.paymentStatus === "confirmed" || order.wompiStatus === "APPROVED" || order.status === "cancelled") return NextResponse.json({ error: "Pedido no disponible para pago." }, { status: 409 });
  if (config.mode === "production") {
    if (!order.quoteVersion || body.quoteVersion !== order.quoteVersion || order.shippingInCents === undefined) return NextResponse.json({ error: "Confirma primero la cotización y el total con envío." }, { status: 409 });
    await db.order.update({ where: { id: order.id }, data: { acceptedQuoteVersion: order.quoteVersion, paymentStarted: true } });
  }
  const reference = `mai-${order.id}`;
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";
  const checkoutUrl = buildWompiCheckoutUrl({ publicKey, currency: "COP", amountInCents: order.total, reference, redirectUrl: `${origin}/checkout/result?orderId=${encodeURIComponent(order.id)}`, signature: buildWompiIntegritySignature(reference, order.total, "COP", secret) });
  return NextResponse.json({ checkoutUrl, sandbox: config.mode === "sandbox" });
  });
}
