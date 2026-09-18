import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryLabels } from "@/lib/products";
import AddToCartButton from "@/components/features/cart/AddToCartButton";
import ProductCard from "@/components/features/products/ProductCard";
import ImageFrame from "@/components/ui/ImageFrame";
import { getAllProducts, getProductById } from "@/lib/products.server";
import { absoluteUrl, buildMetadata, siteName, serializeJsonLd } from "@/lib/seo";
import styles from "@/components/features/products/products.module.css";
type ProductDetailProps = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: ProductDetailProps): Promise<Metadata> {
  const product = await getProductById((await params).id);
  if (!product) return { robots: { index: false, follow: false } };
  return buildMetadata({ title: `${product.name} | ${siteName}`, description: product.description, path: `/products/${product.id}`, image: product.image });
}
export default async function ProductDetailPage({ params }: ProductDetailProps) {
  const [product, products] = await Promise.all([getProductById((await params).id), getAllProducts()]);
  if (!product) notFound();
  const related = products.filter(item => item.category === product.category && item.id !== product.id).slice(0,3);
  const unavailable = typeof product.stock === "number" && product.stock <= 0;
  const url = absoluteUrl(`/products/${product.id}`);
  const structuredData = { "@context":"https://schema.org", "@graph":[
    { "@type":"Product", "@id":`${url}#product`, name:product.name, image:[absoluteUrl(product.image)], description:product.description, sku:product.sku ?? product.id, category:categoryLabels[product.category], brand:{"@type":"Brand",name:siteName}, ...(product.amountInCents > 0 ? { offers:{"@type":"Offer",priceCurrency:"COP",price:product.amountInCents/100, ...(typeof product.stock === "number" ? {availability:`https://schema.org/${unavailable ? "OutOfStock" : "InStock"}`} : {}), url, seller:{"@type":"Organization",name:siteName}}} : {}) },
    {"@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Inicio",item:absoluteUrl("/")},{"@type":"ListItem",position:2,name:"Tienda",item:absoluteUrl("/products")},{"@type":"ListItem",position:3,name:product.name,item:url}]}
  ]};
  return <div className={styles.detail}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(structuredData)}} />
    <nav className={styles.breadcrumb} aria-label="Ruta de navegación"><Link href="/">Inicio</Link><span>/</span><Link href="/products">Tienda</Link><span>/</span><span aria-current="page">{product.name}</span></nav>
    <div className={styles.detailGrid}>
      <ImageFrame src={product.image} alt={product.name} loading="eager" fit="contain" frameClassName={styles.detailImage} sizes="(max-width: 640px) 90vw, 48vw" />
      <div className={styles.detailInfo}><p className={styles.eyebrow}>{categoryLabels[product.category]}</p><h1>{product.name}</h1><p className={styles.detailPrice}>{product.price}<span>COP</span></p><p className={styles.priceNote}>Envío calculado antes de confirmar tu pedido.</p><p className={styles.detailDescription}>{product.description}</p>
        <div className={styles.purchase}>{unavailable ? <p role="status">Este producto está agotado por ahora.</p> : product.amountInCents > 0 ? <AddToCartButton id={product.id} name={product.name} price={product.price} amountInCents={product.amountInCents} image={product.image} /> : <p>Precio pendiente de confirmación.</p>}</div>
        <div className={styles.delivery}><p><strong>Hecho con intención.</strong> Preparación artesanal, producto a producto.</p><p>Entrega estimada: 5 a 7 días hábiles.</p><p>Transferencia Bancolombia. Confirmamos el pago al revisar tu comprobante.</p></div>
        <details open><summary>Lo que hace parte de tu ritual</summary><ul>{product.benefits.map(benefit => <li key={benefit}>— {benefit}</li>)}</ul></details>
        <details><summary>Compra y entrega</summary><p>Envía tu solicitud de pedido. El equipo cotizará el envío y confirmará contigo el total y las instrucciones antes de que pagues.</p><p><Link href="/terms">Consulta nuestros términos de compra y políticas.</Link></p></details>
        <details><summary>Encuentra tu rutina</summary><p>Combina el cuidado de tu piel, cabello y cuerpo con una rutina para tu día a día.</p><p><Link href="/routines">Explorar las rutinas MAI ↗</Link></p></details>
      </div>
    </div>
    {related.length ? <section className={styles.related}><p className={styles.eyebrow}>SIGUE EXPLORANDO</p><h2>Un ritual se complementa.</h2><div>{related.map(item => <ProductCard key={item.id} {...item} />)}</div></section> : null}
  </div>;
}
