export const bancolombiaConfig = {
  bankName: process.env.NEXT_PUBLIC_BANCOLOMBIA_BANK_NAME || "Bancolombia",
  accountType: process.env.NEXT_PUBLIC_BANCOLOMBIA_ACCOUNT_TYPE || "Cuenta de ahorros",
  accountNumber: process.env.NEXT_PUBLIC_BANCOLOMBIA_ACCOUNT_NUMBER || "",
  accountHolder: process.env.NEXT_PUBLIC_BANCOLOMBIA_ACCOUNT_HOLDER || "",
  qrUrl: process.env.NEXT_PUBLIC_BANCOLOMBIA_QR_URL || "",
  proofEmail: process.env.ORDER_PROOF_EMAIL || "hola@mainatural.com",
  proofWhatsapp: process.env.NEXT_PUBLIC_ORDER_PROOF_WHATSAPP || "573246847727",
};

export function formatWhatsappLink(number: string, message: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

export function getOrderPaymentSteps() {
  return [
    "Paso 1: Crear orden",
    "Paso 2: Realizar consignacion",
    "Paso 3: Enviar comprobante",
    "Paso 4: Confirmacion",
  ];
}
