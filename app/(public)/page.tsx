import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/features/products/ProductCard";
import { blogPosts } from "@/lib/blog";
import { categoryImages, categoryLabels } from "@/lib/products";
import { getAllProducts } from "@/lib/products.server";
import { buildMetadata, siteName, siteUrl } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `${siteName} | Cosmética botánica de autor en Colombia`,
  description:
    "Formulaciones botánicas de origen para piel y cabello, rutinas guiadas y asesoría personalizada para elegir con claridad.",
  path: "/",
  image: "/products/Facial/agua-de-rosas-mai-natural.png",
});

const routineGoals = [
  {
    title: "Hidratación y barrera",
    description: "Rutinas simples para acompañar pieles que buscan confort, suavidad y equilibrio.",
  },
  {
    title: "Uniformidad y luminosidad",
    description: "Combina limpieza, tratamiento e hidratación según el objetivo de tu piel.",
  },
  {
    title: "Cuero cabelludo y crecimiento",
    description: "Ordena el cuidado desde la raíz con limpieza y tratamientos capilares complementarios.",
  },
  {
    title: "Cabello seco o procesado",
    description: "Construye una rutina que priorice flexibilidad, nutrición y facilidad de peinado.",
  },
];

export default async function PublicHomePage() {
  const products = await getAllProducts();
  const featuredProducts = products.slice(0, 4);
  const categoryEntries = Object.entries(categoryLabels) as Array<
    [keyof typeof categoryLabels, string]
  >;
  const featuredPosts = blogPosts.slice(0, 3);

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    inLanguage: "es-CO",
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-20 px-4 pb-20 pt-6 md:space-y-24 md:px-6 md:pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      <section
        aria-labelledby="home-hero-title"
        className="relative min-h-[620px] overflow-hidden rounded-[2rem] bg-brand-900 md:min-h-[680px]"
      >
        <Image
          src="https://images.pexels.com/photos/6621434/pexels-photo-6621434.jpeg?auto=compress&cs=tinysrgb&w=1800"
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1280px"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/55 to-transparent" />

        <div className="relative z-10 flex min-h-[620px] flex-col justify-between p-6 sm:p-8 md:min-h-[680px] md:p-14">
          <div className="max-w-2xl pt-6 md:pt-12">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
              Formulaciones botánicas de origen
            </p>
            <h1
              id="home-hero-title"
              className="mt-5 max-w-xl text-4xl font-semibold leading-[1.05] text-white sm:text-5xl md:text-6xl"
            >
              Elige por categoría. O déjate acompañar.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/90 md:text-lg">
              Cuidado botánico para piel y cabello, elaborado en pequeñas cantidades. Si sabes qué
              buscas, entra directo a la tienda. Si no, te ayudamos a construir una rutina con sentido.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-bold text-brand-900 transition hover:bg-brand-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Comprar productos
              </Link>
              <Link
                href="/services"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/80 bg-black/10 px-7 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white hover:text-brand-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Quiero asesoría
              </Link>
            </div>
          </div>

          <nav aria-label="Comprar por categoría" className="mt-12 border-t border-white/30 pt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              Ir directo a
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {categoryEntries.map(([key, label]) => (
                <Link
                  key={key}
                  href={`/products#categoria-${key}`}
                  className="min-h-11 py-2 text-sm font-semibold text-white underline-offset-4 transition hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  {label.replace("Cosmética Natural ", "")}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </section>

      <section aria-labelledby="categories-title">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">Tienda MAI</p>
          <h2 id="categories-title" className="mt-2 text-3xl font-semibold text-brand-900 md:text-4xl">
            Empieza por lo que quieres cuidar
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Una entrada simple al catálogo: rostro, cabello, cuerpo o combinaciones pensadas para
            trabajar en conjunto.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {categoryEntries.map(([key, label]) => (
            <Link
              key={key}
              href={`/products#categoria-${key}`}
              className="group relative min-h-[320px] overflow-hidden rounded-3xl bg-brand-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-700"
            >
              <Image
                src={categoryImages[key]}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/5" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
                <h3 className="text-2xl font-semibold md:text-3xl">
                  {label.replace("Cosmética Natural ", "")}
                </h3>
                <span className="mt-3 inline-flex min-h-11 items-center text-sm font-bold underline-offset-4 group-hover:underline">
                  Explorar categoría →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-right">
          <Link href="/products" className="text-sm font-semibold text-brand-700 underline-offset-4 hover:underline">
            Ver catálogo completo →
          </Link>
        </div>
      </section>

      <section
        aria-labelledby="advisory-title"
        className="grid gap-8 rounded-[2rem] bg-brand-50 p-7 ring-1 ring-brand-100 md:grid-cols-[1.2fr_0.8fr] md:items-center md:p-12"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">Asesoría MAI</p>
          <h2 id="advisory-title" className="mt-2 text-3xl font-semibold text-brand-900 md:text-4xl">
            Si no sabes por dónde empezar, empieza por contarnos qué necesitas.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
            Te ayudamos a ordenar objetivos, hábitos y productos para construir una rutina más clara,
            tanto para piel como para cabello.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/services"
              className="inline-flex min-h-12 items-center rounded-full bg-brand-900 px-7 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              Ver asesorías
            </Link>
            <Link
              href="/routines"
              className="inline-flex min-h-12 items-center rounded-full border border-brand-700 px-7 py-3 text-sm font-bold text-brand-800 transition hover:bg-white"
            >
              Explorar rutinas
            </Link>
          </div>
        </div>

        <div className="grid gap-3" aria-label="Tipos de acompañamiento">
          <div className="rounded-2xl bg-white p-5 ring-1 ring-brand-100">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">Piel</p>
            <p className="mt-2 text-lg font-semibold text-brand-900">Ordena tu rutina facial</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Menos pasos, mejor criterio para elegir y acompañamiento en el proceso.</p>
          </div>
          <div className="rounded-2xl bg-white p-5 ring-1 ring-brand-100">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">Cabello</p>
            <p className="mt-2 text-lg font-semibold text-brand-900">Construye un sistema capilar</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Limpieza, tratamiento y acabado según lo que tu cabello está pidiendo.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="featured-title">
        <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">Selección MAI</p>
            <h2 id="featured-title" className="mt-2 text-3xl font-semibold text-brand-900 md:text-4xl">
              Una forma simple de conocer la tienda
            </h2>
          </div>
          <Link href="/products" className="text-sm font-semibold text-brand-700 underline-offset-4 hover:underline">
            Ver todos los productos →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} compact />
          ))}
        </div>
      </section>

      <section aria-labelledby="goals-title">
        <div className="mb-7 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">Comprar por objetivo</p>
          <h2 id="goals-title" className="mt-2 text-3xl font-semibold text-brand-900 md:text-4xl">
            También puedes empezar por lo que quieres resolver
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {routineGoals.map((goal) => (
            <Link
              key={goal.title}
              href="/routines"
              className="group rounded-3xl border border-brand-100 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-700 md:p-8"
            >
              <h3 className="text-xl font-semibold text-brand-900">{goal.title}</h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">{goal.description}</p>
              <span className="mt-5 inline-flex min-h-11 items-center text-sm font-bold text-brand-700 underline-offset-4 group-hover:underline">
                Ver rutinas →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="why-mai-title" className="rounded-[2rem] bg-brand-900 p-7 text-white md:p-12">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-200">Por qué MAI</p>
          <h2 id="why-mai-title" className="mt-2 text-3xl font-semibold md:text-4xl">
            El producto es solo una parte del proceso.
          </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15">
            <h3 className="text-lg font-semibold">Pequeñas cantidades</h3>
            <p className="mt-2 text-sm leading-6 text-brand-100">Producción cuidada, preparada uno a uno y no como una línea industrial masiva.</p>
          </article>
          <article className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15">
            <h3 className="text-lg font-semibold">Rutinas con criterio</h3>
            <p className="mt-2 text-sm leading-6 text-brand-100">Cada fórmula ocupa un lugar dentro de una rutina clara, comprensible y sostenible.</p>
          </article>
          <article className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15">
            <h3 className="text-lg font-semibold">Acompañamiento</h3>
            <p className="mt-2 text-sm leading-6 text-brand-100">Si tienes dudas, no tienes que resolverlas sola: puedes volver a MAI y revisar el proceso.</p>
          </article>
        </div>
      </section>

      <section
        aria-labelledby="club-title"
        className="grid gap-6 rounded-[2rem] border border-brand-100 bg-white p-7 md:grid-cols-[1fr_auto] md:items-center md:p-10"
      >
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">Club MAI · Próximamente</p>
          <h2 id="club-title" className="mt-2 text-2xl font-semibold text-brand-900 md:text-3xl">
            Para quienes quieren un acompañamiento más continuo.
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 md:text-base">
            Seguimiento, encuentros y beneficios para convertir la compra en un proceso sostenido en el tiempo.
          </p>
        </div>
        <Link
          href="/subscriptions"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-brand-700 px-6 py-3 text-sm font-bold text-brand-800 transition hover:bg-brand-50"
        >
          Conocer Club MAI
        </Link>
      </section>

      <section aria-labelledby="journal-title">
        <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">Cuaderno MAI</p>
            <h2 id="journal-title" className="mt-2 text-3xl font-semibold text-brand-900 md:text-4xl">
              Leer también es una forma de elegir mejor
            </h2>
          </div>
          <Link href="/blog" className="text-sm font-semibold text-brand-700 underline-offset-4 hover:underline">
            Ver todos los artículos →
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {featuredPosts.map((post) => (
            <article key={post.slug} className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
              <Link href={`/blog/${post.slug}`} className="group block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-700">
                <div className="relative aspect-[4/3] overflow-hidden bg-brand-50">
                  <Image
                    src={post.heroImage}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">{post.category}</p>
                  <h3 className="mt-2 text-xl font-semibold leading-7 text-brand-900">{post.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{post.description}</p>
                  <span className="mt-5 inline-flex min-h-11 items-center text-sm font-bold text-brand-700 underline-offset-4 group-hover:underline">
                    Leer artículo →
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="letters-title"
        className="rounded-[2rem] bg-gradient-to-r from-brand-50 to-white p-7 ring-1 ring-brand-100 md:p-10"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">Cartas de MAI</p>
          <h2 id="letters-title" className="mt-2 text-3xl font-semibold text-brand-900 md:text-4xl">
            Nuevas fórmulas, investigación y lanzamientos, sin ruido.
          </h2>
          <p id="letters-description" className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Déjanos tu correo. Por ahora la confirmación se realiza desde tu aplicación de correo; la integración directa quedará para la siguiente fase.
          </p>

          <form
            action="mailto:hola@mainatural.com?subject=Suscripcion%20a%20Cartas%20de%20MAI"
            method="post"
            encType="text/plain"
            aria-describedby="letters-description"
            className="mx-auto mt-7 flex max-w-xl flex-col gap-3 sm:flex-row"
          >
            <div className="flex-1 text-left">
              <label htmlFor="newsletter-email" className="sr-only">
                Correo electrónico
              </label>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="tu@correo.com"
                className="min-h-12 w-full rounded-full border border-slate-300 bg-white px-5 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-700/20"
              />
            </div>
            <button
              type="submit"
              className="min-h-12 rounded-full bg-brand-900 px-7 py-3 text-sm font-bold text-white transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-700"
            >
              Quiero recibirlas
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
