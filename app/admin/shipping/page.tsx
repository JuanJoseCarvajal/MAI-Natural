import AdminOrdersManager from "@/components/admin/AdminOrdersManager";
import { getAllOrders } from "@/app/admin/actions";

export default async function AdminShippingPage() {
  const { orders } = await getAllOrders();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
          Logística
        </p>
        <h1 className="mt-2 text-3xl font-bold text-brand-900">Envíos</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Controla preparación, despacho, tracking y entrega final de cada pedido artesanal.
        </p>
      </section>

      <AdminOrdersManager initialOrders={orders} mode="shipping" />
    </div>
  );
}
