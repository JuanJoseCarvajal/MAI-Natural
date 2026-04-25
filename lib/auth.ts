import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from './db';
import authConfig from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'hola@mainatural.com' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        // Validar que tenemos email y password
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña requeridos');
        }

        try {
          // Buscar usuario en la base de datos
          const user = await db.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user) {
            console.error(`Usuario no encontrado: ${credentials.email}`);
            throw new Error('Email o contraseña incorrectos');
          }

          if (!user.password) {
            console.error(`Usuario sin contraseña: ${credentials.email}`);
            throw new Error('Email o contraseña incorrectos');
          }

          // Verificar contraseña con bcrypt
          let passwordMatch = false;
          try {
            passwordMatch = await bcrypt.compare(
              credentials.password as string,
              user.password
            );
          } catch (bcryptError) {
            console.error('Error comparing password with bcrypt:', bcryptError);
            passwordMatch = false;
          }

          if (!passwordMatch) {
            console.error(`Contraseña incorrecta para: ${credentials.email}`);
            throw new Error('Email o contraseña incorrectos');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          // Si es un error nuestro, lo lanzamos
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('Error durante la autenticación');
        }
      },
    }),
  ],
});
