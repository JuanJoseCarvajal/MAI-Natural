'use client';
import {useEffect,useState,useTransition} from 'react';
import Link from 'next/link';
import {saveSiteContent} from '@/app/admin/content/actions';
import {contentBlocks,contentLocation,contentPage} from '@/lib/content-layout';
type Entry={key:string;source:string;text:string;value:string;revision:number};
export default function ContentEditor({entries}:{entries:Entry[]}){
 const [values,setValues]=useState(entries),[draft,setDraft]=useState<Record<string,string>>({}),[message,setMessage]=useState(''),[pending,start]=useTransition(),[preview,setPreview]=useState(false),[query,setQuery]=useState('');
 const byKey=Object.fromEntries(values.map(e=>[e.key,e]));
 const blocks=contentBlocks.filter(block=>block.keys.every(key=>byKey[key])).map(block=>({...block,section:contentPage(block.source)==='Elementos compartidos'?contentLocation(block.source).title: block.source.includes('EditorialHeroCarousel')?'Carrusel de portada':block.section}));
 const pages=[...new Set(blocks.map(block=>contentPage(block.source)))];
 const priority=['Inicio','Tienda','Rutinas','Asesoría','Suscripciones'];
 pages.sort((a,b)=>(priority.includes(a)?priority.indexOf(a):99)-(priority.includes(b)?priority.indexOf(b):99));
 const text=(block:typeof blocks[number])=>block.keys.map(key=>byKey[key].value).filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
 const changed=blocks.filter(block=>draft[block.id]!==undefined&&draft[block.id]!==text(block));
 const search=query.trim().toLocaleLowerCase();
 const visible=blocks.filter(block=>[contentPage(block.source),block.section,block.label,draft[block.id]??text(block)].join(' ').toLocaleLowerCase().includes(search));
 useEffect(()=>{if(!changed.length)return;const warn=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[changed.length]);
 const save=()=>start(async()=>{
  if(changed.some(block=>!draft[block.id].trim())){setMessage('Los bloques no pueden quedar vacíos.');return;}
  const changes=changed.flatMap(block=>block.keys.map((key,i)=>({key,value:i===0?draft[block.id]:'',revision:byKey[key].revision})));
  try{const result=await saveSiteContent(changes);if(result.error){setMessage(result.error);return;}setValues(current=>current.map(e=>{const change=changes.find(c=>c.key===e.key);return change?{...e,value:change.value,revision:e.revision+1}:e;}));setDraft({});setMessage('Todos los cambios se publicaron.');}catch{setMessage('No se pudo guardar. Tus cambios siguen aquí.');}
 });
 return <section className="space-y-6">
  <header><h1 className="text-3xl font-bold">Textos del sitio</h1><p className="mt-2 text-slate-600">Edita todas las páginas en un solo lugar. Abre una página y sus secciones para encontrar cada texto.</p><p className="mt-2"><Link className="underline" href="/admin/products">Editar productos</Link> · <Link className="underline" href="/admin/blog">Blogs · Diario MAI</Link></p></header>
  <div className="sticky top-0 z-10 space-y-3 rounded-xl border bg-white p-4"><label className="block text-sm font-semibold">Buscar página, sección o texto<input className="mt-2 block w-full rounded-lg border p-3" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Inicio, Tienda, título…"/></label><div className="flex flex-wrap items-center gap-3"><button aria-pressed={preview} onClick={()=>setPreview(!preview)} className="rounded-full border px-4 py-2">{preview?'Volver a editar':'Vista previa del texto'}</button><button disabled={pending||!changed.length} onClick={save} className="rounded-full bg-brand-700 px-5 py-2 text-white disabled:opacity-50">{pending?'Guardando…':`Publicar ${changed.length} cambios`}</button><span className="text-sm text-slate-600">Los cambios de todas las páginas se guardan juntos.</span></div>{message&&<p role="status">{message}</p>}</div>
  <fieldset disabled={pending} className="space-y-4">
   {pages.map(page=>{const pageBlocks=visible.filter(b=>contentPage(b.source)===page);if(!pageBlocks.length)return null;const sections=[...new Set(pageBlocks.map(b=>b.section))];return <details key={`${page}-${!!search}`} open={search?true:undefined} className="rounded-2xl border bg-white p-5"><summary className="cursor-pointer text-xl font-bold">{page} <span className="text-sm font-normal text-slate-500">· {sections.length} secciones · {pageBlocks.length} textos</span></summary><div className="mt-5 space-y-4">{sections.map(section=>{const fields=pageBlocks.filter(b=>b.section===section);return <details key={`${section}-${!!search}`} open={search?true:undefined} className="rounded-xl border bg-slate-50 p-4"><summary className="cursor-pointer font-semibold">{section} <span className="text-sm font-normal text-slate-500">· {fields.length} textos</span></summary><div className="mt-4 space-y-5">{['Título','Subtítulo','Párrafo','Botón o enlace','Otros textos'].map(type=>{const group=fields.filter(b=>b.type===type);if(!group.length)return null;return <fieldset key={type} className="space-y-4"><legend className="mb-2 text-sm font-semibold text-brand-700">{type==='Párrafo'?'Párrafos':type}</legend>{group.map((block,i)=><div key={block.id}>{preview?<p className="whitespace-pre-wrap leading-7">{draft[block.id]??text(block)}</p>:<label className="block text-sm">{block.label}{group.length>1?` ${i+1}`:''}<textarea className="mt-2 block w-full rounded-lg border bg-white p-3 text-base" rows={type==='Párrafo'?4:2} maxLength={12000} value={draft[block.id]??text(block)} onChange={e=>setDraft(current=>({...current,[block.id]:e.target.value}))}/></label>}</div>)}</fieldset>;})}</div></details>;})}<a href={contentLocation(pageBlocks[0].source).url} target="_blank" rel="noreferrer" className="inline-block text-sm underline">Abrir página publicada ↗</a></div></details>;})}
   {!visible.length&&<p className="rounded-xl border bg-white p-6">No hay textos que coincidan con tu búsqueda.</p>}
  </fieldset>
 </section>;
}
