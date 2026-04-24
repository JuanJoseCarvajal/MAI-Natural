"use client";

import { useMemo, useState, useTransition } from "react";
import {
  createAdminProduct,
  deleteAdminProduct,
  updateAdminProduct,
} from "@/app/admin/actions";
import { categoryLabels, type Product, type ProductCategory } from "@/lib/products";

type AdminProductsManagerProps = {
  initialProducts: Product[];
};

type ProductFormState = {
  id: string;
  image: string;
  name: string;
  price: string;
  amountInCents: string;
  description: string;
  category: ProductCategory;
  badge: string;
  benefits: string;
  rating: string;
  reviewsCount: string;
  sku: string;
  stock: string;
  active: boolean;
};

const defaultForm: ProductFormState = {
  id: "",
  image: "",
  name: "",
  price: "",
  amountInCents: "",
  description: "",
  category: "facial",
  badge: "",
  benefits: "Cosmética natural\nIngredientes botánicos\nHecho con intención",
  rating: "4.8",
  reviewsCount: "0",
  sku: "",
  stock: "0",
  active: true,
};

function productToForm(product: Product): ProductFormState {
  return {
    id: product.id,
    image: product.image,
    name: product.name,
    price: product.price,
    amountInCents: String(product.amountInCents),
    description: product.description,
    category: product.category,
    badge: product.badge ?? "",
    benefits: product.benefits.join("\n"),
    rating: String(product.rating),
    reviewsCount: String(product.reviewsCount),
    sku: product.sku ?? "",
    stock: String(product.stock ?? 0),
    active: product.active !== false,
  };
}

export default function AdminProductsManager({
  initialProducts,
}: AdminProductsManagerProps) {
  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(defaultForm);
  const [message, setMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const metrics = useMemo(
    () => ({
      total: products.length,
      active: products.filter((product) => product.active !== false).length,
      lowStock: products.filter((product) => (product.stock ?? 0) <= 5).length,
      hidden: products.filter((product) => product.active === false).length,
    }),
    [products]
  );

  const resetForm = () => {
    setEditingId(null);
    setForm(defaultForm);
  };

  const handleSubmit = () => {
    setMessage("");
    const payload = {
      ...form,
      amountInCents: Number(form.amountInCents),
      benefits: form.benefits.split("\n"),
      rating: Number(form.rating),
      reviewsCount: Number(form.reviewsCount),
      stock: Number(form.stock),
    };

    startTransition(async () => {
      try {
        if (editingId) {
          const result = await updateAdminProduct(editingId, payload);
          setProducts((current) =>
            current.map((product) => (product.id === editingId ? (result.product as Product) : product))
          );
          setMessage("Producto actualizado correctamente.");
        } else {
          const result = await createAdminProduct(payload);
          setProducts((current) => [result.product as Product, ...current]);
          setMessage("Producto creado correctamente.");
        }
        resetForm();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "No fue posible guardar el producto.");
      }
    });
  };

  const handleDelete = (id: string) => {
    const confirmed = window.confirm("¿Seguro que quieres eliminar este producto del catálogo?");
    if (!confirmed) return;

    setMessage("");
    startTransition(async () => {
      try {
        await deleteAdminProduct(id);
        setProducts((current) => current.filter((product) => product.id !== id));
        if (editingId === id) {
          resetForm();
        }
        setMessage("Producto eliminado.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "No fue posible eliminar el producto.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Catálogo total</p>
          <p className="mt-2 text-3xl font-extrabold text-brand-900">{metrics.total}</p>
        </div>
        <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Productos activos</p>
          <p className="mt-2 text-3xl font-extrabold text-brand-900">{metrics.active}</p>
        </div>
        <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Stock bajo</p>
          <p className="mt-2 text-3xl font-extrabold text-amber-700">{metrics.lowStock}</p>
        </div>
        <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Ocultos</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-700">{metrics.hidden}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
                Editor
              </p>
              <h1 className="mt-2 text-2xl font-bold text-brand-900">
                {editingId ? "Editar producto" : "Crear producto"}
              </h1>
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
              <span className="mb-1 block font-medium text-slate-700">ID / slug</span>
              <input
                value={form.id}
                onChange={(event) => setForm((current) => ({ ...current, id: event.target.value }))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                placeholder="se-genera-si-lo-dejas-vacio"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">SKU</span>
              <input
                value={form.sku}
                onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                placeholder="MAI-FAC-001"
              />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">Nombre</span>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">Imagen</span>
              <input
                value={form.image}
                onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Precio visible</span>
              <input
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                placeholder="$59.000"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Valor en centavos</span>
              <input
                type="number"
                value={form.amountInCents}
                onChange={(event) => setForm((current) => ({ ...current, amountInCents: event.target.value }))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Categoría</span>
              <select
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({ ...current, category: event.target.value as ProductCategory }))
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
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Badge</span>
              <input
                value={form.badge}
                onChange={(event) => setForm((current) => ({ ...current, badge: event.target.value }))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                placeholder="Nuevo / Ahorra 10%"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Stock</span>
              <input
                type="number"
                value={form.stock}
                onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Estado</span>
              <select
                value={form.active ? "active" : "inactive"}
                onChange={(event) =>
                  setForm((current) => ({ ...current, active: event.target.value === "active" }))
                }
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              >
                <option value="active">Activo</option>
                <option value="inactive">Oculto</option>
              </select>
            </label>
            <label className="text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">Descripción</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                rows={4}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">Beneficios (uno por línea)</span>
              <textarea
                value={form.benefits}
                onChange={(event) => setForm((current) => ({ ...current, benefits: event.target.value }))}
                rows={4}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              />
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
            {isPending ? "Guardando..." : editingId ? "Guardar cambios" : "Crear producto"}
          </button>
        </div>

        <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
                Catálogo actual
              </p>
              <h2 className="mt-2 text-2xl font-bold text-brand-900">Productos</h2>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {products.map((product) => (
              <article key={product.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-brand-900">{product.name}</p>
                      <span className="rounded-full bg-brand-50 px-2 py-1 text-[11px] font-semibold text-brand-700">
                        {categoryLabels[product.category]}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                          product.active !== false
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {product.active !== false ? "Activo" : "Oculto"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {product.sku || product.id} · {product.price} · Stock: {product.stock ?? 0}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(product.id);
                        setForm(productToForm(product));
                      }}
                      className="rounded-full border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-900"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
