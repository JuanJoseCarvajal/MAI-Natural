import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { requireAdmin } from '@/lib/admin-access';
import { isTrustedUploadOrigin } from '@/lib/request-origin';
import { persistentDatabaseEnabled } from '@/lib/postgres-store';
import { storeProductImage } from '@/lib/product-image-store';
import { imageCategories, imageDirectory, imageExtension, maxImageBytes } from '@/lib/product-images';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!isTrustedUploadOrigin(request.headers.get('origin'), request.url)) return NextResponse.json({error:'Origen no permitido. Abre el administrador desde https://mainatural.com e intenta de nuevo.'}, {status:403});
  try { await requireAdmin(); } catch { return NextResponse.json({error:'Inicia sesión como administrador.'}, {status:401}); }
  if (Number(request.headers.get('content-length')) > maxImageBytes + 65536) return NextResponse.json({error:'La imagen debe pesar máximo 5 MB.'}, {status:413});
  // Bound the stream even when Content-Length is absent or forged.
  const reader = request.body?.getReader();
  if (!reader) return NextResponse.json({error:'Archivo requerido.'}, {status:400});
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) { const {done,value} = await reader.read(); if (done) break; size += value.length; if (size > maxImageBytes + 65536) { await reader.cancel(); return NextResponse.json({error:'La imagen debe pesar máximo 5 MB.'}, {status:413}); } chunks.push(value); }
    const form = await new Response(Buffer.concat(chunks), {headers:{'Content-Type':request.headers.get('content-type') || ''}}).formData();
    const category = form.get('category'), file = form.get('file');
    if (!imageCategories.includes(category as typeof imageCategories[number]) || !(file instanceof File) || !file.size || file.size > maxImageBytes) return NextResponse.json({error:'Selecciona una categoría y una imagen de hasta 5 MB.'}, {status:400});
    const bytes = Buffer.from(await file.arrayBuffer()), extension = imageExtension(bytes);
    if (!extension) return NextResponse.json({error:'Solo se admiten imágenes PNG, JPEG o WebP.'}, {status:400});
    const filename = `${randomUUID()}.${extension}`;
    if (persistentDatabaseEnabled()) {
      await storeProductImage(String(category),filename,bytes);
    } else {
      if (process.env.NODE_ENV === 'production' && !process.env.PRODUCT_IMAGES_DIR) return NextResponse.json({error:'El almacenamiento persistente no está disponible. Contacta al administrador del sitio.'}, {status:503});
      const folder = path.join(imageDirectory(), String(category));
      await mkdir(folder, {recursive:true});
      await writeFile(path.join(folder, filename), bytes, {flag:'wx'});
    }
    return NextResponse.json({url:`/products/media/${category}/${filename}`}, {status:201});
  } catch { return NextResponse.json({error:'No se pudo guardar la imagen en el almacenamiento. Reintenta; si persiste, revisa la conexión y los permisos de la base de datos.'}, {status:500}); }
}
