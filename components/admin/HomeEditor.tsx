 'use client';
import Image from 'next/image';
import {useState,useTransition} from 'react';
import {homePanelSchema,type HomeConfig} from '@/lib/home-config';
import {updateHome} from '@/app/admin/home/actions';
import ProductImageUploader from './ProductImageUploader';
type ProductOption={id:string;name:string;image:string;active?:boolean};
export default function HomeEditor({initial,products}:{initial:HomeConfig;products:ProductOption[]}){
 const [config,setConfig]=useState(initial),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[pending,start]=useTransition();
 const update=(id:string,image:string,imageProductId:string|null=null)=>setConfig(c=>({...c,categories:c.categories.map(p=>p.id===id?{...p,image,imageProductId}:p)}));
 const save=()=>start(async()=>{try{const result=await updateHome(config);if(result.error){setMessage(result.error);return;}setConfig(result.config!);setMessage('Imágenes guardadas.');}catch{setMessage('No se pudo guardar. Tus cambios siguen aquí.');}});
 return <div className="space-y-6"><h1 className="text-3xl font-bold">Imágenes de categorías del home</h1><p>Cambia las fotografías de las tres categorías del home.</p><fieldset disabled={pending||busy} className="space-y-6">{config.categories.filter(c=>['facial','capilar','corporal'].includes(c.id)).map(item=><section key={item.id} className="space-y-4 rounded-2xl border bg-white p-5"><h2 className="text-xl font-bold">{item.title}</h2>{homePanelSchema.shape.image.safeParse(item.image).success&&<Image src={item.image} alt={item.alt} width={360} height={360} className="h-48 w-48 object-cover"/>}<ProductImageUploader category={item.id as 'facial'|'capilar'|'corporal'} remaining={1} onBusy={setBusy} onUploaded={image=>update(item.id,image)} successMessage="Imagen subida. Guarda para publicarla."/><label className="block">Imagen de un producto<select className="ml-3 rounded border p-2" value="" onChange={e=>{const p=products.find(p=>p.id===e.target.value);if(p)update(item.id,p.image,p.id);}}><option value="">Seleccionar producto</option>{products.filter(p=>p.active!==false).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label className="block">Ruta de imagen<input className="mt-1 block w-full rounded border p-3" value={item.image} onChange={e=>update(item.id,e.target.value)}/></label></section>)}</fieldset><button disabled={busy||pending} onClick={save} className="rounded-full bg-brand-700 px-6 py-3 text-white disabled:opacity-50">{pending?'Guardando…':'Guardar imágenes'}</button>{message&&<p role="status">{message}</p>}</div>;
}
