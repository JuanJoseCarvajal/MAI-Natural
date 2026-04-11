"use client";

import { useState } from "react";

type WompiCheckoutButtonProps = {
  productId: string;
};

export default function WompiCheckoutButton({ productId }: WompiCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/payments/wompi/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = (await response.json()) as { checkoutUrl?: string; error?: string };

      if (!response.ok || !data.checkoutUrl) {
        setError(data.error || "No se pudo iniciar el pago");
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch {
      setError("Error de red al iniciar pago con Wompi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="rounded-full border border-brand-300 px-6 py-3 text-sm font-semibold text-brand-900 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Conectando con Wompi..." : "Pagar con Wompi"}
      </button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
