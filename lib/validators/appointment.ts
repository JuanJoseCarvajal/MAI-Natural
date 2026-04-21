import { z } from "zod";

export const appointmentInputSchema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre completo"),
  email: z.string().trim().toLowerCase().email("Correo inválido"),
  phone: z.string().trim().min(7, "Teléfono inválido"),
  date: z
    .string()
    .regex(
      /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
      "Fecha inválida (YYYY-MM-DD)"
    ),
  time: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/,
      "Hora inválida (HH:MM)"
    ),
  service: z.string().trim(),
  notes: z.string().trim(),
});

export type AppointmentInput = z.infer<typeof appointmentInputSchema>;
