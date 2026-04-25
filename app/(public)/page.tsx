import Link from "next/link";
import ProductCard from "@/components/features/products/ProductCard";
import { categoryLabels } from "@/lib/products";
import NaturalHeroSlider from "@/components/features/home/NaturalHeroSlider";
import { getAllProducts } from "@/lib/products.server";

export default async function PublicHomePage() {
  const products = await getAllProducts();
  const featuredProducts = products.slice(0, 4);
  const categoryEntries = Object.entries(categoryLabels);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-16 px-4 pb-16 pt-8 md:space-y-20 md:px-6 md:pt-12">
      <section className="relative overflow-hidden rounded-3xl p-8 md:p-14">
        <NaturalHeroSlider />
        <div className="absolute inset-0 bg-gradient-to-br from-black/45 via-black/25 to-black/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/35 md:to-black/20" />
        <div className="relative z-10 max-w-2xl">
          <p className="inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
            Skincare botanico premium
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-white md:text-6xl">
            Tu ritual natural empieza aqui
          </h1>
          <p className="mt-4 text-base text-slate-100 md:text-lg">
            Descubre formulas limpias para piel, cabello y bienestar. Compra por categoria o arma tu rutina ideal en menos de 2 minutos.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/routines"
              className="rounded-full bg-brand-700 px-7 py-3 text-sm font-bold text-white transition hover:bg-brand-900"
            >
              Armar mi rutina
            </Link>
            <Link
              href="/products"
              className="rounded-full border-2 border-white/80 px-7 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-brand-900"
            >
              Comprar productos
            </Link>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-white/15 p-3 shadow-sm ring-1 ring-white/30 backdrop-blur">
              <p className="text-2xl font-bold text-white">+5k</p>
              <p className="text-xs text-slate-100">Clientes felices</p>
            </div>
            <div className="rounded-xl bg-white/15 p-3 shadow-sm ring-1 ring-white/30 backdrop-blur">
              <p className="text-2xl font-bold text-white">4.8/5</p>
              <p className="text-xs text-slate-100">Valoracion promedio</p>
            </div>
            <div className="rounded-xl bg-white/15 p-3 shadow-sm ring-1 ring-white/30 backdrop-blur">
              <p className="text-2xl font-bold text-white">5-7 dias</p>
              <p className="text-xs text-slate-100">Entrega artesanal</p>
            </div>
          </div>
        </div>
      </section>

            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 p-8 text-white ring-1 ring-brand-300 md:p-10">
        <div className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 left-20 h-36 w-36 rounded-full bg-brand-100/30 blur-2xl" />
        <div className="relative z-10 grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <p className="inline-flex rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold tracking-wide text-white/95 backdrop-blur">
                CLUB MAI · BELLEZA CON ACOMPAÑAMIENTO
            </p>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight md:text-4xl">
                Más que productos. Un proceso contigo.
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-brand-100 md:text-base">
                Supervisión personalizada, reuniones mensuales y seguimiento de tu caso para construir una rutina consciente, sostenible y con resultados reales.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/subscriptions"
                className="rounded-full bg-white px-7 py-3 text-sm font-bold text-brand-900 transition hover:bg-brand-100"
              >
                 Descubrir Club MAI
              </Link>
              <Link
                href="/account"
                className="rounded-full border border-white/80 px-7 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                 Unirme al Club
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            <article className="rounded-2xl bg-white/15 p-4 backdrop-blur ring-1 ring-white/20">
                <p className="text-xs font-semibold text-brand-100">SUPERVISIÓN</p>
                <p className="mt-1 text-lg font-bold text-white">Seguimiento personalizado de tu caso</p>
            </article>
            <article className="rounded-2xl bg-white/15 p-4 backdrop-blur ring-1 ring-white/20">
                <p className="text-xs font-semibold text-brand-100">COMUNIDAD</p>
                <p className="mt-1 text-lg font-bold text-white">Reuniones mensuales + red de miembras</p>
            </article>
            <article className="rounded-2xl bg-white/15 p-4 backdrop-blur ring-1 ring-white/20">
                <p className="text-xs font-semibold text-brand-100">DESCUENTO FIJO</p>
                <p className="mt-1 text-lg font-bold text-white">Hasta 20% OFF en todo el catálogo MAI</p>
            </article>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-brand-900 md:text-3xl">Compra por categoria</h2>
            <p className="mt-1 text-slate-600">Navegacion clara para encontrar justo lo que necesitas.</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-brand-700 hover:underline">
            Ver catalogo completo
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {categoryEntries.map(([key, label]) => (
            <Link
              key={key}
              href={`/products#categoria-${key}`}
              className="group rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-sm font-bold text-brand-900">{label}</p>
              <p className="mt-1 text-xs text-slate-500">Explorar categoria</p>
              <p className="mt-4 text-sm font-semibold text-brand-700 group-hover:translate-x-1 transition">
                Ir ahora →
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-brand-900 md:text-3xl">Destacados de la semana</h2>
            <p className="mt-1 text-slate-600">Seleccionados por recurrencia de compra y resultados.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} compact />
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-3xl bg-brand-900 p-6 text-white md:grid-cols-3 md:p-8">
        <article className="rounded-2xl bg-white/10 p-4">
          <h3 className="text-lg font-bold">Produccion artesanal</h3>
          <p className="mt-1 text-sm text-brand-100">Cada producto se prepara uno a uno. El tiempo estimado de entrega es de 5 a 7 dias habiles.</p>
        </article>
        <article className="rounded-2xl bg-white/10 p-4">
          <h3 className="text-lg font-bold">Rituales guiados</h3>
          <p className="mt-1 text-sm text-brand-100">Indicaciones claras para que cada producto rinda y funcione mejor.</p>
        </article>
        <article className="rounded-2xl bg-white/10 p-4">
          <h3 className="text-lg font-bold">Acompanamiento real</h3>
          <p className="mt-1 text-sm text-brand-100">Equipo disponible para resolver dudas de piel, cabello y uso diario.</p>
        </article>
      </section>

      <section className="grid gap-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:grid-cols-2 md:p-8">
        <div>
          <p className="text-sm font-semibold text-brand-700">Rutinas que convierten mejor</p>
          <h2 className="mt-2 text-2xl font-bold text-brand-900 md:text-3xl">Combina productos por objetivo</h2>
          <p className="mt-3 text-slate-600">
            Mejora conversion y satisfaccion proponiendo combos simples: limpieza + tratamiento + sellado.
          </p>
          <Link
            href="/routines"
            className="mt-6 inline-flex rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-900"
          >
            Explorar rutinas
          </Link>
        </div>
        <div className="grid gap-3">
          <div className="rounded-2xl bg-brand-100 p-4">
            <p className="text-sm font-semibold text-brand-900">Piel luminosa</p>
            <p className="mt-1 text-sm text-slate-700">Balm Facial + Serum Noche + Crema Hidratante</p>
          </div>
          <div className="rounded-2xl bg-brand-100 p-4">
            <p className="text-sm font-semibold text-brand-900">Cabello restaurado</p>
            <p className="mt-1 text-sm text-slate-700">Oleo Restaurador + Mist Relax Botanico</p>
          </div>
          <div className="rounded-2xl bg-brand-100 p-4">
            <p className="text-sm font-semibold text-brand-900">Regalo consciente</p>
            <p className="mt-1 text-sm text-slate-700">Duo Rutina Glow con empaque premium</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-gradient-to-r from-brand-100 to-white p-8 text-center ring-1 ring-brand-200">
        <h2 className="text-2xl font-bold text-brand-900 md:text-3xl">Listo para construir tu rutina ideal?</h2>
        <p className="mx-auto mt-2 max-w-2xl text-slate-700">
          Compra por categoria, compara beneficios y agrega al carrito en una experiencia clara, movil y orientada a conversion.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/products" className="rounded-full bg-brand-700 px-7 py-3 text-sm font-bold text-white hover:bg-brand-900">
            Ir a tienda
          </Link>
          <Link href="/routines" className="rounded-full border border-brand-700 px-7 py-3 text-sm font-bold text-brand-700 hover:bg-brand-700 hover:text-white">
            Ver rutinas
          </Link>
          <Link href="/services" className="rounded-full border border-brand-700 px-7 py-3 text-sm font-bold text-brand-700 hover:bg-brand-700 hover:text-white">
            Hablar con asesora
          </Link>
        </div>
      </section>
    </main>
  );
}
