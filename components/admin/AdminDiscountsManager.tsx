"use client";

import { useState, useTransition } from "react";
import {
  createAdminDiscount,
  deleteAdminDiscount,
  updateAdminDiscount,
} from "@/app/admin/actions";
import type { DiscountCode, DiscountKind, DiscountScope } from "@/lib/discounts";
import { categoryLabels, type Product } from "@/lib/products";

type AdminDiscountsManagerProps = {
  initialDiscounts: DiscountCode[];
  products: Product[];
};

type DiscountFormState = {
  code: string;
  label: string;
  description: string;
  active: boolean;
  kind: DiscountKind;
  percentage: string;
  amountInCents: string;
  scope: DiscountScope;
  category: keyof typeof categoryLabels;
  productIds: string;
  minimumSubtotalInCents: string;
};

const defaultForm: DiscountFormState = {
  code: "",
  label: "",
  description: "",
  active: true,
  kind: "percentage",
  percentage: "10",
  amountInCents: "",
  scope: "kits",
  category: "facial",
  productIds: "",
  minimumSubtotalInCents: "",
};

function discountToForm(discount: DiscountCode): DiscountFormState {
  return {
    code: discount.code,
    label: discount.label,
    description: discount.description ?? "",
    active: discount.active,
    kind: discount.kind,
    percentage: String(discount.percentage ?? ""),
    amountInCents: String(discount.amountInCents ?? ""),
    scope: discount.scope,
    category: discount.category ?? "facial",
    productIds: discount.productIds?.join("\n") ?? "",
    minimumSubtotalInCents: String(discount.minimumSubtotalInCents ?? ""),
  };
}

export default function AdminDiscountsManager({
  initialDiscounts,
  products,
}: AdminDiscountsManagerProps) {
  const [discounts, setDiscounts] = useState(initialDiscounts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DiscountFormState>(defaultForm);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const resetForm = () => {
    setEditingId(null);
    setForm(defaultForm);
  };

  const handleSubmit = () => {
    setMessage("");
    const payload = {
      ...form,
      percentage: Number(form.percentage),
      amountInCents: Number(form.amountInCents),
      productIds: form.productIds.split("\n").map((item) => item.trim()).filter(Boolean),
      minimumSubtotalInCents: Number(form.minimumSubtotalInCents),
    };

    startTransition(async () => {
      try {
        if (editingId) {
          const result = await updateAdminDiscount(editingId, payload);
          setDiscounts((current) =>
            current.map((discount) =>
              discount.id === editingId ? (result.discount as DiscountCode) : discount
            )
          );
          setMessage("Descuento actualizado.");
        } else {
          const result = await createAdminDiscount(payload);
          setDiscounts((current) => [result.discount as DiscountCode, ...current]);
          setMessage("Código creado.");
        }
        resetForm();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "No fue posible guardar el descuento.");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("¿Seguro que quieres eliminar este código de descuento?")) return;
    startTransition(async () => {
      try {
        await deleteAdminDiscount(id);
        setDiscounts((current) => current.filter((discount) => discount.id !== id));
        if (editingId === id) resetForm();
        setMessage("Código eliminado.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "No fue posible eliminar el código.");
      }
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
              Editor
            </p>
            <h2 className="mt-2 text-2xl font-bold text-brand-900">
              {editingId ? "Editar descuento" : "Crear código"}
            </h2>
          </div>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-900"
            >
              Nuevo
            </button>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Código</span>
            <input
              value={form.code}
              onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              placeholder="KITMAI10"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Nombre</span>
            <input
              value={form.label}
              onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
            />
          </label>
          <label className="text-sm md:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">Descripción</span>
            <input
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Tipo</span>
            <select
              value={form.kind}
              onChange={(event) => setForm((current) => ({ ...current, kind: event.target.value as DiscountKind }))}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
            >
              <option value="percentage">Porcentaje</option>
              <option value="fixed">Valor fijo</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">
              {form.kind === "percentage" ? "Porcentaje" : "Valor en centavos"}
            </span>
            <input
              type="number"
              value={form.kind === "percentage" ? form.percentage : form.amountInCents}
              onChange={(event) =>
                setForm((current) =>
                  current.kind === "percentage"
                    ? { ...current, percentage: event.target.value }
                    : { ...current, amountInCents: event.target.value }
                )
              }
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Alcance</span>
            <select
              value={form.scope}
              onChange={(event) => setForm((current) => ({ ...current, scope: event.target.value as DiscountScope }))}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
            >
              <option value="all">Todo el carrito</option>
              <option value="category">Una categoría</option>
              <option value="products">Productos o rutina específica</option>
              <option value="kits">Solo kits y rutinas</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Subtotal mínimo</span>
            <input
              type="number"
              value={form.minimumSubtotalInCents}
              onChange={(event) => setForm((current) => ({ ...current, minimumSubtotalInCents: event.target.value }))}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              placeholder="Opcional"
            />
          </label>
          {form.scope === "category" ? (
            <label className="text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">Categoría</span>
              <select
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value as keyof typeof categoryLabels,
                  }))
                }
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              >
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {form.scope === "products" ? (
            <label className="text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">IDs de productos o rutina</span>
              <textarea
                rows={6}
                value={form.productIds}
                onChange={(event) => setForm((current) => ({ ...current, productIds: event.target.value }))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                placeholder={products.slice(0, 6).map((product) => product.id).join("\n")}
              />
            </label>
          ) : null}
          <label className="text-sm md:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">Estado</span>
            <select
              value={form.active ? "active" : "inactive"}
              onChange={(event) => setForm((current) => ({ ...current, active: event.target.value === "active" }))}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </label>
        </div>

        {message ? (
          <p className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-900">{message}</p>
        ) : null}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="mt-6 w-full rounded-full bg-brand-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-900 disabled:opacity-60"
        >
          {isPending ? "Guardando..." : editingId ? "Guardar cambios" : "Crear código"}
        </button>
      </section>

      <section className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-brand-900">Códigos activos y configurables</h2>
        <div className="mt-6 space-y-3">
          {discounts.map((discount) => (
            <article key={discount.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-brand-900">{discount.code}</p>
                    <span className="rounded-full bg-brand-50 px-2 py-1 text-[11px] font-semibold text-brand-700">
                      {discount.label}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                        discount.active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {discount.active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {discount.description || "Sin descripción."}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Alcance: {discount.scope}
                    {discount.category ? ` · ${categoryLabels[discount.category]}` : ""}
                    {discount.productIds?.length ? ` · ${discount.productIds.length} productos` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(discount.id);
                      setForm(discountToForm(discount));
                    }}
                    className="rounded-full border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-900"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(discount.id)}
                    className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
