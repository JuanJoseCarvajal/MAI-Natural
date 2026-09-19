"use client";

import { formatAdminDate } from "@/lib/admin-order";
import { useState, useTransition } from "react";
import { updateAdminUserRole } from "@/app/admin/actions";
import type { User } from "@/lib/db";

type AdminUsersManagerProps = {
  initialUsers: User[];
};

export default function AdminUsersManager({ initialUsers }: AdminUsersManagerProps) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const visible = users.filter(user=>[user.name,user.email,user.phone].join(" ").toLowerCase().includes(query.trim().toLowerCase()));
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (id: string, role: string) => {
    setMessage("");
    startTransition(async () => {
      try {
        const result = await updateAdminUserRole(id, role);
        setUsers((current) =>
          current.map((user) => (user.id === id ? (result.user as User) : user))
        );
        setMessage("Rol actualizado.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "No fue posible actualizar el rol.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Usuarios</p>
          <p className="mt-2 text-3xl font-extrabold text-brand-900">{users.length}</p>
        </div>
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <p className="text-sm text-red-700">Administradores</p>
          <p className="mt-2 text-3xl font-extrabold text-red-800">
            {users.filter((user) => user.role === "admin").length}
          </p>
        </div>
        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <p className="text-sm text-blue-700">Clientes</p>
          <p className="mt-2 text-3xl font-extrabold text-blue-800">
            {users.filter((user) => user.role !== "admin").length}
          </p>
        </div>
      </section>

      {message ? (
        <p role="status" aria-live="polite" className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-900">{message}</p>
      ) : null}

      <label className="grid gap-2 text-sm font-medium">Buscar usuarios<input type="search" className="rounded-xl border border-slate-300 p-3" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Nombre, correo o teléfono" /></label>
      <p role="status" className="text-sm text-slate-600">{visible.length} usuarios encontrados</p>
      <section className="overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm">
        <div className="overflow-x-auto" role="region" aria-label="Listado administrativo; desplázate para ver todas las columnas" tabIndex={0}>
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Usuario</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Teléfono</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Rol</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.length === 0 && <tr><td colSpan={5} className="p-8 text-center">No hay usuarios que coincidan con tu búsqueda.</td></tr>}
              {visible.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 font-medium text-brand-900">{user.name || "-"}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{user.phone || "-"}</td>
                  <td className="px-6 py-4">
                    <select
                      aria-label={`Rol de ${user.name || user.email}`}
                      value={user.role}
                      onChange={(event) => handleRoleChange(user.id, event.target.value)}
                      disabled={isPending}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="user">Cliente</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {formatAdminDate(user.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
