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
    if (post.showOnHome === false) return [];
    const ids = post.relatedProductIds ?? post.promotion?.productIds;
    const candidates = ids
      ? ids.map(id => products.find(product => product.id === id))
      : products.filter(product => product.category === post.relatedProductCategory);
    const product = candidates.find(product => product && product.active !== false && product.amountInCents > 0 && !seen.has(product.id));
    if (!product) return [];
    seen.add(product.id);
    return [{
      slug: post.slug,
      headline: post.title,
      eyebrow: post.category,
      articleTitle: post.title,
      productId: product.id,
      productName: product.name,
      image: product.image,
    }];
  }).slice(0, 4);
}
