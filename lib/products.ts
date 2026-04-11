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

export const products: Product[] = [
  // ── FACIAL ──────────────────────────────────────────────────────────────
  {
    id: "aqua-suero-facial",
    image: "https://mainatural.com/wp-content/uploads/2021/08/Suero-Aqua-MAI-1.png",
    name: "Aqua – Suero Facial",
    price: "$74.000",
    amountInCents: 7400000,
    description: "Suero acuoso con Bakuchiol, Clitoria, Granada y Ácido Hialurónico. Hidratación, brillo y renovación en cada gota.",
    category: "facial",
    badge: "Top ventas",
    benefits: ["Bakuchiol vegetal (alternativa suave al retinol)", "Ácido Hialurónico hidratante", "Antioxidantes de Granada"],
    rating: 4.9,
    reviewsCount: 142,
  },
  {
    id: "leche-nutritiva-dia",
    image: "https://mainatural.com/wp-content/uploads/2025/05/LEche-Nutritiva-Dia-1.png",
    name: "Leche Nutritiva – Día",
    price: "$74.000",
    amountInCents: 7400000,
    description: "Elixir floral con rosas, manzanilla, melissa y karité. Hidratación suave y equilibrio para empezar el día.",
    category: "facial",
    benefits: ["Pétalos de rosa y manzanilla", "Niacinamida + vitamina E", "Ácido Hialurónico 24h"],
    rating: 4.8,
    reviewsCount: 98,
  },
  {
    id: "leche-nutritiva-noche",
    image: "https://mainatural.com/wp-content/uploads/2025/05/LEche-Nutritiva-Dia-1.png",
    name: "Leche Nutritiva – Noche",
    price: "$74.000",
    amountInCents: 7400000,
    description: "Fórmula regenerativa nocturna con botánicos que restauran la piel mientras duermes.",
    category: "facial",
    badge: "Nuevo",
    benefits: ["Regeneración nocturna", "Melissa armonizante", "Manteca de karité nutritiva"],
    rating: 4.8,
    reviewsCount: 74,
  },
  {
    id: "rocio-primordial-tonico",
    image: "https://mainatural.com/wp-content/uploads/2021/08/Suero-Aqua-MAI-1.png",
    name: "Rocio Primordial – Tónico Facial",
    price: "$59.000",
    amountInCents: 5900000,
    description: "Tónico emoliente 120 ml que equilibra y prepara la piel para el siguiente paso de tu rutina.",
    category: "facial",
    benefits: ["Equilibra el pH", "Prepara la piel para el serum", "Botánicos calmantes"],
    rating: 4.7,
    reviewsCount: 61,
  },
  {
    id: "calendula-mousse-limpiador",
    image: "https://mainatural.com/wp-content/uploads/2021/08/Suero-Aqua-MAI-1.png",
    name: "Caléndula & Aloe – Mousse Limpiador",
    price: "$62.000",
    amountInCents: 6200000,
    description: "Mousse cremoso limpiador 150 ml con caléndula, aloe vera y manzanilla. Limpieza suave sin resecar.",
    category: "facial",
    benefits: ["Limpieza profunda y suave", "Caléndula calmante", "Aloe vera hidratante"],
    rating: 4.8,
    reviewsCount: 88,
  },
  {
    id: "romero-mousse-limpiador",
    image: "https://mainatural.com/wp-content/uploads/2021/08/Suero-Aqua-MAI-1.png",
    name: "Romero & Carbón – Mousse Limpiador",
    price: "$58.000",
    amountInCents: 5800000,
    description: "Mousse cremoso 120 ml con romero y carbón activado para limpiar en profundidad y purificar los poros.",
    category: "facial",
    benefits: ["Carbón activado purificante", "Romero antioxidante", "Controla el exceso de sebo"],
    rating: 4.7,
    reviewsCount: 52,
  },
  // ── CAPILAR ─────────────────────────────────────────────────────────────
  {
    id: "balsamo-jardin-herbal",
    image: "https://mainatural.com/wp-content/uploads/2021/08/Balsamo-MAI-1.png",
    name: "Bálsamo – Jardín Herbal",
    price: "$78.000",
    amountInCents: 7800000,
    description: "Bálsamo capilar con jojoba, almendras, manteca de cacao y extractos de caléndula y manzanilla.",
    category: "capilar",
    badge: "Top ventas",
    benefits: ["Ácido Hialurónico capilar", "Proteínas vegetales fortalecedoras", "Apta todo tipo de cabello"],
    rating: 4.9,
    reviewsCount: 115,
  },
  {
    id: "el-perfume-capilar",
    image: "https://mainatural.com/wp-content/uploads/2025/05/El-Perfume.png",
    name: "El Perfume – Perfume Capilar",
    price: "$52.000",
    amountInCents: 5200000,
    description: "Termoprotector, acondicionador y perfume capilar con hierbaluisa, lavanda, romero, ortiga y maracuyá.",
    category: "capilar",
    badge: "Nuevo",
    benefits: ["Termoprotector hasta 230°C", "Pantenol + proteínas vegetales", "Aroma botánico duradero"],
    rating: 4.8,
    reviewsCount: 83,
  },
  {
    id: "shampoo-jardin-herbal",
    image: "https://mainatural.com/wp-content/uploads/2021/08/Balsamo-MAI-1.png",
    name: "Shampoo – Jardín Herbal",
    price: "$68.000",
    amountInCents: 6800000,
    description: "Shampoo 500 ml libre de sulfatos con hierbas botánicas que limpian, nutren y dan brillo.",
    category: "capilar",
    benefits: ["Libre de sulfatos y parabenos", "Limpieza suave", "Hierbas jardín herbal"],
    rating: 4.8,
    reviewsCount: 97,
  },
  // ── CORPORAL ────────────────────────────────────────────────────────────
  {
    id: "body-milk-rosas-cacao",
    image: "https://mainatural.com/wp-content/uploads/2025/05/Body-Milk-500.png",
    name: "Body Milk Rosas & Cacao",
    price: "$46.000",
    amountInCents: 4600000,
    description: "Crema corporal alquímica con rosas maceradas, manteca de cacao y extractos botánicos que firman y nutren.",
    category: "corporal",
    badge: "Top ventas",
    benefits: ["Rosas maceradas en aceite", "Manteca de cacao nutritiva", "Firmeza y luminosidad"],
    rating: 4.9,
    reviewsCount: 106,
  },
  // ── KITS ────────────────────────────────────────────────────────────────
  {
    id: "kit-ritual-facial",
    image: "https://mainatural.com/wp-content/uploads/2025/06/foto8-768x432.jpg",
    name: "Kit Ritual Facial",
    price: "$180.000",
    amountInCents: 18000000,
    description: "Mousse limpiador + Tónico Rocío + Suero Aqua. Rutina facial completa de 3 pasos en un solo kit.",
    category: "kits",
    badge: "Ahorra 15%",
    benefits: ["Limpieza + Tónico + Serum", "Ideal para regalo", "3 pasos en 1 caja"],
    rating: 4.9,
    reviewsCount: 38,
  },
  {
    id: "kit-capilar-herbal",
    image: "https://mainatural.com/wp-content/uploads/2025/06/foto8-768x432.jpg",
    name: "Kit Capilar Jardín Herbal",
    price: "$130.000",
    amountInCents: 13000000,
    description: "Shampoo + Bálsamo Jardín Herbal. Rutina capilar botánica para cabello nutrido y brillante.",
    category: "kits",
    badge: "Ahorra 10%",
    benefits: ["Shampoo + Bálsamo", "Sin sulfatos ni parabenos", "Apto todo tipo de cabello"],
    rating: 4.8,
    reviewsCount: 29,
  },
];

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}

export function getProductsByCategory(category: ProductCategory) {
  return products.filter((product) => product.category === category);
}
