'use client';
import Image from 'next/image';
import {useState} from 'react';

type MediaImage={url:string;alt:string};
type Props={images?:MediaImage[];layout?:'stack'|'carousel'|'grid';label?:string};
export default function BlogMedia({images=[],layout='stack',label='Imágenes del artículo'}:Props){
 const [selected,setSelected]=useState(0);
 if(!images.length)return null;
 const index=Math.min(selected,images.length-1);
 const move=(direction:number)=>setSelected((index+direction+images.length)%images.length);
 const photo=(item:MediaImage,i:number)=><Image key={`${item.url}-${i}`} src={item.url} alt={item.alt} width={900} height={600} sizes={layout==='grid'?'(min-width:640px) 400px, 90vw':'(min-width:900px) 850px, 90vw'} className="h-auto w-full rounded-xl"/>;
 if(layout!=='carousel')return <div className={layout==='grid'?'not-prose my-6 grid grid-cols-1 items-start gap-4 sm:grid-cols-2':'not-prose my-6 space-y-4'}>{images.map(photo)}</div>;
 return <div role="region" aria-roledescription="carrusel" aria-label={label||'Imágenes del artículo'} className="not-prose my-6" onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move(event.key==='ArrowLeft'?-1:1);}}}>
  {photo(images[index],index)}
  <div className="mt-3 flex items-center justify-between gap-4">
   <button type="button" disabled={images.length<2} onClick={()=>move(-1)} className="min-h-11 rounded-lg border px-4" aria-label="Imagen anterior">Anterior</button>
   <span role="status" aria-live="polite">{index+1} / {images.length}</span>
   <button type="button" disabled={images.length<2} onClick={()=>move(1)} className="min-h-11 rounded-lg border px-4" aria-label="Imagen siguiente">Siguiente</button>
  </div>
 </div>;
}
