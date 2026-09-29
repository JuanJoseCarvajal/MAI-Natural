'use client';
import Image from 'next/image';
import {useRef,useState} from 'react';
import type {BlogDraft} from '@/lib/blog-editor';
import {adminProductSchema} from '@/lib/validators/admin';
import ProductImageUploader from './ProductImageUploader';
type Section=BlogDraft['sections'][number];
export default function BlogMediaEditor({section,category,onChange,onBusy}:{section:Section;category:string;onChange:(section:Section)=>void;onBusy:(busy:boolean)=>void}){
 const current=useRef(section);current.current=section;
 const [url,setUrl]=useState(''),[error,setError]=useState('');
 const media=section.media??[];
 const commit=(next:Section)=>{current.current=next;onChange(next);};
 const append=(value:string)=>{const parsed=adminProductSchema.shape.image.safeParse(value);if(!parsed.success){setError(parsed.error.issues[0].message);return;}if((current.current.media?.length??0)>=20)return;commit({...current.current,media:[...(current.current.media??[]),{url:parsed.data,alt:''}]});setUrl('');setError('');};
 const move=(index:number,offset:number)=>{const next=[...media];[next[index],next[index+offset]]=[next[index+offset],next[index]];commit({...section,media:next});};
 return <div className="my-4 space-y-3 rounded-xl border p-4">
  <h4 className="font-semibold">Imágenes de esta sección</h4>
  <p className="text-sm">Aparecen después del texto, antes de la siguiente sección. Describe cada imagen para lectores de pantalla.</p>
  <label className="block">Presentación<select className="ml-2 rounded border p-2" value={section.layout??'stack'} onChange={event=>commit({...section,layout:event.target.value as Section['layout']})}><option value="stack">Imágenes entre secciones</option><option value="carousel">Carrusel</option><option value="grid">Grid de imágenes</option></select></label>
  <ProductImageUploader category={category} remaining={20-media.length} onUploaded={append} onBusy={onBusy} successMessage="Subida. Guarda el artículo para publicarla."/>
  <label className="block">Ruta de una imagen existente<input className="block w-full rounded border p-2" value={url} onChange={event=>setUrl(event.target.value)} placeholder="/products/media/…"/></label>
  <button type="button" disabled={!url.trim()||media.length>=20} onClick={()=>append(url)}>Agregar imagen por ruta</button>
  {error&&<p role="alert">{error}</p>}
  <ol className="space-y-3">{media.map((item,index)=><li key={index} className="rounded border p-3">
   <Image src={item.url} alt={item.alt} width={120} height={90} className="rounded"/>
   <label className="block">Descripción de imagen {index+1}<input className="block w-full rounded border p-2" value={item.alt} maxLength={250} onChange={event=>commit({...section,media:media.map((entry,i)=>i===index?{...entry,alt:event.target.value}:entry)})}/></label>
   <div className="flex flex-wrap gap-3"><button type="button" className="min-h-11" disabled={index===0} aria-label={`Subir imagen ${index+1}`} onClick={()=>move(index,-1)}>Subir</button><button type="button" className="min-h-11" disabled={index===media.length-1} aria-label={`Bajar imagen ${index+1}`} onClick={()=>move(index,1)}>Bajar</button><button type="button" className="min-h-11" aria-label={`Quitar imagen ${index+1}`} onClick={()=>commit({...section,media:media.filter((_,i)=>i!==index)})}>Quitar</button></div>
  </li>)}</ol>
 </div>;
}
