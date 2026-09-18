'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Stats {
  appointmentsCount: number;
  ordersCount: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({
    appointmentsCount: 0,
    ordersCount: 0,
  });

  useEffect(() => {
    const email = session?.user?.email;
    if (!email) return;

    // Fetch user stats
    const fetchStats = async () => {
      try {
        const appointmentsRes = await fetch(
          `/api/appointments?email=${encodeURIComponent(email)}`
        );
        const appointmentsData = await appointmentsRes.json();
        const appointmentsCount = appointmentsData.appointments?.length || 0;

        setStats({
          appointmentsCount,
          ordersCount: 0, // TODO: Fetch from API
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [session?.user?.email]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-brand-900">Resumen de tu cuenta</h1>
        <p className="mt-2 text-slate-700">
          Aquí solo ves lo importante: tus citas y tus órdenes creadas.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg bg-white p-6 shadow ring-1 ring-brand-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Citas Agendadas</p>
              <p className="text-3xl font-bold text-brand-900 mt-2">{stats.appointmentsCount}</p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
          <Link
            href="/account/appointments"
            className="mt-4 inline-block text-sm text-brand-700 hover:text-brand-900 font-semibold"
          >
            Ver todas →
          </Link>
        </div>

        <div className="rounded-lg bg-white p-6 shadow ring-1 ring-brand-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Órdenes creadas</p>
              <p className="text-3xl font-bold text-brand-900 mt-2">{stats.ordersCount}</p>
            </div>
            <div className="text-4xl">🛒</div>
          </div>
          <Link
            href="/account/orders"
            className="mt-4 inline-block text-sm text-brand-700 hover:text-brand-900 font-semibold"
          >
            Ver todas →
          </Link>
        </div>
      </div>

      <section className="rounded-xl bg-brand-900 p-8 text-white">
        <p className="text-xs tracking-widest">CÍRCULO MAI · EN PREPARACIÓN</p>
        <h2 className="mt-3 text-3xl">Tu cuidado puede abrir nuevas preguntas.</h2>
        <p className="mt-4 text-sm leading-7">Estamos preparando un espacio de estudio quincenal con Melina. Las inscripciones aún no están abiertas; puedes conocer la propuesta o empezar por un encuentro individual.</p>
        <Link href="/subscriptions" className="mt-5 inline-block rounded bg-white px-5 py-3 text-sm text-brand-900">Conocer el Círculo MAI →</Link>
      </section>

      {/* Quick Actions */}
      <div className="rounded-lg bg-white p-6 shadow ring-1 ring-brand-100">
        <h2 className="text-lg font-semibold text-brand-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/services"
            className="flex items-center gap-4 rounded-lg border-2 border-brand-700 p-4 hover:bg-brand-50 transition-colors"
          >
            <div className="text-3xl">📅</div>
            <div>
              <p className="font-semibold text-brand-900">Agendar Cita</p>
              <p className="text-xs text-slate-600">Reservar servicio</p>
            </div>
          </Link>

          <Link
            href="/products"
            className="flex items-center gap-4 rounded-lg border-2 border-brand-700 p-4 hover:bg-brand-50 transition-colors"
          >
            <div className="text-3xl">🛍️</div>
            <div>
              <p className="font-semibold text-brand-900">Ver Productos</p>
              <p className="text-xs text-slate-600">Explorar catálogo</p>
            </div>
          </Link>

          <Link
            href="/account/appointments"
            className="flex items-center gap-4 rounded-lg border-2 border-brand-700 p-4 hover:bg-brand-50 transition-colors"
          >
            <div className="text-3xl">📋</div>
            <div>
              <p className="font-semibold text-brand-900">Mis citas y órdenes</p>
              <p className="text-xs text-slate-600">Ver historial creado</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="rounded-lg bg-brand-50 p-6 ring-1 ring-brand-100">
        <p className="text-sm text-slate-700">
          Consejo: mantén tu perfil actualizado para acelerar futuras compras y reservas.
        </p>
      </div>
    </div>
  );
}
