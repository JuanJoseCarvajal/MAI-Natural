import { z } from "zod";

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Ingresa tu nombre completo")
  .max(80, "El nombre es demasiado largo");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Ingresa un correo válido")
  .max(120, "El correo es demasiado largo");

export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener mínimo 8 caracteres")
  .max(72, "La contraseña es demasiado larga")
  .regex(/[A-Za-z]/, "La contraseña debe incluir al menos una letra")
  .regex(/[0-9]/, "La contraseña debe incluir al menos un número");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(32, "El enlace de recuperación no es válido"),
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
