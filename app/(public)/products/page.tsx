import ProductsCatalogView from "@/components/features/products/ProductsCatalogView";
import { getAllProducts } from "@/lib/products.server";

export default async function ProductsPage() {
  const products = await getAllProducts();
  return <ProductsCatalogView products={products} />;
}
