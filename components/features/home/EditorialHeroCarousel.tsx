"use client";
import { SiteText } from "@/components/common/SiteText";


import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import type { EditorialSlide } from "@/lib/editorial";
import styles from "./editorial-carousel.module.css";

export default function EditorialHeroCarousel({ slides }: { slides: EditorialSlide[] }) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(true);
  const touchStart = useRef<number | null>(null);
  const rotationBeforePointer = useRef<boolean | null>(null);
  const region = useRef<HTMLElement>(null);
  const seen = useRef(new Set<string>());
  const slide = slides[current] ?? slides[0];

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPlaying(!preference.matches);
    const onPreference = () => { if (preference.matches) setPlaying(false); };
    const onVisibility = () => setVisible(!document.hidden);
    onVisibility();
    preference.addEventListener("change", onPreference);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      preference.removeEventListener("change", onPreference);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!playing || hovered || !visible || slides.length < 2) return;
    const timer = window.setInterval(() => setCurrent(value => (value + 1) % slides.length), 7000);
    return () => window.clearInterval(timer);
  }, [playing, hovered, visible, slides.length]);

  useEffect(() => {
    if (!slide || !region.current || !visible || seen.current.has(slide.slug)) return;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting) || seen.current.has(slide.slug)) return;
      seen.current.add(slide.slug);
      trackEvent("view_promotion", { promotion_id: slide.slug, promotion_name: slide.headline, creative_slot: "home_editorial_carousel", items: [{ item_id: slide.productId, item_name: slide.productName }] });
    }, { threshold: 0.5 });
    observer.observe(region.current);
    return () => observer.disconnect();
  }, [slide, visible]);

  function navigate(index: number) {
    setPlaying(false);
    setCurrent((index + slides.length) % slides.length);
  }

  function track(destination: "article" | "product") {
    trackEvent("select_promotion", {
      promotion_id: slide.slug, promotion_name: slide.headline,
      creative_slot: "home_editorial_carousel", destination,
      items: [{ item_id: slide.productId, item_name: slide.productName }],
    });
  }

  if (!slide) return null;

  return (
    <section
      ref={region}
      className={`hero-photo ${styles.carousel}`}
      aria-label="Historias y productos del Diario MAI"
      aria-roledescription="carrusel"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setPlaying(false)}
      onTouchStart={event => { touchStart.current = event.touches[0].clientX; }}
      onTouchEnd={event => {
        if (touchStart.current === null) return;
        const distance = event.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(distance) > 55) navigate(current + (distance < 0 ? 1 : -1));
        touchStart.current = null;
      }}
    >
      <div className={styles.topline}>
        <span><SiteText id="64b01d01e00795b04238">{"DEL DIARIO A TU RITUAL"}</SiteText></span>
        {slides.length > 1 && <button type="button" onPointerDown={() => { rotationBeforePointer.current = playing; }} onClick={() => { setPlaying(!(rotationBeforePointer.current ?? playing)); rotationBeforePointer.current = null; }} aria-label={playing ? "Pausar carrusel" : "Reproducir carrusel"}>{playing ? "Ⅱ" : "▷"}<span>{playing ? "Pausar" : "Reproducir"}</span></button>}
      </div>
      <div className={styles.slide} role="group" aria-roledescription="diapositiva" aria-label={`${current + 1} de ${slides.length}: ${slide.productName}`}>
        <Image key={slide.image} src={slide.image} alt={slide.productName} fill priority={current === 0} sizes="(max-width: 760px) 100vw, 54vw" className={styles.image} />
        <div className={styles.card}>
          <div aria-live={playing ? "off" : "polite"} aria-atomic="true">
            <p className={styles.eyebrow}>{slide.eyebrow}</p>
            <h2>{slide.headline}</h2>
          </div>
          <div className={styles.links}>
            <Link href={`/blog/${slide.slug}`} onClick={() => track("article")} aria-label={`Leer historia: ${slide.articleTitle}`}><SiteText id="b77fada2c6d4fe472c8f">{"Leer historia "}</SiteText><span aria-hidden="true">↗</span></Link>
            <Link href={`/products/${slide.productId}`} onClick={() => track("product")} aria-label={`Ver producto: ${slide.productName}`}>{slide.productName} <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </div>
      {slides.length > 1 && <div className={styles.controls}>
        <button type="button" onClick={() => navigate(current - 1)} aria-label="Historia anterior">←</button>
        <div className={styles.dots} role="group" aria-label="Elegir historia">{slides.map((item, index) => <button type="button" key={item.slug} aria-label={`Mostrar historia ${index + 1}: ${item.productName}`} aria-pressed={index === current} onClick={() => navigate(index)}><span /></button>)}</div>
        <span className={styles.counter}>{String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
        <button type="button" onClick={() => navigate(current + 1)} aria-label="Historia siguiente">→</button>
      </div>}
    </section>
  );
}
