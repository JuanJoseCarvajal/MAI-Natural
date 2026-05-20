'use server';

import { signIn } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendTransactionalEmail } from '@/lib/email';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '@/lib/validators/user';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';

const RESET_TOKEN_TTL_MINUTES = 60;

function firstValidationError(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
  const fieldErrors = error.flatten().fieldErrors;
  return Object.values(fieldErrors).flat().find(Boolean) ?? 'Datos inválidos';
}

function hashResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function getAppUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  return configuredUrl?.replace(/\/$/, '') || 'http://localhost:3000';
}

export async function loginAction(email: string, password: string) {
  try {
    const parsed = loginSchema.safeParse({ email, password });

    if (!parsed.success) {
      return { error: firstValidationError(parsed.error) };
    }

    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Correo o contraseña incorrectos' };
  }
}

export async function registerAction(
  name: string,
  email: string,
  password: string
) {
  try {
    const parsed = registerSchema.safeParse({ name, email, password });

    if (!parsed.success) {
      return { error: firstValidationError(parsed.error) };
    }

    const { name: cleanName, email: cleanEmail, password: cleanPassword } = parsed.data;

    const existingUser = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      if (existingUser.password) {
        return { error: 'El correo ya está registrado' };
      }

      const hashedPassword = await bcrypt.hash(cleanPassword, 12);

      await db.user.update({
        where: { id: existingUser.id },
        data: {
          name: cleanName,
          password: hashedPassword,
        },
      });

      await signIn('credentials', {
        email: cleanEmail,
        password: cleanPassword,
        redirect: false,
      });

      return { success: true };
    }

    const hashedPassword = await bcrypt.hash(cleanPassword, 12);

    await db.user.create({
      data: {
        email: cleanEmail,
        name: cleanName,
        password: hashedPassword,
      },
    });

    await signIn('credentials', {
      email: cleanEmail,
      password: cleanPassword,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    console.error('Register error:', error);
    return { error: 'No pudimos crear la cuenta. Inténtalo de nuevo.' };
  }
}

export async function requestPasswordResetAction(email: string) {
  try {
    const parsed = forgotPasswordSchema.safeParse({ email });

    if (!parsed.success) {
      return { error: firstValidationError(parsed.error) };
    }

    const user = await db.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user) {
      return { success: true };
    }

    await db.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token = randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(token);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    await db.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    const resetUrl = `${getAppUrl()}/reset-password?token=${token}`;
    const emailResult = await sendTransactionalEmail({
      to: user.email,
      subject: 'Recupera tu contraseña en MAI Natural',
      html: `
        <p>Hola${user.name ? ` ${user.name}` : ''},</p>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p><a href="${resetUrl}">Crear una nueva contraseña</a></p>
        <p>Este enlace vence en ${RESET_TOKEN_TTL_MINUTES} minutos. Si no solicitaste este cambio, puedes ignorar este correo.</p>
      `,
      text: [
        `Hola${user.name ? ` ${user.name}` : ''},`,
        'Recibimos una solicitud para restablecer tu contraseña.',
        `Crea una nueva contraseña aquí: ${resetUrl}`,
        `Este enlace vence en ${RESET_TOKEN_TTL_MINUTES} minutos. Si no solicitaste este cambio, puedes ignorar este correo.`,
      ].join('\n\n'),
    });

    if (!emailResult.sent) {
      console.warn('Enlace de recuperación generado sin envío de correo:', resetUrl);
    }

    return { success: true };
  } catch (error) {
    console.error('Password reset request error:', error);
    return { error: 'No pudimos enviar el correo de recuperación. Inténtalo de nuevo.' };
  }
}

export async function resetPasswordAction(token: string, password: string) {
  try {
    const parsed = resetPasswordSchema.safeParse({ token, password });

    if (!parsed.success) {
      return { error: firstValidationError(parsed.error) };
    }

    const tokenHash = hashResetToken(parsed.data.token);
    const resetToken = await db.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt.getTime() < Date.now()
    ) {
      return { error: 'El enlace de recuperación venció o ya fue usado' };
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

    await db.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    await db.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    await db.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId },
    });

    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { error: 'No pudimos actualizar la contraseña. Inténtalo de nuevo.' };
  }
}
