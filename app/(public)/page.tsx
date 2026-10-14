
import { SiteText } from "@/components/common/SiteText";
import { absoluteUrl, serializeJsonLd } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import FullHomeHero from "@/components/features/home/FullHomeHero";
import AnhydrousSlider from "@/components/features/home/AnhydrousSlider";
import {getHomeConfig} from "@/lib/home-config.server";
import {getAnhydrousProducts, getHomeBlogSlides, getHomeCategories} from "@/lib/home-config";
import styles from "@/components/features/home/home-refresh.module.css";
import { getAllProducts } from "@/lib/products.server";
import { getEditableBlogPosts } from "@/lib/blog-content";


export const revalidate = 60;

export default async function PublicHomePage() {
  const [products,blogPosts,config] = await Promise.all([getAllProducts(),getEditableBlogPosts(),getHomeConfig()]);
  const heroSlides = getHomeBlogSlides(blogPosts);
  const categories = getHomeCategories(config,products);
  const anhydrousProducts = getAnhydrousProducts(products,config.anhydrous.productIds);
  return (
    <div className="home-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd({ "@context": "https://schema.org", "@graph": [
        { "@type": "Organization", "@id": absoluteUrl("/#organization"), name: "MAI Natural", url: absoluteUrl("/"), logo: absoluteUrl("/ima/MAI-Logo.svg") },
        { "@type": "WebSite", "@id": absoluteUrl("/#website"), name: "MAI Natural", url: absoluteUrl("/"), inLanguage: "es-CO", publisher: { "@id": absoluteUrl("/#organization") } }
      ] }) }} />
      <FullHomeHero slides={heroSlides} />
      <div className="benefit-ribbon" aria-label="Nuestra propuesta"><span><SiteText id="079c82f4057b19ccd11d">{"Formulaciones botánicas de autor"}</SiteText></span><i aria-hidden="true">✳</i><span><SiteText id="a5324c5c1ba60f93e390">{"Elaborado uno a uno"}</SiteText></span><i aria-hidden="true">✳</i><span><SiteText id="244000cb11499039b36c">{"Asesoría personalizada"}</SiteText></span><i aria-hidden="true">✳</i><span><SiteText id="1dd1b8dea4e652cbfee8">{"Una rutina a tu ritmo"}</SiteText></span></div>

      <section id="colecciones" className={styles.collections}>
        <div className={styles.collectionHeading}><div><p className={styles.eyebrow}>TU NATURALEZA, TU RITUAL</p><h2>Empieza por ti.</h2></div><Link href="/products" className="text-link">Todo el catálogo ↗</Link></div>
        <div className={styles.categoryGrid}>{categories.filter(c=>c.enabled).map((c,index)=><Link key={c.id} href={c.href} className={styles.category}><Image src={c.image} alt={c.alt} fill sizes="(max-width:760px) 100vw, 50vw"/><div className={styles.categoryContent}><span>{String(index+1).padStart(2,'0')} / MAI</span><h3>{c.title}</h3><p>{c.description}</p><span className={styles.glassButton}>{c.action}<span aria-hidden="true">↗</span></span></div></Link>)}</div>
      </section>
      <section className={styles.anhydrous} aria-labelledby="anhydrous-heading"><div className={styles.anhydrousIntro}><div className={styles.anhydrousCopy}><p className={styles.eyebrow}>COSMÉTICA ANHIDRA · LO ESENCIAL, CONCENTRADO</p><h2 id="anhydrous-heading">{config.anhydrous.title}</h2><p>{config.anhydrous.description}</p><span className={styles.anhydrousTag}>SIN AGUA EN LA FÓRMULA. TODO UN RITUAL.</span></div><div className={styles.anhydrousArt}><Image src={config.anhydrous.image} alt={config.anhydrous.alt} fill sizes="(max-width:760px) 100vw, 45vw"/></div></div><AnhydrousSlider products={anhydrousProducts}/></section>

      <section className="ritual-story"><div className="ritual-photo"><Image src="/products/media/facial/espuma-lavanda-ortiga-1.png" alt="Jabón Espumoso Facial Lavanda y Ortiga MAI" fill sizes="(max-width: 760px) 100vw, 50vw" /></div><div className="ritual-copy"><p className="eyebrow"><SiteText id="06d9f45991890069f530">{"MENOS COMPLICACIONES, MÁS CONSTANCIA"}</SiteText></p><h2><SiteText id="6edcef3a00105b5e11bb">{"Tu cuidado no necesita más pasos."}</SiteText><br /><em><SiteText id="3ea2d340f7ade062b3ee">{"Necesita los tuyos."}</SiteText></em></h2><p><SiteText id="2535278361aed13e66c0">{"Empieza por lo que buscas, conoce cada producto y construye una rutina que tenga sentido para ti."}</SiteText></p><ol className="ritual-steps"><li><span>01</span><SiteText id="9e55e9a2601df6ef98ec">{" Elige lo que quieres cuidar"}</SiteText></li><li><span>02</span><SiteText id="4db29ef4332e1f9d1f7c">{" Descubre una selección de productos"}</SiteText></li><li><span>03</span><SiteText id="d2b8713dcd21ce8ee074">{" Haz espacio para tu ritual"}</SiteText></li></ol><Link href="/routines" className="mai-button mai-button-light"><SiteText id="9756770b7d4219b241ab">{"Encontrar mi rutina "}</SiteText><span aria-hidden="true">↗</span></Link></div></section>

      <section className="editorial-section care-values"><div><p className="eyebrow"><SiteText id="86396f2b367f17024cfd">{"EL UNIVERSO MAI"}</SiteText></p><h2><SiteText id="9b5bf029121d7551e0b3">{"Formulaciones de autor."}</SiteText><br /><em><SiteText id="f1c93db42d8de73e94f5">{"Elaboradas una a una."}</SiteText></em></h2></div><div className="values-list"><article><span>01</span><div><h3><SiteText id="bbb8f3f9291e5868ee31">{"El tiempo de cada formulación"}</SiteText></h3><p><SiteText id="31bfaffb47bc2f5333b2">{"Elaboramos cada producto uno a uno. Entrega estimada de 5 a 7 días hábiles; confirma las condiciones para tu destino al comprar."}</SiteText></p></div></article><article><span>02</span><div><h3><SiteText id="0699239ba520dee08906">{"Elegir con tranquilidad"}</SiteText></h3><p><SiteText id="3529f25651a29adc01d4">{"Conoce los productos, compara sus precios y encuentra una rutina sin añadir pasos que no necesitas."}</SiteText></p></div></article><article><span>03</span><div><h3><SiteText id="67ff0d1961733a817481">{"Estamos para acompañarte"}</SiteText></h3><p><SiteText id="d911bda54992d0f77d3c">{"Si tienes dudas, conversemos. Nuestra asesoría te ayuda a conocer el catálogo y elegir con más claridad."}</SiteText></p><Link href="/services" className="text-link"><SiteText id="ceb10c119bd31f80fe08">{"Conocer las asesorías ↗"}</SiteText></Link></div></article></div></section>

      <section className={styles.journal}><div className={styles.journalHeader}><div><p className={styles.eyebrow}>EL DIARIO MAI · HISTORIAS PARA HABITARTE</p><h2>El cuidado también<br/><em>se lee.</em></h2></div><Link href="/blog">Explorar el diario ↗</Link></div><div className={styles.journalGrid}>{blogPosts.slice(0,3).map((post,index)=><Link key={post.slug} href={`/blog/${post.slug}`} className={styles.story}><Image src={post.heroImage} alt={post.heroAlt||post.title} fill sizes={index===0?'(max-width:760px) 100vw, 60vw':'(max-width:760px) 100vw, 35vw'}/><div className={styles.storyCopy}><p className={styles.eyebrow}>{post.category} · {post.readTime}</p><h3>{post.title}</h3>{index===0&&<p className={styles.storyDescription}>{post.description}</p>}<span>Entrar en la historia ↗</span></div></Link>)}</div></section>

      <section className="home-faq editorial-section"><div><p className="eyebrow"><SiteText id="514f6b301c1d7a77a347">{"ANTES DE EMPEZAR"}</SiteText></p><h2><SiteText id="fe1d3544e07d1d97d3d4">{"Hablemos de tu compra."}</SiteText></h2></div><div>{[
        ["¿Cómo elijo mis productos?", "Explora el catálogo por cuidado facial, capilar o corporal. En Rutinas puedes ver una selección por necesidad. Si todavía tienes dudas, solicita una asesoría."],
        ["¿Cuánto tarda mi pedido?", "La entrega estimada es de 5 a 7 días hábiles porque cada formulación se elabora uno a uno. El destino y las condiciones de envío se revisan antes de confirmar tu pedido."],
        ["¿Necesito crear una cuenta para comprar?", "Puedes continuar como invitada o invitado desde el carrito. Te pediremos los datos necesarios para gestionar tu pedido y su entrega."],
        ["¿Qué opciones de pago hay?", "Pagas exclusivamente con Wompi. Revisa tus datos, el envío y el total en el checkout; después continúa a Wompi para completar el pago. Si estás en un entorno de pruebas, lo indicaremos antes de continuar."],
      ].map(([q,a], faqIndex) => <details key={q}><summary><SiteText id={`home:faq:${faqIndex}:question`}>{q}</SiteText><span aria-hidden="true">+</span></summary><p><SiteText id={`home:faq:${faqIndex}:answer`}>{a}</SiteText></p></details>)}</div></section>
    </div>
  );
}
