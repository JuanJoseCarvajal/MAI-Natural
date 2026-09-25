import { afterEach, describe, expect, it, vi } from "vitest";
import { openWompiCheckout } from "./wompi-client";
afterEach(() => vi.unstubAllGlobals());
describe("Wompi redirect", () => {
 it("sends the existing order to checkout and redirects to official Wompi", async () => {
  const assign=vi.fn(); const fetch=vi.fn().mockResolvedValue({ok:true,json:async()=>({checkoutUrl:"https://checkout.wompi.co/p/?reference=test"})});
  vi.stubGlobal("fetch",fetch); vi.stubGlobal("window",{location:{assign}});
  await openWompiCheckout({orderId:"existing",quoteVersion:"quote"});
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({orderId:"existing",quoteVersion:"quote"});
  expect(fetch.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  expect(assign).toHaveBeenCalledWith("https://checkout.wompi.co/p/?reference=test");
 });
 it.each(["https://evil.test/p/","https://checkout.wompi.co.evil.test/p/","https://user@checkout.wompi.co/p/","http://checkout.wompi.co/p/","https://checkout.wompi.co/other"])("rejects %s", async checkoutUrl => {
  vi.stubGlobal("fetch",vi.fn().mockResolvedValue({ok:true,json:async()=>({checkoutUrl})}));
  await expect(openWompiCheckout({orderId:"existing"})).rejects.toThrow("Destino");
 });
 it("preserves request on timeout and server errors", async () => {
  vi.stubGlobal("fetch",vi.fn().mockRejectedValue(new DOMException("Timeout","TimeoutError")));
  await expect(openWompiCheckout({appointmentId:"existing"})).rejects.toThrow("solicitud se conserva");
  vi.stubGlobal("fetch",vi.fn().mockResolvedValue({ok:false,json:async()=>({error:"Pago en revisión"})}));
  await expect(openWompiCheckout({orderId:"existing"})).rejects.toThrow("Pago en revisión");
 });
});
