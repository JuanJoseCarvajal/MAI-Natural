import RoutineBuilderView from "@/components/features/products/RoutineBuilderView";
import { getAllProducts } from "@/lib/products.server";

export default async function RoutinesPage() {
  const products = await getAllProducts();
  return <RoutineBuilderView products={products} />;
}
