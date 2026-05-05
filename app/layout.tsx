import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/common/Providers";
import { CartProvider } from "@/components/features/cart/CartContext";
import AppChrome from "@/components/common/AppChrome";

export const metadata: Metadata = {
  title: "MAI Natural",
  description: "Cosmética natural colombiana",
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
      </body>
    </html>
  );
}
