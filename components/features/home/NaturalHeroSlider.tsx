"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Slide = {
  src: string;
  alt: string;
};

const SLIDES: Slide[] = [
  {
    src: "https://images.pexels.com/photos/207518/pexels-photo-207518.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Cultivo organico de lavanda en campo abierto",
  },
  {
    src: "https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Rostro aplicando skincare botanico con gotas de agua",
  },
  {
    src: "https://images.pexels.com/photos/56866/garden-rose-red-pink-56866.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Rosas naturales en ambiente de jardin botanico",
  },
  {
    src: "https://images.pexels.com/photos/6621434/pexels-photo-6621434.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Cosecha botanica en manos para cosmetica natural",
  },
];

export default function NaturalHeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 3800);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0">
      {SLIDES.map((slide, index) => (
        <div
          key={slide.src}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            index === current ? "opacity-100" : "opacity-0"
          )}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            sizes="100vw"
            priority={index === 0}
            className="object-cover"
          />
        </div>
      ))}

      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 backdrop-blur">
        {SLIDES.map((_, index) => (
          <button
            key={`dot-${index}`}
            type="button"
            aria-label={`Ir a slide ${index + 1}`}
            onClick={() => setCurrent(index)}
            className={cn(
              "h-2.5 w-2.5 rounded-full transition",
              index === current ? "bg-brand-700" : "bg-white"
            )}
          />
        ))}
      </div>
    </div>
  );
}
