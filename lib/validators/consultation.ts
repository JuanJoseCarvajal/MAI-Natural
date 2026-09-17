import { z } from "zod";
import { appointmentInputSchema } from "./appointment";

export const consultationInputSchema = appointmentInputSchema.pick({ name: true, email: true, phone: true, date: true, time: true }).extend({
  topic: z.enum(["piel", "cabello", "cuidado", "explorar"]),
  intention: z.enum(["orientacion", "escucha", "proceso"]),
  notes: z.string().trim().max(600, "Puedes compartir hasta 600 caracteres").default(""),
  continuityInterest: z.boolean().default(false),
  consent: z.literal(true, { errorMap: () => ({ message: "Autoriza el uso de tus datos para gestionar este encuentro" }) }),
});

export const consultationContactSchema = consultationInputSchema.pick({ name: true, email: true, phone: true });
export type ConsultationInput = z.infer<typeof consultationInputSchema>;
