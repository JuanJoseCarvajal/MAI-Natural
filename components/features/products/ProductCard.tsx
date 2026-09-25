"use client";
import { SiteText } from "@/components/common/SiteText";

import Link from "next/link";
import { categoryLabels, type ProductCategory } from "@/lib/products";
import { useCart } from "@/components/features/cart/CartContext";
import ProductGallery from "./ProductGallery";
import { useEffect, useRef, useState } from "react";
import { trackAddToCart } from "@/lib/analytics";
import styles from "./products.module.css";

type ProductCardProps = { id: string; image: string; images?: string[]; variants?: {id: string; name: string; image: string}[]; name: string; price: string; amountInCents?: number; description: string; category?: ProductCategory; badge?: string; rating?: number; reviewsCount?: number; compact?: boolean; stock?: number };

export default function ProductCard({ id, image, images, variants, name, price, amountInCents = 0, description, category, badge, stock }: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const unavailable = typeof stock === "number" && stock <= 0;
  function handleAdd() {
    if (unavailable || amountInCents <= 0) return;
    addItem({ id, name, price, amountInCents, image });
    trackAddToCart({ item_id: id, item_name: name, price: amountInCents / 100, quantity: 1 });
    setAdded(true);
    timer.current = setTimeout(() => setAdded(false), 1800);
  }
  return <article className={styles.card}>
    <ProductGallery image={image} images={images} name={name} />
    <div className={styles.cardBody}>
      {category ? <p className={styles.category}>{categoryLabels[category].replace("Formulaciones Botánicas de Autor · ", "Cuidado ")}</p> : null}
      <h3><Link href={`/products/${id}`}>{name}</Link></h3>
      <p className={styles.description}>{description}</p>
      <p className={styles.price}>{price} <span hidden={amountInCents <= 0}><SiteText id="3523f6e81ccde3b2be29">{"COP"}</SiteText></span></p>
      {variants?.length ? <Link className={styles.addButton} href={`/products/${id}`}>Elegir componentes →</Link> : <button onClick={handleAdd} disabled={added || unavailable || amountInCents <= 0} className={styles.addButton} aria-label={added ? `${name} agregado al carrito` : `Agregar ${name} al carrito`}>
        <span aria-live="polite">{amountInCents <= 0 ? "Precio por confirmar" : unavailable ? "Agotado" : added ? "Agregado ✓" : "Agregar al carrito"}</span><span aria-hidden="true">{added || unavailable ? "" : "+"}</span>
      </button>}
    </div>
  </article>;
}
