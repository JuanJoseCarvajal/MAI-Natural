"use client";
import {SiteText} from "@/components/common/SiteText";

import { useState } from "react";
import { useCart } from "@/components/features/cart/CartContext";
import { trackAddToCart } from "@/lib/analytics";

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
    trackAddToCart({
      item_id: id,
      item_name: name,
      price: amountInCents / 100,
      quantity: 1,
    });
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
      {added ? <SiteText id="364aeded4a3ca7df964f">{"✓ Agregado al carrito"}</SiteText> : <SiteText id="6a8d11469368c844362d">{"Agregar al carrito"}</SiteText>}
    </button>
  );
}
