"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/features/cart/CartContext";
import type { Product } from "@/lib/products";

const WHATSAPP_NUMBER = "573246847727";

const routineProfiles = [
  {
    id: "capilar-completa",
    label: "Cabello reseco o sin forma",
    description:
      "Una secuencia de limpieza, nutricion y definicion para recuperar suavidad, brillo y control.",
    productIds: ["mnk-001", "balsamo-jardin-herbal", "ca-hcc-500"],
  },
  {
    id: "facial-equilibrio",
    label: "Piel mixta o con textura",
    description:
      "Rutina de 3 pasos para limpiar, equilibrar y tratar sin complicarte la seleccion.",
    productIds: ["fa-lam-120", "fa-rpt-70", "fa-ass-30"],
  },
  {
    id: "corporal-regalo",
    label: "Ritual corporal completo",
    description:
      "Una seleccion que combina limpieza artesanal, suavidad corporal y un toque aromatico para completar la experiencia MAI.",
    productIds: ["co-js-110-1", "co-js-67", "el-perfume-perfume-capilar"],
  },
];

type RoutineBuilderViewProps = {
  products: Product[];
};

export default function RoutineBuilderView({ products }: RoutineBuilderViewProps) {
  const { addItem, openCart } = useCart();
  const [selectedProfileId, setSelectedProfileId] = useState(routineProfiles[0].id);

  const highlightedKits = useMemo(
    () =>
      products.filter((product) =>
        [
          "kit-trio-capilar-esencial-mai",
          "kit-trio-facial-equilibrio-mai",
          "kit-trio-corporal-ritual-mai",
        ].includes(product.id)
      ),
    [products]
  );

  const selectedProfile =
    routineProfiles.find((profile) => profile.id === selectedProfileId) ?? routineProfiles[0];

  const selectedRoutineProducts = selectedProfile.productIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));

  const routineTotal = selectedRoutineProducts.reduce(
    (sum, product) => sum + product.amountInCents,
    0
  );

  const addRoutineToCart = () => {
    selectedRoutineProducts.forEach((product) => {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        amountInCents: product.amountInCents,
        image: product.image,
      });
    });
    openCart();
  };

  const openRoutineWhatsApp = () => {
    const text = encodeURIComponent(
      [
        `Hola MAI, necesito ayuda con la rutina "${selectedProfile.label}".`,
        `Quiero comprar en la pagina y me gustaria confirmar esta seleccion: ${selectedRoutineProducts
          .map((product) => product.name)
          .join(", ")}.`,
        `Total estimado en la web: ${new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 0,
        }).format(routineTotal / 100)}.`,
      ].join(" ")
    );

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="mx-auto mb-16 mt-12 max-w-6xl px-4">
      <section className="rounded-[2rem] bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 p-6 text-white shadow-xl md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/95">
              Rutinas guiadas
            </p>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight md:text-4xl">
              Construye una rutina MAI independiente del catalogo.
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-brand-100 md:text-base">
              Aqui encuentras trios listos para comprar y un selector guiado por necesidad para
              armar tu rutina ideal sin mezclarte con todo el catalogo.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-full bg-white px-6 py-3 text-sm font-bold text-brand-900 transition hover:bg-brand-100"
              >
                Ver productos por categoria
              </Link>
              <button
                type="button"
                onClick={openRoutineWhatsApp}
                className="rounded-full border border-white/70 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Hablar con Agente MAI
              </button>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-1">
            {highlightedKits.map((kit) => (
              <div
                key={kit.id}
                className="rounded-2xl bg-white/10 p-4 backdrop-blur ring-1 ring-white/15"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-100">
                  {kit.badge || "Kit"}
                </p>
                <p className="mt-2 text-lg font-bold text-white">{kit.name}</p>
                <p className="mt-2 text-sm text-brand-100">{kit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
            Constructor de rutina
          </p>
          <h2 className="mt-3 text-2xl font-extrabold text-brand-900">Elige lo que necesitas</h2>
          <div className="mt-5 space-y-3">
            {routineProfiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => setSelectedProfileId(profile.id)}
                className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                  selectedProfileId === profile.id
                    ? "border-brand-700 bg-brand-50 ring-1 ring-brand-200"
                    : "border-slate-200 hover:border-brand-300"
                }`}
              >
                <p className="font-semibold text-brand-900">{profile.label}</p>
                <p className="mt-1 text-sm text-slate-600">{profile.description}</p>
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
                Recomendacion MAI
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-brand-900">
                {selectedProfile.label}
              </h2>
              <p className="mt-2 text-sm text-slate-600">{selectedProfile.description}</p>
            </div>
            <div className="rounded-2xl bg-brand-50 px-4 py-3 text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
                Total estimado
              </p>
              <p className="mt-1 text-2xl font-extrabold text-brand-900">
                {new Intl.NumberFormat("es-CO", {
                  style: "currency",
                  currency: "COP",
                  minimumFractionDigits: 0,
                }).format(routineTotal / 100)}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {selectedRoutineProducts.map((product, index) => (
              <div key={product.id} className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
                  Paso {index + 1}
                </p>
                <p className="mt-2 font-bold text-brand-900">{product.name}</p>
                <p className="mt-2 text-sm text-slate-600">{product.price}</p>
                <p className="mt-3 line-clamp-4 text-sm text-slate-600">{product.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={addRoutineToCart}
              className="rounded-full bg-brand-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-900"
            >
              Agregar rutina completa
            </button>
            <button
              type="button"
              onClick={openRoutineWhatsApp}
              className="rounded-full border border-[#1f9d58] px-6 py-3 text-sm font-bold text-[#1f9d58] transition hover:bg-[#1f9d58] hover:text-white"
            >
              Hablar con Agente MAI
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            WhatsApp funciona como canal de asesoria y cierre: te ayuda a elegir, pero la compra se
            deriva a la pagina.
          </p>
        </article>
      </section>
    </main>
  );
}
