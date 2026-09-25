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
  stock?: number;
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
    "https://mainatural.com/wp-content/uploads/elementor/thumbs/Categoria-Facial-2-r67l4wjc01w2wakl51c9itj5wiaessnoowkbun5kf4.png",
  capilar:
    "https://mainatural.com/wp-content/uploads/elementor/thumbs/Categoria-Capilar-r65x99bym2z55xrkl8xfasfi8z6q9qwcbgd2m3cm1s.png",
  corporal:
    "https://mainatural.com/wp-content/uploads/elementor/thumbs/Categoria-Facial-2-r67l4wjc01w2wakl51c9itj5wiaessnoowkbun5kf4.png",
  kits: "https://mainatural.com/wp-content/uploads/2025/06/foto8-768x432.jpg",
};
