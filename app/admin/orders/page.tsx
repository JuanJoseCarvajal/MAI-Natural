'use client';

import { useEffect, useState } from 'react';
import { getAllOrders } from '../actions';

interface Order {
  id: string;
  userId: string;
  total: number;
  status: string;
  createdAt: Date;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await getAllOrders();
      setOrders(res.orders || []);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      shipped: 'bg-blue-100 text-blue-800',
      delivered: 'bg-purple-100 text-purple-800',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">Todas las órdenes</h1>
      <p className="mt-2 text-slate-700">Gestiona todos los pedidos del sistema.</p>

      {/* Revenue stats */}
      {orders.length > 0 && (
        <div className="mt-6 rounded-lg bg-brand-50 p-6 ring-1 ring-brand-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Ingresos totales</p>
              <p className="text-3xl font-bold text-brand-900 mt-1">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="mt-6 text-center">
          <p className="text-slate-600">Cargando órdenes...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6 rounded-lg bg-slate-50 p-6 text-center">
          <p className="text-slate-700">No hay órdenes registradas aún.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg bg-white shadow ring-1 ring-brand-100">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">ID Orden</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Usuario ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Monto</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Estado</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{order.userId}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-brand-900">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(order.createdAt).toLocaleDateString('es-ES')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 rounded-lg bg-blue-50 p-4 ring-1 ring-blue-200">
        <p className="text-xs text-blue-700">
          <strong>Total:</strong> {orders.length} órdenes registradas
        </p>
      </div>
    </div>
  );
}
