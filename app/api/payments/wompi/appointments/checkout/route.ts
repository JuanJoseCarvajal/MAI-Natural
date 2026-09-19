import { NextRequest, NextResponse } from "next/server";
import { db, databaseTransaction } from "@/lib/db";
import { initialConsultation } from "@/lib/consultation";
import { getWompiConfiguration, wompiReady } from "@/lib/wompi-server";
import { buildWompiCheckoutUrl, buildWompiIntegritySignature } from "@/lib/wompi";

export async function POST(request: NextRequest) {
  const config = getWompiConfiguration();
  if (!await wompiReady()) return NextResponse.json({ error: "Wompi no está disponible. Intenta nuevamente más tarde." }, { status: 503 });
  const body = await request.json().catch(() => null);
  if (typeof body?.appointmentId !== "string" || !/^[a-f0-9-]{36}$/i.test(body.appointmentId)) return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  return databaseTransaction(async () => {
  const appointment = await db.appointment.findUnique({ where: { id: body.appointmentId } });
  if (!appointment || appointment.service !== initialConsultation.name || appointment.status !== "pending_payment" || appointment.wompiStatus === "APPROVED" || Date.now() - new Date(appointment.createdAt).getTime() >= 86400000) return NextResponse.json({ error: "La solicitud no está disponible para pago. Contacta al equipo antes de intentar nuevamente." }, { status: 409 });
  if (appointment.paymentMode && appointment.paymentMode !== config.mode) return NextResponse.json({ error: "Esta solicitud pertenece a otro entorno de pago." }, { status: 409 });
  await db.appointment.update({ where: { id: appointment.id }, data: { paymentMode: config.mode as "sandbox" | "production", paymentAmountInCents: initialConsultation.amountInCents } });
  const reference = `mai-appointment-${appointment.id}`;
  const amountInCents = initialConsultation.amountInCents;
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";
  const checkoutUrl = buildWompiCheckoutUrl({ publicKey: config.publicKey, currency: "COP", amountInCents, reference, redirectUrl: `${origin}/services/payment?appointment=${encodeURIComponent(appointment.id)}`, signature: buildWompiIntegritySignature(reference, amountInCents, "COP", config.integritySecret) });
  return NextResponse.json({ checkoutUrl, sandbox: config.mode === "sandbox" });
  });
}
