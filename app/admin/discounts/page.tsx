import { getAllAdminDiscounts, getAllAdminProducts } from "@/app/admin/actions";
import AdminDiscountsManager from "@/components/admin/AdminDiscountsManager";

export default async function AdminDiscountsPage() {
  const [{ discounts }, { products }] = await Promise.all([
    getAllAdminDiscounts(),
    getAllAdminProducts(),
  ]);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
          Promociones
        </p>
        <h1 className="mt-2 text-3xl font-bold text-brand-900">Descuentos y códigos especiales</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Configura descuentos editables para productos, categorías, kits y rutinas específicas.
        </p>
      </section>

      <AdminDiscountsManager initialDiscounts={discounts} products={products} />
    </div>
  );
}
