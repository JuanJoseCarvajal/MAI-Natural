"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

const PLAN_NAMES: Record<string, string> = {
  esencial: "Club Esencial",
  ritual: "Club Ritual",
  embajadora: "Club Embajadora",
};

function BienvenidaInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("plan") ?? "esencial";
  const planName = PLAN_NAMES[planId] ?? "Club MAI";

  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center md:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 p-10 text-white md:p-14">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 left-10 h-36 w-36 rounded-full bg-brand-100/20 blur-2xl" />

        <div className="relative z-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-4xl">
            ✦
          </div>

          <h1 className="mt-6 text-3xl font-extrabold md:text-4xl">
            ¡Bienvenida al<br />{planName}!
          </h1>

          <p className="mt-4 text-base text-slate-200">
            Tu inscripción fue recibida. En las próximas <strong className="text-white">24 horas</strong> recibirás 
            un correo con los detalles de acceso, tu guía de diagnóstico y el enlace a tu primera reunión.
          </p>

          <div className="mt-8 space-y-3 rounded-2xl bg-white/10 p-5 text-left backdrop-blur ring-1 ring-white/20">
            <h2 className="text-sm font-bold text-brand-100 uppercase tracking-wide">Próximos pasos</h2>
            <ol className="space-y-2 text-sm text-slate-200">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold">1</span>
                Revisa tu correo — enviaremos tu diagnóstico en las próximas horas.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold">2</span>
                Crea o inicia sesión en tu cuenta MAI para ver tu membresía activa.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold">3</span>
                Únete a la reunión mensual — te enviaremos el calendario por correo.
              </li>
            </ol>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/account"
              className="rounded-full bg-white px-7 py-3 text-sm font-bold text-brand-900 hover:bg-brand-100"
            >
              Ver mi cuenta
            </Link>
            <Link
              href="/products"
              className="rounded-full border border-white/70 px-7 py-3 text-sm font-bold text-white hover:bg-white/10"
            >
              Explorar productos con descuento
            </Link>
          </div>

          {planId === "embajadora" && (
            <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm text-slate-200 ring-1 ring-white/20">
              <strong className="text-white">¡Eres Embajadora MAI!</strong> Tu código de referidos estará disponible en tu cuenta dentro de las próximas 24 horas.
            </div>
          )}
        </div>
      </div>

      <p className="mt-8 text-sm text-slate-500">
        ¿Tienes preguntas?{" "}
        <Link href="/services" className="font-semibold text-brand-700 hover:underline">
          Habla con una asesora MAI
        </Link>
      </p>
    </main>
  );
}

export default function BienvenidaPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-700" />
      </div>
    }>
      <BienvenidaInner />
    </Suspense>
  );
}
