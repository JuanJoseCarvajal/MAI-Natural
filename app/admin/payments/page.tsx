import AdminOrdersManager from "@/components/admin/AdminOrdersManager";
import { getAllOrders, getAllAppointments } from "@/app/admin/actions";

export default async function AdminPaymentsPage() {
  const [{ orders }, { appointments }] = await Promise.all([getAllOrders(), getAllAppointments()]);

  const pendingTransfers = appointments.filter((appointment) =>
    ["pending_payment", "payment_pending_verification"].includes(appointment.status)
  ).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
            Finanzas
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-900">Pagos</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Valida transferencias, monitorea pedidos pagados y centraliza el estado de cobro de la
            operación.
          </p>
        </div>
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm text-amber-700">Citas con pago pendiente</p>
          <p className="mt-1 text-3xl font-extrabold text-amber-800">{pendingTransfers}</p>
        </div>
      </section>

      <AdminOrdersManager initialOrders={orders} mode="payments" />
    </div>
  );
}
