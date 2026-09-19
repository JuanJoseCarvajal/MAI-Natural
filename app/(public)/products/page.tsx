import type { Metadata } from "next";
import ProductsCatalogView from "@/components/features/products/ProductsCatalogView";
import { getAllProducts } from "@/lib/products.server";
import { absoluteUrl, buildMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Formulaciones botánicas de autor en Colombia | MAI Natural",
  description:
    "Descubre formulaciones botánicas de autor para piel, cabello y cuerpo, elaboradas uno a uno por MAI.",
  path: "/products",
});

export default async function ProductsPage() {
  const products = await getAllProducts();
  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Formulaciones botánicas de autor MAI",
    url: absoluteUrl("/products"),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: product.name,
        url: absoluteUrl(`/products/${product.id}`),
      })),
    },
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(collection) }} />
    <ProductsCatalogView products={products} />
  </>;
}
