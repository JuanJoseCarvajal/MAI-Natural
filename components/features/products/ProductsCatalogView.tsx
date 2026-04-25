"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/features/products/ProductCard";
import FilterChip from "@/components/ui/FilterChip";
import StickyFilterBar from "@/components/ui/StickyFilterBar";
import { categoryLabels, type Product } from "@/lib/products";

type ProductsCatalogViewProps = {
  products: Product[];
};

export default function ProductsCatalogView({ products }: ProductsCatalogViewProps) {
  const ALL_FILTER = "all";
  const categories = useMemo(() => Object.entries(categoryLabels), []);
  const [activeCategory, setActiveCategory] = useState(ALL_FILTER);
  const visibleCategories =
    activeCategory === ALL_FILTER
      ? categories
      : categories.filter(([key]) => key === activeCategory);

  return (
    <main className="max-w-6xl mx-auto px-4 mt-12 mb-16">
      <h1 className="text-3xl font-extrabold text-brand-900 mb-3 text-center">Catalogo de Productos</h1>
      <p className="mx-auto mb-10 max-w-3xl text-center text-slate-600">
        Explora el catalogo por categoria y compra directo. Si quieres una experiencia guiada,
        ahora las rutinas viven en una pagina independiente.
      </p>

      <section className="mb-12 rounded-[2rem] border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
              Rutinas MAI
            </p>
            <h2 className="mt-3 text-2xl font-extrabold text-brand-900 md:text-3xl">
              Ahora tienen su propia pagina independiente.
            </h2>
            <p className="mt-3 text-sm text-slate-600 md:text-base">
              Separamos la experiencia guiada del catalogo para que puedas comprar por categoria o
              entrar directo a construir una rutina segun tu necesidad.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/routines"
              className="rounded-full bg-brand-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-900"
            >
              Ir a rutinas
            </Link>
            <Link
              href="#categoria-kits"
              className="rounded-full border border-brand-300 px-6 py-3 text-sm font-bold text-brand-900 transition hover:bg-brand-50"
            >
              Ver kits en catalogo
            </Link>
          </div>
        </div>
      </section>

      <StickyFilterBar className="-mx-4 mb-10 px-4 py-3 supports-[backdrop-filter]:bg-white/75">
        <div className="flex items-center justify-center gap-2 overflow-x-auto whitespace-nowrap">
          <FilterChip
            href="#"
            onClick={(event) => {
              event.preventDefault();
              setActiveCategory(ALL_FILTER);
            }}
            active={activeCategory === ALL_FILTER}
          >
            Todos
          </FilterChip>
          {categories.map(([key, label]) => (
            <FilterChip
              key={key}
              href="#"
              onClick={(event) => {
                event.preventDefault();
                setActiveCategory(key);
              }}
              active={activeCategory === key}
            >
              {label}
            </FilterChip>
          ))}
        </div>
      </StickyFilterBar>

      <div className="space-y-12">
        {visibleCategories.map(([key, label]) => {
          const categoryProducts = products.filter((item) => item.category === key);
          if (categoryProducts.length === 0) return null;

          return (
            <section id={`categoria-${key}`} key={key} className="scroll-mt-28">
              <h2 className="mb-6 text-2xl font-bold text-brand-900">{label}</h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {categoryProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
