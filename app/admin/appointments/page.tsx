'use client';

import { useEffect, useState } from 'react';
import { getAllAppointments } from '../actions';

interface Appointment {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  service: string;
  notes?: string | null;
  status: string;
  createdAt: Date;
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      const res = await getAllAppointments();
      setAppointments(res.appointments || []);
      setLoading(false);
    };

    fetchAppointments();
  }, []);

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">Todas las citas</h1>
      <p className="mt-2 text-slate-700">Gestiona todos los agendamientos del sistema.</p>

      {loading ? (
        <div className="mt-6 text-center">
          <p className="text-slate-600">Cargando citas...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="mt-6 rounded-lg bg-slate-50 p-6 text-center">
          <p className="text-slate-700">No hay citas agendadas aún.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg bg-white shadow ring-1 ring-brand-100">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Teléfono</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Servicio</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Fecha & Hora</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {appointments.map((appt) => (
                <tr key={appt.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{appt.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{appt.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{appt.phone}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{appt.service}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(appt.date).toLocaleDateString('es-ES')} {appt.time}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(appt.status)}`}>
                      {appt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 rounded-lg bg-blue-50 p-4 ring-1 ring-blue-200">
        <p className="text-xs text-blue-700">
          <strong>Total:</strong> {appointments.length} citas registradas
        </p>
      </div>
    </div>
  );
}
