import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedBlogPosts, getBlogPost } from "@/lib/blog";
import { categoryLabels } from "@/lib/products";
import { getAllProducts } from "@/lib/products.server";
import { absoluteUrl, buildMetadata, siteName } from "@/lib/seo";

type BlogDetailProps = {
  params: { slug: string };
};

export const revalidate = 60;
export const dynamicParams = true;

export function generateStaticParams() {
  return getPublishedBlogPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: BlogDetailProps): Metadata {
  const post = getBlogPost(params.slug);
  if (!post) return {};

  return buildMetadata({
    title: `${post.title} | ${siteName}`,
    description: post.description,
    path: `/blog/${post.slug}`,
    image: post.heroImage,
    type: "article",
    publishedTime: post.publishedAt,
  });
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  const products = await getAllProducts();
  const relatedProducts = post.promotion
    ? post.promotion.productIds.flatMap(id => products.filter(product => product.id === id))
    : post.relatedProductCategory
    ? products.filter((product) => product.category === post.relatedProductCategory).slice(0, 3)
    : products.slice(0, 3);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: absoluteUrl(post.heroImage),
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Organization", name: siteName },
    publisher: { "@type": "Organization", name: siteName },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    keywords: post.keywords.join(", "),
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />
      <Link href="/blog" className="text-sm font-semibold text-brand-700 hover:underline">
        Volver al blog
      </Link>

      <article className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
          {post.category} · {post.readTime}
        </p>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight text-brand-900 md:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-slate-600">{post.description}</p>
        <p className="mt-4 text-xs text-slate-500">Diario MAI · <time dateTime={post.publishedAt}>{new Intl.DateTimeFormat("es-CO", { dateStyle: "long", timeZone: "America/Bogota" }).format(new Date(post.publishedAt))}</time></p>
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-brand-50 ring-1 ring-brand-100">
          <Image
            src={post.heroImage}
            alt={post.title}
            fill
            priority
            className="object-cover"
            sizes="(min-width: 768px) 768px, 100vw"
          />
        </div>

        <div className="prose prose-slate mt-10 max-w-none prose-headings:text-brand-900 prose-a:text-brand-700">
          {post.sections.map((section) => (
            <section key={section.heading} className="mt-8">
              <h2 className="text-2xl font-bold text-brand-900">{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-base leading-7 text-slate-700">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </article>

      <section className="mt-12 rounded-2xl bg-brand-900 p-6 text-white">
        <h2 className="text-2xl font-bold">Convierte esta guia en una rutina</h2>
        <p className="mt-2 text-brand-100">
          Explora productos relacionados o arma una rutina guiada segun tu objetivo.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/routines" className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-brand-900">
            Armar rutina
          </Link>
          <Link href="/products" className="rounded-full border border-white/80 px-5 py-2.5 text-sm font-bold text-white">
            Ver productos
          </Link>
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-2xl font-bold text-brand-900">
            Productos relacionados
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {relatedProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-md"
              >
                <div className="relative mb-4 aspect-square overflow-hidden"><Image src={product.image} alt={product.name} fill sizes="(min-width:768px) 250px, 90vw" className="object-cover" /></div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
                  {categoryLabels[product.category]}
                </p>
                <p className="mt-2 font-bold text-brand-900">{product.name}</p>
                <p className="mt-1 text-sm text-slate-600">{product.price}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
