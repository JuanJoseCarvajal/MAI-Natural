"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { categoryLabels, type Product } from "@/lib/products";
import styles from "./products.module.css";
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export default function ProductsCatalogView({ products }: { products: Product[] }) {
  const [categories, setCategories] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("default");
  const [budget, setBudget] = useState("all");
  const visible = useMemo(() => {
    const result = products.filter(p => (!categories.length || categories.includes(p.category)) && normalize(`${p.name} ${p.description} ${categoryLabels[p.category]}`).includes(normalize(query.trim())) && (budget === "all" || p.amountInCents <= Number(budget)));
    if (sort === "asc") result.sort((a,b) => a.amountInCents-b.amountInCents);
    if (sort === "desc") result.sort((a,b) => b.amountInCents-a.amountInCents);
    if (sort === "name") result.sort((a,b) => a.name.localeCompare(b.name, "es"));
    return result;
  }, [products, categories, query, sort, budget]);
  const toggle = (key: string) => setCategories(current => current.includes(key) ? current.filter(c => c !== key) : [...current,key]);
  const reset = () => { setCategories([]); setQuery(""); setBudget("all"); };
  return <main className={styles.catalog}>
    <nav className={styles.breadcrumb} aria-label="Ruta de navegación"><Link href="/">Inicio</Link><span>/</span><span>Tienda</span></nav>
    <header className={styles.catalogHeader}><div><p className={styles.eyebrow}>EL PODER DE LO SIMPLE</p><h1>Tu naturaleza.<br /><em>Tu ritual.</em></h1></div><div><p>Cuidado facial, capilar y corporal para encontrar ese momento que es solo tuyo.</p><Link href="/routines">Encuentra tu rutina <span aria-hidden="true">↗</span></Link></div></header>
    <section className={styles.filters} aria-label="Filtrar productos">
      <div className={styles.categoryFilters}><button onClick={() => setCategories([])} aria-pressed={!categories.length}>Todo el cuidado <span>{products.length}</span></button>{Object.entries(categoryLabels).map(([key,label]) => <button key={key} onClick={() => toggle(key)} aria-pressed={categories.includes(key)}>{label.replace("Cosmética Natural ", "")} <span>{products.filter(p => p.category === key).length}</span></button>)}</div>
      <div className={styles.searchRow}><label className={styles.search}><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Busca tu próximo ritual…" aria-label="Buscar productos por nombre o necesidad" /></label><label className={styles.select}>Presupuesto<select value={budget} onChange={e => setBudget(e.target.value)}><option value="all">Todos los precios</option><option value="5000000">Hasta $50.000</option><option value="8000000">Hasta $80.000</option><option value="12000000">Hasta $120.000</option></select></label><label className={styles.select}>Ordenar por<select value={sort} onChange={e => setSort(e.target.value)}><option value="default">Orden del catálogo</option><option value="asc">Menor precio</option><option value="desc">Mayor precio</option><option value="name">Nombre: A–Z</option></select></label></div>
    </section>
    <div className={styles.results}><p role="status">{visible.length} {visible.length === 1 ? "producto" : "productos"}</p><div>{categories.map(key => <button key={key} onClick={() => toggle(key)} aria-label={`Quitar filtro ${categoryLabels[key as keyof typeof categoryLabels]}`}>{categoryLabels[key as keyof typeof categoryLabels].replace("Cosmética Natural ", "")} ×</button>)}{categories.length || query || budget !== "all" ? <button onClick={reset}>Limpiar filtros</button> : null}</div><span>Precios en pesos colombianos</span></div>
    {visible.length ? <div className={styles.productGrid}>{visible.map(product => <ProductCard key={product.id} {...product} />)}</div> : <div className={styles.empty}><h2>No encontramos ese ritual.</h2><p>Prueba otra palabra o amplía los filtros para descubrir más opciones.</p><button onClick={reset}>Ver todos los productos</button></div>}
    <aside className={styles.routineBanner}><div><p className={styles.eyebrow}>UN CUIDADO QUE VA CONTIGO</p><h2>Empieza con una rutina.</h2><p>Descubre cómo combinar tus productos en el día a día.</p></div><Link href="/routines">Explorar rutinas <span aria-hidden="true">↗</span></Link></aside>
  </main>;
}
