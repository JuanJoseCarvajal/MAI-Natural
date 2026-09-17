import type { Metadata } from "next";
import ProductsCatalogView from "@/components/features/products/ProductsCatalogView";
import { getAllProducts } from "@/lib/products.server";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Tienda de cosmetica natural facial, capilar y corporal | MAI Natural",
  description:
    "Compra productos MAI de cosmetica natural: cuidado facial, capilar, corporal, kits y rutinas botanicas con produccion artesanal.",
  path: "/products",
});

export default async function ProductsPage() {
  const products = await getAllProducts();
  return <ProductsCatalogView products={products} />;
}
