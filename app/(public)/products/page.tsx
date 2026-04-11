"use client";
import ProductCard from "@/components/features/products/ProductCard";
import FilterChip from "@/components/ui/FilterChip";
import StickyFilterBar from "@/components/ui/StickyFilterBar";
import { categoryLabels, products } from "@/lib/products";
import { useEffect, useMemo, useState } from "react";

export default function ProductsPage() {
  const categories = useMemo(() => Object.entries(categoryLabels), []);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.[0] ?? "");

  useEffect(() => {
    const sectionIds = categories.map(([key]) => `categoria-${key}`);
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length === 0) return;

        const id = visible[0].target.id.replace("categoria-", "");
        if (id) setActiveCategory(id);
      },
      {
        root: null,
        rootMargin: "-130px 0px -55% 0px",
        threshold: [0.2, 0.4, 0.7],
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [categories]);

  return (
    <main className="max-w-6xl mx-auto px-4 mt-12 mb-16">
      <h1 className="text-3xl font-extrabold text-brand-900 mb-3 text-center">Catalogo de Productos</h1>
      <p className="mx-auto mb-10 max-w-3xl text-center text-slate-600">
        Encuentra tu rutina ideal por categoria y descubre formulas botanicas orientadas a resultados.
      </p>

      <StickyFilterBar className="-mx-4 mb-10 px-4 py-3 supports-[backdrop-filter]:bg-white/75">
        <div className="flex items-center justify-center gap-2 overflow-x-auto whitespace-nowrap">
          {categories.map(([key, label]) => (
            <FilterChip
              key={key}
              href={`#categoria-${key}`}
              onClick={() => setActiveCategory(key)}
              active={activeCategory === key}
            >
              {label}
            </FilterChip>
          ))}
        </div>
      </StickyFilterBar>

      <div className="space-y-12">
        {categories.map(([key, label]) => {
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
