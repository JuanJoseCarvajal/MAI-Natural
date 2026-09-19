"use client";

import { adminStatusLabels } from "@/lib/admin-order";
import { useState, useTransition } from "react";
import { updateAdminAppointmentStatus } from "@/app/admin/actions";
import type { Appointment } from "@/lib/db";

type AdminAppointmentsManagerProps = {
  initialAppointments: Appointment[];
};

const statusOptions = [
  "pending_payment",
  "payment_pending_verification",
  "confirmed",
  "cancelled",
  "expired_payment_window",
];

export default function AdminAppointmentsManager({
  initialAppointments,
}: AdminAppointmentsManagerProps) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [query, setQuery] = useState("");
  const visible = appointments.filter(a=>[a.name,a.email,a.date,a.phone].join(" ").toLowerCase().includes(query.trim().toLowerCase()));
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (id: string, status: string) => {
    setMessage("");
    startTransition(async () => {
      try {
        const result = await updateAdminAppointmentStatus(id, status);
        setAppointments((current) =>
          current.map((appointment) =>
            appointment.id === id ? (result.appointment as Appointment) : appointment
          )
        );
        setMessage("Cita actualizada.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "No fue posible actualizar la cita.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Citas registradas</p>
          <p className="mt-2 text-3xl font-extrabold text-brand-900">{appointments.length}</p>
        </div>
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm text-amber-700">Pagos pendientes</p>
          <p className="mt-2 text-3xl font-extrabold text-amber-800">
            {
              appointments.filter((appointment) =>
                ["pending_payment", "payment_pending_verification"].includes(appointment.status)
              ).length
            }
          </p>
        </div>
        <div className="rounded-3xl border border-green-200 bg-green-50 p-5 shadow-sm">
          <p className="text-sm text-green-700">Confirmadas</p>
          <p className="mt-2 text-3xl font-extrabold text-green-800">
            {appointments.filter((appointment) => appointment.status === "confirmed").length}
          </p>
        </div>
      </section>

      {message ? (
        <p role="status" aria-live="polite" className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-900">{message}</p>
      ) : null}

      <label className="grid gap-2 text-sm font-medium">Buscar citas por cliente, fecha o contacto<input type="search" className="rounded-xl border border-slate-300 p-3" value={query} onChange={e=>setQuery(e.target.value)} /></label>
      <p role="status" className="text-sm text-slate-600">{visible.length} citas encontradas · horarios de Colombia</p>
      <section className="overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm">
        <div className="overflow-x-auto" role="region" aria-label="Listado administrativo; desplázate para ver todas las columnas" tabIndex={0}>
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Cliente</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Servicio</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Agenda</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Contacto</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-600">
                    No hay citas que coincidan. Limpia la búsqueda para ver todas.
                  </td>
                </tr>
              ) : (
                visible.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-brand-900">{appointment.name}</p>
                      <p className="text-xs text-slate-500">{appointment.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{appointment.service}{appointment.wompiStatus && <p className="mt-2 text-amber-800">{appointment.paymentMode === "production" ? `Wompi · pago real: ${appointment.paymentStatus === "confirmed" ? "confirmado" : appointment.wompiStatus}. Coordina el horario antes de confirmar la cita.` : `Wompi: ${adminStatusLabels[`sandbox_${appointment.wompiStatus.toLowerCase()}`] ?? "Prueba por revisar"}. No confirma pago real.`}</p>}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {appointment.date} · {appointment.time}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{appointment.phone}</td>
                    <td className="px-6 py-4">
                      <select
                        aria-label={`Estado de la cita de ${appointment.name}`}
                        value={appointment.status}
                        onChange={(event) =>
                          handleStatusChange(appointment.id, event.target.value)
                        }
                        disabled={isPending}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      >
                        {statusOptions.map((option) => (
                          <option key={adminStatusLabels[option] ?? option} value={adminStatusLabels[option] ?? option}>
                            {adminStatusLabels[option] ?? option}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
