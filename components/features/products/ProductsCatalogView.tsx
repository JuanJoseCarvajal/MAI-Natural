"use client";
import { SiteText } from "@/components/common/SiteText";

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
    const result = products.filter(p => (!categories.length || categories.includes(p.category)) && normalize(`${p.name} ${p.description} ${categoryLabels[p.category]}`).includes(normalize(query.trim())) && (budget === "all" || (p.amountInCents > 0 && p.amountInCents <= Number(budget))));
    if (sort === "asc") result.sort((a,b) => a.amountInCents-b.amountInCents);
    if (sort === "desc") result.sort((a,b) => b.amountInCents-a.amountInCents);
    if (sort === "name") result.sort((a,b) => a.name.localeCompare(b.name, "es"));
    return result;
  }, [products, categories, query, sort, budget]);
  const toggle = (key: string) => setCategories(current => current.includes(key) ? current.filter(c => c !== key) : [...current,key]);
  const reset = () => { setCategories([]); setQuery(""); setBudget("all"); };
  return <div className={styles.catalog}>
    <header className={styles.catalogHeader}><div><p className={styles.eyebrow}><SiteText id="6dbc4dfe3657689d4791">{"EL PODER DE LO SIMPLE"}</SiteText></p><h1><SiteText id="5872e8d355ac4bd86654">{"Tu naturaleza."}</SiteText><br /><em><SiteText id="058f4c1756f54a193eac">{"Tu ritual."}</SiteText></em></h1></div><div><p><SiteText id="540018251b2f0e1c9c75">{"Cuidado facial, capilar y corporal para encontrar ese momento que es solo tuyo."}</SiteText></p><Link href="/routines"><SiteText id="576f0cab11eaa8e39fd5">{"Encuentra tu rutina "}</SiteText><span aria-hidden="true">↗</span></Link></div></header>
    <section className={styles.filters} aria-label="Filtrar productos">
      <div className={styles.categoryFilters}><button onClick={() => setCategories([])} aria-pressed={!categories.length}><SiteText id="96961b1308eac652cb99">{"Todo el cuidado "}</SiteText><span>{products.length}</span></button>{Object.entries(categoryLabels).filter(([key]) => products.some(p => p.category === key)).map(([key,label]) => <button key={key} onClick={() => toggle(key)} aria-pressed={categories.includes(key)}>{label.replace("Cosmética Natural ", "")} <span>{products.filter(p => p.category === key).length}</span></button>)}</div>
      <div className={styles.searchRow}><label className={styles.search}><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Busca tu próximo ritual…" aria-label="Buscar productos por nombre o necesidad" /></label><label className={styles.select}><SiteText id="637392d0e859838b84a0">{"Presupuesto"}</SiteText><select value={budget} onChange={e => setBudget(e.target.value)}><option value="all"><SiteText id="9e7e01cfa48322182fe0">{"Todos los precios"}</SiteText></option><option value="5000000"><SiteText id="3504ba6d54d9a0b1e12b">{"Hasta $50.000"}</SiteText></option><option value="8000000"><SiteText id="96b228c61fd02f55ded9">{"Hasta $80.000"}</SiteText></option><option value="12000000"><SiteText id="1945c62c5f0bc92bb19a">{"Hasta $120.000"}</SiteText></option></select></label><label className={styles.select}><SiteText id="ee37ca853beda562de11">{"Ordenar por"}</SiteText><select value={sort} onChange={e => setSort(e.target.value)}><option value="default"><SiteText id="cb69701aa2bbb9577ec8">{"Orden del catálogo"}</SiteText></option><option value="asc"><SiteText id="8ef1de5c065746fce66f">{"Menor precio"}</SiteText></option><option value="desc"><SiteText id="19becd3cf7cc09c331f8">{"Mayor precio"}</SiteText></option><option value="name"><SiteText id="dbd786168e1468a17fc2">{"Nombre: A–Z"}</SiteText></option></select></label></div>
    </section>
    <div className={styles.results}><p role="status">{visible.length} {visible.length === 1 ? "producto" : "productos"}</p><div>{categories.map(key => <button key={key} onClick={() => toggle(key)} aria-label={`Quitar filtro ${categoryLabels[key as keyof typeof categoryLabels]}`}>{categoryLabels[key as keyof typeof categoryLabels].replace("Cosmética Natural ", "")}<SiteText id="206a7b9d738f475f644c">{" ×"}</SiteText></button>)}{categories.length || query || budget !== "all" ? <button onClick={reset}><SiteText id="553257363e763e123b36">{"Limpiar filtros"}</SiteText></button> : null}</div><span><SiteText id="74e04aa60103aef2f304">{"Precios en pesos colombianos"}</SiteText></span></div>
    {visible.length ? <div className={styles.productGrid}>{visible.map(product => <ProductCard key={product.id} {...product} />)}</div> : <div className={styles.empty}><h2><SiteText id="0049794bcda9e5ae6ba7">{"No encontramos ese ritual."}</SiteText></h2><p><SiteText id="0889683e53a9fba4ad06">{"Prueba otra palabra o amplía los filtros para descubrir más opciones."}</SiteText></p><button onClick={reset}><SiteText id="1d1c09d47cb0093c534c">{"Ver todos los productos"}</SiteText></button></div>}
    <aside className={styles.routineBanner}><div><p className={styles.eyebrow}><SiteText id="52fd4820307dbd1c93fd">{"UN CUIDADO QUE VA CONTIGO"}</SiteText></p><h2><SiteText id="d43961bd3675476fa739">{"Empieza con una rutina."}</SiteText></h2><p><SiteText id="c59499f18540f8201878">{"Descubre cómo combinar tus productos en el día a día."}</SiteText></p></div><Link href="/routines"><SiteText id="4890c24c79d6a7bf00c2">{"Explorar rutinas "}</SiteText><span aria-hidden="true">↗</span></Link></aside>
  </div>;
}
