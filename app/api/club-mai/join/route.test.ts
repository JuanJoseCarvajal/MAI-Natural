import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("Círculo MAI cerrado", () => {
  it("rechaza el alta sin éxito, sin guardar datos ni cobrar", async () => {
    const response = await POST();
    expect(response.status).toBe(403);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toMatchObject({ ok: false, code: "ENROLLMENT_CLOSED" });
  });
});
