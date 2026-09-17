"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/features/cart/CartContext";
import { trackAddToCart } from "@/lib/analytics";
import type { Product } from "@/lib/products";
import styles from "@/styles/editorial.module.css";

const profiles = [
  { id: "capilar", label: "Tu ritual capilar", description: "Tres productos para acompañar el lavado y el peinado.", steps: ["Limpieza", "Acondicionamiento", "Peinado"], productIds: ["mnk-001", "balsamo-jardin-herbal", "ca-hcc-500"] },
  { id: "facial", label: "Tu ritual facial", description: "Una selección para descubrir el cuidado del rostro, paso a paso.", steps: ["Limpieza", "Tónico", "Suero"], productIds: ["fa-lam-120", "fa-rpt-70", "fa-ass-30"] },
  { id: "corporal", label: "Un momento para ti", description: "Dos opciones de jabón para alternar y un perfume para tu cabello.", steps: ["Jabón corporal", "Otra opción de jabón", "Aroma capilar"], productIds: ["co-js-110-1", "co-js-67", "el-perfume-perfume-capilar"] },
];
const formatPrice = (cents: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(cents / 100);

export default function RoutineBuilderView({ products }: { products: Product[] }) {
  const { addItem, openCart } = useCart();
  const [selectedId, setSelectedId] = useState(profiles[0].id);
  const selected = profiles.find((profile) => profile.id === selectedId) ?? profiles[0];
  const selection = selected.productIds.map((id) => products.find((product) => product.id === id));
  const available = selection.every((product) => product && product.active !== false && typeof product.stock === "number" && product.stock > 0);
  const total = selection.reduce((sum, product) => sum + (product?.amountInCents ?? 0), 0);
  const complete = selection.every(Boolean);
  const whatsapp = `https://wa.me/573246847727?text=${encodeURIComponent(`Hola MAI, quiero orientación sobre ${selected.label.toLowerCase()}.`)}`;
  function addRoutine() {
    if (!available) return;
    selection.forEach((product) => {
      if (!product) return;
      addItem({ id: product.id, name: product.name, price: product.price, amountInCents: product.amountInCents, image: product.image });
      trackAddToCart({ item_id: product.id, item_name: product.name, price: product.amountInCents / 100, quantity: 1 });
    });
    openCart();
  }
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <p className="eyebrow">EL ARTE DE CUIDARTE</p>
        <h1>Tu ritmo.<br /><em>Tu ritual.</em></h1>
        <p>No necesitas empezar con todo. Encuentra una selección de productos para hacer del cuidado un momento tuyo.</p>
        <Link href="/products" className="text-link">Explorar todos los productos ↗</Link>
      </header>
      <section className={styles.routineLayout} aria-label="Elige tu rutina">
        <fieldset className={styles.selector}>
          <legend className="eyebrow">01 / ELIGE TU MOMENTO</legend>
          {profiles.map((profile, index) => (
            <label key={profile.id} className={`${styles.option} ${selectedId === profile.id ? styles.selected : ""}`}>
              <input type="radio" name="routine" value={profile.id} checked={selectedId === profile.id} onChange={() => setSelectedId(profile.id)} />
              <span><small>0{index + 1}</small><strong>{profile.label}</strong><span>{profile.description}</span></span>
            </label>
          ))}
          <p className={styles.note}>Consulta el modo de uso de cada producto. Si necesitas ayuda para elegir, estamos cerca.</p>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="text-link">Recibir orientación por WhatsApp ↗</a>
        </fieldset>
        <div className={styles.routineResult}>
          <div aria-live="polite"><p className="eyebrow">02 / TU SELECCIÓN</p><h2>{selected.label}</h2></div>
          <ol className={styles.steps}>
            {selection.map((product, index) => (
              <li key={selected.productIds[index]}>
                <div className={styles.stepImage}>{product ? <Image src={product.image} alt={product.name} fill sizes="(min-width: 900px) 220px, 40vw" className="object-contain p-5" /> : <span>Producto no disponible</span>}</div>
                <p className="eyebrow">0{index + 1} / {selected.steps[index]}</p>
                {product ? <><Link href={`/products/${product.id}`} className={styles.productName}>{product.name}</Link><p>{product.price} <small>COP</small></p></> : <p>Por ahora no disponible</p>}
              </li>
            ))}
          </ol>
          <div className={styles.totalRow}><div><span>Subtotal de la selección</span><strong>{complete ? `${formatPrice(total)} COP` : "Selección incompleta"}</strong><small>Envío calculado al finalizar la compra.</small></div><button type="button" className="mai-button" disabled={!available} onClick={addRoutine}>Agregar los 3 productos ↗</button></div>
          {!available ? <p className={styles.note} role="status">Necesitamos confirmar disponibilidad de esta selección. Escríbenos para ayudarte a elegir.</p> : null}
        </div>
      </section>
      <section className={styles.banner}><p className="eyebrow">CUIDADO CON INTENCIÓN</p><h2>Una pausa que empieza contigo.</h2><p>Descubre nuestras asesorías si prefieres elegir con acompañamiento.</p><Link className="text-link" href="/services">Conocer las asesorías ↗</Link></section>
    </main>
  );
}
