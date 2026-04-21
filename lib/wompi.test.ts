import { describe, it, expect } from "vitest";
import {
  buildWompiIntegritySignature,
  createWompiReference,
  buildWompiCheckoutUrl,
} from "./wompi";

describe("buildWompiIntegritySignature", () => {
  it("genera un hash SHA-256 hex de 64 caracteres", () => {
    const sig = buildWompiIntegritySignature("REF-1", 1000, "COP", "secret");
    expect(sig).toMatch(/^[a-f0-9]{64}$/);
  });

  it("es determinística con los mismos inputs", () => {
    const a = buildWompiIntegritySignature("REF-1", 1000, "COP", "secret");
    const b = buildWompiIntegritySignature("REF-1", 1000, "COP", "secret");
    expect(a).toBe(b);
  });

  it("cambia el hash si cambia cualquier input", () => {
    const base = buildWompiIntegritySignature("REF-1", 1000, "COP", "secret");
    expect(buildWompiIntegritySignature("REF-2", 1000, "COP", "secret")).not.toBe(base);
    expect(buildWompiIntegritySignature("REF-1", 2000, "COP", "secret")).not.toBe(base);
    expect(buildWompiIntegritySignature("REF-1", 1000, "USD", "secret")).not.toBe(base);
    expect(buildWompiIntegritySignature("REF-1", 1000, "COP", "other")).not.toBe(base);
  });

  // Fixture congelado: si alguien cambia el orden de concatenación
  // (reference + amount + currency + secret) o el algoritmo, esto falla.
  it("respeta el orden de concatenación esperado por Wompi", () => {
    const sig = buildWompiIntegritySignature("REF-1", 50000, "COP", "test_secret");
    expect(sig).toBe("d5eb51a0028475d7f79acbb10cccf3d9a5059564d667512cc7b7da7641ad25ad");
  });
});

describe("createWompiReference", () => {
  it("usa el prefijo 'mai' por defecto", () => {
    expect(createWompiReference()).toMatch(/^mai-[0-9a-f-]+$/);
  });

  it("acepta un prefijo custom", () => {
    expect(createWompiReference("cita")).toMatch(/^cita-[0-9a-f-]+$/);
  });

  it("genera referencias únicas en llamadas consecutivas", () => {
    const a = createWompiReference();
    const b = createWompiReference();
    expect(a).not.toBe(b);
  });
});

describe("buildWompiCheckoutUrl", () => {
  const baseParams = {
    publicKey: "pub_test_123",
    currency: "COP",
    amountInCents: 50000,
    reference: "REF-1",
    redirectUrl: "https://example.com/return",
    signature: "abc123",
  };

  it("apunta al checkout oficial de Wompi", () => {
    const url = buildWompiCheckoutUrl(baseParams);
    expect(url.startsWith("https://checkout.wompi.co/p/?")).toBe(true);
  });

  it("incluye todos los params con los nombres esperados por Wompi", () => {
    const url = buildWompiCheckoutUrl(baseParams);
    const query = new URL(url).searchParams;
    expect(query.get("public-key")).toBe("pub_test_123");
    expect(query.get("currency")).toBe("COP");
    expect(query.get("amount-in-cents")).toBe("50000");
    expect(query.get("reference")).toBe("REF-1");
    expect(query.get("redirect-url")).toBe("https://example.com/return");
    expect(query.get("signature:integrity")).toBe("abc123");
  });
});
