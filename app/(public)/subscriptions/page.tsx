import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import styles from "./subscriptions.module.css";

export const metadata = buildMetadata({ title: "Círculo MAI · Un espacio para profundizar", description: "Conoce la propuesta de estudio quincenal con Melina: belleza, cosmética y autoformulación. Inscripciones en preparación; empieza por un encuentro personal.", path: "/subscriptions" });

export default function SubscriptionsPage() {
  return <div className={styles.page}>
    <section className={styles.hero}>
      <div><p className="eyebrow">CÍRCULO MAI · EN PREPARACIÓN</p><h1>Hay preguntas<br />que merecen<br /><em>más de un encuentro.</em></h1><p>Lo que empieza con una conversación puede convertirse en una nueva manera de mirarte. Un espacio para estudiar, compartir y darle continuidad a tus preguntas junto a Melina.</p><Link className="mai-button" href="/services#tu-encuentro">Empezar por mi encuentro ↗</Link><a className={styles.secondary} href="#el-circulo">Descubrir el Círculo ↓</a><small>El encuentro inicial es independiente. No te suscribe ni activa cobros recurrentes.</small></div>
      <div className={styles.art}><div aria-hidden="true">✳</div><p>Escuchar.<br />Preguntar.<br /><em>Volver a ti.</em></p><span>UNA EXPLORACIÓN COMPARTIDA</span></div>
    </section>
    <section id="el-circulo" className={styles.details}><p className="eyebrow">LA PROPUESTA QUE ESTAMOS PREPARANDO</p><h2>El cuidado como<br /><em>punto de partida.</em></h2><div className={styles.grid}>
      <article><span>01 / EL RITMO</span><h3>Encontrarnos cada quince días</h3><p>Grupos de estudio quincenales para dar espacio a las preguntas y volver a ellas con nuevas perspectivas.</p></article>
      <article><span>02 / LA MIRADA</span><h3>Belleza y algo más</h3><p>Cosmética, hábitos y autoformulación: explorar cómo te nombras, qué eliges y cómo participas en tu propia realidad.</p></article>
      <article><span>03 / TU DECISIÓN</span><h3>Continuar con intención</h3><p>Conocer el enfoque de Melina en un encuentro personal y decidir después si quieres profundizar en grupo.</p></article>
    </div></section>
    <section className={styles.invitation}><div><p className="eyebrow">A TU RITMO</p><h2>Primero, una conversación.<br /><em>El siguiente paso lo eliges tú.</em></h2><p>Melina Jimenez Isaza, creadora de MAI, acompaña este recorrido desde su experiencia cosmética y su mirada de exploración personal.</p></div><div className={styles.status}><strong>Inscripciones aún no abiertas</strong><p>Publicaremos precio, modalidad, calendario y condiciones de renovación y cancelación antes de ofrecer una membresía. Hoy no se reciben pagos ni altas al Círculo.</p><Link href="/services#tu-encuentro" className="mai-button">Conocer mi primer encuentro ↗</Link><Link href="/blog" className={styles.secondary}>Mientras tanto, explorar el Diario MAI →</Link></div></section>
    <section className={styles.faq}><h2>Antes de dar<br /><em>el siguiente paso.</em></h2><div>{[
      ["¿Ya puedo suscribirme?", "Aún no. Estamos preparando la propuesta y sus condiciones. No hay planes disponibles para contratar ni cobros de membresía habilitados."],
      ["¿El encuentro con Melina me inscribe?", "No. Es una asesoría individual con su propio valor y alcance, visibles antes de solicitarla. Si te interesa la continuidad puedes conversarlo con Melina, sin compromiso de suscripción."],
      ["¿Incluye productos o descuentos?", "No hay beneficios comerciales confirmados para el Círculo. Los productos y las asesorías se consultan por separado; no necesitas comprar una membresía para acceder al catálogo."],
      ["¿Cómo podré renovar o cancelar?", "Las condiciones y el mecanismo de cancelación se comunicarán antes de abrir inscripciones. Esta página no crea una membresía ni autoriza renovaciones."],
      ["¿Qué tipo de acompañamiento propone?", "Estudio sobre belleza, cosmética y exploración personal. No sustituye atención médica ni psicoterapia. Puedes conocer el enfoque de Melina en la página de Asesorías."],
    ].map(([question,answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>
  </div>;
}
