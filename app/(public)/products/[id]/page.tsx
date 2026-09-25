
import { SiteText } from "@/components/common/SiteText";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryLabels } from "@/lib/products";
import ProductPurchase from "@/components/features/products/ProductPurchase";
import ProductCard from "@/components/features/products/ProductCard";
import ProductGallery from "@/components/features/products/ProductGallery";
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
    <Breadcrumbs items={[{ label: "Tienda", href: "/products" }, { label: product.name }]} />
    <div className={styles.detailGrid}>
      <ProductGallery image={product.image} images={product.images} name={product.name} detail />
      <div className={styles.detailInfo}><p className={styles.eyebrow}>{categoryLabels[product.category]}</p><h1>{product.name}</h1><p className={styles.detailPrice}>{product.price}<span hidden={product.amountInCents <= 0}><SiteText id="6539c299f7388a51c22c">{"COP"}</SiteText></span></p><p className={styles.priceNote}><SiteText id="b56903e541b63c5d3296">{"Envío calculado antes de confirmar tu pedido."}</SiteText></p><p className={styles.detailDescription}>{product.description}</p>
        <div className={styles.purchase}><ProductPurchase product={product} /></div>
        <div className={styles.delivery}><p><strong><SiteText id="64d5d48f2d8c8272c4b6">{"Formulación de autor."}</SiteText></strong><SiteText id="5295e1b37eac2b98a30a">{" Elaborada uno a uno, producto a producto."}</SiteText></p><p><SiteText id="a167be8fd1e60de8e796">{"Entrega estimada: 5 a 7 días hábiles."}</SiteText></p><p><SiteText id="ac50c57ee5a598d356ae">{"Paga con Wompi. En el checkout verás el envío y el total antes de continuar al pago seguro. Las pruebas se identifican y no realizan cobros reales."}</SiteText></p></div>
        <details open><summary><SiteText id="58fc11ffa85367216e54">{"Lo que hace parte de tu ritual"}</SiteText></summary><ul>{product.benefits.map(benefit => <li key={benefit}>— {benefit}</li>)}</ul></details>
        <details><summary><SiteText id="37460bf97f9bcf02924a">{"Compra y entrega"}</SiteText></summary><p><SiteText id="3c746d8e385d96bd85d4">{"Revisa tus datos y el total con envío en el checkout. Después continúa directamente a Wompi para completar tu pago."}</SiteText></p><p><Link href="/terms"><SiteText id="2651daa6303fadcf30ce">{"Consulta nuestros términos de compra y políticas."}</SiteText></Link></p></details>
        <details><summary><SiteText id="287e0357b0f89482759f">{"Encuentra tu rutina"}</SiteText></summary><p><SiteText id="3851a236b0dbe529cb19">{"Combina el cuidado de tu piel, cabello y cuerpo con una rutina para tu día a día."}</SiteText></p><p><Link href="/routines"><SiteText id="6b10bac646f393a4803b">{"Explorar las rutinas MAI ↗"}</SiteText></Link></p></details>
      </div>
    </div>
    {related.length ? <section className={styles.related}><p className={styles.eyebrow}><SiteText id="8a81ec777a9192e7cb80">{"SIGUE EXPLORANDO"}</SiteText></p><h2><SiteText id="deba4b0f98c235951042">{"Un ritual se complementa."}</SiteText></h2><div>{related.map(item => <ProductCard key={item.id} {...item} />)}</div></section> : null}
  </div>;
}
