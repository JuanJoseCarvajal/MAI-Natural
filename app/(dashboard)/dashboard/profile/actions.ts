'use server';

import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

export async function updateProfileAction(
  email: string,
  name: string,
  phone: string
) {
  try {
    if (!email || !name) {
      return { error: 'Email y nombre son requeridos' };
    }

    const updated = await db.user.update({
      where: { email },
      data: { name, phone, updatedAt: new Date() },
    });

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

export async function getUserProfile(email: string) {
  try {
    const user = await db.user.findUnique({ where: { email } });
    return { user };
  } catch (error) {
    return { error: 'Error al obtener usuario' };
  }
}
