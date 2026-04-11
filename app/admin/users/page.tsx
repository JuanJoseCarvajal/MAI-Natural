'use client';

import { useEffect, useState } from 'react';
import { getAllUsers } from '../actions';

interface User {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  role: string;
  createdAt: Date;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await getAllUsers();
      setUsers(res.users || []);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      user: 'bg-blue-100 text-blue-800',
    };
    return colors[role as keyof typeof colors] || colors.user;
  };

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const userCount = users.length - adminCount;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">Todos los usuarios</h1>
      <p className="mt-2 text-slate-700">Gestiona los usuarios registrados del sistema.</p>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg bg-white p-6 shadow ring-1 ring-brand-100">
          <p className="text-slate-600 text-sm">Total de usuarios</p>
          <p className="text-3xl font-bold text-brand-900 mt-2">{users.length}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow ring-1 ring-brand-100">
          <p className="text-slate-600 text-sm">Administradores</p>
          <p className="text-3xl font-bold text-red-900 mt-2">{adminCount}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow ring-1 ring-brand-100">
          <p className="text-slate-600 text-sm">Usuarios regulares</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{userCount}</p>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 text-center">
          <p className="text-slate-600">Cargando usuarios...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="mt-6 rounded-lg bg-slate-50 p-6 text-center">
          <p className="text-slate-700">No hay usuarios registrados aún.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg bg-white shadow ring-1 ring-brand-100">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Teléfono</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Rol</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Fecha de registro</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.phone || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(user.createdAt).toLocaleDateString('es-ES')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 rounded-lg bg-blue-50 p-4 ring-1 ring-blue-200">
        <p className="text-xs text-blue-700">
          <strong>Nota:</strong> El admin demo es usuario@ejemplo.com. Para promover otros usuarios a admin,
          actualiza su rol en la base de datos.
        </p>
      </div>
    </div>
  );
}
