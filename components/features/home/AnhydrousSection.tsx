'use client';

import Image from 'next/image';
import Link from 'next/link';
import {useRef} from 'react';
import type {Product} from '@/lib/products';
import {anhydrousShopUrl} from '@/lib/anhydrous';
import styles from './anhydrous-section.module.css';

type SlideProduct = Pick<Product, 'id' | 'name' | 'image' | 'price'>;

export default function AnhydrousSection({products}: {products: SlideProduct[]}) {
  const track = useRef<HTMLUListElement>(null);
  function move(direction: number) {
    const list = track.current;
    if (!list) return;
    const step = list.firstElementChild?.getBoundingClientRect().width ?? list.clientWidth;
    list.scrollBy({left: direction * (step + 20), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }
  if (!products.length) return null;
  return <section className={`ritual-story ${styles.section}`} aria-labelledby="anhydrous-title">
    <div className={`ritual-copy ${styles.copy}`}>
      <p className="eyebrow">COSMÉTICA ANHIDRA · CUIDADO EN SÓLIDO</p>
      <h2 id="anhydrous-title">Otra forma de cuidarte.<br/><em>Lo esencial, en tus manos.</em></h2>
      <p>Shampoos, acondicionadores y jabones sólidos, junto a nuestros productos anhidros. Una colección para descubrir nuevas texturas y hacer de lo cotidiano un momento de cuidado.</p>
      <Link href={anhydrousShopUrl} className="mai-button mai-button-light">Explorar cosmética anhidra <span aria-hidden="true">↗</span></Link>
    </div>
    <div className={styles.slider} role="region" aria-label="Productos de cosmética anhidra">
      <div className={styles.controls}><span>{products.length} productos para descubrir</span>{products.length > 1 && <div><button type="button" onClick={()=>move(-1)} aria-label="Ver producto anterior" aria-controls="anhydrous-products">←</button><button type="button" onClick={()=>move(1)} aria-label="Ver producto siguiente" aria-controls="anhydrous-products">→</button></div>}</div>
      <ul id="anhydrous-products" ref={track} className={styles.track} tabIndex={0} aria-label="Desliza para explorar todos los productos">
        {products.map(product=><li key={product.id} className={styles.card}>
          <Link href={`/products/${product.id}`} className={styles.photo}><Image src={product.image} alt={product.name} fill sizes="(max-width: 760px) 75vw, 30vw"/><span aria-hidden="true">↗</span></Link>
          <h3><Link href={`/products/${product.id}`}>{product.name}</Link></h3><p>{product.price}</p>
        </li>)}
      </ul>
    </div>
  </section>;
}
