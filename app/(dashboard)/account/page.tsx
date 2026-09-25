
import { SiteText } from "@/components/common/SiteText";
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
    db.appointment.findMany({ where: { userId } }),
    db.order.findMany({ where: { userId } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-900"><SiteText id="d8cab8d68a1a7f2d022a">{"Resumen de tu cuenta"}</SiteText></h1>
        <p className="mt-2 text-slate-700"><SiteText id="e3e1050bccd964d7edb4">{"Aquí ves el estado de tus pedidos y tus citas en un solo lugar."}</SiteText></p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow ring-1 ring-brand-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600"><SiteText id="e65095c30ae264e180a5">{"Historial de pedidos"}</SiteText></p>
              <p className="mt-2 text-3xl font-bold text-brand-900">{orders.length}</p>
            </div>
            <div className="text-4xl">🛒</div>
          </div>
          <Link
            href="/account/orders"
            className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:text-brand-900"
          ><SiteText id="90b9dda80bb60ccba712">{"Ver historial →"}</SiteText></Link>
        </div>

        <div className="rounded-lg bg-white p-6 shadow ring-1 ring-brand-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600"><SiteText id="94bd3ae6733b05934e1f">{"Citas registradas"}</SiteText></p>
              <p className="mt-2 text-3xl font-bold text-brand-900">{appointments.length}</p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
          <Link
            href="/account/orders#historial-citas"
            className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:text-brand-900"
          ><SiteText id="0ee2951f763a0bdd39c9">{"Ver citas →"}</SiteText></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-gradient-to-br from-brand-900 to-brand-700 p-6 text-white shadow">
          <p className="text-xs font-semibold tracking-wide text-brand-100"><SiteText id="9ecc7ba6a9803a2ca384">{"PEDIDOS"}</SiteText></p>
          <h2 className="mt-2 text-2xl font-bold"><SiteText id="052f2591abb67113c19f">{"Sigue el estado de cada orden"}</SiteText></h2>
          <p className="mt-3 text-sm text-brand-100"><SiteText id="6d211725feeca72e3b30">{"Consulta si tu pedido está en preparación, enviado, en ruta o entregado."}</SiteText></p>
          <Link
            href="/account/orders"
            className="mt-5 inline-block rounded-full bg-white px-5 py-2 text-sm font-bold text-brand-900 hover:bg-brand-100"
          ><SiteText id="fd65454a6e071e7c672a">{"Ver mis pedidos"}</SiteText></Link>
        </div>

        <div className="rounded-xl bg-white p-6 shadow ring-1 ring-brand-100">
          <p className="text-xs font-semibold tracking-wide text-brand-700"><SiteText id="28ff6c5d5a0cdf96197a">{"PERFIL"}</SiteText></p>
          <h2 className="mt-2 text-2xl font-bold text-brand-900"><SiteText id="b204e90d72fb0f3bd193">{"Mantén tus datos al día"}</SiteText></h2>
          <p className="mt-3 text-sm text-slate-700"><SiteText id="3d4bb728daeedab00d08">{"Actualiza tu contacto para recibir confirmaciones de pago, envío y agendamiento."}</SiteText></p>
          <Link
            href="/account/profile"
            className="mt-5 inline-block rounded-full border border-brand-300 px-5 py-2 text-sm font-bold text-brand-900 hover:bg-brand-50"
          ><SiteText id="be4df0f36aeaaba9ebee">{"Editar perfil"}</SiteText></Link>
        </div>
      </div>
    </div>
  );
}
