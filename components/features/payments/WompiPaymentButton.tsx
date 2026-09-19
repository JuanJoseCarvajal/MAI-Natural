"use client";
import { useState } from "react";

export default function WompiPaymentButton({ orderId, appointmentId, mode = "sandbox", quoteVersion }: { orderId?: string; appointmentId?: string; mode?: string; quoteVersion?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function pay() {
    if (loading) return;
    setLoading(true); setError("");
    try {
      const response = await fetch(appointmentId ? "/api/payments/wompi/appointments/checkout" : "/api/payments/wompi/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(appointmentId ? { appointmentId } : { orderId, quoteVersion }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No pudimos iniciar el pago.");
      const url = new URL(data.checkoutUrl);
      if (url.origin !== "https://checkout.wompi.co" || url.pathname !== "/p/") throw new Error("Destino de pago inválido");
      window.location.assign(url.href);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Revisa tu conexión."); setLoading(false); }
  }
  return <div className="mt-6"><button type="button" disabled={loading} onClick={pay} className="w-full rounded-full bg-brand-900 px-6 py-4 text-white disabled:opacity-60">{loading ? "Abriendo Wompi…" : (mode === "production" ? "Aceptar total y pagar con Wompi ↗" : "Ir a Wompi · pago de prueba ↗")}</button><p className="mt-3 text-xs leading-6 text-slate-600">{mode === "production" ? "Se abrirá el checkout oficial de Wompi. Confirmaremos el resultado directamente con el proveedor. No repitas el pago si queda pendiente." : <>Se abrirá Wompi en modo de pruebas. No uses datos de pago reales. {appointmentId ? "La simulación no confirma tu cita." : "El importe simulado es el subtotal sin envío."}</>}</p>{error && <p role="alert" className="mt-3 text-sm text-red-700">{error} Tu solicitud se conserva; no necesitas crearla otra vez.</p>}</div>;
}
