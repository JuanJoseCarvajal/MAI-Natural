"use client";
import { useCart } from "./CartContext";
export default function CartIcon() {
  const {totalItems,openCart} = useCart();
  return <button onClick={openCart} aria-label={`Abrir carrito, ${totalItems} productos`} className="icon-button cart-trigger"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg><span>{totalItems}</span></button>;
}
