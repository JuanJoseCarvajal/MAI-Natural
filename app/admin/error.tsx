'use client';
export default function AdminError({reset}:{reset:()=>void}) {
 return <section role="alert" className="mx-auto max-w-xl space-y-4 rounded-2xl border bg-white p-6"><h1 className="text-2xl font-bold">No pudimos cargar los datos actuales</h1><p>Comprueba tu conexión y vuelve a intentar. Si el problema continúa, el administrador debe revisar la conexión y la migración de la base de datos.</p><button onClick={reset} className="rounded-full bg-brand-700 px-5 py-3 text-white">Volver a intentar</button></section>;
}
