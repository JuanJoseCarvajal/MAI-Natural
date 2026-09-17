import type { Metadata } from "next";

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://mainatural.com"
).replace(/\/$/, "");

export const siteName = "MAI Natural";
export const defaultSeoDescription =
  "Cosmetica natural colombiana para piel, cabello y bienestar, con formulas botanicas y acompaniamiento personalizado.";

type SeoInput = {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
};

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildMetadata({
  title,
  description = defaultSeoDescription,
  path = "/",
  image = "/favicon.webp",
  type = "website",
  publishedTime,
}: SeoInput): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      locale: "es_CO",
      type,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
