import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { categoryLabels, type Product } from "@/lib/products";

const catalogPath = path.join(process.cwd(), "lib", "products.catalog.json");

export type AdminProductInput = {
  id?: string;
  image: string;
  images?: string[];
  variants?: Product["variants"];
  name: string;
  price: string;
  amountInCents: number;
  description: string;
  category: keyof typeof categoryLabels;
  badge?: string;
  benefits?: string[];
  rating?: number;
  reviewsCount?: number;
  sku?: string;
  stock?: number;
  active?: boolean;
};

async function readCatalogFile() {
  const raw = await fs.readFile(catalogPath, "utf8");
  return JSON.parse(raw) as Product[];
}

async function writeCatalogFile(products: Product[]) {
  await fs.writeFile(catalogPath, `${JSON.stringify(products, null, 2)}\n`, "utf8");
}

export async function getAllProducts() {
  const products = await readCatalogFile();
  return products.filter((product) => product.active !== false);
}

export async function getAllProductsForAdmin() {
  return readCatalogFile();
}

export async function getProductById(id: string) {
  const products = await readCatalogFile();
  return products.find((product) => product.id === id && product.active !== false);
}

export async function createProduct(input: AdminProductInput) {
  const products = await readCatalogFile();
  const id =
    input.id?.trim() ||
    input.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  if (products.some((product) => product.id === id)) {
    throw new Error("Ya existe un producto con ese identificador.");
  }

  const nextProduct: Product = {
    id,
    image: input.image.trim(),
    images: Array.from(new Set([input.image.trim(), ...(input.images ?? [])])),
    variants: input.variants ?? [],
    name: input.name.trim(),
    price: input.price.trim(),
    amountInCents: input.amountInCents,
    description: input.description.trim(),
    category: input.category,
    badge: input.badge?.trim() || undefined,
    benefits: input.benefits?.map((benefit) => benefit.trim()).filter(Boolean) ?? [],
    rating: input.rating ?? 0,
    reviewsCount: input.reviewsCount ?? 0,
    sku: input.sku?.trim() || undefined,
    stock: input.stock,
    active: input.active ?? true,
  };

  const nextProducts = [nextProduct, ...products];
  await writeCatalogFile(nextProducts);
  return nextProduct;
}

export async function updateProduct(id: string, updates: AdminProductInput) {
  const products = await readCatalogFile();
  const current = products.find((product) => product.id === id);
  if (!current) {
    throw new Error("Producto no encontrado.");
  }
  const nextId = updates.id?.trim() || id;
  if (nextId !== id && products.some(product => product.id === nextId)) throw new Error("Ya existe un producto con ese identificador.");

  const nextProducts = products.map((product) =>
    product.id === id
      ? {
          ...product,
          id: nextId,
          image: updates.image.trim(),
          images: Array.from(new Set([updates.image.trim(), ...(updates.images ?? product.images ?? [])])),
          variants: updates.variants ?? product.variants,
          name: updates.name.trim(),
          price: updates.price.trim(),
          amountInCents: updates.amountInCents,
          description: updates.description.trim(),
          category: updates.category,
          badge: updates.badge?.trim() || undefined,
          benefits: updates.benefits?.map((benefit) => benefit.trim()).filter(Boolean) ?? product.benefits,
          rating: updates.rating ?? product.rating,
          reviewsCount: updates.reviewsCount ?? product.reviewsCount,
          sku: updates.sku?.trim() || undefined,
          stock: updates.stock,
          active: updates.active ?? true,
        }
      : product
  );

  await writeCatalogFile(nextProducts);
  return nextProducts.find((product) => product.id === nextId)!;
}

export async function deleteProduct(id: string) {
  const products = await readCatalogFile();
  const nextProducts = products.filter((product) => product.id !== id);
  await writeCatalogFile(nextProducts);
}
