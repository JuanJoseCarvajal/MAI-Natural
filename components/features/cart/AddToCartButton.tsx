"use client";
import { useState } from "react";
import { useCart } from "@/components/features/cart/CartContext";

type Props = {
  id: string;
  name: string;
  price: string;
  amountInCents: number;
  image: string;
};

export default function AddToCartButton({ id, name, price, amountInCents, image }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({ id, name, price, amountInCents, image });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={added}
      className={`mt-6 rounded-full px-6 py-3 font-semibold text-white transition ${
        added ? "bg-green-600" : "bg-brand-700 hover:bg-brand-900"
      }`}
    >
      {added ? "✓ Agregado al carrito" : "Agregar al carrito"}
    </button>
  );
}
