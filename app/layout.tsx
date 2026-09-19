import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/common/Providers";
import { CartProvider } from "@/components/features/cart/CartContext";
import AppChrome from "@/components/common/AppChrome";
import Analytics from "@/components/common/Analytics";
import { buildMetadata, defaultSeoDescription, siteName, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  ...buildMetadata({
    title: `${siteName} | Formulaciones botánicas de autor`,
    description: defaultSeoDescription,
    path: "/",
  }),
  applicationName: siteName,
  keywords: [
    "formulaciones botánicas de autor",
    "cosmética de autor colombiana",
    "cuidado facial de autor",
    "cuidado capilar de autor",
    "elaborado uno a uno",
  ],
  icons: {
    icon: "/favicon.webp",
    shortcut: "/favicon.webp",
    apple: "/favicon.webp",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <CartProvider>
            <AppChrome>{children}</AppChrome>
          </CartProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
