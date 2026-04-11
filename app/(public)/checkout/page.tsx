"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/features/cart/CartContext";
import ImageFrame from "@/components/ui/ImageFrame";

function formatCOP(cents: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmountInCents, increment, decrement, removeItem } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/payments/wompi/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
        }),
      });

      const data = (await res.json()) as { checkoutUrl?: string; error?: string };

      if (!res.ok || !data.checkoutUrl) {
        setError(data.error ?? "No se pudo iniciar el pago");
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-2xl">🛍️</p>
        <h1 className="mt-4 text-2xl font-bold text-brand-900">Tu carrito está vacío</h1>
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
    <section className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-900">Tu carrito</h1>

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
              <p className="font-semibold text-brand-900 text-sm">{item.name}</p>
              <p className="text-sm text-slate-500">{item.price} / unidad</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => decrement(item.id)}
                className="h-7 w-7 rounded-full border text-brand-900 hover:bg-slate-100 text-lg leading-none"
              >
                −
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
              ×
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between rounded-2xl bg-brand-50 px-6 py-4">
        <span className="text-lg font-semibold text-brand-900">Total</span>
        <span className="text-2xl font-bold text-brand-700">{formatCOP(totalAmountInCents)}</span>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <button
        onClick={handlePay}
        disabled={loading}
        className="mt-6 w-full rounded-full bg-brand-700 py-4 text-lg font-bold text-white transition hover:bg-brand-900 disabled:opacity-60"
      >
        {loading ? "Redirigiendo a Wompi…" : "Pagar con Wompi"}
      </button>

      <button
        onClick={() => router.back()}
        className="mt-3 w-full rounded-full border border-brand-300 py-3 text-sm font-semibold text-brand-900 hover:bg-brand-50"
      >
        Seguir comprando
      </button>
    </section>
  );
}
