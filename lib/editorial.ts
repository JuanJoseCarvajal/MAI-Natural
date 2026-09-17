import { getPublishedBlogPosts, type BlogPost } from "@/lib/blog";
import type { Product } from "@/lib/products";

export type EditorialSlide = {
  slug: string;
  headline: string;
  eyebrow: string;
  articleTitle: string;
  productId: string;
  productName: string;
  image: string;
};

export function getEditorialSlides(products: Product[], posts: BlogPost[] = getPublishedBlogPosts()): EditorialSlide[] {
  const seen = new Set<string>();
  return posts.flatMap((post) => {
    const candidates = post.promotion
      ? post.promotion.productIds.map(id => products.find(product => product.id === id))
      : products.filter(product => product.category === post.relatedProductCategory);
    const product = candidates.find(product => product && product.active !== false && product.amountInCents > 0 && (product.stock === undefined || product.stock > 0) && !seen.has(product.id));
    if (!product) return [];
    seen.add(product.id);
    return [{
      slug: post.slug,
      headline: post.promotion?.headline ?? post.title,
      eyebrow: post.promotion?.eyebrow ?? post.category,
      articleTitle: post.title,
      productId: product.id,
      productName: product.name,
      image: product.image,
    }];
  }).slice(0, 4);
}
