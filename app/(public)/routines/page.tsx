import RoutineBuilderView from "@/components/features/products/RoutineBuilderView";
import { getAllProducts } from "@/lib/products.server";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 60;

export const metadata = buildMetadata({ title: "Tu ritual: kits faciales, capilares y selección personalizada | MAI Natural", description: "Elige un ritual facial o capilar de MAI Natural, o crea tu selección de cosmética natural. Compara qué incluye cada kit y revisa precios en pesos colombianos.", path: "/routines" });

export default async function RoutinesPage() {
  const products = await getAllProducts();
  return <RoutineBuilderView products={products} />;
}
