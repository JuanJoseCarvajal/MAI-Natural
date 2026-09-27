"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { createAdminProduct, deleteAdminProduct, updateAdminProduct } from "@/app/admin/actions";
import { categoryLabels, type Product } from "@/lib/products";
import { adminProductSchema } from "@/lib/validators/admin";
import styles from "./products-admin.module.css";

type Draft = Product;
const emptyProduct = (): Draft => ({
  id: "", name: "", image: "/products/autor/foto-pendiente.svg", images: [],
  price: "$0", amountInCents: 0, description: "", category: "facial", benefits: [],
  rating: 0, reviewsCount: 0, active: false, variants: [],
});

function Photo({ src, alt = "", small = false }: { src: string; alt?: string; small?: boolean }) {
  const valid = adminProductSchema.shape.image.safeParse(src).success;
  return <Image src={valid ? src : "/products/autor/foto-pendiente.svg"} alt={alt} width={small ? 88 : 120} height={small ? 110 : 150} sizes={small ? "88px" : "120px"} className={styles.photo} />;
}

export default function AdminProductsManager({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const open = draft !== null;

  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    const overflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
      trigger.current?.focus();
    };
  }, [open]);

  const edit = (product?: Product) => {
    trigger.current = document.activeElement as HTMLElement;
    setEditingId(product?.id ?? null);
    setError("");
    setDraft(product ? { ...product, images: Array.from(new Set([product.image, ...(product.images ?? [])])), variants: product.variants?.map(v => ({ ...v })) ?? [], benefits: [...product.benefits] } : emptyProduct());
  };
  const change = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft(current => current ? { ...current, [key]: value } : null);
  const close = () => { if (!pending) setDraft(null); };
  const save = () => {
    if (!draft || pending) return;
    const parsed = adminProductSchema.safeParse(draft);
    if (!parsed.success) { setError(parsed.error.issues.map(issue => issue.path.join(".") + ": " + issue.message).join(" · ")); return; }
    setError("");
    startTransition(async () => {
      try {
        const { product } = editingId ? await updateAdminProduct(editingId, parsed.data) : await createAdminProduct(parsed.data);
        setProducts(current => editingId ? current.map(item => item.id === editingId ? product : item) : [product, ...current]);
        setNotice(editingId ? "Producto actualizado." : "Producto creado.");
        setDraft(null);
      } catch (failure) { setError(failure instanceof Error ? failure.message : "No fue posible guardar. Inténtalo nuevamente."); }
    });
  };
  const remove = (product: Product) => {
    if (!window.confirm("¿Eliminar " + product.name + " del catálogo?")) return;
    startTransition(async () => {
      try { await deleteAdminProduct(product.id); setProducts(current => current.filter(item => item.id !== product.id)); setNotice("Producto eliminado."); }
      catch (failure) { setNotice(failure instanceof Error ? failure.message : "No fue posible eliminar."); }
    });
  };
  const photos = draft?.images ?? [];
  const replacePhotos = (next: string[], primary = draft?.image) => {
    setDraft(current => current ? { ...current, images: next, image: primary && next.includes(primary) ? primary : next[0] || "/products/autor/foto-pendiente.svg" } : null);
  };
  const movePhoto = (index: number, direction: number) => {
    const next = [...photos], target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    replacePhotos(next, next[0]);
  };
  const visible = products.filter(product => [product.name, product.sku, product.id].join(" ").toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));

  return <div className={styles.workspace}>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>Catálogo</p><h1>Gestión de productos</h1><p>Imágenes, descripciones y disponibilidad en un solo lugar.</p></div>
      <div role="toolbar" aria-label="Acciones de productos"><button type="button" disabled={pending} className={styles.create} aria-label="Crear producto" title="Crear producto" onClick={() => edit()}><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg><span>Crear producto</span></button></div>
    </header>
    <div className={styles.metrics}>
      <span><strong>{products.length}</strong> referencias</span>
      <span><strong>{products.filter(p => p.active !== false).length}</strong> visibles</span>
      <span><strong>5–7 días</strong> preparación y entrega</span>
    </div>
    {notice && <p role="status" className={styles.notice}>{notice}</p>}
    <label className={styles.search}>Buscar productos<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Nombre, SKU o identificador" /></label>
    <p role="status">{visible.length} productos encontrados</p>
    <div className={styles.grid}>
      {visible.map(product => <article key={product.id} className={styles.card}>
        <Photo src={product.image} alt={product.name} />
        <div className={styles.cardBody}><p className={styles.eyebrow}>{product.category}</p><h2>{product.name}</h2><p>{product.price} · {product.active === false ? "Oculto" : "Elaboración bajo pedido"}</p><p className={styles.meta}>{product.sku || product.id} · {Array.from(new Set([product.image, ...(product.images ?? [])])).length} fotos</p>
          <div className={styles.actions}><button type="button" disabled={pending} onClick={() => edit(product)} aria-label={"Editar " + product.name}>Editar</button><button type="button" disabled={pending} onClick={() => remove(product)} className={styles.delete} aria-label={"Eliminar " + product.name}>Eliminar</button></div>
        </div>
      </article>)}
    </div>
    {!visible.length && <p>No hay productos que coincidan con tu búsqueda.</p>}
    {draft && <dialog ref={dialog} aria-labelledby="product-editor-title" onCancel={event => { event.preventDefault(); close(); }} className={styles.dialog}>
      <header className={styles.modalHeader}><div><p className={styles.eyebrow}>{editingId ? "Editar referencia" : "Nueva referencia"}</p><h2 id="product-editor-title">{editingId ? draft.name : "Crear producto"}</h2></div><button type="button" disabled={pending} onClick={close} aria-label="Cerrar editor" autoFocus>×</button></header>
      <form onSubmit={event => { event.preventDefault(); save(); }}>
        <fieldset disabled={pending} className={styles.fields}>
          <label>Nombre<input required maxLength={160} value={draft.name} onChange={event => change("name", event.target.value)} /></label>
          <label>Categoría<select value={draft.category} onChange={event => change("category", event.target.value as Product["category"])}>{Object.entries(categoryLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          <label>ID / slug<input value={draft.id} pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={160} placeholder="Se genera a partir del nombre" onChange={event => change("id", event.target.value)} /><small>Cambiarlo modifica el enlace público del producto.</small></label>
          <label>SKU<input value={draft.sku ?? ""} onChange={event => change("sku", event.target.value)} /></label>
          <label>Precio (COP)<input type="number" min="0" step="0.01" required value={draft.amountInCents / 100} onChange={event => { const amount = Math.round(Number(event.target.value) * 100); setDraft(current => current ? { ...current, amountInCents: amount, price: amount > 0 ? "$" + (amount / 100).toLocaleString("es-CO") : "Precio por confirmar" } : null); }} /></label>
          <label>Precio visible<input required value={draft.price} onChange={event => change("price", event.target.value)} /></label>
          <p className={styles.full}>Modelo de producción: todos los productos se elaboran bajo pedido. Preparación y entrega estimadas: 5 a 7 días hábiles.</p>
          <label>Visibilidad<select value={draft.active === false ? "hidden" : "active"} onChange={event => change("active", event.target.value === "active")}><option value="active">Visible</option><option value="hidden">Oculto</option></select></label>
          <label>Etiqueta<input value={draft.badge ?? ""} onChange={event => change("badge", event.target.value)} /></label>
          <label>Valoración<input type="number" min="0" max="5" step="0.1" value={draft.rating} onChange={event => change("rating", Number(event.target.value))} /></label>
          <label>Número de reseñas<input type="number" min="0" step="1" value={draft.reviewsCount} onChange={event => change("reviewsCount", Number(event.target.value))} /></label>
          <label className={styles.full}>Descripción<textarea aria-label="Descripción" rows={6} maxLength={12000} value={draft.description} onChange={event => change("description", event.target.value)} /></label>
          <label className={styles.full}>Beneficios (uno por línea)<textarea aria-label="Beneficios (uno por línea)" rows={3} value={draft.benefits.join("\n")} onChange={event => change("benefits", event.target.value.split("\n"))} /></label>
          <section className={styles.full} aria-label="Imágenes del producto"><h3>Imágenes y carrusel</h3><p>La primera foto será la principal. Agrega rutas de imágenes del sitio o URLs de mainatural.com.</p>
            <div className={styles.photos}>{photos.map((src, index) => <div key={index} className={styles.photoRow}><Photo src={src} small /><div><label>{index === 0 ? "Imagen principal" : "Imagen " + (index + 1)}<input required value={src} placeholder="/products/autor/foto.png" onChange={event => { const next = [...photos]; next[index] = event.target.value; replacePhotos(next, next[0]); }} /></label><div className={styles.actions}><button type="button" disabled={index === 0} onClick={() => { const next = [...photos]; next.splice(index, 1); next.unshift(src); replacePhotos(next, src); }}>Hacer principal</button><button type="button" disabled={index === 0} aria-label={"Subir imagen " + (index + 1)} onClick={() => movePhoto(index, -1)}>↑</button><button type="button" disabled={index === photos.length - 1} aria-label={"Bajar imagen " + (index + 1)} onClick={() => movePhoto(index, 1)}>↓</button><button type="button" aria-label={"Quitar imagen " + (index + 1)} onClick={() => replacePhotos(photos.filter((_, i) => i !== index))}>Quitar</button></div></div></div>)}</div>
            <button type="button" disabled={photos.length >= 20} onClick={() => change("images", [...photos, ""])}>+ Agregar imagen</button>
          </section>
          <section className={styles.full} aria-label="Variantes del producto"><h3>Variantes</h3><p>Comparten el precio y el plazo de elaboración del producto.</p>
            {(draft.variants ?? []).map((variant, index) => <div key={index} className={styles.variant}>
              {(["id", "name", "image"] as const).map(key => <label key={key}>{key === "id" ? "ID de variante" : key === "name" ? "Nombre de variante" : "Imagen de variante"}<input required value={variant[key]} onChange={event => change("variants", draft.variants!.map((v, i) => i === index ? { ...v, [key]: event.target.value } : v))} /></label>)}
              <button type="button" onClick={() => change("variants", draft.variants!.filter((_, i) => i !== index))}>Quitar variante</button>
            </div>)}
            <button type="button" disabled={(draft.variants?.length ?? 0) >= 30} onClick={() => change("variants", [...(draft.variants ?? []), { id: "", name: "", image: draft.image }])}>+ Agregar variante</button>
          </section>
        </fieldset>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <footer className={styles.modalFooter}><button type="button" disabled={pending} onClick={close}>Cancelar</button><button type="submit" disabled={pending} className={styles.create}>{pending ? "Guardando…" : "Guardar producto"}</button></footer>
      </form>
    </dialog>}
  </div>;
}
