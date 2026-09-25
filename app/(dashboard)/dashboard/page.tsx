'use client';
import { SiteText } from "@/components/common/SiteText";


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
        <h1 className="text-3xl font-bold text-brand-900"><SiteText id="240cb332f448c4dfea9e">{"Resumen de tu cuenta"}</SiteText></h1>
        <p className="mt-2 text-slate-700"><SiteText id="800d64853501116c649b">{"Aquí solo ves lo importante: tus citas y tus órdenes creadas."}</SiteText></p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg bg-white p-6 shadow ring-1 ring-brand-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm"><SiteText id="998fcb7291eb2c0a204e">{"Citas Agendadas"}</SiteText></p>
              <p className="text-3xl font-bold text-brand-900 mt-2">{stats.appointmentsCount}</p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
          <Link
            href="/account/appointments"
            className="mt-4 inline-block text-sm text-brand-700 hover:text-brand-900 font-semibold"
          ><SiteText id="ae31f5043ffb738d5277">{"Ver todas →"}</SiteText></Link>
        </div>

        <div className="rounded-lg bg-white p-6 shadow ring-1 ring-brand-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm"><SiteText id="53749d149e19a33a4064">{"Órdenes creadas"}</SiteText></p>
              <p className="text-3xl font-bold text-brand-900 mt-2">{stats.ordersCount}</p>
            </div>
            <div className="text-4xl">🛒</div>
          </div>
          <Link
            href="/account/orders"
            className="mt-4 inline-block text-sm text-brand-700 hover:text-brand-900 font-semibold"
          ><SiteText id="ae31f5043ffb738d5277">{"Ver todas →"}</SiteText></Link>
        </div>
      </div>

      <section className="rounded-xl bg-brand-900 p-8 text-white">
        <p className="text-xs tracking-widest"><SiteText id="f4fa6381476a8b471edf">{"CÍRCULO MAI · EN PREPARACIÓN"}</SiteText></p>
        <h2 className="mt-3 text-3xl"><SiteText id="553705fd1624079a1239">{"Tu cuidado puede abrir nuevas preguntas."}</SiteText></h2>
        <p className="mt-4 text-sm leading-7"><SiteText id="90a3d86874a42cac2099">{"Estamos preparando un espacio de estudio quincenal con Melina. Las inscripciones aún no están abiertas; puedes conocer la propuesta o empezar por un encuentro individual."}</SiteText></p>
        <Link href="/subscriptions" className="mt-5 inline-block rounded bg-white px-5 py-3 text-sm text-brand-900"><SiteText id="e7dbb2b909c9c0eb27b8">{"Conocer el Círculo MAI →"}</SiteText></Link>
      </section>

      {/* Quick Actions */}
      <div className="rounded-lg bg-white p-6 shadow ring-1 ring-brand-100">
        <h2 className="text-lg font-semibold text-brand-900 mb-4"><SiteText id="85c25a0b1aaf2d86129c">{"Acciones Rápidas"}</SiteText></h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/services"
            className="flex items-center gap-4 rounded-lg border-2 border-brand-700 p-4 hover:bg-brand-50 transition-colors"
          >
            <div className="text-3xl">📅</div>
            <div>
              <p className="font-semibold text-brand-900"><SiteText id="a4a82bde3ac41de73c10">{"Agendar Cita"}</SiteText></p>
              <p className="text-xs text-slate-600"><SiteText id="3e03f8941a1f0ae54bf5">{"Reservar servicio"}</SiteText></p>
            </div>
          </Link>

          <Link
            href="/products"
            className="flex items-center gap-4 rounded-lg border-2 border-brand-700 p-4 hover:bg-brand-50 transition-colors"
          >
            <div className="text-3xl">🛍️</div>
            <div>
              <p className="font-semibold text-brand-900"><SiteText id="24f35ea7d13535c520f9">{"Ver Productos"}</SiteText></p>
              <p className="text-xs text-slate-600"><SiteText id="21ae7211756dd650aa22">{"Explorar catálogo"}</SiteText></p>
            </div>
          </Link>

          <Link
            href="/account/appointments"
            className="flex items-center gap-4 rounded-lg border-2 border-brand-700 p-4 hover:bg-brand-50 transition-colors"
          >
            <div className="text-3xl">📋</div>
            <div>
              <p className="font-semibold text-brand-900"><SiteText id="70e26d0ecf76d4a5f446">{"Mis citas y órdenes"}</SiteText></p>
              <p className="text-xs text-slate-600"><SiteText id="2c3ba36a2960e496e715">{"Ver historial creado"}</SiteText></p>
            </div>
          </Link>
        </div>
      </div>

      <div className="rounded-lg bg-brand-50 p-6 ring-1 ring-brand-100">
        <p className="text-sm text-slate-700"><SiteText id="911ef4fd81b1a2287ad3">{"Consejo: mantén tu perfil actualizado para acelerar futuras compras y reservas."}</SiteText></p>
      </div>
    </div>
  );
}
