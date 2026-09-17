import { z } from "zod";

export const appointmentInputSchema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre completo").max(100),
  email: z.string().trim().toLowerCase().email("Correo inválido").max(254),
  phone: z.string().trim().min(7, "Teléfono inválido").max(25).regex(/^\+?[\d\s()-]+$/, "Revisa el número de teléfono"),
  date: z
    .string()
    .regex(
      /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
      "Fecha inválida (YYYY-MM-DD)"
    ).refine(value => {
      const parsed = new Date(`${value}T12:00:00Z`);
      return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
    }, "La fecha no existe en el calendario"),
  time: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/,
      "Hora inválida (HH:MM)"
    ),
  service: z.string().trim().max(120),
  notes: z.string().trim().max(1500),
});

export type AppointmentInput = z.infer<typeof appointmentInputSchema>;
