"use client";
import { SiteText } from "@/components/common/SiteText";

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
  return <div className="mt-6">{loading && <PaymentRedirectOverlay mode={mode} />}<button type="button" disabled={loading} onClick={pay} className="w-full rounded-full bg-brand-900 px-6 py-4 text-white disabled:opacity-60">{loading ? <SiteText id="b45dc3e421a60c86c208">{"Redirigiendo a Wompi…"}</SiteText> : (mode === "production" ? <SiteText id="7537859530a14887f3e4">{"Pagar con Wompi ↗"}</SiteText> : <SiteText id="b86b67105a7a6912c680">{"Ir a Wompi · pago de prueba ↗"}</SiteText>)}</button><p className="mt-3 text-xs leading-6 text-slate-600">{mode === "production" ? <SiteText id="41eb585d477c5ac8545a">{"Se abrirá el checkout oficial de Wompi. Confirmaremos el resultado directamente con el proveedor. No repitas el pago si queda pendiente."}</SiteText> : <><SiteText id="4ca6a0904e20b66149cf">{"Se abrirá Wompi en modo de pruebas. No uses datos de pago reales. "}</SiteText>{appointmentId ? <SiteText id="809d7e83858c49d7783f">{"La simulación no confirma tu cita."}</SiteText> : <SiteText id="d1fe7a089329d35dbfe2">{"El importe simulado corresponde al total mostrado."}</SiteText>}</>}</p>{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}<SiteText id="eccc76a0d5ff7f02db49">{" Tu solicitud se conserva; no necesitas crearla otra vez."}</SiteText></p>}</div>;
}
