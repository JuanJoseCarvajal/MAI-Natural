import Link from "next/link";
import Image from "next/image";

/* ─── Datos ──────────────────────────────────────── */

const pillars = [
  {
    icon: "✦",
    title: "Supervisión personalizada",
    description:
      "Seguimiento real de tu proceso con revisión de rutina, ajustes según evolución de tu piel o cabello, y recomendaciones claras para tu caso específico.",
    img: "https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=800",
    alt: "Mujer aplicando skincare natural con gesto consciente",
  },
  {
    icon: "✦",
    title: "Reuniones mensuales en comunidad",
    description:
      "Encuentros grupales guiados para resolver dudas reales, compartir avances y aprender juntas a sostener hábitos de belleza consciente.",
    img: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800",
    alt: "Comunidad femenina compartiendo experiencias de bienestar",
  },
  {
    icon: "✦",
    title: "Seguimiento de casos",
    description:
      "Registro de cambios, próximos pasos y objetivos medibles para que construyas una rutina sólida que evoluciona contigo.",
    img: "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=800",
    alt: "Ingredientes botánicos naturales para cosméticos",
  },
];

const steps = [
  {
    num: "01",
    title: "Diagnóstico inicial",
    description: "Valoración de tu piel o cabello y definición de objetivos reales y alcanzables.",
  },
  {
    num: "02",
    title: "Plan de rutina",
    description: "Productos recomendados, frecuencias de uso y hábitos de soporte para tu tipo específico.",
  },
  {
    num: "03",
    title: "Reunión mensual",
    description: "Encuentro grupal para revisar avances, resolver dudas y ajustar el plan según tu evolución.",
  },
  {
    num: "04",
    title: "Seguimiento continuo",
    description: "Registro de resultados y próximos pasos para sostener y profundizar el proceso mes a mes.",
  },
];

const memberships = [
  {
    id: "esencial",
    name: "Club Esencial",
    tagline: "El punto de partida perfecto",
    price: "$59.000",
    cadence: "/ mes",
    badge: "Más popular",
    highlight: "10% OFF permanente en productos",
    description:
      "Ideal para quien quiere empezar con respaldo. Accedes a la reunión mensual grupal, guía de rutina personalizada y descuento permanente en todos los productos MAI.",
    perks: [
      "1 reunión mensual en vivo",
      "Guía de rutina personalizada",
      "10% de descuento permanente",
      "Acceso a la comunidad Club MAI",
      "Boletín de hábitos mensuales",
    ],
    img: "https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=900",
    alt: "Ritual de skincare consciente con productos naturales",
    featured: false,
  },
  {
    id: "ritual",
    name: "Club Ritual",
    tagline: "Acompañamiento profundo y constante",
    price: "$99.000",
    cadence: "/ mes",
    badge: "Recomendado",
    highlight: "15% OFF + supervisión de caso",
    description:
      "Para quien quiere profundidad, seguimiento continuo y evolución más rápida. Incluye reunión grupal mensual más una supervisión individual de tu caso.",
    perks: [
      "Reunión grupal mensual",
      "1 supervisión individual de caso",
      "Ajustes estratégicos de rutina",
      "15% de descuento permanente",
      "Prioridad en nuevos lanzamientos",
      "Archivos de recursos exclusivos",
    ],
    img: "https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=900",
    alt: "Mujer en ritual de cuidado facial profundo",
    featured: true,
  },
  {
    id: "embajadora",
    name: "Club Embajadora",
    tagline: "Crece con la marca y comparte",
    price: "$149.000",
    cadence: "/ mes",
    badge: "Exclusivo",
    highlight: "20% OFF + Programa de referidos",
    description:
      "Para miembras activas que quieren crecer con MAI y compartir su experiencia. Referidos con beneficio doble, bonos por activación y acceso prioritario.",
    perks: [
      "Todo lo del Club Ritual",
      "20% de descuento permanente",
      "Código de referidos con beneficio doble",
      "Bonos por activación de nuevas miembras",
      "Acceso prioritario a eventos MAI",
      "Kit de bienvenida de embajadora",
    ],
    img: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=900",
    alt: "Comunidad femenina de belleza consciente y natural",
    featured: false,
  },
];

