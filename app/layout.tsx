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
    title: `${siteName} | Cosmetica natural colombiana`,
    description: defaultSeoDescription,
    path: "/",
  }),
  applicationName: siteName,
  keywords: [
    "cosmetica natural",
    "cosmetica natural colombiana",
    "rutina facial natural",
    "shampoo natural",
    "productos naturales para la piel",
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
