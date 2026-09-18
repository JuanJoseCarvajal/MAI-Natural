import { describe, it, expect } from "vitest";
import { db } from "./db";
import { serializeJsonLd } from "./seo";
import { POST as calendly } from "@/app/api/webhooks/calendly/route";

describe("security defaults", () => {
  it("does not provision a public demo administrator", async () => {
    expect(await db.user.findUnique({ where: { email: "hola@mainatural.com" } })).toBeNull();
  });
  it("rejects unverified calendar events", async () => {
    expect((await calendly()).status).toBe(503);
    expect(await db.appointment.findMany()).toEqual([]);
  });
  it("prevents structured data from closing its script element", () => {
    expect(serializeJsonLd({ name: "</script><script>alert(1)</script>" })).not.toContain("<");
  });
});
