import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fetchWompiTransaction, getWompiConfiguration, verifyWompiEvent } from "@/lib/wompi-server";

export async function POST(request: NextRequest) {
  const config = getWompiConfiguration();
  if (!config.configured) return NextResponse.json({ error: "Wompi no disponible" }, { status: 503 });
  const raw = await request.text();
  if (raw.length > 65536) return NextResponse.json({ error: "Evento demasiado grande" }, { status: 413 });
  let input: unknown;
  try { input = JSON.parse(raw); } catch { return NextResponse.json({ error: "Evento inválido" }, { status: 400 }); }
  const event = verifyWompiEvent(input, config.eventsSecret);
  if (!event) return NextResponse.json({ error: "Firma o evento inválido" }, { status: 401 });
  try {
    // Re-query Wompi: never trust unsigned fields or stale/replayed payload status.
    const transaction = await fetchWompiTransaction(event.data.transaction.id);
    const orderId = transaction.reference.replace(/^mai-/, "");
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    if (order.paymentMethod !== "wompi_sandbox" || transaction.reference !== `mai-${order.id}` || transaction.amount_in_cents !== order.total) return NextResponse.json({ error: "El pago no coincide con el pedido" }, { status: 409 });
    if (order.wompiTransactionId && order.wompiTransactionId !== transaction.id) return NextResponse.json({ error: "Otra transacción ya está asociada" }, { status: 409 });
    if (order.wompiStatus === "APPROVED" || order.wompiStatus === transaction.status) return NextResponse.json({ received: true, sandbox: true });
    await db.order.update({ where: { id: order.id }, data: {
      wompiTransactionId: transaction.id, wompiStatus: transaction.status,
      paymentStatus: `sandbox_${transaction.status.toLowerCase()}`,
    } });
    return NextResponse.json({ received: true, sandbox: true });
  } catch {
    return NextResponse.json({ error: "Verificación temporalmente no disponible" }, { status: 503 });
  }
}
