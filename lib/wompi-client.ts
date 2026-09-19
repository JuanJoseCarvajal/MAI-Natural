type PaymentRequest = { appointmentId: string } | { orderId: string; quoteVersion?: string };

export async function openWompiCheckout(payment: PaymentRequest) {
  const endpoint = "appointmentId" in payment ? "/api/payments/wompi/appointments/checkout" : "/api/payments/wompi/checkout";
  const response = await fetch(endpoint, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payment),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "No pudimos abrir Wompi. Tu solicitud se conserva.");
  const url = new URL(data.checkoutUrl);
  if (url.origin !== "https://checkout.wompi.co" || url.pathname !== "/p/" || url.username || url.password) throw new Error("Destino de pago inválido.");
  window.location.assign(url.href);
}
