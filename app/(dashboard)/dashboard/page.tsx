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

      {/* Programas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl bg-gradient-to-br from-brand-900 to-brand-700 p-6 text-white shadow">
          <p className="text-xs font-semibold tracking-wide text-brand-100">PROGRAMA DE SUSCRIPCION</p>
          <h2 className="mt-2 text-2xl font-bold">Compra suscripción y ten descuentos</h2>
          <p className="mt-3 text-sm text-brand-100">
            Recibe tus productos favoritos de forma periódica con beneficios exclusivos y ahorro en cada entrega.
          </p>
          <button className="mt-5 rounded-full bg-white px-5 py-2 text-sm font-bold text-brand-900 hover:bg-brand-100">
            Ver planes de suscripción
          </button>
        </div>

        <div className="rounded-xl bg-white p-6 shadow ring-1 ring-brand-100">
          <p className="text-xs font-semibold tracking-wide text-brand-700">PROGRAMA DE REFERIDOS</p>
          <h2 className="mt-2 text-2xl font-bold text-brand-900">Vuélvete embajador MAI</h2>
          <p className="mt-3 text-sm text-slate-700">
            Comparte tu código y gana descuentos. Tú recibes beneficio y la persona referida también.
          </p>
          <div className="mt-4 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-900 ring-1 ring-brand-100">
            Código sugerido: <strong>MAI-USUARIO-10</strong>
          </div>
          <button className="mt-5 rounded-full border border-brand-300 px-5 py-2 text-sm font-bold text-brand-900 hover:bg-brand-50">
            Activar mi código
          </button>
        </div>
      </div>

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
