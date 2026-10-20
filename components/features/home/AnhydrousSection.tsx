'use client';
import {SiteText} from "@/components/common/SiteText";


import ProductGallery from '@/components/features/products/ProductGallery';
import Link from 'next/link';
import {useRef} from 'react';
import type {Product} from '@/lib/products';
import {anhydrousShopUrl} from '@/lib/anhydrous';
import styles from './anhydrous-section.module.css';

type SlideProduct = Pick<Product, 'id' | 'name' | 'image' | 'images' | 'price'>;

export default function AnhydrousSection({products}: {products: SlideProduct[]}) {
  const track = useRef<HTMLUListElement>(null);
  function move(direction: number) {
    const list = track.current;
    if (!list) return;
    const step = list.firstElementChild?.getBoundingClientRect().width ?? list.clientWidth;
    list.scrollBy({left: direction * (step + 20), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }
  if (!products.length) return null;
  return <section className={styles.section} aria-labelledby="anhydrous-title">
    <div className={styles.copy}>
      <p className="eyebrow"><SiteText id="52580a8807084b262101">{"COSMÉTICA ANHIDRA · CUIDADO EN SÓLIDO"}</SiteText></p>
      <h2 id="anhydrous-title"><SiteText id="52f0e844ce4c1a3ce993">{"Otra forma de cuidarte."}</SiteText><br/><em><SiteText id="c25f18c581b14da1531b">{"Lo esencial, en tus manos."}</SiteText></em></h2>
      <p><SiteText id="e12d07aa7c026e248999">{"Shampoos, acondicionadores y jabones sólidos, junto a nuestros productos anhidros. Una colección para descubrir nuevas texturas y hacer de lo cotidiano un momento de cuidado."}</SiteText></p>
      <Link href={anhydrousShopUrl} className="mai-button"><SiteText id="95abff4068c90d4c3a4d">{"Explorar cosmética anhidra "}</SiteText><span aria-hidden="true">↗</span></Link>
    </div>
    <div className={styles.slider} role="region" aria-label="Productos de cosmética anhidra">
      <div className={styles.controls}><span>{products.length}<SiteText id="46b82a81c1bb1034f5ca">{" productos para descubrir"}</SiteText></span>{products.length > 1 && <div><button type="button" onClick={()=>move(-1)} aria-label="Ver producto anterior" aria-controls="anhydrous-products">←</button><button type="button" onClick={()=>move(1)} aria-label="Ver producto siguiente" aria-controls="anhydrous-products">→</button></div>}</div>
      <ul id="anhydrous-products" ref={track} className={styles.track} tabIndex={0} aria-label="Desliza para explorar todos los productos">
        {products.map(product=><li key={product.id} className={styles.card}>
          <ProductGallery image={product.image} images={product.images} name={product.name}/>
          <h3><Link href={`/products/${product.id}`}>{product.name}</Link></h3><p>{product.price}</p>
        </li>)}
      </ul>
    </div>
  </section>;
}
