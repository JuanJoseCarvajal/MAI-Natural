'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  service: string;
  notes: string;
  created: string;
}

export default function AppointmentsPage() {
  const { data: session, status } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.email) return;
    const email = session.user.email;

    const fetchAppointments = async () => {
      try {
        const response = await fetch(`/api/appointments?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        setAppointments(data.appointments || []);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [status, session?.user?.email]);

  const handleCancel = async (appointmentId: string) => {
    if (!confirm('¿Deseas cancelar esta cita?')) return;

    try {
      const response = await fetch(`/api/appointments?id=${appointmentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAppointments(appointments.filter((a) => a.id !== appointmentId));
      }
    } catch (error) {
      console.error('Error canceling appointment:', error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">Mis citas</h1>
      <p className="mt-2 text-slate-700">Aquí verás tus citas agendadas.</p>

      {loading ? (
        <div className="mt-6 text-center">
          <p className="text-slate-600">Cargando citas...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center">
          <p className="text-slate-700">No tienes citas agendadas aún.</p>
          <Link
            href="/services"
            className="mt-4 inline-block rounded-full bg-brand-700 px-6 py-2 text-white font-semibold hover:bg-brand-900"
          >
            Agendar una cita
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="rounded-lg border border-brand-100 bg-white p-4 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-brand-900">{appointment.service}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    📅 {new Date(appointment.date).toLocaleDateString('es-ES')} a las{' '}
                    {appointment.time}
                  </p>
                  <p className="text-sm text-slate-600">📞 {appointment.phone}</p>
                  {appointment.notes && (
                    <p className="text-sm text-slate-600 mt-2">📝 {appointment.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => handleCancel(appointment.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