const testimonials = [
  {
    name: "Valentina R.",
    plan: "Club Ritual",
    text: "Llevaba años sin entender por qué mi piel no mejoraba. En dos meses de Club MAI entendí mi rutina de verdad. El seguimiento personalizado cambió todo.",
    avatar: "V",
  },
  {
    name: "Camila S.",
    plan: "Club Esencial",
    text: "Las reuniones mensuales son increíbles. Aprendes tanto de las experiencias de las demás. Me siento acompañada en cada paso del proceso.",
    avatar: "C",
  },
  {
    name: "Daniela M.",
    plan: "Club Embajadora",
    text: "Pasé del Club Esencial al Embajadora en tres meses porque los resultados fueron tan reales que quiero que todas conozcan MAI. Ya tengo 6 referidas activas.",
    avatar: "D",
  },
];

const faqs = [
  {
    q: "¿Puedo cancelar mi membresía en cualquier momento?",
    a: "Sí. Puedes cancelar antes de tu próximo ciclo sin penalización. Solo asegúrate de hacerlo con al menos 5 días de anticipación.",
  },
  {
    q: "¿Las reuniones son grabadas?",
    a: "Sí. Si no puedes asistir en vivo, recibes la grabación dentro de las 24 horas siguientes para que no te pierdas ningún contenido.",
  },
  {
    q: "¿Qué pasa si ya soy clienta de MAI?",
    a: "¡Perfecto! Tu historial de compras y tu conocimiento previo enriquecerán tu experiencia en el Club. Los descuentos aplican desde el día 1.",
  },
  {
    q: "¿El descuento aplica a todos los productos?",
    a: "Aplica al catálogo completo de productos MAI, sin excepción. Solo se excluyen productos ya en promoción o en liquidación.",
  },
  {
    q: "¿Puedo cambiar de plan?",
    a: "Sí. Puedes subir o bajar de plan en cualquier momento. El cambio toma efecto en el siguiente ciclo de facturación.",
  },
];

/* ─── Página ──────────────────────────────────────── */

