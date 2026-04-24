"use client";

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
        <p className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-900">{message}</p>
      ) : null}

      <section className="overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Servicio</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Agenda</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Contacto</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-600">
                    No hay citas registradas todavía.
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-brand-900">{appointment.name}</p>
                      <p className="text-xs text-slate-500">{appointment.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{appointment.service}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {appointment.date} · {appointment.time}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{appointment.phone}</td>
                    <td className="px-6 py-4">
                      <select
                        value={appointment.status}
                        onChange={(event) =>
                          handleStatusChange(appointment.id, event.target.value)
                        }
                        disabled={isPending}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
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
