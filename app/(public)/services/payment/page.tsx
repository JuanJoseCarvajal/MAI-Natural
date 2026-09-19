import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { initialConsultation } from "@/lib/consultation";
import { fetchWompiTransaction, getWompiConfiguration } from "@/lib/wompi-server";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Resultado del pago de asesoría", robots: { index: false, follow: false } };
export default async function Payment({ searchParams }: { searchParams: Promise<{ appointment?: string; id?: string }> }) {
  const query = await searchParams;
  let message = "No pudimos verificar la transacción. Si ya la iniciaste, consulta con el equipo antes de repetirla.";
  if (query.appointment && query.id) {
    try {
      const appointment = await db.appointment.findUnique({ where: { id: query.appointment } });
      const tx = await fetchWompiTransaction(query.id);
      if (appointment && (appointment.paymentMode ?? "sandbox") === getWompiConfiguration().mode && appointment.service === initialConsultation.name && tx.reference === `mai-appointment-${appointment.id}` && tx.amount_in_cents === (appointment.paymentAmountInCents ?? initialConsultation.amountInCents)) {
        const labels = { APPROVED: "aprobada", DECLINED: "rechazada", PENDING: "pendiente", ERROR: "con error", VOIDED: "anulada" };
        message = appointment.paymentMode === "production" ? `Transacción ${labels[tx.status]}. El equipo verificará su registro y coordinará contigo la cita. No repitas el pago.` : `Simulación ${labels[tx.status]}. No se ha confirmado un cobro real ni la cita.`;
      }
    } catch { /* Keep the verification failure visible without exposing provider details. */ }
  }
  return <main className="mx-auto max-w-2xl px-6 py-24"><h1 className="text-3xl font-bold">Tu asesoría · resultado de Wompi</h1><p role="status" className="my-6">{message}</p><p>El equipo confirma contigo el horario, la modalidad y la recepción del pago. No envíes un segundo pago sin consultar.</p><Link className="mt-8 inline-block underline" href="/services">Volver a asesorías</Link></main>;
}
