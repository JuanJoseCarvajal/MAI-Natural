'use client';
import {useRef} from 'react';
import type {Product} from '@/lib/products';
import ProductCard from '@/components/features/products/ProductCard';
import styles from './home-refresh.module.css';
export default function AnhydrousSlider({products}:{products:Product[]}){
 const rail=useRef<HTMLDivElement>(null);
 const scroll=(direction:number)=>{const el=rail.current;if(el)el.scrollBy({left:direction*el.clientWidth*.85,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
 return <div className={styles.slider}><div className={styles.sliderHeading}><p>{products.length} esenciales · Un nuevo ritual</p>{products.length>1&&<div className={styles.controls}><button onClick={()=>scroll(-1)} aria-label="Ver productos anteriores">←</button><button onClick={()=>scroll(1)} aria-label="Ver productos siguientes">→</button></div>}</div><div ref={rail} className={styles.productRail} tabIndex={0} role="region" aria-label="Productos de cosmética anhidra">{products.map(p=><div className={styles.productSlide} key={p.id}><ProductCard {...p} compact/></div>)}</div>{!products.length&&<p>Estamos preparando los próximos esenciales de esta colección.</p>}</div>;
}
