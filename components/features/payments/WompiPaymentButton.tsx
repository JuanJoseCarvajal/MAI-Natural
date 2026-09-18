"use client";
import { useState } from "react";

export default function WompiPaymentButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function pay() {
    if (loading) return;
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/payments/wompi/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No pudimos iniciar el pago.");
      const url = new URL(data.checkoutUrl);
      if (url.origin !== "https://checkout.wompi.co" || url.pathname !== "/p/") throw new Error("Destino de pago inválido");
      window.location.assign(url.href);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Revisa tu conexión."); setLoading(false); }
  }
  return <div className="mt-6"><button type="button" disabled={loading} onClick={pay} className="w-full rounded-full bg-brand-900 px-6 py-4 text-white disabled:opacity-60">{loading ? "Abriendo Wompi…" : "Ir a Wompi · pago de prueba ↗"}</button><p className="mt-3 text-xs leading-6 text-slate-600">Se abrirá el checkout oficial de Wompi en modo de pruebas. No uses datos de pago reales. El importe simulado corresponde al subtotal; el envío aún no está cotizado.</p>{error && <p role="alert" className="mt-3 text-sm text-red-700">{error} Tu pedido se conserva; no necesitas crearlo otra vez.</p>}</div>;
}
