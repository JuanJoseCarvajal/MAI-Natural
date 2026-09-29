'use client';
import Image from 'next/image';
import {useEffect,useId,useRef,useState} from 'react';
type Item={id:string;file:File;preview:string;progress:number;status:'waiting'|'uploading'|'done'|'error';error?:string};
export default function ProductImageUploader({category,remaining,onUploaded,onBusy,successMessage='Subida. Pulsa Guardar producto para publicarla.'}:{category:string;remaining:number;successMessage?:string;onUploaded:(url:string)=>void;onBusy:(busy:boolean)=>void}) {
 const inputId=useId(),instructionsId=useId();
 const [items,setItems]=useState<Item[]>([]),[message,setMessage]=useState('');
 const busy=useRef(false),xhr=useRef<XMLHttpRequest|null>(null),urls=useRef<string[]>([]),mounted=useRef(true);
 useEffect(()=>{const previews=urls.current;mounted.current=true;return()=>{mounted.current=false;xhr.current?.abort();previews.forEach(url=>URL.revokeObjectURL(url));};},[]);
 const update=(id:string,patch:Partial<Item>)=>{if(mounted.current)setItems(all=>all.map(item=>item.id===id?{...item,...patch}:item));};
 async function run(batch:Item[]){
  if(busy.current)return;busy.current=true;onBusy(true);
  for(const item of batch){
   if(!mounted.current)break;
   update(item.id,{status:'uploading',progress:0,error:undefined});
   try {
    const url=await new Promise<string>((resolve,reject)=>{
     const request=new XMLHttpRequest();xhr.current=request;request.open('POST','/api/admin/product-images');request.timeout=90000;
     request.upload.onprogress=e=>{if(e.lengthComputable)update(item.id,{progress:Math.round(e.loaded/e.total*100)});};
     request.onerror=()=>reject(new Error('Se perdió la conexión. Puedes reintentar esta foto.'));
     request.ontimeout=()=>reject(new Error('La carga tardó demasiado. Reintenta con una conexión estable.'));
     request.onabort=()=>reject(new Error('Carga cancelada. Puedes reintentar.'));
     request.onload=()=>{
      let result:{url?:string;error?:string}={};try{result=JSON.parse(request.responseText);}catch{}
      if(request.status>=200&&request.status<300&&result.url){resolve(result.url);return;}
      reject(new Error(result.error || (request.status===413?'La foto supera el límite del servidor. Usa una imagen más pequeña.':request.status===401?'Tu sesión venció. Guarda los textos antes de volver a iniciar sesión.':'No se pudo subir la foto. Reintenta.')));
     };
     const form=new FormData();form.append('category',category);form.append('file',item.file);request.send(form);
    });
    if(mounted.current){onUploaded(url);update(item.id,{status:'done',progress:100});}
   }catch(error){update(item.id,{status:'error',error:error instanceof Error?error.message:'Error al subir.'});}
  }
  busy.current=false;if(mounted.current)onBusy(false);
 }
 function select(files:File[]){
  if(busy.current)return;
  if(files.length>remaining){setMessage(`Puedes agregar ${remaining} fotos más. La galería admite 20.`);return;}
  const invalid=files.find(file=>!['image/png','image/jpeg','image/webp'].includes(file.type)||!file.size||file.size>5*1024*1024);
  if(invalid){setMessage(`${invalid.name}: selecciona una foto PNG, JPEG o WebP de hasta 5 MB.`);return;}
  setMessage('');const batch=files.map(file=>{const preview=URL.createObjectURL(file);urls.current.push(preview);return {id:crypto.randomUUID(),file,preview,progress:0,status:'waiting' as const};});
  setItems(all=>[...all,...batch]);void run(batch);
 }
 return <div className="my-4 space-y-3 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50 p-4" onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();select(Array.from(event.dataTransfer.files));}}>
  <label htmlFor={inputId} className="block font-semibold">Agregar fotos desde este computador</label>
  <p id={instructionsId} className="text-sm">Selecciona o arrastra tus fotos aquí. PNG, JPEG o WebP, máximo 5 MB por foto. {remaining} espacios disponibles.</p>
  <input id={inputId} type="file" multiple accept="image/png,image/jpeg,image/webp" disabled={busy.current||remaining===0} aria-describedby={instructionsId} onChange={event=>{const files=Array.from(event.currentTarget.files??[]);event.currentTarget.value='';select(files);}}/>
  {message&&<p role="alert">{message}</p>}
  <ul className="space-y-3" aria-label="Estado de las fotos seleccionadas">{items.map(item=><li key={item.id} className="flex items-start gap-3 rounded-lg bg-white p-3">
   <Image src={item.preview} alt={`Vista previa: ${item.file.name}`} width={64} height={80} unoptimized className="rounded object-cover"/>
   <div className="min-w-0 flex-1"><p className="break-all text-sm font-semibold">{item.file.name}</p>
    <p role={item.status==='error'?'alert':'status'} className="text-sm">{item.status==='done'?successMessage:item.status==='error'?item.error:item.status==='waiting'?'En espera':item.progress===100?'Procesando en el servidor…':`Subiendo: ${item.progress}%`}</p>
    {item.status==='uploading'&&<progress max={100} value={item.progress} aria-label={`Progreso de ${item.file.name}`} className="w-full"/>}
    {item.status==='error'&&<button type="button" disabled={busy.current||remaining===0} onClick={()=>void run([item])}>Reintentar {item.file.name}</button>}
   </div>
  </li>)}</ul>
 </div>;
}
