import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Product } from "./products";
const fixture = vi.hoisted(() => ({ json: "[]" }));
vi.mock("server-only", () => ({}));
vi.mock("fs", () => ({ promises: {
  readFile: vi.fn(async () => fixture.json),
  writeFile: vi.fn(async (_path: string, value: string) => { fixture.json = value; }),
} }));
import { createProduct, updateProduct, getProductById } from "./products.server";
const original: Product = {
  id: "fixture", name: "Producto", image: "/products/one.png", images: ["/products/one.png"],
  category: "facial", price: "$35.000", amountInCents: 3500000, description: "Anterior",
  benefits: ["Anterior"], rating: 0, reviewsCount: 0, active: true,
};
beforeEach(() => { fixture.json = JSON.stringify([original]); });
describe("product administration persistence", () => {
  it("persists a second photo, description, variants and cleared benefits without resetting unspecified stock", async () => {
    const images = ["/products/two.png", "/products/one.png"];
    await updateProduct(original.id, { ...original, description: "Nueva", image: images[0], images,
      benefits: [], rating: 4.2, reviewsCount: 3, variants: [{ id: "menta", name: "Menta", image: images[1] }] });
    expect(await getProductById(original.id)).toMatchObject({
      description: "Nueva", image: images[0], images, benefits: [], rating: 4.2, reviewsCount: 3,
      variants: [{ id: "menta", name: "Menta", image: images[1] }],
    });
    expect((await getProductById(original.id))?.stock).toBeUndefined();
  });
  it("renames identifiers without duplicate products and rejects collisions", async () => {
    await createProduct({ ...original, id: "other" });
    await expect(updateProduct("fixture", { ...original, id: "other" })).rejects.toThrow("Ya existe");
    await updateProduct("fixture", { ...original, id: "renamed", stock: 0 });
    expect(await getProductById("fixture")).toBeUndefined();
    expect(await getProductById("renamed")).toMatchObject({ id: "renamed", stock: 0 });
  });
});
