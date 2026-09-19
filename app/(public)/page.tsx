import { absoluteUrl, serializeJsonLd } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/features/products/ProductCard";
import { getAllProducts } from "@/lib/products.server";
import { getPublishedBlogPosts } from "@/lib/blog";
import { getEditorialSlides } from "@/lib/editorial";
import EditorialHeroCarousel from "@/components/features/home/EditorialHeroCarousel";

export const revalidate = 60;

const collections = [
  { key: "facial", title: "Para tu piel", note: "Limpieza, frescura e hidratación", image: "/products/Facial/agua-de-rosas-mai-natural.png" },
  { key: "capilar", title: "Para tu cabello", note: "Un jardín en tu rutina", image: "/products/Capilar/shampoo-jardin-herbal-mai-natural.png" },
  { key: "corporal", title: "Para todo tu cuerpo", note: "Pequeños momentos de bienestar", image: "/products/Corporal/crema-corporal-rosas-cacao-mai-natural.png" },
];

export default async function PublicHomePage() {
  const products = await getAllProducts();
  const blogPosts = getPublishedBlogPosts();
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
          <p className="eyebrow"><span className="tiny-leaf">✳</span> FORMULACIONES BOTÁNICAS DE AUTOR</p>
          <h1>Volver a lo natural.<br /><em>Volver a ti.</em></h1>
          <p className="hero-description">El cuidado empieza con una pausa. Descubre rituales botánicos para tu piel, tu cabello y ese momento que es solo tuyo.</p>
          <div className="hero-actions"><Link href="/products" className="mai-button">Descubrir productos <span aria-hidden="true">↗</span></Link><Link href="/routines" className="text-link">Encuentra tu ritual <span aria-hidden="true">→</span></Link></div>
          <div className="hero-footnote"><span className="hero-line" /><p>Formulado uno a uno.<br /><strong>Cuidado que se siente.</strong></p></div>
        </div>
        <EditorialHeroCarousel slides={editorialSlides} />
      </section>
      <div className="benefit-ribbon" aria-label="Nuestra propuesta"><span>Formulaciones botánicas de autor</span><i aria-hidden="true">✳</i><span>Elaborado uno a uno</span><i aria-hidden="true">✳</i><span>Asesoría personalizada</span><i aria-hidden="true">✳</i><span>Una rutina a tu ritmo</span></div>

      <section className="editorial-section">
        <div className="section-heading"><div><p className="eyebrow">TU NATURALEZA, TU RITUAL</p><h2>¿Por dónde quieres empezar?</h2></div><Link href="/products" className="text-link">Todo el catálogo <span aria-hidden="true">↗</span></Link></div>
        <div className="collection-grid">{collections.map((c, index) => <Link className="collection-card" key={c.key} href={`/products?category=${c.key}`}><div className="collection-image"><Image src={c.image} alt={c.title + ": cosmética botánica MAI"} fill sizes="(max-width: 640px) 85vw, 33vw" /><span className="collection-number">0{index + 1}</span></div><div className="collection-caption"><div><h3>{c.title}</h3><p>{c.note}</p></div><span aria-hidden="true">↗</span></div></Link>)}</div>
      </section>

      <section className="editorial-section selection-section"><div className="section-heading"><div><p className="eyebrow">LA SELECCIÓN MAI</p><h2>Pequeños gestos. <em>Mucho cuidado.</em></h2></div><Link href="/products" className="text-link">Explorar productos <span aria-hidden="true">↗</span></Link></div><div className="home-product-grid">{featuredProducts.map(p => <ProductCard key={p.id} {...p} compact />)}</div></section>

      <section className="ritual-story"><div className="ritual-photo"><Image src="/products/Facial/calendula-aloe-vera-manzanilla-mousse-cremoso-limpiador-mai-natural.png" alt="Limpiador botánico de caléndula, aloe vera y manzanilla MAI" fill sizes="(max-width: 760px) 100vw, 50vw" /></div><div className="ritual-copy"><p className="eyebrow">MENOS COMPLICACIONES, MÁS CONSTANCIA</p><h2>Tu cuidado no necesita más pasos.<br /><em>Necesita los tuyos.</em></h2><p>Empieza por lo que buscas, conoce cada producto y construye una rutina que tenga sentido para ti.</p><ol className="ritual-steps"><li><span>01</span> Elige lo que quieres cuidar</li><li><span>02</span> Descubre una selección de productos</li><li><span>03</span> Haz espacio para tu ritual</li></ol><Link href="/routines" className="mai-button mai-button-light">Encontrar mi rutina <span aria-hidden="true">↗</span></Link></div></section>

      <section className="editorial-section care-values"><div><p className="eyebrow">EL UNIVERSO MAI</p><h2>Formulaciones de autor.<br /><em>Elaboradas una a una.</em></h2></div><div className="values-list"><article><span>01</span><div><h3>El tiempo de cada formulación</h3><p>Elaboramos cada producto uno a uno. Entrega estimada de 5 a 7 días hábiles; confirma las condiciones para tu destino al comprar.</p></div></article><article><span>02</span><div><h3>Elegir con tranquilidad</h3><p>Conoce los productos, compara sus precios y encuentra una rutina sin añadir pasos que no necesitas.</p></div></article><article><span>03</span><div><h3>Estamos para acompañarte</h3><p>Si tienes dudas, conversemos. Nuestra asesoría te ayuda a conocer el catálogo y elegir con más claridad.</p><Link href="/services" className="text-link">Conocer las asesorías ↗</Link></div></article></div></section>

      <section className="editorial-section journal-section"><div className="section-heading"><div><p className="eyebrow">EL DIARIO MAI</p><h2>Un poco de inspiración para cuidarte.</h2></div><Link href="/blog" className="text-link">Leer el diario ↗</Link></div><div className="journal-grid">{blogPosts.slice(0,3).map(post => <article key={post.slug}><Link href={`/blog/${post.slug}`} className="journal-image"><Image src={post.heroImage} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" /></Link><p className="eyebrow">{post.category} · {post.readTime}</p><h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3><Link href={`/blog/${post.slug}`} className="text-link">Leer historia ↗</Link></article>)}</div></section>

      <section className="home-faq editorial-section"><div><p className="eyebrow">ANTES DE EMPEZAR</p><h2>Hablemos de tu compra.</h2></div><div>{[
        ["¿Cómo elijo mis productos?", "Explora el catálogo por cuidado facial, capilar o corporal. En Rutinas puedes ver una selección por necesidad. Si todavía tienes dudas, solicita una asesoría."],
        ["¿Cuánto tarda mi pedido?", "La entrega estimada es de 5 a 7 días hábiles porque cada formulación se elabora uno a uno. El destino y las condiciones de envío se revisan antes de confirmar tu pedido."],
        ["¿Necesito crear una cuenta para comprar?", "Puedes continuar como invitada o invitado desde el carrito. Te pediremos los datos necesarios para gestionar tu pedido y su entrega."],
        ["¿Qué opciones de pago hay?", "Pagas exclusivamente con Wompi. Revisa tus datos, el envío y el total en el checkout; después continúa a Wompi para completar el pago. Si estás en un entorno de pruebas, lo indicaremos antes de continuar."],
      ].map(([q,a]) => <details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>
    </div>
  );
}
