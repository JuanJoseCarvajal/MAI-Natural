"use client";
import ProductCard from "@/components/features/products/ProductCard";
import FilterChip from "@/components/ui/FilterChip";
import StickyFilterBar from "@/components/ui/StickyFilterBar";
import { categoryLabels, products } from "@/lib/products";
import { useMemo, useState } from "react";

export default function ProductsPage() {
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
        Encuentra tu rutina ideal por categoria y descubre formulas botanicas orientadas a resultados.
      </p>

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
