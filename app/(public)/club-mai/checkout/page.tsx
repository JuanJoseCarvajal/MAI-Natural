"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, Suspense } from "react";

/* ─── Datos de planes ──────────────────────────────── */

const PLANS = {
  esencial: {
    id: "esencial",
    name: "Club Esencial",
    tagline: "El punto de partida perfecto",
    price: "$59.000",
    priceNum: 59000,
    cadence: "mes",
    highlight: "10% OFF permanente en productos",
    img: "https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=700",
    perks: [
      "1 reunión mensual en vivo",
      "Guía de rutina personalizada",
      "10% de descuento permanente",
      "Acceso a la comunidad Club MAI",
      "Boletín de hábitos mensuales",
    ],
  },
  ritual: {
    id: "ritual",
    name: "Club Ritual",
    tagline: "Acompañamiento profundo y constante",
    price: "$99.000",
    priceNum: 99000,
    cadence: "mes",
    highlight: "15% OFF + supervisión de caso",
    img: "https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=700",
    perks: [
      "Reunión grupal mensual",
      "1 supervisión individual de caso",
      "Ajustes estratégicos de rutina",
      "15% de descuento permanente",
      "Prioridad en nuevos lanzamientos",
      "Archivos de recursos exclusivos",
    ],
  },
  embajadora: {
    id: "embajadora",
    name: "Club Embajadora",
    tagline: "Crece con la marca y comparte",
    price: "$149.000",
    priceNum: 149000,
    cadence: "mes",
    highlight: "20% OFF + Programa de referidos",
    img: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=700",
    perks: [
      "Todo lo del Club Ritual",
      "20% de descuento permanente",
      "Código de referidos con beneficio doble",
      "Bonos por activación de nuevas miembras",
      "Acceso prioritario a eventos MAI",
      "Kit de bienvenida de embajadora",
    ],
  },
} as const;

type PlanId = keyof typeof PLANS;

/* ─── Inner component (uses useSearchParams) ─────── */

function CheckoutInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan") ?? "esencial";
  const plan = PLANS[planParam as PlanId] ?? PLANS.esencial;

  const { data: session, status } = useSession();
  const [name, setName] = useState(session?.user?.name ?? "");
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [billing, setBilling] = useState<"monthly" | "quarterly">("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const billedPrice =
    billing === "quarterly"
      ? `${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(plan.priceNum * 3 * 0.9)} / trimestre`
      : `${plan.price} / mes`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Completa tu nombre y correo para continuar.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/club-mai/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.id, name, email, billing }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Hubo un problema. Intenta de nuevo.");
        return;
      }
      router.push(`/club-mai/bienvenida?plan=${plan.id}`);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:px-6">

      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/subscriptions" className="hover:text-brand-700">Club MAI</Link>
        <span>/</span>
        <span className="text-brand-900 font-medium">Completar inscripción</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-[1fr_400px]">

        {/* ── Form ── */}
        <div>
          <h1 className="text-3xl font-extrabold text-brand-900">Completa tu inscripción</h1>
          <p className="mt-2 text-slate-600">
            Estás a un paso de unirte al <span className="font-semibold text-brand-700">{plan.name}</span>. Sin compromisos: cancela cuando quieras.
          </p>

          {status === "unauthenticated" && (
            <div className="mt-4 rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-200">
              <p className="text-sm text-brand-900">
                ¿Tienes cuenta MAI?{" "}
                <Link href="/login?callbackUrl=/club-mai/checkout" className="font-bold text-brand-700 hover:underline">
                  Iniciar sesión
                </Link>{" "}
                para usar tus datos guardados.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {/* Billing cycle */}
            <fieldset>
              <legend className="mb-3 text-sm font-bold text-brand-900">Ciclo de facturación</legend>
              <div className="flex gap-3">
                <label className={`flex flex-1 cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition ${billing === "monthly" ? "border-brand-700 bg-brand-50" : "border-slate-200 hover:border-brand-300"}`}>
                  <input
                    type="radio"
                    name="billing"
                    value="monthly"
                    checked={billing === "monthly"}
                    onChange={() => setBilling("monthly")}
                    className="accent-brand-700"
                  />
                  <div>
                    <p className="text-sm font-semibold text-brand-900">Mensual</p>
                    <p className="text-xs text-slate-500">{plan.price}/mes</p>
                  </div>
                </label>
                <label className={`flex flex-1 cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition ${billing === "quarterly" ? "border-brand-700 bg-brand-50" : "border-slate-200 hover:border-brand-300"}`}>
                  <input
                    type="radio"
                    name="billing"
                    value="quarterly"
                    checked={billing === "quarterly"}
                    onChange={() => setBilling("quarterly")}
                    className="accent-brand-700"
                  />
                  <div>
                    <p className="text-sm font-semibold text-brand-900">Trimestral</p>
                    <p className="text-xs text-slate-500">Ahorra 10% · pago único cada 3 meses</p>
                  </div>
                </label>
              </div>
            </fieldset>

            {/* Personal info */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-brand-900" htmlFor="name">
                Nombre completo
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-brand-900" htmlFor="email">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@email.com"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-brand-700 py-4 text-sm font-bold text-white transition hover:bg-brand-900 disabled:opacity-60"
            >
              {loading ? "Procesando..." : `Confirmar inscripción · ${billedPrice}`}
            </button>

            <p className="text-center text-xs text-slate-500">
              Al confirmar aceptas los{" "}
              <Link href="/terms" className="underline hover:text-brand-700">Términos del Club MAI</Link>.
              {" "}Puedes cancelar en cualquier momento desde tu cuenta.
            </p>
          </form>
        </div>

        {/* ── Plan summary ── */}
        <aside className="md:sticky md:top-24 md:self-start">
          <div className="overflow-hidden rounded-3xl bg-white shadow ring-1 ring-brand-100">
            <div className="relative h-44 overflow-hidden">
              <Image
                src={plan.img}
                alt={plan.name}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-900/80 to-transparent" />
              <div className="absolute bottom-4 left-5">
                <p className="text-xs text-brand-200">{plan.tagline}</p>
                <p className="text-xl font-extrabold text-white">{plan.name}</p>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-brand-900">{plan.price}</span>
                <span className="text-sm text-slate-500">/ mes</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-brand-700">{plan.highlight}</p>
              <ul className="mt-4 space-y-2.5">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-0.5 text-brand-700">✓</span>
                    {perk}
                  </li>
                ))}
              </ul>
              <Link
                href="/subscriptions#membresias"
                className="mt-5 block text-center text-xs text-brand-700 hover:underline"
              >
                ← Comparar todos los planes
              </Link>
            </div>
          </div>
        </aside>

      </div>
    </main>
  );
}

/* ─── Page wrapper (Suspense for useSearchParams) ── */

export default function ClubCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-700" />
      </div>
    }>
      <CheckoutInner />
    </Suspense>
  );
}
