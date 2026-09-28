export type ProductCategory =
  | "facial"
  | "capilar"
  | "corporal"
  | "kits";

export type Product = {
  images?: string[];
  variants?: { id: string; name: string; image: string }[];
  id: string;
  image: string;
  name: string;
  price: string;
  amountInCents: number;
  description: string;
  category: ProductCategory;
  badge?: string;
  benefits: string[];
  rating: number;
  reviewsCount: number;
  sku?: string;
  active?: boolean;
};

/** Resolve only canonical, purchasable catalog entries, never client prices. */
export function resolveProduct(products: Product[], id: string): Product | undefined {
  const [baseId, variantId, extra] = id.split("~");
  if (extra !== undefined) return undefined;
  const product = products.find(item => item.id === baseId);
  if (!product || product.active === false || !Number.isSafeInteger(product.amountInCents) || product.amountInCents <= 0) return undefined;
  if (!product.variants?.length) return variantId === undefined ? product : undefined;
  const variant = product.variants.find(item => item.id === variantId);
  return variant ? { ...product, id, name: `${product.name} · ${variant.name}`, image: variant.image } : undefined;
}

export const categoryLabels: Record<ProductCategory, string> = {
  facial: "Formulaciones Botánicas de Autor · Facial",
  capilar: "Formulaciones Botánicas de Autor · Capilar",
  corporal: "Formulaciones Botánicas de Autor · Corporal",
  kits: "Kits y Rutinas",
};

export const categoryImages: Record<ProductCategory, string> = {
  facial:
    "/products/media/facial/fa-lam-120-1-1.png",
  capilar:
    "/products/media/capilar/mnk-001-1.png",
  corporal:
    "/products/media/corporal/crema-corporal-1.png",
  kits: "/products/media/facial/ritual-mineral-exfoliante-1.png",
};
