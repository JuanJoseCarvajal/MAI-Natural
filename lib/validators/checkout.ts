import { z } from "zod";

export const checkoutSchema = z.object({
  paymentMethod: z.enum(["bank_transfer_bancolombia", "wompi_sandbox", "wompi"]).default("bank_transfer_bancolombia"),
  customerName: z.string().trim().min(3, "Escribe tu nombre completo.").max(100),
  customerEmail: z.string().trim().email("Revisa tu correo electrónico.").max(200).transform(value => value.toLowerCase()),
  customerPhone: z.string().trim().regex(/^(?:\+?57\s?)?3\d{9}$/, "Escribe un celular colombiano de 10 dígitos."),
  city: z.string().trim().min(2, "Escribe tu ciudad.").max(100),
  address: z.string().trim().min(8, "Escribe una dirección completa.").max(240),
  items: z.array(z.object({ id: z.string().min(1).max(150), quantity: z.number().int().min(1).max(20) })).min(1).max(50)
    .refine(items => new Set(items.map(item => item.id)).size === items.length, "Hay productos repetidos en el carrito."),
  discountCode: z.string().trim().max(50).optional(),
});
