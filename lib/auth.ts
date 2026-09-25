import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { createHash } from 'node:crypto';
import { ADMIN_SESSION_SECONDS, isAdministrativeAccount } from './admin-policy';
import { consumeLoginAttempt } from './login-security';
import { db } from './db';
import authConfig from './auth.config';
import { loginSchema } from './validators/user';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.authenticatedAt = Math.floor(Date.now() / 1000);
      }
      if (!token.sub) return null;
      try {
        const current = await db.user.findUnique({ where: { id: token.sub } });
        if (!current?.password) return null;
        const version = createHash('sha256').update(current.password).digest('hex');
        if (user) token.passwordVersion = version;
        if (token.passwordVersion !== version) return null;
        if (current.role === 'admin' && (!isAdministrativeAccount(current) || Date.now() / 1000 - Number(token.authenticatedAt || 0) >= ADMIN_SESSION_SECONDS)) return null;
        token.role = current.role;
        token.email = current.email;
        return token;
      } catch { return null; }
    },
  },
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
          await consumeLoginAttempt(parsed.data.email);
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

          if (user.role === 'admin' && !isAdministrativeAccount(user)) return null;
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
