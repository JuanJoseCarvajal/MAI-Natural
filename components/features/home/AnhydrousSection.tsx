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
  return <section className={`editorial-section ${styles.section}`} aria-labelledby="anhydrous-title">
    <div className={styles.copy}>
      <p className="eyebrow">COSMÉTICA ANHIDRA</p>
      <h2 id="anhydrous-title">Lo esencial,<br/><em>sin agua en la fórmula.</em></h2>
      <p>Descubre otra forma de cuidar de ti: fórmulas sin agua que hacen parte de tus rituales de cada día. Explora nuestros acondicionadores y desodorantes anhidros y encuentra el cuidado que va contigo.</p>
      <Link href={anhydrousShopUrl} className="mai-button">Explorar cosmética anhidra <span aria-hidden="true">↗</span></Link>
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
