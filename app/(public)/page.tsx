
import { SiteText } from "@/components/common/SiteText";
import { absoluteUrl, serializeJsonLd } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/features/products/ProductCard";
import { getAllProducts } from "@/lib/products.server";
import { getPublishedBlogPosts } from "@/lib/blog";
import { getEditableBlogPosts } from "@/lib/blog-content";
import { getEditorialSlides } from "@/lib/editorial";
import EditorialHeroCarousel from "@/components/features/home/EditorialHeroCarousel";

export const revalidate = 60;

const collections = [
  { key: "facial", title: "Para tu piel", note: "Limpieza, frescura e hidratación", image: "/products/autor/fa-lnd-70-1.png" },
  { key: "capilar", title: "Para tu cabello", note: "Un jardín en tu rutina", image: "/products/autor/mnk-001-1.png" },
  { key: "corporal", title: "Para todo tu cuerpo", note: "Pequeños momentos de bienestar", image: "/products/autor/crema-corporal-1.png" },
];

export default async function PublicHomePage() {
  const products = await getAllProducts();
  const blogPosts = await getEditableBlogPosts();
  const editorialSlides = getEditorialSlides(products, blogPosts);
  const featuredProducts = ["fa-lam-120-1", "fa-ass-30", "mnk-001", "balsamo-jardin-herbal"].map(id => products.find(p => p.id === id)).filter((p): p is typeof products[number] => Boolean(p));
  return (
    <div className="home-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd({ "@context": "https://schema.org", "@graph": [
        { "@type": "Organization", "@id": absoluteUrl("/#organization"), name: "MAI Natural", url: absoluteUrl("/"), logo: absoluteUrl("/ima/MAI-Logo.svg") },
        { "@type": "WebSite", "@id": absoluteUrl("/#website"), name: "MAI Natural", url: absoluteUrl("/"), inLanguage: "es-CO", publisher: { "@id": absoluteUrl("/#organization") } }
      ] }) }} />
      <section className="botanical-hero">
        <div className="hero-copy">
          <p className="eyebrow"><span className="tiny-leaf">✳</span><SiteText id="0040a1a069bf91299613">{" FORMULACIONES BOTÁNICAS DE AUTOR"}</SiteText></p>
          <h1><SiteText id="66e6259e4b4ff8e6a16a">{"Volver a lo natural."}</SiteText><br /><em><SiteText id="7d2ed90e853d00f1d759">{"Volver a ti."}</SiteText></em></h1>
          <p className="hero-description"><SiteText id="042e06020690ef1deb8b">{"El cuidado empieza con una pausa. Descubre rituales botánicos para tu piel, tu cabello y ese momento que es solo tuyo."}</SiteText></p>
          <div className="hero-actions"><Link href="/products" className="mai-button"><SiteText id="2bb097523c91e50803bf">{"Descubrir productos "}</SiteText><span aria-hidden="true">↗</span></Link><Link href="/routines" className="text-link"><SiteText id="7c72104e3acd96e6701c">{"Encuentra tu ritual "}</SiteText><span aria-hidden="true">→</span></Link></div>
          <div className="hero-footnote"><span className="hero-line" /><p><SiteText id="9c06be703de5e650dd6c">{"Formulado uno a uno."}</SiteText><br /><strong><SiteText id="6c3f6151dd8dc33688a4">{"Cuidado que se siente."}</SiteText></strong></p></div>
        </div>
        <EditorialHeroCarousel slides={editorialSlides} />
      </section>
      <div className="benefit-ribbon" aria-label="Nuestra propuesta"><span><SiteText id="079c82f4057b19ccd11d">{"Formulaciones botánicas de autor"}</SiteText></span><i aria-hidden="true">✳</i><span><SiteText id="a5324c5c1ba60f93e390">{"Elaborado uno a uno"}</SiteText></span><i aria-hidden="true">✳</i><span><SiteText id="244000cb11499039b36c">{"Asesoría personalizada"}</SiteText></span><i aria-hidden="true">✳</i><span><SiteText id="1dd1b8dea4e652cbfee8">{"Una rutina a tu ritmo"}</SiteText></span></div>

      <section className="editorial-section">
        <div className="section-heading"><div><p className="eyebrow"><SiteText id="66332d2226717eb1de94">{"TU NATURALEZA, TU RITUAL"}</SiteText></p><h2><SiteText id="30f0f5b6402689983d81">{"¿Por dónde quieres empezar?"}</SiteText></h2></div><Link href="/products" className="text-link"><SiteText id="b4395d208e1636809c26">{"Todo el catálogo "}</SiteText><span aria-hidden="true">↗</span></Link></div>
        <div className="collection-grid">{collections.map((c, index) => <Link className="collection-card" key={c.key} href={`/products?category=${c.key}`}><div className="collection-image"><Image src={c.image} alt={c.title + ": cosmética botánica MAI"} fill sizes="(max-width: 640px) 85vw, 33vw" /><span className="collection-number">0{index + 1}</span></div><div className="collection-caption"><div><h3><SiteText id={`home:collection:${c.key}:title`}>{c.title}</SiteText></h3><p><SiteText id={`home:collection:${c.key}:note`}>{c.note}</SiteText></p></div><span aria-hidden="true">↗</span></div></Link>)}</div>
      </section>

      <section className="editorial-section selection-section"><div className="section-heading"><div><p className="eyebrow"><SiteText id="7a78a005c8a147872ed8">{"LA SELECCIÓN MAI"}</SiteText></p><h2><SiteText id="7dcb24797b5b4b14cafd">{"Pequeños gestos. "}</SiteText><em><SiteText id="b803ec1e0a5f8e110665">{"Mucho cuidado."}</SiteText></em></h2></div><Link href="/products" className="text-link"><SiteText id="dcbdab263a28fb42c7d7">{"Explorar productos "}</SiteText><span aria-hidden="true">↗</span></Link></div><div className="home-product-grid">{featuredProducts.map(p => <ProductCard key={p.id} {...p} compact />)}</div></section>

      <section className="ritual-story"><div className="ritual-photo"><Image src="/products/autor/espuma-lavanda-ortiga-1.png" alt="Jabón Espumoso Facial Lavanda y Ortiga MAI" fill sizes="(max-width: 760px) 100vw, 50vw" /></div><div className="ritual-copy"><p className="eyebrow"><SiteText id="06d9f45991890069f530">{"MENOS COMPLICACIONES, MÁS CONSTANCIA"}</SiteText></p><h2><SiteText id="6edcef3a00105b5e11bb">{"Tu cuidado no necesita más pasos."}</SiteText><br /><em><SiteText id="3ea2d340f7ade062b3ee">{"Necesita los tuyos."}</SiteText></em></h2><p><SiteText id="2535278361aed13e66c0">{"Empieza por lo que buscas, conoce cada producto y construye una rutina que tenga sentido para ti."}</SiteText></p><ol className="ritual-steps"><li><span>01</span><SiteText id="9e55e9a2601df6ef98ec">{" Elige lo que quieres cuidar"}</SiteText></li><li><span>02</span><SiteText id="4db29ef4332e1f9d1f7c">{" Descubre una selección de productos"}</SiteText></li><li><span>03</span><SiteText id="d2b8713dcd21ce8ee074">{" Haz espacio para tu ritual"}</SiteText></li></ol><Link href="/routines" className="mai-button mai-button-light"><SiteText id="9756770b7d4219b241ab">{"Encontrar mi rutina "}</SiteText><span aria-hidden="true">↗</span></Link></div></section>

      <section className="editorial-section care-values"><div><p className="eyebrow"><SiteText id="86396f2b367f17024cfd">{"EL UNIVERSO MAI"}</SiteText></p><h2><SiteText id="9b5bf029121d7551e0b3">{"Formulaciones de autor."}</SiteText><br /><em><SiteText id="f1c93db42d8de73e94f5">{"Elaboradas una a una."}</SiteText></em></h2></div><div className="values-list"><article><span>01</span><div><h3><SiteText id="bbb8f3f9291e5868ee31">{"El tiempo de cada formulación"}</SiteText></h3><p><SiteText id="31bfaffb47bc2f5333b2">{"Elaboramos cada producto uno a uno. Entrega estimada de 5 a 7 días hábiles; confirma las condiciones para tu destino al comprar."}</SiteText></p></div></article><article><span>02</span><div><h3><SiteText id="0699239ba520dee08906">{"Elegir con tranquilidad"}</SiteText></h3><p><SiteText id="3529f25651a29adc01d4">{"Conoce los productos, compara sus precios y encuentra una rutina sin añadir pasos que no necesitas."}</SiteText></p></div></article><article><span>03</span><div><h3><SiteText id="67ff0d1961733a817481">{"Estamos para acompañarte"}</SiteText></h3><p><SiteText id="d911bda54992d0f77d3c">{"Si tienes dudas, conversemos. Nuestra asesoría te ayuda a conocer el catálogo y elegir con más claridad."}</SiteText></p><Link href="/services" className="text-link"><SiteText id="ceb10c119bd31f80fe08">{"Conocer las asesorías ↗"}</SiteText></Link></div></article></div></section>

      <section className="editorial-section journal-section"><div className="section-heading"><div><p className="eyebrow"><SiteText id="8298f488f625ecbf3ed6">{"EL DIARIO MAI"}</SiteText></p><h2><SiteText id="11f3385a00dc41b8a2e2">{"Un poco de inspiración para cuidarte."}</SiteText></h2></div><Link href="/blog" className="text-link"><SiteText id="55f0939b0065acb3b84d">{"Leer el diario ↗"}</SiteText></Link></div><div className="journal-grid">{blogPosts.slice(0,3).map(post => <article key={post.slug}><Link href={`/blog/${post.slug}`} className="journal-image"><Image src={post.heroImage} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" /></Link><p className="eyebrow">{post.category} · {post.readTime}</p><h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3><Link href={`/blog/${post.slug}`} className="text-link"><SiteText id="b98f5572ff5c49d119e2">{"Leer historia ↗"}</SiteText></Link></article>)}</div></section>

      <section className="home-faq editorial-section"><div><p className="eyebrow"><SiteText id="514f6b301c1d7a77a347">{"ANTES DE EMPEZAR"}</SiteText></p><h2><SiteText id="fe1d3544e07d1d97d3d4">{"Hablemos de tu compra."}</SiteText></h2></div><div>{[
        ["¿Cómo elijo mis productos?", "Explora el catálogo por cuidado facial, capilar o corporal. En Rutinas puedes ver una selección por necesidad. Si todavía tienes dudas, solicita una asesoría."],
        ["¿Cuánto tarda mi pedido?", "La entrega estimada es de 5 a 7 días hábiles porque cada formulación se elabora uno a uno. El destino y las condiciones de envío se revisan antes de confirmar tu pedido."],
        ["¿Necesito crear una cuenta para comprar?", "Puedes continuar como invitada o invitado desde el carrito. Te pediremos los datos necesarios para gestionar tu pedido y su entrega."],
        ["¿Qué opciones de pago hay?", "Pagas exclusivamente con Wompi. Revisa tus datos, el envío y el total en el checkout; después continúa a Wompi para completar el pago. Si estás en un entorno de pruebas, lo indicaremos antes de continuar."],
      ].map(([q,a], faqIndex) => <details key={q}><summary><SiteText id={`home:faq:${faqIndex}:question`}>{q}</SiteText><span aria-hidden="true">+</span></summary><p><SiteText id={`home:faq:${faqIndex}:answer`}>{a}</SiteText></p></details>)}</div></section>
    </div>
  );
}
