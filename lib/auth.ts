import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from './db';
import authConfig from './auth.config';
import { loginSchema } from './validators/user';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'hola@mainatural.com' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse({
          email: credentials?.email,
          password: credentials?.password,
        });

        if (!parsed.success) {
          throw new Error('Email y contraseña requeridos');
        }

        try {
          const user = await db.user.findUnique({
            where: { email: parsed.data.email },
          });

          if (!user) {
            throw new Error('Email o contraseña incorrectos');
          }

          if (!user.password) {
            throw new Error('Email o contraseña incorrectos');
          }

          let passwordMatch = false;
          try {
            passwordMatch = await bcrypt.compare(
              parsed.data.password,
              user.password
            );
          } catch (bcryptError) {
            console.error('Error comparing password with bcrypt:', bcryptError);
            passwordMatch = false;
          }

          if (!passwordMatch) {
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
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('Error durante la autenticación');
        }
      },
    }),
  ],
});
