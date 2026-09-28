import type { MetadataRoute } from "next";
import { getEditableBlogPosts } from "@/lib/blog-content";
import { getAllProducts } from "@/lib/products.server";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();
  const staticRoutes = [
    "/",
    "/products",
    "/routines",
    "/services",
    "/subscriptions",
    "/blog",
    "/terms",
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: absoluteUrl(path),
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.8,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/products/${product.id}`),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...(await getEditableBlogPosts()).map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
  ];
}
