"use client";

import { useCart } from "@/components/features/cart/CartContext";

export default function CartIcon() {
  const { totalItems, openCart } = useCart();

  return (
    <button
      onClick={openCart}
      aria-label={`Abrir carrito, ${totalItems} producto${totalItems !== 1 ? "s" : ""}`}
      className="relative flex items-center gap-1 rounded-full px-3 py-1 text-white/80 transition hover:bg-white/10 hover:text-white"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {totalItems > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-400 px-1 text-[10px] font-bold text-white ring-2 ring-brand-900">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      ) : null}
    </button>
  );
}
