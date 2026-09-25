"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import styles from "./gallery.module.css";

export default function ProductGallery({ image, images, name, detail = false }: { image: string; images?: string[]; name: string; detail?: boolean }) {
  const photos = images?.length ? images : [image];
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const next = (direction: number) => setIndex(current => (current + direction + photos.length) % photos.length);
  const controls = <div className={styles.controls}>
    <button type="button" onClick={() => next(-1)} aria-label={"Foto anterior de " + name}>←</button>
    <span aria-live="polite">{index + 1} / {photos.length}</span>
    <button type="button" onClick={() => next(1)} aria-label={"Foto siguiente de " + name}>→</button>
  </div>;
  return <div className={styles.gallery}>
    <button type="button" className={styles.frame} onClick={() => { setExpanded(true); dialog.current?.showModal(); }} aria-label={"Ampliar imagen de " + name}>
      <Image src={photos[index]} alt={name + " · foto " + (index + 1)} fill sizes={detail ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 50vw, 25vw"} />
      <span className={styles.expand}>Ampliar ↗</span>
    </button>
    {photos.length > 1 && controls}
    {detail && photos.length > 1 && <div className={styles.thumbnails}>{photos.map((src, i) =>
      <button key={src} type="button" aria-label={"Ver foto " + (i + 1)} aria-pressed={index === i} onClick={() => setIndex(i)}>
        <Image src={src} alt="" width={64} height={80} sizes="64px" />
      </button>)}</div>}
    <dialog ref={dialog} className={styles.dialog} onClose={() => setExpanded(false)} aria-label={"Galería de " + name}
      onKeyDown={event => { if(event.key === "ArrowLeft") {event.preventDefault(); next(-1);} if(event.key === "ArrowRight") {event.preventDefault(); next(1);} }}>
      <button type="button" className={styles.close} onClick={() => dialog.current?.close()} autoFocus>Cerrar ×</button>
      <div className={styles.large}>{expanded && <Image src={photos[index]} alt={name + " · foto " + (index + 1)} fill sizes="90vw" />}</div>
      {photos.length > 1 && controls}
    </dialog>
  </div>;
}