export default function SubscriptionsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-20 px-4 pb-20 pt-0 md:px-6">

      {/* ── Hero ── */}
      <section className="relative -mx-4 overflow-hidden md:-mx-6">
        <div className="relative h-[520px] w-full md:h-[600px]">
          <Image
            src="https://images.pexels.com/photos/6621434/pexels-photo-6621434.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Herbolaria botánica para cosméticos naturales MAI"
            fill
            sizes="100vw"
            priority
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/90 via-brand-900/70 to-brand-900/30" />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
            <div className="max-w-2xl">
              <p className="inline-flex rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold tracking-widest text-white backdrop-blur">
                CLUB MAI · BELLEZA CON ACOMPAÑAMIENTO
              </p>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white md:text-6xl">
                Más que productos.<br />
                <span className="text-brand-100">Un proceso contigo.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base text-slate-200 md:text-lg">
                Entra a un club donde tu belleza es acompañada, supervisada y sostenida. 
                Supervisión personalizada, reuniones en comunidad y seguimiento de tu caso, 
                todo en un solo lugar.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="#membresias"
                  className="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-brand-900 transition hover:bg-brand-100"
                >
                  Ver membresías
                </Link>
                <Link
                  href="/services"
                  className="rounded-full border-2 border-white/70 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Agendar valoración gratuita
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-6">
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-white">+500</p>
                  <p className="text-xs text-slate-300">Miembras activas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-white">48h</p>
                  <p className="text-xs text-slate-300">Respuesta al diagnóstico</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-white">4.9/5</p>
                  <p className="text-xs text-slate-300">Satisfacción de miembras</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ¿Por qué Club MAI? ── */}
      <section className="mx-auto max-w-6xl px-2">
        <div className="mb-10 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-700">¿Por qué Club MAI?</p>
          <h2 className="mt-2 text-3xl font-extrabold text-brand-900 md:text-4xl">
            Tres pilares que transforman tu rutina
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            El Club no es una suscripción más. Es un sistema de acompañamiento diseñado para que tus resultados sean reales, medibles y sostenibles.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((p) => (
            <article key={p.title} className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={p.img}
                  alt={p.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900/60 to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-brand-900">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl px-2">
        <div className="grid gap-0 md:grid-cols-2">
          <div className="relative min-h-[380px] overflow-hidden rounded-3xl md:rounded-r-none">
            <Image
              src="https://images.pexels.com/photos/207518/pexels-photo-207518.jpeg?auto=compress&cs=tinysrgb&w=900"
              alt="Campo de lavanda orgánica botánica"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-brand-900/70 via-brand-700/40 to-brand-900/70" />
            <div className="absolute inset-0 flex items-center justify-center p-10 text-center">
              <div>
                <p className="text-5xl font-extrabold text-white">Tu ruta</p>
                <p className="mt-2 text-2xl font-extrabold text-brand-100">mes a mes</p>
                <p className="mt-3 text-sm text-slate-200">Cada mes, un paso más claro hacia la belleza que ya llevas dentro.</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl bg-brand-50 p-8 ring-1 ring-brand-100 md:rounded-l-none">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-700">Ruta mensual</p>
            <h2 className="mt-2 text-2xl font-extrabold text-brand-900 md:text-3xl">Cómo funciona el Club</h2>
            <ol className="mt-8 space-y-6">
              {steps.map((s) => (
                <li key={s.num} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-extrabold text-white">
                    {s.num}
                  </span>
                  <div>
                    <p className="font-bold text-brand-900">{s.title}</p>
                    <p className="mt-0.5 text-sm text-slate-600">{s.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Membresías ── */}
      <section id="membresias" className="scroll-mt-24 mx-auto max-w-6xl px-2">
        <div className="mb-10 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-700">Elige tu espacio</p>
          <h2 className="mt-2 text-3xl font-extrabold text-brand-900 md:text-4xl">Membresías Club MAI</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Tres niveles diseñados para crecer contigo. Empieza donde estás y evoluciona a tu ritmo.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {memberships.map((plan) => (
            <article
              key={plan.id}
              className={`relative flex flex-col overflow-hidden rounded-3xl shadow-sm ring-1 transition hover:-translate-y-1 hover:shadow-lg ${
                plan.featured
                  ? "ring-brand-700 shadow-brand-200"
                  : "ring-slate-200 bg-white"
              }`}
            >
              {/* Badge */}
              <div className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-xs font-bold ${
                plan.featured ? "bg-brand-700 text-white" : "bg-white/90 text-brand-900 shadow"
              }`}>
                {plan.badge}
              </div>

              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={plan.img}
                  alt={plan.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <div className={`absolute inset-0 ${plan.featured ? "bg-gradient-to-t from-brand-900/80 to-brand-900/30" : "bg-gradient-to-t from-brand-900/70 to-transparent"}`} />
                <div className="absolute bottom-4 left-5 right-5">
                  <p className={`text-xs font-semibold ${plan.featured ? "text-brand-100" : "text-slate-200"}`}>{plan.tagline}</p>
                  <p className={`text-2xl font-extrabold ${plan.featured ? "text-white" : "text-white"}`}>{plan.name}</p>
                </div>
              </div>

              {/* Content */}
              <div className={`flex flex-1 flex-col p-6 ${plan.featured ? "bg-brand-900 text-white" : "bg-white"}`}>
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-extrabold ${plan.featured ? "text-white" : "text-brand-900"}`}>{plan.price}</span>
                  <span className={`text-sm ${plan.featured ? "text-brand-200" : "text-slate-500"}`}>{plan.cadence}</span>
                </div>
                <p className={`mt-3 text-sm font-semibold ${plan.featured ? "text-brand-100" : "text-brand-700"}`}>{plan.highlight}</p>
                <p className={`mt-2 text-sm leading-relaxed ${plan.featured ? "text-slate-300" : "text-slate-600"}`}>{plan.description}</p>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {plan.perks.map((perk) => (
                    <li key={perk} className={`flex items-start gap-2 text-sm ${plan.featured ? "text-slate-200" : "text-slate-700"}`}>
                      <span className={`mt-0.5 shrink-0 text-base ${plan.featured ? "text-brand-300" : "text-brand-700"}`}>✓</span>
                      {perk}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/club-mai/checkout?plan=${plan.id}`}
                  className={`mt-6 block rounded-full px-6 py-3.5 text-center text-sm font-bold transition ${
                    plan.featured
                      ? "bg-white text-brand-900 hover:bg-brand-100"
                      : "bg-brand-700 text-white hover:bg-brand-900"
                  }`}
                >
                  Unirme al {plan.name}
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Comparison note */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Todos los planes incluyen acceso a la comunidad. Puedes cambiar o cancelar en cualquier momento.
        </p>
      </section>

      {/* ── Testimonios ── */}
      <section className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-700 to-brand-900 p-8 md:p-12 px-2">
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-20 h-48 w-48 rounded-full bg-brand-100/20 blur-3xl" />
        <div className="relative z-10">
          <div className="mb-8 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-200">Miembras que lo viven</p>
            <h2 className="mt-2 text-3xl font-extrabold text-white">Lo que dicen en el Club</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <blockquote key={t.name} className="rounded-2xl bg-white/10 p-6 backdrop-blur ring-1 ring-white/15">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-extrabold text-white">
                    {t.avatar}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-xs text-brand-200">{t.plan}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm italic leading-relaxed text-slate-200">&ldquo;{t.text}&rdquo;</p>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ── Embajadora ── */}
      <section className="mx-auto max-w-6xl px-2">
        <div className="grid gap-0 overflow-hidden rounded-3xl md:grid-cols-2">
          <div className="relative min-h-[280px] overflow-hidden">
            <Image
              src="https://images.pexels.com/photos/56866/garden-rose-red-pink-56866.jpeg?auto=compress&cs=tinysrgb&w=900"
              alt="Rosas naturales jardín botánico MAI"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-brand-900/50" />
          </div>
          <div className="flex flex-col justify-center bg-brand-50 p-8 ring-1 ring-brand-100 md:p-10">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-700">Programa de referidos</p>
            <h2 className="mt-2 text-2xl font-extrabold text-brand-900 md:text-3xl">Embajadora MAI</h2>
            <p className="mt-3 text-slate-600">
              Comparte tu código personal y convierte tu experiencia en impacto real. 
              Cada persona que refieras recibe un beneficio, y tú acumulas bonos directos en tu cuenta.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2"><span className="text-brand-700">✓</span> Tu referida recibe 10% OFF en su primera compra</li>
              <li className="flex items-center gap-2"><span className="text-brand-700">✓</span> Tú recibes bono acumulable por cada activación</li>
              <li className="flex items-center gap-2"><span className="text-brand-700">✓</span> Sin límite de referidas activas</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/club-mai/checkout?plan=embajadora"
                className="rounded-full bg-brand-700 px-6 py-3 text-sm font-bold text-white hover:bg-brand-900"
              >
                Activar programa Embajadora
              </Link>
              <Link
                href="/account"
                className="rounded-full border border-brand-300 px-6 py-3 text-sm font-bold text-brand-900 hover:bg-white"
              >
                Ver mi código actual
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="mx-auto max-w-3xl px-2">
        <div className="mb-8 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-700">Preguntas frecuentes</p>
          <h2 className="mt-2 text-3xl font-extrabold text-brand-900">Todo lo que necesitas saber</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 open:ring-brand-200 open:shadow-md"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-brand-900">
                {f.q}
                <span className="shrink-0 text-brand-700 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 p-10 text-center text-white md:p-16 px-2">
        <div className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
        <p className="text-sm font-bold uppercase tracking-widest text-brand-200">¿Lista para empezar?</p>
        <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">
          Tu proceso empieza hoy.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-slate-200">
          Únete al Club MAI y descubre lo que ocurre cuando la belleza tiene acompañamiento real. Cancela cuando quieras.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="#membresias"
            className="rounded-full bg-white px-8 py-4 text-sm font-bold text-brand-900 hover:bg-brand-100"
          >
            Ver membresías
          </Link>
          <Link
            href="/services"
            className="rounded-full border-2 border-white/70 px-8 py-4 text-sm font-bold text-white hover:bg-white/10"
          >
            Agendar valoración inicial gratis
          </Link>
        </div>
      </section>

    </main>
  );
}

