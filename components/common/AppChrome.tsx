"use client";

import { usePathname } from "next/navigation";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import WhatsAppAgentButton from "@/components/common/WhatsAppAgentButton";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <a href="#main-content" className="skip-link">Saltar al contenido</a>
      <Header />
      <main id="main-content" className="min-h-[70vh]" tabIndex={-1}><Breadcrumbs contained />{children}</main>
      <Footer />
      <WhatsAppAgentButton />
    </>
  );
}
