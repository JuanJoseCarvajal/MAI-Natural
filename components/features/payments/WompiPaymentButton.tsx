"use client";
import { useState } from "react";
import { openWompiCheckout } from "@/lib/wompi-client";
import PaymentRedirectOverlay from "./PaymentRedirectOverlay";

export default function WompiPaymentButton({ orderId, appointmentId, mode = "sandbox", quoteVersion }: { orderId?: string; appointmentId?: string; mode?: string; quoteVersion?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function pay() {
    if (loading) return;
    setLoading(true); setError("");
    try {
      if (!appointmentId && !orderId) throw new Error("Solicitud no disponible.");
      await openWompiCheckout(appointmentId ? { appointmentId } : { orderId: orderId!, quoteVersion });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Revisa tu conexión."); setLoading(false); }
  }
  return <div className="mt-6">{loading && <PaymentRedirectOverlay mode={mode} />}<button type="button" disabled={loading} onClick={pay} className="w-full rounded-full bg-brand-900 px-6 py-4 text-white disabled:opacity-60">{loading ? "Redirigiendo a Wompi…" : (mode === "production" ? "Pagar con Wompi ↗" : "Ir a Wompi · pago de prueba ↗")}</button><p className="mt-3 text-xs leading-6 text-slate-600">{mode === "production" ? "Se abrirá el checkout oficial de Wompi. Confirmaremos el resultado directamente con el proveedor. No repitas el pago si queda pendiente." : <>Se abrirá Wompi en modo de pruebas. No uses datos de pago reales. {appointmentId ? "La simulación no confirma tu cita." : "El importe simulado corresponde al total mostrado."}</>}</p>{error && <p role="alert" className="mt-3 text-sm text-red-700">{error} Tu solicitud se conserva; no necesitas crearla otra vez.</p>}</div>;
}
