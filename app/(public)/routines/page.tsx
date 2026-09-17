import RoutineBuilderView from "@/components/features/products/RoutineBuilderView";
import { getAllProducts } from "@/lib/products.server";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Rutinas de cuidado facial, capilar y corporal | MAI Natural", description: "Encuentra tu ritual MAI: explora selecciones de productos, conoce sus precios y elige con acompañamiento.", path: "/routines" });

export default async function RoutinesPage() {
  const products = await getAllProducts();
  return <RoutineBuilderView products={products} />;
}
