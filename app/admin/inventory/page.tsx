import Link from "next/link";
import { getAllAdminProducts } from "@/app/admin/actions";
import { categoryLabels } from "@/lib/products";

export default async function AdminInventoryPage() {
  const { products } = await getAllAdminProducts();

  const lowStockProducts = products.filter((product) => (product.stock ?? 0) <= 5);
  const outOfStockProducts = products.filter((product) => (product.stock ?? 0) === 0);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
            Operación
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-900">Inventario</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Monitorea disponibilidad del taller, productos con stock crítico y referencias que ya
            requieren reposición.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="rounded-full bg-brand-700 px-6 py-3 text-sm font-bold text-white"
        >
          Editar catálogo
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Productos monitoreados</p>
          <p className="mt-2 text-3xl font-extrabold text-brand-900">{products.length}</p>
        </div>
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm text-amber-700">Stock bajo</p>
          <p className="mt-2 text-3xl font-extrabold text-amber-800">{lowStockProducts.length}</p>
        </div>
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <p className="text-sm text-red-700">Sin stock</p>
          <p className="mt-2 text-3xl font-extrabold text-red-800">{outOfStockProducts.length}</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-bold text-brand-900">Vista operativa de inventario</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => {
                const stock = product.stock ?? 0;
                const stockClass =
                  stock === 0
                    ? "bg-red-50 text-red-700"
                    : stock <= 5
                    ? "bg-amber-50 text-amber-700"
                    : "bg-green-50 text-green-700";

                return (
                  <tr key={product.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-brand-900">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{product.sku || "-"}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {categoryLabels[product.category]}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${stockClass}`}>
                        {stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {product.active !== false ? "Visible" : "Oculto"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
