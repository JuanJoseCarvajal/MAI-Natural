"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/features/cart/CartContext";
import ImageFrame from "@/components/ui/ImageFrame";
import type { DiscountEvaluation } from "@/lib/discounts";
import { bancolombiaConfig, formatWhatsappLink, getOrderPaymentSteps } from "@/lib/bank-transfer";

function formatCOP(cents: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, totalAmountInCents, increment, decrement, removeItem, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountResult, setDiscountResult] = useState<DiscountEvaluation | null>(null);
  const [discountMessage, setDiscountMessage] = useState("");
  const [validatingDiscount, setValidatingDiscount] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  useEffect(() => {
    if (!session?.user) return;
    setCustomerName((current) => current || session.user?.name || "");
    setCustomerEmail((current) => current || session.user?.email || "");
  }, [session?.user]);

  const discountedTotal = discountResult?.valid
    ? discountResult.discountedSubtotalInCents
    : totalAmountInCents;

  const paymentSteps = useMemo(() => getOrderPaymentSteps(), []);
  const proofWhatsappUrl = formatWhatsappLink(
    bancolombiaConfig.proofWhatsapp,
    "Hola MAI, quiero enviar el comprobante de mi pedido."
  );

  const handleApplyDiscount = async () => {
    if (!discountCode.trim() || items.length === 0) return;
    setValidatingDiscount(true);
    setDiscountMessage("");

    try {
      const response = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: discountCode.trim(),
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
        }),
      });

      const data = (await response.json()) as DiscountEvaluation;
      if (!response.ok || !data.valid) {
        setDiscountResult(null);
        setDiscountMessage(data.message || "El codigo no se pudo aplicar.");
        return;
      }

      setDiscountResult(data);
      setDiscountMessage(`Codigo aplicado: ${data.code}`);
    } catch {
      setDiscountResult(null);
      setDiscountMessage("Error de conexion al validar el codigo.");
    } finally {
      setValidatingDiscount(false);
    }
  };

  const handleCreateOrder = async () => {
    if (items.length === 0) return;
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setError("Completa nombre, correo y telefono para crear la orden.");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
          discountCode: discountResult?.valid ? discountResult.code : undefined,
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        emailSent?: boolean;
        error?: string;
        order?: { id: string };
      };

      if (!res.ok || !data.order?.id) {
        setError(data.error ?? "No se pudo crear la orden.");
        return;
      }

      clearCart();
      setNotice(
        data.emailSent
          ? "Orden creada. Revisa tu correo para ver instrucciones de consignacion y envio de comprobante."
          : "Orden creada. Continua con la consignacion y guarda el numero de pedido."
      );
      router.push(
        `/checkout/result?orderId=${encodeURIComponent(data.order.id)}&status=pending_confirmation`
      );
    } catch {
      setError("Error de conexion. Intentalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-2xl">🛍️</p>
        <h1 className="mt-4 text-2xl font-bold text-brand-900">Tu carrito esta vacio</h1>
        <p className="mt-2 text-slate-600">Agrega productos para continuar.</p>
        <button
          onClick={() => router.push("/products")}
          className="mt-8 rounded-full bg-brand-700 px-8 py-3 font-semibold text-white hover:bg-brand-900"
        >
          Ver productos
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h1 className="text-3xl font-bold text-brand-900">Checkout por consignacion Bancolombia</h1>
          <p className="mt-3 text-slate-600">
            Aqui creas tu orden primero. El pago se hace despues por consignacion Bancolombia y se
            confirma manualmente cuando recibimos tu comprobante.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {paymentSteps.map((step, index) => (
              <div key={step} className="rounded-2xl border border-brand-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
                  Paso {index + 1}
                </p>
                <p className="mt-2 text-sm font-semibold text-brand-900">{step.replace(/^Paso \d:\s*/, "")}</p>
              </div>
            ))}
          </div>

          <ul className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 p-4">
                <ImageFrame
                  src={item.image}
                  alt={item.name}
                  frameClassName="h-16 w-16 shrink-0 rounded-xl border-slate-200 bg-white p-1"
                  imageClassName="h-full"
                  fit="contain"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-brand-900">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.price} / unidad</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
                    Metodo de pago: Consignacion Bancolombia
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => decrement(item.id)}
                    className="h-7 w-7 rounded-full border text-brand-900 hover:bg-slate-100 text-lg leading-none"
                  >
                    -
                  </button>
                  <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => increment(item.id)}
                    className="h-7 w-7 rounded-full border text-brand-900 hover:bg-slate-100 text-lg leading-none"
                  >
                    +
                  </button>
                </div>
                <p className="w-24 text-right text-sm font-semibold text-brand-700">
                  {formatCOP(item.amountInCents * item.quantity)}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  aria-label="Quitar"
                  className="ml-2 text-slate-400 hover:text-red-500 text-lg"
                >
                  x
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-brand-900">Datos del comprador</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input
                type="text"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Nombre completo"
                className="rounded-2xl border border-slate-300 px-4 py-3"
              />
              <input
                type="email"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
                placeholder="Correo electronico"
                className="rounded-2xl border border-slate-300 px-4 py-3"
              />
              <input
                type="tel"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                placeholder="Telefono / WhatsApp"
                className="rounded-2xl border border-slate-300 px-4 py-3 md:col-span-2"
              />
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-brand-100 bg-white px-5 py-4 text-sm text-slate-700">
            <p className="font-semibold text-brand-900">Codigo de descuento</p>
            <div className="mt-3 flex flex-col gap-3 md:flex-row">
              <input
                type="text"
                value={discountCode}
                onChange={(event) => setDiscountCode(event.target.value.toUpperCase())}
                placeholder="Ingresa tu codigo"
                className="flex-1 rounded-full border border-slate-300 px-4 py-3"
              />
              <button
                type="button"
                onClick={handleApplyDiscount}
                disabled={validatingDiscount || items.length === 0}
                className="rounded-full bg-brand-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-900 disabled:opacity-60"
              >
                {validatingDiscount ? "Validando..." : "Aplicar codigo"}
              </button>
            </div>
            {discountMessage ? (
              <p className={`mt-3 text-sm ${discountResult?.valid ? "text-green-700" : "text-red-600"}`}>
                {discountMessage}
              </p>
            ) : null}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
              Metodo de pago unico
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-brand-900">Consignacion Bancolombia</h2>
            <p className="mt-3 text-sm text-slate-600">
              No estas pagando todavia. Primero se crea la orden y luego haces la consignacion con
              los datos bancarios o por QR.
            </p>
          </div>

          <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
              Resumen
            </p>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>{formatCOP(totalAmountInCents)}</span>
            </div>
            {discountResult?.valid ? (
              <div className="mt-2 flex items-center justify-between text-sm text-green-700">
                <span>Descuento</span>
                <span>-{formatCOP(discountResult.discountAmountInCents)}</span>
              </div>
            ) : null}
            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
              <span className="text-lg font-semibold text-brand-900">Total de la orden</span>
              <span className="text-2xl font-bold text-brand-700">{formatCOP(discountedTotal)}</span>
            </div>
            <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              La orden se crea en estado <strong>Pendiente de confirmacion</strong>. Solo cambia a
              <strong> Confirmada</strong> cuando recibimos y validamos tu comprobante.
            </p>
          </div>

          <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-brand-900">Datos Bancolombia</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p><strong>Banco:</strong> {bancolombiaConfig.bankName}</p>
              <p><strong>Tipo de cuenta:</strong> {bancolombiaConfig.accountType}</p>
              <p><strong>Numero de cuenta:</strong> {bancolombiaConfig.accountNumber || "Por configurar"}</p>
              <p><strong>Titular:</strong> {bancolombiaConfig.accountHolder || "Por configurar"}</p>
            </div>
            {bancolombiaConfig.qrUrl ? (
              <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 p-4">
                <p className="text-sm font-semibold text-brand-900">Pago con QR</p>
                <a
                  href={bancolombiaConfig.qrUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex text-sm font-semibold text-brand-700 hover:underline"
                >
                  Abrir QR Bancolombia
                </a>
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-brand-900">Enviar comprobante</h2>
            <p className="mt-3 text-sm text-slate-600">
              Despues de consignar, envia el comprobante por correo o WhatsApp para confirmar el pago.
            </p>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p><strong>Correo:</strong> {bancolombiaConfig.proofEmail}</p>
              <p><strong>WhatsApp:</strong> {bancolombiaConfig.proofWhatsapp}</p>
            </div>
            <a
              href={proofWhatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-full border border-[#1f9d58] px-5 py-2.5 text-sm font-bold text-[#1f9d58] transition hover:bg-[#1f9d58] hover:text-white"
            >
              Enviar comprobante por WhatsApp
            </a>
          </div>

          <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm text-sm text-slate-700">
            <p className="font-semibold text-brand-900">Politica de entrega</p>
            <p className="mt-2">
              El tiempo estimado de entrega es de 5 a 7 dias habiles. Cada pedido se produce de
              forma personalizada y artesanal, uno a uno y nunca en masa.
            </p>
          </div>

          {error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          ) : null}
          {notice ? (
            <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</p>
          ) : null}

          <button
            onClick={handleCreateOrder}
            disabled={loading}
            className="w-full rounded-full bg-brand-700 py-4 text-lg font-bold text-white transition hover:bg-brand-900 disabled:opacity-60"
          >
            {loading ? "Creando orden..." : "Crear orden y recibir instrucciones"}
          </button>

          <button
            onClick={() => router.back()}
            className="w-full rounded-full border border-brand-300 py-3 text-sm font-semibold text-brand-900 hover:bg-brand-50"
          >
            Seguir comprando
          </button>
        </aside>
      </div>
    </section>
  );
}
