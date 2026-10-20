'use server';
import { requireAdmin } from '@/lib/admin-access';
import { readSiteContent, siteTextCatalog, writeSiteContent } from '@/lib/site-content';
import { revalidatePath } from 'next/cache';
export async function saveSiteContent(changes: unknown) {
  try {
    const actor = await requireAdmin();
    const saved = await writeSiteContent(changes, actor.id);
    revalidatePath('/', 'layout');
    return { success: true, saved };
  } catch (error) {
    return { error: error instanceof Error && /Otra sesión|Texto inválido|Cantidad/.test(error.message) ? error.message : 'No se pudo guardar. Verifica tu sesión administrativa y la conexión.' };
  }
}

export async function loadSiteContent(){
 await requireAdmin();
 const saved=new Map((await readSiteContent()).map(row=>[row.key,row]));
 return Object.entries(siteTextCatalog).map(([key,field])=>({key,...field,value:saved.get(key)?.value??field.text,revision:saved.get(key)?.revision??0}));
}
