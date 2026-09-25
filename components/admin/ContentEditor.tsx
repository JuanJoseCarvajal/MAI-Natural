'use client';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveSiteContent } from '@/app/admin/content/actions';
type Entry = {key:string;source:string;text:string;value:string;revision:number};
export default function ContentEditor({entries}:{entries:Entry[]}) {
  const groups = [...new Set(entries.map(e=>e.source))].sort();
  const [group,setGroup] = useState(groups[0] || '');
  const [draft,setDraft] = useState<Record<string,string>>({});
  const [message,setMessage] = useState('');
  const [pending,startTransition] = useTransition();
  const router = useRouter();
  const changed = entries.filter(e=>draft[e.key] !== undefined && draft[e.key] !== e.value);
  useEffect(() => {
    if (!changed.length) return;
    const warn = (event:BeforeUnloadEvent) => { event.preventDefault(); event.returnValue=''; };
    window.addEventListener('beforeunload',warn);
    return () => window.removeEventListener('beforeunload',warn);
  }, [changed.length]);
  return <form onSubmit={event=>{event.preventDefault();startTransition(async()=>{
    try {
    const result=await saveSiteContent(changed.map(e=>({key:e.key,value:draft[e.key],revision:e.revision})));
    setMessage(result.error || 'Textos publicados correctamente.');
    if(!result.error){setDraft({});router.refresh();}
    } catch { setMessage('No se pudo conectar. Tus cambios siguen aquí; vuelve a intentar.'); }
  });}}>
    <fieldset disabled={pending} className="space-y-5">
      <label className="block">Página / sección<select value={group} onChange={e=>setGroup(e.target.value)} className="mt-2 block w-full rounded border p-3">{groups.map(g=><option key={g} value={g}>{g.replace('app/(public)/','Páginas / ').replace('components/features/','Secciones / ').replace('/page.tsx','').replace('.tsx','')}</option>)}</select></label>
      {entries.filter(e=>e.source===group).map((e,index)=><label key={e.key} className="block rounded-xl border bg-white p-4"><span className="mb-2 block font-semibold">{index+1}. {e.text.trim().slice(0,90)}</span><textarea value={draft[e.key] ?? e.value} maxLength={12000} required rows={Math.min(8,Math.max(2,Math.ceil(e.text.length/90)))} onChange={event=>setDraft({...draft,[e.key]:event.target.value})} className="block w-full rounded border p-3"/><button type="button" onClick={()=>setDraft({...draft,[e.key]:e.text})} className="mt-2 text-sm underline">Restaurar texto original</button></label>)}
      <button disabled={!changed.length} className="rounded-full bg-brand-700 px-6 py-3 text-white disabled:opacity-50">{pending?'Guardando…':`Publicar ${changed.length} cambios`}</button>
    </fieldset><p role="status" className="my-4">{message}</p>
  </form>;
}
