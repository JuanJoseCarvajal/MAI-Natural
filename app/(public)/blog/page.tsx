import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { blogPosts } from "@/lib/blog";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Blog de cosmetica natural y rutinas | MAI Natural",
  description:
    "Guias de cosmetica natural, cuidado facial, cuidado capilar y regalos conscientes para elegir mejor tu rutina MAI.",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
          Guia MAI
        </p>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight text-brand-900 md:text-5xl">
          Blog de cosmetica natural, rutinas y bienestar
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Contenido pensado para atraer busquedas de alta intencion y llevar a cada lectora hacia productos, rutinas y asesoria personalizada.
        </p>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        {blogPosts.map((post) => (
          <article
            key={post.slug}
            className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg"
          >
            <Link href={`/blog/${post.slug}`} className="relative block aspect-[4/3] bg-brand-50">
              <Image
                src={post.heroImage}
                alt={post.title}
                fill
                className="object-contain p-8"
                sizes="(min-width: 768px) 33vw, 100vw"
              />
            </Link>
            <div className="flex flex-1 flex-col p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
                {post.category} · {post.readTime}
              </p>
              <h2 className="mt-3 text-xl font-bold text-brand-900">
                <Link href={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-3 text-sm text-slate-600">{post.description}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-auto pt-5 text-sm font-semibold text-brand-700 hover:underline"
              >
                Leer guia
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
