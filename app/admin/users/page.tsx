import AdminUsersManager from "@/components/admin/AdminUsersManager";
import { getAllUsers } from "@/app/admin/actions";

export default async function AdminUsersPage() {
  const { users } = await getAllUsers();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
          Personas
        </p>
        <h1 className="mt-2 text-3xl font-bold text-brand-900">Usuarios y roles</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Administra accesos internos, base de clientes y segmentación operativa desde el panel.
        </p>
      </section>

      <AdminUsersManager initialUsers={users} />
    </div>
  );
}
