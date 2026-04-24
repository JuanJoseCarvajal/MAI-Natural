"use client";

import { useState, useTransition } from "react";
import { updateAdminUserRole } from "@/app/admin/actions";
import type { User } from "@/lib/db";

type AdminUsersManagerProps = {
  initialUsers: User[];
};

export default function AdminUsersManager({ initialUsers }: AdminUsersManagerProps) {
  const [users, setUsers] = useState(initialUsers);
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
        <p className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-900">{message}</p>
      ) : null}

      <section className="overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Teléfono</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 font-medium text-brand-900">{user.name || "-"}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{user.phone || "-"}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(event) => handleRoleChange(user.id, event.target.value)}
                      disabled={isPending}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {new Date(user.createdAt).toLocaleDateString("es-CO")}
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
