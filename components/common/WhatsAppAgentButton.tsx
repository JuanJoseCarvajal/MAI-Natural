"use client";

import { usePathname } from "next/navigation";

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
  const hiddenRoutes = ["/admin", "/login", "/register"];

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
      className="fixed bottom-5 right-5 z-[60] flex items-center gap-3 rounded-full bg-[#1f9d58] px-4 py-3 text-sm font-bold text-white shadow-2xl transition hover:bg-[#18884b]"
      aria-label="Hablar con Agente MAI por WhatsApp"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
        W
      </span>
      <span className="hidden sm:inline">Agente MAI por WhatsApp</span>
      <span className="sm:hidden">WhatsApp</span>
    </button>
  );
}
