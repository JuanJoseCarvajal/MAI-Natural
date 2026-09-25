"use client";
import { SiteText } from "@/components/common/SiteText";


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
      <a href="#main-content" className="skip-link"><SiteText id="73ec3c5e32e3d5a35b95">{"Saltar al contenido"}</SiteText></a>
      <Header />
      <main id="main-content" className="min-h-[70vh]" tabIndex={-1}><Breadcrumbs contained />{children}</main>
      <Footer />
      <WhatsAppAgentButton />
    </>
  );
}
