export type ProductCategory =
  | "facial"
  | "capilar"
  | "corporal"
  | "kits";

export type Product = {
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

export const categoryLabels: Record<ProductCategory, string> = {
  facial: "Cosmética Natural Facial",
  capilar: "Cosmética Natural Capilar",
  corporal: "Cosmética Natural Corporal",
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
