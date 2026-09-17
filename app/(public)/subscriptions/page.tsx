import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import styles from "@/styles/editorial.module.css";

export const metadata = buildMetadata({ title: "Club MAI · Próximamente | MAI Natural", description: "Estamos preparando Club MAI. Mientras tanto, descubre nuestros productos, rutinas y asesorías.", path: "/subscriptions" });

export default function SubscriptionsPage() {
  return <main className={styles.page}><section className={styles.club}><div className={styles.hero}><p className="eyebrow">CLUB MAI / PRÓXIMAMENTE</p><h1>El cuidado también<br /><em>nos reúne.</em></h1><p>Estamos preparando un espacio para seguir compartiendo el universo MAI. Las suscripciones aún no están disponibles.</p><p>Mientras llega ese momento, encuentra tu próximo ritual o descubre nuestras asesorías.</p><div className={styles.links}><Link href="/products" className="mai-button">Explorar productos ↗</Link><Link href="/services" className="text-link">Conocer las asesorías ↗</Link></div></div><div className={styles.clubArt} aria-hidden="true"><span>mai.</span><small>UN MOMENTO PARA TI</small></div></section></main>;
}
