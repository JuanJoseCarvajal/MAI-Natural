"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/features/cart/CartContext";
import ImageFrame from "@/components/ui/ImageFrame";
import type { DiscountEvaluation } from "@/lib/discounts";

const money = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value / 100);

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, totalAmountInCents, increment, decrement, removeItem, clearCart } = useCart();
  const [wompiAvailable, setWompiAvailable] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer_bancolombia");
  useEffect(() => { let active = true; fetch("/api/payments/wompi/status").then(response => response.json()).then(data => { if (active) setWompiAvailable(data.available === true); }).catch(() => {}); return () => { active = false; }; }, []);
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState<DiscountEvaluation | null>(null);
  const [discountMessage, setDiscountMessage] = useState("");
  const [validating, setValidating] = useState(false);
  const signature = JSON.stringify(items.map(({ id, quantity }) => ({ id, quantity })));
  const currentSignature = useRef(signature);
  currentSignature.current = signature;
  useEffect(() => { setDiscount(null); setDiscountMessage(""); }, [signature]);

  async function applyDiscount() {
    if (!code.trim()) return;
    const snapshot = signature;
    setValidating(true);
    try {
      const res = await fetch("/api/discounts/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, items: JSON.parse(signature) }) });
      const data = await res.json() as DiscountEvaluation;
      if (snapshot !== currentSignature.current) return;
      setDiscount(res.ok && data.valid ? data : null);
      setDiscountMessage(res.ok && data.valid ? `Código ${data.code} aplicado.` : data.message || "No se pudo aplicar el código.");
    } catch { setDiscountMessage("No pudimos validar el código. Inténtalo otra vez."); }
    finally { setValidating(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setLoading(true); setError("");
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fields, paymentMethod, items: JSON.parse(signature), discountCode: discount?.valid ? discount.code : undefined }) });
      const data = await res.json();
      if (!res.ok || !data.order?.id) { setError(data.error || "No pudimos crear tu pedido. Tus productos siguen en el carrito."); return; }
      clearCart();
      router.push(`/checkout/result?orderId=${encodeURIComponent(data.order.id)}`);
    } catch { setError("Se perdió la conexión. Antes de volver a enviar, verifica si recibiste el correo del pedido para evitar duplicarlo."); }
    finally { submitting.current = false; setLoading(false); }
  }

  if (!items.length) return <section className="mx-auto max-w-xl px-6 py-24 text-center"><p className="text-xs uppercase tracking-[.2em]">Tu ritual empieza aquí</p><h1 className="mt-4 text-4xl text-brand-900">Tu bolsa está esperando.</h1><p className="mt-4 text-slate-600">Encuentra el cuidado que se siente bien para ti.</p><Link className="mt-8 inline-flex rounded-full bg-brand-900 px-8 py-4 text-white" href="/products">Explorar productos →</Link></section>;

  return <section className="mx-auto max-w-6xl px-5 py-12 md:py-20">
    <Link href="/products" className="text-sm text-brand-700">← Seguir explorando</Link>
    <div className="mb-10 mt-8"><p className="text-xs font-semibold uppercase tracking-[.22em] text-brand-700">Un paso más cerca de tu ritual</p><h1 className="mt-3 text-4xl text-brand-900 md:text-5xl">Tu cuidado, casi en casa.</h1><p className="mt-4 text-slate-600">Compra como invitado. No necesitas crear una cuenta.</p></div>
    <ol className="mb-8 flex flex-wrap gap-6 border-y border-brand-100 py-5 text-sm"><li className="font-semibold text-brand-900">01 · Datos y pedido</li><li className="text-slate-600">02 · Confirmar envío</li><li className="text-slate-600">03 · Pago y preparación</li></ol>
    <form onSubmit={submit} className="grid items-start gap-8 lg:grid-cols-[1.15fr_.85fr]">
      <fieldset disabled={loading} className="min-w-0 space-y-7">
        <div className="rounded-3xl border border-brand-100 bg-white p-6 md:p-8"><h2 className="text-2xl text-brand-900">01. Tus datos</h2><p className="mt-2 text-sm text-slate-600">Usaremos estos datos para coordinar tu pedido.</p><div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="text-sm md:col-span-2">Nombre completo<input name="customerName" autoComplete="name" defaultValue={session?.user?.name || ""} required minLength={3} maxLength={100} className="mt-2 w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3" /></label>
          <label className="text-sm">Correo electrónico<input name="customerEmail" type="email" autoComplete="email" defaultValue={session?.user?.email || ""} required maxLength={200} className="mt-2 w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3" /></label>
          <label className="text-sm">Celular / WhatsApp<input name="customerPhone" type="tel" inputMode="tel" autoComplete="tel" required pattern="(\+?57\s?)?3[0-9]{9}" placeholder="3001234567" aria-describedby="phone-help" className="mt-2 w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3" /><span id="phone-help" className="mt-1 block text-xs text-slate-500">10 dígitos, con o sin +57.</span></label>
        </div></div>
        <div className="rounded-3xl border border-brand-100 bg-white p-6 md:p-8"><h2 className="text-2xl text-brand-900">02. ¿Dónde te lo enviamos?</h2><div className="mt-6 grid gap-5"><label className="text-sm">Ciudad y departamento<input name="city" autoComplete="address-level2" placeholder="Ej. Medellín, Antioquia" required minLength={2} maxLength={100} className="mt-2 w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3" /></label><label className="text-sm">Dirección, barrio y apartamento<input name="address" autoComplete="street-address" required minLength={8} maxLength={240} className="mt-2 w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3" /></label></div><p className="mt-5 text-sm leading-relaxed text-slate-600">El costo y el plazo de envío se confirman contigo según tu ubicación antes de pagar. El envío todavía no está incluido.</p></div>
        <div className="rounded-3xl border border-brand-100 bg-brand-50 p-6 md:p-8"><h2 className="text-2xl text-brand-900">03. ¿Cómo prefieres pagar?</h2>
          <label className="mt-5 flex cursor-pointer gap-3 rounded-xl border border-brand-100 bg-white p-4"><input type="radio" name="payment-choice" checked={paymentMethod === "bank_transfer_bancolombia"} onChange={() => setPaymentMethod("bank_transfer_bancolombia")} /><span><strong>Transferencia Bancolombia</strong><small className="mt-1 block leading-6">Confirmamos envío y total antes de compartir los datos de pago.</small></span></label>
          <label className={`mt-3 flex gap-3 rounded-xl border border-brand-100 bg-white p-4 ${wompiAvailable ? "cursor-pointer" : "opacity-60"}`}><input type="radio" name="payment-choice" disabled={!wompiAvailable} checked={paymentMethod === "wompi_sandbox"} onChange={() => setPaymentMethod("wompi_sandbox")} /><span><strong>Wompi · entorno de pruebas</strong><small className="mt-1 block leading-6">{wompiAvailable ? "Continúa al checkout seguro de Wompi para simular un pago. No realiza cobros reales." : "Wompi aún no está disponible para compras reales. Solicita tu pedido por transferencia Bancolombia."}</small></span></label>
          <p className="mt-4 text-sm font-semibold text-brand-900">No se realizará ningún cobro al enviar este formulario.</p></div>
      </fieldset>
      <aside className="rounded-3xl border border-brand-100 bg-white p-6 lg:sticky lg:top-28 md:p-8"><h2 className="text-2xl text-brand-900">Tu selección <span className="text-base text-slate-500">({items.reduce((n, item) => n + item.quantity, 0)})</span></h2>
        <ul className="mt-5 divide-y divide-brand-100">{items.map(item => <li key={item.id} className="flex gap-3 py-5"><ImageFrame src={item.image} alt={item.name} frameClassName="h-20 w-16 shrink-0 rounded-xl bg-brand-50" imageClassName="h-full" fit="contain" /><div className="min-w-0 flex-1"><p className="text-sm font-medium text-brand-900">{item.name}</p><p className="mt-1 text-sm">{money(item.amountInCents * item.quantity)}</p><div className="mt-3 flex items-center justify-between gap-2"><div className="flex items-center rounded-full border border-brand-100"><button type="button" disabled={loading} aria-label={`Reducir cantidad de ${item.name}`} onClick={() => decrement(item.id)} className="h-11 w-11">−</button><span className="px-1 text-sm" aria-live="polite">{item.quantity}</span><button type="button" disabled={loading || item.quantity >= 20} aria-label={`Aumentar cantidad de ${item.name}`} onClick={() => increment(item.id)} className="h-11 w-11">+</button></div><button type="button" disabled={loading} onClick={() => removeItem(item.id)} aria-label={`Quitar ${item.name}`} className="min-h-11 text-xs underline">Quitar</button></div></div></li>)}</ul>
        <details className="border-y border-brand-100 py-4"><summary className="cursor-pointer text-sm">¿Tienes un código de descuento?</summary><label htmlFor="discount-code" className="mt-4 block text-xs">Código</label><div className="mt-2 flex gap-2"><input id="discount-code" value={code} onChange={event => { setCode(event.target.value.toUpperCase()); setDiscount(null); setDiscountMessage(""); }} className="min-w-0 flex-1 rounded-xl border px-3 py-3 text-sm" /><button disabled={loading || validating || !code.trim()} type="button" onClick={applyDiscount} className="rounded-xl border border-brand-700 px-4 text-sm disabled:opacity-50">{validating ? "…" : "Aplicar"}</button></div><p className="mt-2 text-xs" role="status">{discountMessage}</p></details>
        <dl className="mt-6 space-y-3 text-sm"><div className="flex justify-between"><dt>Productos</dt><dd>{money(totalAmountInCents)}</dd></div>{discount?.valid && <div className="flex justify-between text-brand-700"><dt>Descuento</dt><dd>−{money(discount.discountAmountInCents)}</dd></div>}<div className="flex justify-between"><dt>Envío</dt><dd>Por confirmar</dd></div><div className="flex justify-between border-t border-brand-100 pt-4 text-lg font-semibold"><dt>Subtotal</dt><dd>{money(discount?.valid ? discount.discountedSubtotalInCents : totalAmountInCents)}</dd></div></dl>
        <p className="mt-4 text-xs leading-relaxed text-slate-500">Valores en pesos colombianos. Revisamos precios y disponibilidad al crear tu pedido. El total final incluirá el envío que aceptes.</p>
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        <button type="submit" disabled={loading || validating} className="mt-6 min-h-14 w-full rounded-full bg-brand-900 px-4 py-4 font-semibold text-white disabled:opacity-50">{loading ? "Creando tu pedido…" : "Crear pedido · sin cobro →"}</button><p className="mt-4 text-center text-xs text-slate-500">Al continuar aceptas los <Link href="/terms" className="underline">términos</Link> y la <Link href="/terms#privacidad" className="underline">información sobre uso de tus datos</Link>.</p>
      </aside>
    </form>
  </section>;
}
