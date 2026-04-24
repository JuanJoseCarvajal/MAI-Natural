import AdminAppointmentsManager from "@/components/admin/AdminAppointmentsManager";
import { getAllAppointments } from "@/app/admin/actions";

export default async function AdminAppointmentsPage() {
  const { appointments } = await getAllAppointments();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
          Agenda
        </p>
        <h1 className="mt-2 text-3xl font-bold text-brand-900">Citas y agendamientos</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Gestiona reservas, validaciones de pago y confirmación final de citas desde una sola
          vista operativa.
        </p>
      </section>

      <AdminAppointmentsManager initialAppointments={appointments} />
    </div>
  );
}
