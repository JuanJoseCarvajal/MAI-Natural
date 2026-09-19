import AdminOrdersManager from "@/components/admin/AdminOrdersManager";
import { getAllOrders } from "@/app/admin/actions";

export default async function AdminOrdersPage() {
  const { orders } = await getAllOrders();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
          Comercio
        </p>
        <h1 className="mt-2 text-3xl font-bold text-brand-900">Pedidos</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Supervisa el flujo completo de pedidos: estado operativo, verificación de pago y avance
          del despacho.
        </p>
      </section>

      <AdminOrdersManager initialOrders={orders} mode="orders" />
    </div>
  );
}
