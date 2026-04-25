"use client";
import Link from "next/link";
import { categoryLabels, type ProductCategory } from "@/lib/products";
import { useCart } from "@/components/features/cart/CartContext";
import ImageFrame from "@/components/ui/ImageFrame";
import { useState } from "react";

type ProductCardProps = {
  id: string;
  image: string;
  name: string;
  price: string;
  amountInCents?: number;
  description: string;
  category?: ProductCategory;
  badge?: string;
  rating?: number;
  reviewsCount?: number;
  compact?: boolean;
};

export default function ProductCard({
  id,
  image,
  name,
  price,
  amountInCents = 0,
  description,
  category,
  badge,
  rating,
  reviewsCount,
  compact = false,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({ id, name, price, amountInCents, image });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white p-4 shadow ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="absolute left-4 top-4 flex items-center gap-2">
        {badge ? (
          <span className="rounded-full bg-brand-700 px-3 py-1 text-xs font-semibold text-white">{badge}</span>
        ) : null}
        {category ? (
          <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-900">
            {categoryLabels[category]}
          </span>
        ) : null}
      </div>

      <Link
        href={`/products/${id}`}
        aria-label={`Ver detalle de ${name}`}
        className="block"
      >
        <ImageFrame
          src={image}
          alt={name}
          frameClassName="mt-8 h-52 cursor-pointer"
          fit="cover"
        />
      </Link>

      <div className="mt-4 flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-brand-900">{name}</h3>
        <span className="text-lg font-bold text-brand-700">{price}</span>
      </div>

      {typeof rating === "number" ? (
        <p className="mt-1 text-sm text-slate-600">
          ⭐ {rating.toFixed(1)}{reviewsCount ? ` (${reviewsCount})` : ""}
        </p>
      ) : null}

      <p className={`mt-3 text-sm text-slate-600 ${compact ? "line-clamp-2" : ""}`}>{description}</p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
        Pago: Consignacion Bancolombia
      </p>

      <div className="mt-auto flex items-center gap-3 pt-5">
        <Link
          href={`/products/${id}`}
          className="rounded-full border border-brand-300 px-5 py-2 text-sm font-semibold text-brand-900 transition hover:bg-brand-50"
        >
          Ver detalle
        </Link>
        <button
          onClick={handleAdd}
          disabled={added}
          className={`flex-1 rounded-full py-2 text-sm font-semibold text-white transition ${
            added
              ? "bg-green-600"
              : "bg-brand-700 hover:bg-brand-900"
          }`}
        >
          {added ? "✓ Agregado" : "Agregar al carrito"}
        </button>
      </div>
    </article>
  );
}
