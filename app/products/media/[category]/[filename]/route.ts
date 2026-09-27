import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { imageCategories, imageDirectory } from '@/lib/product-images';
export const runtime = 'nodejs';
export async function GET(_request: Request, {params}: {params:Promise<{category:string;filename:string}>}) {
  const {category,filename} = await params;
  if (!imageCategories.includes(category as typeof imageCategories[number]) || !/^[a-zA-Z0-9_-]+\.(png|jpg|jpeg|webp)$/.test(filename)) return new Response(null,{status:404});
  try {
    const bytes = await readFile(path.join(imageDirectory(),category,filename));
    const extension = filename.split('.').pop();
    return new Response(new Uint8Array(bytes), {headers:{'Content-Type':extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' : `image/${extension}`, 'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'}});
  } catch { return new Response(null,{status:404}); }
}
