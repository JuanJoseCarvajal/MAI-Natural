import Link from "next/link";

export default function SubscriptionsPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-5xl items-center px-4 py-16 md:px-6">
      <section className="w-full overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-xl">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(42,99,67,0.16),_transparent_35%),linear-gradient(135deg,#173626_0%,#2a6343_54%,#5e8f72_100%)] px-6 py-14 text-white md:px-10">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.18em]">
            Club MAI
          </span>
          <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-tight md:text-5xl">
            Suscripciones desactivadas por ahora.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-100 md:text-lg">
            Estamos preparando la primera version del Club MAI para lanzarla con una experiencia
            mas solida y un flujo de pagos claro. Esta seccion estara disponible proximamente.
          </p>
        </div>

        <div className="grid gap-6 px-6 py-8 md:grid-cols-[1.2fr_0.8fr] md:px-10 md:py-10">
          <div>
            <div className="inline-flex rounded-full bg-brand-50 px-4 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
              Proximamente
            </div>
            <h2 className="mt-4 text-2xl font-bold text-brand-900">Que si puedes hacer hoy</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Mientras terminamos Club MAI, ya puedes avanzar con asesorias y agendamientos
              personalizados desde la seccion de servicios.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/services"
                className="rounded-full bg-brand-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-900"
              >
                Ir a servicios
              </Link>
              <Link
                href="/products"
                className="rounded-full border border-brand-300 px-6 py-3 text-sm font-bold text-brand-900 transition hover:bg-brand-50"
              >
                Ver productos
              </Link>
            </div>
          </div>

          <aside className="rounded-[1.5rem] border border-brand-100 bg-brand-50 p-5">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-700">
              Lanzamiento
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li>Planes y beneficios del Club MAI volveran a mostrarse aqui.</li>
              <li>La activacion de membresias seguira apagada hasta cerrar el flujo completo.</li>
              <li>Cuando este listo, esta pagina cambiara de &quot;Proximamente&quot; a suscripciones activas.</li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
