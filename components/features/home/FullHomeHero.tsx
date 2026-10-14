'use client';
import Image from 'next/image';
import Link from 'next/link';
import {useRef,useState} from 'react';
import type {HomePanel} from '@/lib/home-config';
import styles from './home-refresh.module.css';
export default function FullHomeHero({slides}:{slides:HomePanel[]}){
 const [current,setCurrent]=useState(0);const touch=useRef<number|null>(null);const slide=slides[current]??slides[0];
 if(!slide)return null;
 const go=(index:number)=>setCurrent((index+slides.length)%slides.length);
 return <section className={styles.hero} aria-label="Descubre MAI" aria-roledescription="carrusel" onTouchStart={e=>{touch.current=e.touches[0].clientX;}} onTouchEnd={e=>{if(touch.current!==null){const distance=e.changedTouches[0].clientX-touch.current;if(Math.abs(distance)>60)go(current+(distance<0?1:-1));}touch.current=null;}}>
 <Image key={slide.image} src={slide.image} alt={slide.alt} fill priority={current===0} sizes="100vw" className={styles.heroImage}/><div className={styles.shade}/>
 <div className={styles.heroCopy} aria-live="polite" aria-atomic="true"><p className={styles.eyebrow}>MAI · FORMULACIONES BOTÁNICAS DE AUTOR</p><h1>{slide.title}</h1><p className={styles.intro}>{slide.description}</p><Link className={styles.glassButton} href={slide.href}>{slide.action}<span aria-hidden="true">↗</span></Link></div>
 <div className={styles.heroBottom}><span className={styles.heroNote}>ELABORADO UNO A UNO.<br/>CUIDADO QUE SE SIENTE.</span>{slides.length>1&&<div className={styles.controls}><button onClick={()=>go(current-1)} aria-label="Banner anterior">←</button><div className={styles.dots}>{slides.map((item,i)=><button key={item.id} aria-label={`Mostrar banner: ${item.title}`} aria-pressed={i===current} onClick={()=>go(i)}><span/></button>)}</div><span>{String(current+1).padStart(2,'0')} / {String(slides.length).padStart(2,'0')}</span><button onClick={()=>go(current+1)} aria-label="Banner siguiente">→</button></div>}<a href="#colecciones" className={styles.scrollLink}>EXPLORA TU NATURALEZA ↓</a></div>
 </section>;
}
