
"use client";
import { useEffect, useRef, useState } from "react";
import { SiteText } from "@/components/common/SiteText";
export default function PaymentRedirectOverlay({ mode = "production" }: { mode?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    const timer = setTimeout(() => setSlow(true), 8000);
    return () => { clearTimeout(timer); element?.close(); };
  }, []);
  return <dialog ref={dialog} onCancel={event => event.preventDefault()} className="fixed inset-0 z-[100] m-auto w-full max-w-lg border-0 bg-transparent p-6 backdrop:bg-brand-900/90" aria-labelledby="payment-redirect-title" aria-describedby="payment-redirect-description">
    <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center text-brand-900 shadow-2xl">
      <div className="mx-auto h-12 w-12 animate-spin motion-reduce:animate-none rounded-full border-4 border-brand-100 border-t-brand-700" aria-hidden="true" />
      <h1 id="payment-redirect-title" className="mt-6 text-2xl font-semibold"><SiteText id="65940dbe5baa49cd534f">{"Preparando tu pago con Wompi"}</SiteText></h1>
      <p id="payment-redirect-description" className="mt-3 leading-7 text-slate-600"><SiteText id="d9ebc6dfd94db16a562d">{"Serás redirigido a Wompi para completar tu "}</SiteText>{mode === "sandbox" ? "prueba de pago" : "pago"}<SiteText id="823412a7cd58d2aaff9f">{". No cierres esta ventana ni pulses atrás."}</SiteText></p>
      <p className="mt-5 text-sm font-semibold text-brand-700"><SiteText id="16efde1c378891fde484">{"Estamos verificando tu pedido…"}</SiteText></p>
      <p role="status" className="mt-3 text-sm text-slate-600">{slow ? "La conexión está tardando un poco más. Cuando esté lista, te redirigiremos automáticamente a Wompi. No necesitas hacer clic de nuevo." : ""}</p>
    </div>
  </dialog>;
}
