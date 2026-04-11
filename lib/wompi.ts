import { createHash, randomUUID } from "crypto";

const WOMPI_CHECKOUT_BASE_URL = "https://checkout.wompi.co/p/";

export function buildWompiIntegritySignature(
  reference: string,
  amountInCents: number,
  currency: string,
  integritySecret: string
) {
  const raw = `${reference}${amountInCents}${currency}${integritySecret}`;
  return createHash("sha256").update(raw).digest("hex");
}

export function createWompiReference(prefix = "mai") {
  return `${prefix}-${randomUUID()}`;
}

export function buildWompiCheckoutUrl(params: {
  publicKey: string;
  currency: string;
  amountInCents: number;
  reference: string;
  redirectUrl: string;
  signature: string;
}) {
  const searchParams = new URLSearchParams({
    "public-key": params.publicKey,
    currency: params.currency,
    "amount-in-cents": String(params.amountInCents),
    reference: params.reference,
    "redirect-url": params.redirectUrl,
    "signature:integrity": params.signature,
  });

  return `${WOMPI_CHECKOUT_BASE_URL}?${searchParams.toString()}`;
}
