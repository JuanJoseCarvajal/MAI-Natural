"use client";
import { SiteText } from "@/components/common/SiteText";


import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const WHATSAPP_NUMBER = "573246847727";

function buildDefaultMessage(pathname: string) {
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "https://mainatural.com";
  const currentUrl = `${baseUrl}${pathname}`;

  return [
    "Hola MAI, quiero asesoria personalizada para elegir mi rutina ideal.",
    "Quiero que me ayudes segun mi necesidad y luego terminar la compra directamente en la pagina.",
    `Estoy viendo esta seccion: ${currentUrl}`,
  ].join(" ");
}

export default function WhatsAppAgentButton() {
  const pathname = usePathname();
  const [heroVisible, setHeroVisible] = useState(pathname === "/");
  const hiddenRoutes = ["/admin", "/login", "/register", "/services"];

  useEffect(() => {
    const hero = document.querySelector(".botanical-hero");
    if (pathname !== "/" || !hero) { setHeroVisible(false); return; }
    const observer = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting));
    observer.observe(hero);
    return () => observer.disconnect();
  }, [pathname]);

  if (hiddenRoutes.some((route) => pathname.startsWith(route))) {
    return null;
  }

  const handleClick = () => {
    const message = encodeURIComponent(buildDefaultMessage(pathname));
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`fixed bottom-5 right-5 z-[60] flex items-center gap-3 rounded-full bg-[#1f9d58] px-4 py-3 text-sm font-bold text-white shadow-2xl transition hover:bg-[#18884b] ${heroVisible ? "max-[760px]:hidden" : ""}`}
      aria-label="Hablar con Agente MAI por WhatsApp"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20"><SiteText id="71d9a02f279a1677591e">{"W"}</SiteText></span>
      <span className="hidden sm:inline"><SiteText id="f4e91f1ce89cac8aaa37">{"Agente MAI por WhatsApp"}</SiteText></span>
      <span className="sm:hidden"><SiteText id="9b75fc58503b14737c30">{"WhatsApp"}</SiteText></span>
    </button>
  );
}
