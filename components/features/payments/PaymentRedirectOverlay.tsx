export default function PaymentRedirectOverlay({ mode = "production" }: { mode?: string }) {
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-brand-900/90 p-6 text-white" role="alertdialog" aria-modal="true" aria-labelledby="payment-redirect-title" aria-describedby="payment-redirect-description">
    <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center text-brand-900 shadow-2xl">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700" aria-hidden="true" />
      <h1 id="payment-redirect-title" className="mt-6 text-2xl font-semibold">Preparando tu pago con Wompi</h1>
      <p id="payment-redirect-description" className="mt-3 leading-7 text-slate-600">Serás redirigido a Wompi para completar tu {mode === "sandbox" ? "prueba de pago" : "pago"}. No cierres esta ventana ni pulses atrás.</p>
      <p className="mt-5 text-sm font-semibold text-brand-700">Estamos verificando tu pedido…</p>
    </div>
  </div>;
}
