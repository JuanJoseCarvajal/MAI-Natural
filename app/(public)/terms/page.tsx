import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 md:px-6">
      <div className="mb-8">
        <Link href="/subscriptions" className="text-sm font-semibold text-brand-700 hover:underline">
          Volver al Club MAI
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold text-brand-900">
          Terminos del Club MAI
        </h1>
        <p className="mt-3 text-slate-600">
          Estos terminos resumen las condiciones principales de las membresias y servicios de
          acompanamiento de MAI Natural.
        </p>
      </div>

      <div className="space-y-6 rounded-2xl bg-white p-6 text-sm leading-6 text-slate-700 shadow ring-1 ring-brand-100">
        <section>
          <h2 className="text-lg font-bold text-brand-900">Membresia</h2>
          <p className="mt-2">
            La membresia seleccionada habilita los beneficios descritos para cada plan mientras el
            pago este activo y confirmado.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-900">Pagos y renovaciones</h2>
          <p className="mt-2">
            Los pagos se realizan segun el ciclo elegido. MAI Natural puede validar manualmente los
            pagos antes de activar beneficios, descuentos o accesos.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-900">Cancelaciones</h2>
          <p className="mt-2">
            Puedes solicitar la cancelacion de tu membresia en cualquier momento. Los beneficios se
            mantienen hasta el cierre del periodo ya pagado.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-900">Acompanamiento</h2>
          <p className="mt-2">
            Las recomendaciones de rutina y bienestar son educativas y no reemplazan diagnostico,
            tratamiento medico ni consulta con profesionales de salud.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-900">Contacto</h2>
          <p className="mt-2">
            Para soporte sobre membresias, pagos o beneficios, escribenos a{" "}
            <a href="mailto:info@mainatural.com" className="font-semibold text-brand-700 hover:underline">
              info@mainatural.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
