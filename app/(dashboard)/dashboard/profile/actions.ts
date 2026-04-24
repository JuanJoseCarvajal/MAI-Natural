'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

type SessionUser = { id?: string; email?: string | null };

export async function updateProfileAction(name: string, phone: string) {
  try {
    const session = await auth();
    const sessionUser = session?.user as SessionUser | undefined;

    if (!session?.user || (!sessionUser?.id && !sessionUser?.email)) {
      return { error: 'Debes iniciar sesión para actualizar tu perfil' };
    }

    if (!name?.trim()) {
      return { error: 'El nombre es requerido' };
    }

    const updated =
      (sessionUser.id
        ? await db.user.update({
            where: { id: sessionUser.id },
            data: { name: name.trim(), phone: phone.trim() || null, updatedAt: new Date() },
          })
        : null) ??
      (sessionUser.email
        ? await db.user.update({
            where: { email: sessionUser.email },
            data: { name: name.trim(), phone: phone.trim() || null, updatedAt: new Date() },
          })
        : null);

    if (!updated) {
      return { error: 'No encontramos tu perfil para actualizarlo' };
    }

    return {
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: updated,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Error al actualizar perfil',
    };
  }
}

export async function getUserProfile() {
  try {
    const session = await auth();
    const sessionUser = session?.user as SessionUser | undefined;

    if (!session?.user || (!sessionUser?.id && !sessionUser?.email)) {
      return { error: 'No autorizado' };
    }

    const user =
      (sessionUser.id
        ? await db.user.findUnique({ where: { id: sessionUser.id } })
        : null) ??
      (sessionUser.email ? await db.user.findUnique({ where: { email: sessionUser.email } }) : null);

    return { user };
  } catch (error) {
    return { error: 'Error al obtener usuario' };
  }
}
