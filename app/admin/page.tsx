'use client';

import { useEffect, useState } from 'react';
import { getAllAppointments, getAllOrders, getAllUsers } from './actions';
import Link from 'next/link';

export default function AdminPage() {
  const [stats, setStats] = useState({
    appointmentsCount: 0,
    ordersCount: 0,
    usersCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [appointmentsRes, ordersRes, usersRes] = await Promise.all([
        getAllAppointments(),
        getAllOrders(),
        getAllUsers(),
      ]);

      setStats({
        appointmentsCount: appointmentsRes.appointments?.length || 0,
        ordersCount: ordersRes.orders?.length || 0,
        usersCount: usersRes.users?.length || 0,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, link }: { title: string; value: number; icon: string; link: string }) => (
    <Link href={link}>
      <div className="rounded-lg bg-white p-6 shadow ring-1 ring-brand-100 cursor-pointer hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600 text-sm">{title}</p>
            <p className="text-3xl font-bold text-brand-900 mt-2">{value}</p>
          </div>
          <div className="text-4xl">{icon}</div>
        </div>
      </div>
    </Link>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-900">Panel de Administración</h1>
      <p className="mt-2 text-slate-700">Bienvenido al panel de admin. Gestiona citas, órdenes y usuarios.</p>

      {loading ? (
        <div className="mt-6 text-center">
          <p className="text-slate-600">Cargando datos...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total de Citas"
              value={stats.appointmentsCount}
              icon="📅"
              link="/admin/appointments"
            />
            <StatCard
              title="Total de Órdenes"
              value={stats.ordersCount}
              icon="🛒"
              link="/admin/orders"
            />
            <StatCard
              title="Total de Usuarios"
              value={stats.usersCount}
              icon="👥"
              link="/admin/users"
            />
          </div>

          {/* Quick Actions */}
          <div className="mt-8 rounded-lg bg-white p-6 shadow ring-1 ring-brand-100">
            <h2 className="text-lg font-semibold text-brand-900 mb-4">Acciones rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/admin/appointments"
                className="block rounded-lg border-2 border-brand-700 p-4 text-center hover:bg-brand-50 transition-colors"
              >
                <p className="text-2xl mb-2">📅</p>
                <p className="font-semibold text-brand-900">Ver todas las citas</p>
                <p className="text-xs text-slate-600 mt-1">Revisar agendamientos</p>
              </Link>
              <Link
                href="/admin/orders"
                className="block rounded-lg border-2 border-brand-700 p-4 text-center hover:bg-brand-50 transition-colors"
              >
                <p className="text-2xl mb-2">🛒</p>
                <p className="font-semibold text-brand-900">Ver todas las órdenes</p>
                <p className="text-xs text-slate-600 mt-1">Revisar compras</p>
              </Link>
              <Link
                href="/admin/users"
                className="block rounded-lg border-2 border-brand-700 p-4 text-center hover:bg-brand-50 transition-colors"
              >
                <p className="text-2xl mb-2">👥</p>
                <p className="font-semibold text-brand-900">Ver todos los usuarios</p>
                <p className="text-xs text-slate-600 mt-1">Gestionar usuarios</p>
              </Link>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 rounded-lg bg-blue-50 p-6 ring-1 ring-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Panel de Administración</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Ver resumen de citas, órdenes y usuarios</li>
              <li>• Protegido: Solo para administradores (rol: admin)</li>
              <li>• Datos en tiempo real desde la base de datos</li>
              <li>• Usuario admin de demo: usuario@ejemplo.com (con rol: admin)</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
