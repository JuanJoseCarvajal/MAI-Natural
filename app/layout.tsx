import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import Providers from "@/components/common/Providers";
import { CartProvider } from "@/components/features/cart/CartContext";

export const metadata: Metadata = {
  title: "MAI Natural",
  description: "Cosmética natural colombiana",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <CartProvider>
            <Header />
            <main className="min-h-[70vh]">{children}</main>
            <Footer />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}