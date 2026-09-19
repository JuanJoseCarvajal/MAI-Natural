export const supportWhatsapp = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "573246847727";
export function formatWhatsappLink(number: string, message: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
