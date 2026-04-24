import AdminProductsManager from "@/components/admin/AdminProductsManager";
import { getAllAdminProducts } from "@/app/admin/actions";

export default async function AdminProductsPage() {
  const { products } = await getAllAdminProducts();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
          Catálogo
        </p>
        <h1 className="mt-2 text-3xl font-bold text-brand-900">Gestión de productos</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Crea, edita, oculta y administra el catálogo base de MAI Natural con control de stock,
          SKU y visibilidad comercial.
        </p>
      </section>

      <AdminProductsManager initialProducts={products} />
    </div>
  );
}
