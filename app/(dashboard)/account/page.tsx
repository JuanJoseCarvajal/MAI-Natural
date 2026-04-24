import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export default async function AccountPage() {
  const session = await auth();
  const email = session?.user?.email;
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!session?.user || !email || !userId) {
    redirect('/login?callbackUrl=/account');
  }

  const [appointments, orders] = await Promise.all([
    db.appointment.findMany({ where: { email } }),
    db.order.findMany({ where: { userId } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-900">Resumen de tu cuenta</h1>
        <p className="mt-2 text-slate-700">
          Aquí ves el estado de tus pedidos y tus citas en un solo lugar.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow ring-1 ring-brand-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Historial de pedidos</p>
              <p className="mt-2 text-3xl font-bold text-brand-900">{orders.length}</p>
            </div>
            <div className="text-4xl">🛒</div>
          </div>
          <Link
            href="/account/orders"
            className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:text-brand-900"
          >
            Ver historial →
          </Link>
        </div>

        <div className="rounded-lg bg-white p-6 shadow ring-1 ring-brand-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Citas registradas</p>
              <p className="mt-2 text-3xl font-bold text-brand-900">{appointments.length}</p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
          <Link
            href="/account/orders#historial-citas"
            className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:text-brand-900"
          >
            Ver citas →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-gradient-to-br from-brand-900 to-brand-700 p-6 text-white shadow">
          <p className="text-xs font-semibold tracking-wide text-brand-100">PEDIDOS</p>
          <h2 className="mt-2 text-2xl font-bold">Sigue el estado de cada orden</h2>
          <p className="mt-3 text-sm text-brand-100">
            Consulta si tu pedido está en preparación, enviado, en ruta o entregado.
          </p>
          <Link
            href="/account/orders"
            className="mt-5 inline-block rounded-full bg-white px-5 py-2 text-sm font-bold text-brand-900 hover:bg-brand-100"
          >
            Ver mis pedidos
          </Link>
        </div>

        <div className="rounded-xl bg-white p-6 shadow ring-1 ring-brand-100">
          <p className="text-xs font-semibold tracking-wide text-brand-700">PERFIL</p>
          <h2 className="mt-2 text-2xl font-bold text-brand-900">Mantén tus datos al día</h2>
          <p className="mt-3 text-sm text-slate-700">
            Actualiza tu contacto para recibir confirmaciones de pago, envío y agendamiento.
          </p>
          <Link
            href="/account/profile"
            className="mt-5 inline-block rounded-full border border-brand-300 px-5 py-2 text-sm font-bold text-brand-900 hover:bg-brand-50"
          >
            Editar perfil
          </Link>
        </div>
      </div>
    </div>
  );
}
