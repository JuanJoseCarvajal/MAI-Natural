"use client";
import { SiteText } from "@/components/common/SiteText";


import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { getShippingInCents } from "@/lib/shipping";
import { openWompiCheckout } from "@/lib/wompi-client";
import PaymentRedirectOverlay from "@/components/features/payments/PaymentRedirectOverlay";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/features/cart/CartContext";
import ImageFrame from "@/components/ui/ImageFrame";
import type { DiscountEvaluation } from "@/lib/discounts";

const money = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value / 100);

export default function CheckoutPage() {
  const [createdOrder, setCreatedOrder] = useState<{ id: string; quoteVersion?: string } | null>(null);
  const [city, setCity] = useState("");
  const shippingInCents = getShippingInCents(city);
  const { data: session } = useSession();
  const { items, totalAmountInCents, increment, decrement, removeItem } = useCart();
  const [wompiMode, setWompiMode] = useState("sandbox");
  const [wompiAvailable, setWompiAvailable] = useState(false);
  const paymentMethod = wompiMode === "production" ? "wompi" : "wompi_sandbox";
  useEffect(() => { let active = true; fetch("/api/payments/wompi/status").then(response => response.json()).then(data => { if (active) { setWompiAvailable(data.available === true); setWompiMode(data.mode === "production" ? "production" : "sandbox"); } }).catch(() => {}); return () => { active = false; }; }, []);
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
    if (shippingInCents === null) { setError("Indica tu ciudad para calcular el envío."); return; }
    if (!wompiAvailable) { setError("Wompi no está disponible temporalmente. Intenta nuevamente más tarde."); return; }
    if (submitting.current) return;
    submitting.current = true;
    setLoading(true); setError("");
    let redirecting = false;
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (createdOrder) { await openWompiCheckout({ orderId: createdOrder.id, quoteVersion: createdOrder.quoteVersion }); redirecting = true; return; }
      const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fields, paymentMethod, expectedTotalInCents: (discount?.valid ? discount.discountedSubtotalInCents : totalAmountInCents) + shippingInCents, items: JSON.parse(signature), discountCode: discount?.valid ? discount.code : undefined }) });
      const data = await res.json();
      if (!res.ok || !data.order?.id) { setError(data.error || "No pudimos crear tu pedido. Tus productos siguen en el carrito."); return; }
      setCreatedOrder(data.order);
      await openWompiCheckout({ orderId: data.order.id, quoteVersion: data.order.quoteVersion });
      redirecting = true;
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No pudimos abrir Wompi. Tu pedido se conserva; vuelve a intentarlo."); }
    finally { if (!redirecting) { submitting.current = false; setLoading(false); } }
  }

  if (!items.length) return <section className="mx-auto max-w-xl px-6 py-24 text-center"><p className="text-xs uppercase tracking-[.2em]"><SiteText id="b48cede21580f4453e7b">{"Tu ritual empieza aquí"}</SiteText></p><h1 className="mt-4 text-4xl text-brand-900"><SiteText id="cd2c4fd8e12ab0f0c12a">{"Tu bolsa está esperando."}</SiteText></h1><p className="mt-4 text-slate-600"><SiteText id="8dca1a1e1a0737fafc08">{"Encuentra el cuidado que se siente bien para ti."}</SiteText></p><Link className="mt-8 inline-flex rounded-full bg-brand-900 px-8 py-4 text-white" href="/products"><SiteText id="6fc10f637a3e271cb047">{"Explorar productos →"}</SiteText></Link></section>;

  return <section className="mx-auto max-w-6xl px-5 py-12 md:py-20">{loading && <PaymentRedirectOverlay mode={wompiMode} />}
    <Link href="/products" className="text-sm text-brand-700"><SiteText id="d12c52d1436b6c0c0580">{"← Seguir explorando"}</SiteText></Link>
    <div className="mb-10 mt-8"><p className="text-xs font-semibold uppercase tracking-[.22em] text-brand-700"><SiteText id="354d9a5b546d89f5ea1e">{"Un paso más cerca de tu ritual"}</SiteText></p><h1 className="mt-3 text-4xl text-brand-900 md:text-5xl"><SiteText id="8f5758136a01782ee8c8">{"Tu cuidado, casi en casa."}</SiteText></h1><p className="mt-4 text-slate-600"><SiteText id="c1d7264a26fcf2c32b8a">{"Compra como invitado. No necesitas crear una cuenta."}</SiteText></p></div>
    <ol className="mb-8 flex flex-wrap gap-6 border-y border-brand-100 py-5 text-sm"><li className="font-semibold text-brand-900"><SiteText id="f40cda8c4e349c96403d">{"01 · Datos y entrega"}</SiteText></li><li className="text-slate-600"><SiteText id="a5914c4c56d0705ef7e6">{"02 · Revisar total"}</SiteText></li><li className="text-slate-600"><SiteText id="2e0fe7aba28d4b2159c5">{"03 · Pagar con Wompi"}</SiteText></li></ol>
    <form onSubmit={submit} className="grid items-start gap-8 lg:grid-cols-[1.15fr_.85fr]">
      <fieldset disabled={loading || Boolean(createdOrder)} className="min-w-0 space-y-7">
        <div className="rounded-3xl border border-brand-100 bg-white p-6 md:p-8"><h2 className="text-2xl text-brand-900"><SiteText id="2cdf958cec4364135847">{"01. Tus datos"}</SiteText></h2><p className="mt-2 text-sm text-slate-600"><SiteText id="7a035f103f263b593b5d">{"Usaremos estos datos para coordinar tu pedido."}</SiteText></p><div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="text-sm md:col-span-2"><SiteText id="4a3850e5ea5b347e0b63">{"Nombre completo"}</SiteText><input name="customerName" autoComplete="name" defaultValue={session?.user?.name || ""} required minLength={3} maxLength={100} className="mt-2 w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3" /></label>
          <label className="text-sm"><SiteText id="62906bdd086f4167fb6f">{"Correo electrónico"}</SiteText><input name="customerEmail" type="email" autoComplete="email" defaultValue={session?.user?.email || ""} required maxLength={200} className="mt-2 w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3" /></label>
          <label className="text-sm"><SiteText id="3c2bc77cafe62dd9cec8">{"Celular / WhatsApp"}</SiteText><input name="customerPhone" type="tel" inputMode="tel" autoComplete="tel" required pattern="(\+?57\s?)?3[0-9]{9}" placeholder="3001234567" aria-describedby="phone-help" className="mt-2 w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3" /><span id="phone-help" className="mt-1 block text-xs text-slate-500"><SiteText id="742e6ac478ea259d8ff9">{"10 dígitos, con o sin +57."}</SiteText></span></label>
        </div></div>
        <div className="rounded-3xl border border-brand-100 bg-white p-6 md:p-8"><h2 className="text-2xl text-brand-900"><SiteText id="9c904548cb53cdcd6ab9">{"02. ¿Dónde te lo enviamos?"}</SiteText></h2><div className="mt-6 grid gap-5"><label className="text-sm"><SiteText id="15b13b434a94b4f25d05">{"Ciudad o municipio"}</SiteText><input name="city" value={city} onChange={event => setCity(event.target.value)} autoComplete="address-level2" placeholder="Ej. Medellín" required minLength={2} maxLength={100} className="mt-2 w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3" /></label><label className="text-sm"><SiteText id="b80f080e949fd7d1e73d">{"Dirección, barrio y apartamento"}</SiteText><input name="address" autoComplete="street-address" required minLength={8} maxLength={240} className="mt-2 w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3" /></label></div><p className="mt-5 text-sm leading-relaxed text-slate-600"><SiteText id="c6ab033eb72180d15d60">{"Envío: $15.000 en Medellín y $25.000 fuera de Medellín. El total se actualiza según tu ciudad."}</SiteText></p></div>
        <div className="rounded-3xl border border-brand-100 bg-brand-50 p-6 md:p-8"><h2 className="text-2xl text-brand-900"><SiteText id="332d3d18377e6a176af7">{"03. Paga con Wompi"}</SiteText></h2>
          <div className="mt-5 rounded-xl border border-brand-100 bg-white p-4" role="status"><strong>{wompiMode === "production" ? "Wompi · pago seguro" : "Wompi · entorno de pruebas"}</strong><p className="mt-1 text-sm leading-6">{wompiAvailable ? wompiMode === "production" ? "Al continuar abrirás Wompi para completar el pago del total mostrado, incluido el envío." : "El checkout está en pruebas. No realiza cobros reales." : "Wompi no está disponible temporalmente. Tu selección se conserva; vuelve a intentarlo más tarde."}</p></div>
          <p className="mt-4 text-sm font-semibold text-brand-900"><SiteText id="3d5d2bc50505be5bdc5d">{"Completarás el pago en la página segura de Wompi."}</SiteText></p></div>
      </fieldset>
      <aside className="rounded-3xl border border-brand-100 bg-white p-6 lg:sticky lg:top-28 md:p-8"><h2 className="text-2xl text-brand-900"><SiteText id="3a724d9fb5c5d7ac1533">{"Tu selección "}</SiteText><span className="text-base text-slate-500">({items.reduce((n, item) => n + item.quantity, 0)})</span></h2>
        <ul className="mt-5 divide-y divide-brand-100">{items.map(item => <li key={item.id} className="flex gap-3 py-5"><ImageFrame src={item.image} alt={item.name} frameClassName="h-20 w-16 shrink-0 rounded-xl bg-brand-50" imageClassName="h-full" fit="contain" /><div className="min-w-0 flex-1"><p className="text-sm font-medium text-brand-900">{item.name}</p><p className="mt-1 text-sm">{money(item.amountInCents * item.quantity)}</p><div className="mt-3 flex items-center justify-between gap-2"><div className="flex items-center rounded-full border border-brand-100"><button type="button" disabled={loading || Boolean(createdOrder)} aria-label={`Reducir cantidad de ${item.name}`} onClick={() => decrement(item.id)} className="h-11 w-11">−</button><span className="px-1 text-sm" aria-live="polite">{item.quantity}</span><button type="button" disabled={loading || Boolean(createdOrder) || item.quantity >= 20} aria-label={`Aumentar cantidad de ${item.name}`} onClick={() => increment(item.id)} className="h-11 w-11">+</button></div><button type="button" disabled={loading || Boolean(createdOrder)} onClick={() => removeItem(item.id)} aria-label={`Quitar ${item.name}`} className="min-h-11 text-xs underline"><SiteText id="d07ba85cdbd64794fe09">{"Quitar"}</SiteText></button></div></div></li>)}</ul>
        <details className="border-y border-brand-100 py-4"><summary className="cursor-pointer text-sm"><SiteText id="4be3ee10131fbd3aade7">{"¿Tienes un código de descuento?"}</SiteText></summary><label htmlFor="discount-code" className="mt-4 block text-xs"><SiteText id="6beabe48e79a606c6a48">{"Código"}</SiteText></label><div className="mt-2 flex gap-2"><input id="discount-code" disabled={loading || Boolean(createdOrder)} value={code} onChange={event => { setCode(event.target.value.toUpperCase()); setDiscount(null); setDiscountMessage(""); }} className="min-w-0 flex-1 rounded-xl border px-3 py-3 text-sm" /><button disabled={loading || Boolean(createdOrder) || validating || !code.trim()} type="button" onClick={applyDiscount} className="rounded-xl border border-brand-700 px-4 text-sm disabled:opacity-50">{validating ? "…" : "Aplicar"}</button></div><p className="mt-2 text-xs" role="status">{discountMessage}</p></details>
        <dl className="mt-6 space-y-3 text-sm"><div className="flex justify-between"><dt><SiteText id="17c9ffcaa5a9d9d8bdea">{"Productos"}</SiteText></dt><dd>{money(totalAmountInCents)}</dd></div>{discount?.valid && <div className="flex justify-between text-brand-700"><dt><SiteText id="bbe22aec812f21711a06">{"Descuento"}</SiteText></dt><dd>−{money(discount.discountAmountInCents)}</dd></div>}<div className="flex justify-between"><dt><SiteText id="c2a6d16d819c0fb97a4b">{"Envío"}</SiteText></dt><dd>{shippingInCents === null ? "Indica tu ciudad" : shippingInCents === 0 ? "Incluido" : money(shippingInCents)}</dd></div><div className="flex justify-between border-t border-brand-100 pt-4 text-lg font-semibold"><dt>{shippingInCents === null ? "Subtotal" : "Total a pagar"}</dt><dd>{money((discount?.valid ? discount.discountedSubtotalInCents : totalAmountInCents) + (shippingInCents ?? 0))}</dd></div></dl>
        <p className="mt-4 text-xs leading-relaxed text-slate-500"><SiteText id="2f9390c1a64a138a0beb">{"Valores en pesos colombianos. Revisamos precios y disponibilidad al crear tu pedido. El total incluye el envío mostrado."}</SiteText></p>
        {shippingInCents === null && <p role="status" className="mt-4 text-sm text-amber-800"><SiteText id="c2da22358375971ae0ad">{"Indica tu ciudad para ver el envío y el total antes de pagar."}</SiteText></p>}
        {createdOrder && <p className="mt-4 text-sm"><Link className="underline" href={`/checkout/result?orderId=${createdOrder.id}`}><SiteText id="85473a67aa8e3b9689fe">{"Consultar el pedido creado y retomar su pago"}</SiteText></Link></p>}
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        <button type="submit" disabled={loading || validating || !wompiAvailable || shippingInCents === null} className="mt-6 min-h-14 w-full rounded-full bg-brand-900 px-4 py-4 font-semibold text-white disabled:opacity-50">{loading ? "Redirigiendo a Wompi…" : createdOrder ? "Retomar pago con Wompi →" : wompiMode === "sandbox" ? "Continuar a Wompi · prueba →" : "Pagar con Wompi →"}</button><p className="mt-4 text-center text-xs text-slate-500"><SiteText id="b71b801fa5e290284413">{"Al continuar aceptas los "}</SiteText><Link href="/terms" className="underline"><SiteText id="0d0035d66bfb6185a234">{"términos"}</SiteText></Link><SiteText id="54a5e4d38b45c1a4555a">{" y la "}</SiteText><Link href="/terms#privacidad" className="underline"><SiteText id="1993af921fb756214e47">{"información sobre uso de tus datos"}</SiteText></Link>.</p>
      </aside>
    </form>
  </section>;
}
