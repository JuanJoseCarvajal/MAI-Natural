import Link from "next/link";

const plans = [
  {
    name: "Esencial",
    frequency: "Cada 30 días",
    discount: "10% OFF",
    priceNote: "Ideal para una rutina base de 1-2 productos.",
    perks: ["Envío preferente", "Recordatorio inteligente", "Pausa cuando quieras"],
  },
  {
    name: "Ritual",
    frequency: "Cada 30 o 60 días",
    discount: "15% OFF",
    priceNote: "Perfecto para rutina completa piel + cabello.",
    perks: ["Acceso a lanzamientos", "Ajustes de frecuencia", "Soporte personalizado"],
  },
  {
    name: "Embajador MAI",
    frequency: "Flexible",
    discount: "20% OFF + Referidos",
    priceNote: "Para clientes recurrentes que recomiendan la marca.",
    perks: ["Código de referido", "Beneficio doble", "Bonos por activación"],
  },
];

export default function SubscriptionsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 p-8 text-white md:p-12">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
        <div className="relative z-10 max-w-3xl">
          <p className="inline-flex rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold tracking-wide backdrop-blur">
            MODELO DE SUSCRIPCIÓN MAI
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
            Menos fricción, más constancia en tu rutina
          </h1>
          <p className="mt-4 text-base text-brand-100 md:text-lg">
            Nuestro modelo está diseñado para que nunca te falten tus esenciales: eliges productos, frecuencia y beneficios.
            Puedes pausar, adelantar o editar tu suscripción desde tu cuenta.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="rounded-full bg-white px-6 py-3 text-sm font-bold text-brand-900 hover:bg-brand-100"
            >
              Elegir productos
            </Link>
            <Link
              href="/account"
              className="rounded-full border border-white/80 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
            >
              Gestionar mi cuenta
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-brand-900 md:text-3xl">¿Cómo funciona?</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-semibold text-brand-700">PASO 1</p>
            <h3 className="mt-2 text-lg font-bold text-brand-900">Selecciona tu rutina</h3>
            <p className="mt-2 text-sm text-slate-600">Elige productos y cantidad según tus objetivos de piel y cabello.</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-semibold text-brand-700">PASO 2</p>
            <h3 className="mt-2 text-lg font-bold text-brand-900">Define frecuencia</h3>
            <p className="mt-2 text-sm text-slate-600">Configura envíos cada 30 o 60 días. Puedes cambiarlo cuando quieras.</p>
          </article>
          <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-semibold text-brand-700">PASO 3</p>
            <h3 className="mt-2 text-lg font-bold text-brand-900">Recibe beneficios</h3>
            <p className="mt-2 text-sm text-slate-600">Accede a descuentos, prioridad en stock y programa de referidos MAI.</p>
          </article>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-brand-900 md:text-3xl">Planes de suscripción</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-100">
              <p className="text-xs font-semibold text-brand-700">{plan.frequency}</p>
              <h3 className="mt-2 text-2xl font-bold text-brand-900">{plan.name}</h3>
              <p className="mt-2 inline-flex rounded-full bg-brand-100 px-3 py-1 text-sm font-bold text-brand-900">
                {plan.discount}
              </p>
              <p className="mt-3 text-sm text-slate-600">{plan.priceNote}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {plan.perks.map((perk) => (
                  <li key={perk}>• {perk}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-3xl bg-brand-50 p-8 ring-1 ring-brand-100">
        <h2 className="text-2xl font-bold text-brand-900">Embajador MAI por referidos</h2>
        <p className="mt-2 text-slate-700">
          Comparte tu código personal. Tú recibes descuento y la persona referida también obtiene beneficio en su primera compra.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/account"
            className="rounded-full bg-brand-700 px-6 py-3 text-sm font-bold text-white hover:bg-brand-900"
          >
            Activar mi código
          </Link>
          <Link
            href="/products"
            className="rounded-full border border-brand-300 px-6 py-3 text-sm font-bold text-brand-900 hover:bg-white"
          >
            Ver productos elegibles
          </Link>
        </div>
      </section>
    </main>
  );
}
