import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initialConsultation } from "@/lib/consultation";
import { getWompiConfiguration } from "@/lib/wompi-server";
import { buildWompiCheckoutUrl, buildWompiIntegritySignature } from "@/lib/wompi";

export async function POST(request: NextRequest) {
  const config = getWompiConfiguration();
  if (!config.configured) return NextResponse.json({ error: "Wompi de pruebas no está disponible. Coordina la transferencia con el equipo." }, { status: 503 });
  const body = await request.json().catch(() => null);
  if (typeof body?.appointmentId !== "string" || !/^[a-f0-9-]{36}$/i.test(body.appointmentId)) return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  const appointment = await db.appointment.findUnique({ where: { id: body.appointmentId } });
  if (!appointment || appointment.service !== initialConsultation.name || appointment.status !== "pending_payment" || appointment.wompiStatus === "APPROVED" || Date.now() - new Date(appointment.createdAt).getTime() >= 86400000) return NextResponse.json({ error: "La solicitud no está disponible para pago. Contacta al equipo antes de intentar nuevamente." }, { status: 409 });
  const reference = `mai-appointment-${appointment.id}`;
  const amountInCents = initialConsultation.amountInCents;
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";
  const checkoutUrl = buildWompiCheckoutUrl({ publicKey: config.publicKey, currency: "COP", amountInCents, reference, redirectUrl: `${origin}/services/payment?appointment=${encodeURIComponent(appointment.id)}`, signature: buildWompiIntegritySignature(reference, amountInCents, "COP", config.integritySecret) });
  return NextResponse.json({ checkoutUrl, sandbox: true });
}
