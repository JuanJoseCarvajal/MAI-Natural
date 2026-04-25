'use server';

import { signIn } from '@/lib/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function loginAction(email: string, password: string) {
  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Error durante el inicio de sesión' 
    };
  }
}

export async function registerAction(
  name: string,
  email: string,
  password: string
) {
  try {
    // Verificar si el usuario ya existe
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.password) {
        return { error: 'El correo ya está registrado' };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await db.user.update({
        where: { id: existingUser.id },
        data: {
          name,
          password: hashedPassword,
        },
      });

      await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      return { success: true };
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario
    await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    // Iniciar sesión automáticamente
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Error al registrarse' 
    };
  }
}
