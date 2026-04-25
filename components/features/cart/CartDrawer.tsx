"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "./CartContext";
import ImageFrame from "@/components/ui/ImageFrame";

function formatCOP(cents: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    increment,
    decrement,
    totalAmountInCents,
    totalItems,
  } = useCart();

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close with Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeCart]);

  return (
    <>
      {/* Backdrop */}
      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={closeCart}
          aria-hidden="true"
        />
      ) : null}

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <h2 className="text-lg font-bold text-brand-900">
              Tu carrito
            </h2>
            {totalItems > 0 ? (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">
                {totalItems}
              </span>
            ) : null}
          </div>
          <button
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <span className="text-5xl">🌿</span>
              <p className="text-slate-700 font-medium">Tu carrito está vacío</p>
              <p className="text-sm text-slate-500">
                Explora nuestros productos naturales y agrega tus favoritos.
              </p>
              <Link
                href="/products"
                onClick={closeCart}
                className="mt-2 rounded-full bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-900"
              >
                Ir a la tienda
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                    <ImageFrame
                      src={item.image}
                      alt={item.name}
                      frameClassName="h-16 w-16 flex-shrink-0 rounded-lg border-slate-200 bg-white p-1"
                      imageClassName="h-full"
                      fit="contain"
                    />
                  <div className="flex flex-1 flex-col gap-1">
                    <p className="text-sm font-semibold text-brand-900 leading-tight">
                      {item.name}
                    </p>
                    <p className="text-sm font-bold text-brand-700">
                      {item.price}
                    </p>
                    {/* Quantity controls */}
                    <div className="mt-auto flex items-center gap-2">
                      <button
                        onClick={() => decrement(item.id)}
                        aria-label="Disminuir cantidad"
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-200 text-sm font-bold"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm font-semibold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => increment(item.id)}
                        aria-label="Aumentar cantidad"
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-200 text-sm font-bold"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label="Eliminar del carrito"
                        className="ml-auto rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer: totals + CTA */}
        {items.length > 0 ? (
          <footer className="border-t border-slate-200 px-5 py-5 space-y-3">
            <div className="flex items-center justify-between text-base font-semibold text-slate-800">
              <span>Subtotal</span>
              <span className="text-brand-700 font-bold">
                {formatCOP(totalAmountInCents)}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Entrega estimada de 5 a 7 dias habiles. Nuestros productos son personalizados y artesanales, elaborados uno a uno y nunca en masa.
            </p>
            <p className="text-xs text-brand-800">
              Metodo de pago unico: <strong>Consignacion Bancolombia</strong>.
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full rounded-full bg-brand-700 py-3 text-center text-sm font-bold text-white transition hover:bg-brand-900"
            >
              Crear orden
            </Link>
            <button
              onClick={closeCart}
              className="block w-full rounded-full border border-slate-300 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Seguir comprando
            </button>
          </footer>
        ) : null}
      </aside>
    </>
  );
}
