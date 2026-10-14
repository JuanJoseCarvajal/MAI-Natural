import { describe, expect, it } from "vitest";
import { allBlogPosts, getBlogPost, getPublishedBlogPosts } from "./blog";
import { getEditorialSlides } from "./editorial";
import campaigns from "./editorial-campaigns.json";
import catalog from "./products.catalog.json";
import type { Product } from "./products";
import { existsSync } from "node:fs";
import { join } from "node:path";

const products = catalog as Product[];

describe("programación editorial MAI", () => {
  it("oculta una entrega hasta la hora exacta en Colombia", () => {
    const slug = campaigns[1].slug;
    expect(getBlogPost(slug, new Date("2026-10-01T13:59:59Z"))).toBeUndefined();
    expect(getBlogPost(slug, new Date("2026-10-01T14:00:00Z"))?.slug).toBe(slug);
  });

  it("pone la entrega recién publicada primero en Diario y carrusel", () => {
    const posts = getPublishedBlogPosts(new Date("2026-10-01T14:00:00Z"));
    expect(posts[0].slug).toBe(campaigns[1].slug);
    expect(getEditorialSlides(products, posts)[0].productId).toBe("mnk-001");
    expect(posts.some(post => post.slug === campaigns[2].slug)).toBe(false);
  });

  it("no promociona productos desactivados ni repite el mismo producto", () => {
    const unavailable = products.map(product => ({ ...product, active: false }));
    expect(getEditorialSlides(unavailable)).toEqual([]);
    const slides = getEditorialSlides(products, getPublishedBlogPosts(new Date("2026-12-01")));
    expect(new Set(slides.map(slide => slide.productId)).size).toBe(slides.length);
    expect(slides.length).toBeLessThanOrEqual(4);
  });

  it("tiene seis entregas completas con intervalos de quince fechas locales", () => {
    expect(campaigns).toHaveLength(6);
    campaigns.forEach((campaign, index) => {
      expect(campaign.sections.length).toBeGreaterThanOrEqual(4);
      expect(campaign.social.slides).toHaveLength(4);
      expect(campaign.social.stories).toHaveLength(3);
      if (index > 0) {
        const day = Date.parse(campaign.publishedAt.slice(0, 10));
        const prior = Date.parse(campaigns[index - 1].publishedAt.slice(0, 10));
        expect((day - prior) / 86400000).toBe(15);
      }
    });
  });

  it("cada campaña enlaza productos y fotografías existentes", () => {
    expect(new Set(allBlogPosts.map(post => post.slug)).size).toBe(allBlogPosts.length);
    campaigns.forEach(campaign => {
      expect(existsSync(join(process.cwd(), campaign.heroImage.startsWith('/products/media/') ? 'assets/product-images' : 'public', campaign.heroImage.replace('/products/media/', '')))).toBe(true);
      campaign.promotion.productIds.forEach(id => expect(products.some(product => product.id === id)).toBe(true));
    });
  });
});

it('honors home opt-out and explicit product selection including an empty selection', () => {
  const post = getPublishedBlogPosts(new Date('2026-10-01T14:00:00Z'))[0];
  expect(getEditorialSlides(products, [{...post,showOnHome:false}])).toEqual([]);
  expect(getEditorialSlides(products, [{...post,showOnHome:true,relatedProductIds:[]}])).toEqual([]);
  const product = products.find(p=>p.active!==false&&p.amountInCents>0)!;
  expect(getEditorialSlides(products, [{...post,showOnHome:true,relatedProductIds:[product.id]}])[0].productId).toBe(product.id);
  expect(getEditorialSlides(products.map(p=>({...p,active:false})), [{...post,showOnHome:true,relatedProductIds:[product.id]}])).toEqual([]);
});

it('reflects a renamed article instead of its obsolete campaign copy', () => {
  const post = getPublishedBlogPosts(new Date('2026-10-01T14:00:00Z'))[0];
  const updated = {...post,title:'Cosmética ANHÍDRIDA',category:'Cosmética sin agua',promotion:{...post.promotion!,headline:'El cuidado, sin prisa.',eyebrow:'UN MOMENTO COTIDIANO'}};
  expect(getEditorialSlides(products,[updated])[0]).toMatchObject({slug:updated.slug,headline:updated.title,eyebrow:updated.category,articleTitle:updated.title});
});
