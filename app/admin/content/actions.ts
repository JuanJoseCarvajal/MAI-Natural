'use server';
import { requireAdmin } from '@/lib/admin-access';
import { writeSiteContent } from '@/lib/site-content';
import { revalidatePath } from 'next/cache';
export async function saveSiteContent(changes: unknown) {
  try {
    const actor = await requireAdmin();
    await writeSiteContent(changes, actor.id);
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error && /Otra sesión|Texto inválido|Cantidad/.test(error.message) ? error.message : 'No se pudo guardar. Verifica tu sesión administrativa y la conexión.' };
  }
}
