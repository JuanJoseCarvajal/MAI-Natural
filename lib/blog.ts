export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  readTime: string;
  heroImage: string;
  keywords: string[];
  sections: Array<{
    heading: string;
    body: string[];
  }>;
  relatedProductCategory?: "facial" | "capilar" | "corporal" | "kits";
};

export const blogPosts: BlogPost[] = [
  {
    slug: "rutina-facial-natural-piel-sensible",
    title: "Rutina facial natural para piel sensible: limpieza, tonico e hidratacion",
    description:
      "Aprende como construir una rutina facial natural para piel sensible con pasos simples, ingredientes botanicos y productos MAI.",
    category: "Cuidado facial",
    publishedAt: "2026-07-02",
    readTime: "5 min",
    heroImage: "/products/Facial/agua-de-rosas-mai-natural.png",
    keywords: ["rutina facial natural", "piel sensible", "cosmetica natural facial"],
    relatedProductCategory: "facial",
    sections: [
      {
        heading: "Por que una rutina corta suele funcionar mejor",
        body: [
          "La piel sensible agradece constancia y pocos pasos. Una rutina con limpieza suave, tonico calmante e hidratacion evita sobrecargar la barrera cutanea y facilita identificar que ingrediente realmente aporta bienestar.",
          "En MAI recomendamos empezar con productos botanicos de uso diario, observar la piel durante una o dos semanas y ajustar segun sensacion de tirantez, brillo o resequedad.",
        ],
      },
      {
        heading: "Paso 1: limpieza sin sensacion agresiva",
        body: [
          "Busca limpiadores que retiren impurezas sin dejar la piel demasiado seca. Si al terminar sientes ardor o tension intensa, la limpieza puede ser mas fuerte de lo que tu piel necesita.",
          "Para rutinas de noche, limpia con calma y evita combinar demasiados exfoliantes en la misma semana.",
        ],
      },
      {
        heading: "Paso 2: tonico botanico para preparar la piel",
        body: [
          "Un tonico facial natural puede aportar frescura y ayudar a que la hidratacion se sienta mas uniforme. Aplicalo con las manos limpias o con un pad suave, sin frotar.",
          "El agua de rosas y los rocios faciales son buenas opciones cuando buscas una sensacion calmante y ligera.",
        ],
      },
      {
        heading: "Paso 3: hidratacion diaria y seguimiento",
        body: [
          "La hidratacion es el paso que sostiene la rutina. Si tu piel cambia por clima, estres o ciclo hormonal, ajusta la cantidad antes de cambiar todos los productos.",
          "El seguimiento personalizado de MAI ayuda a convertir la compra en un proceso: elegimos productos, revisamos respuesta y afinamos la rutina.",
        ],
      },
    ],
  },
  {
    slug: "shampoo-natural-cabello-rizado-colombia",
    title: "Shampoo natural para cabello rizado en Colombia: como elegirlo",
    description:
      "Guia para elegir shampoo natural para cabello rizado, evitar resequedad y complementar con crema para peinar botanica.",
    category: "Cuidado capilar",
    publishedAt: "2026-07-02",
    readTime: "4 min",
    heroImage: "/products/Capilar/shampoo-jardin-herbal-mai-natural.png",
    keywords: ["shampoo natural", "cabello rizado", "cosmetica natural capilar"],
    relatedProductCategory: "capilar",
    sections: [
      {
        heading: "El rizo necesita limpieza y definicion, no peso",
        body: [
          "El cabello rizado suele pedir equilibrio: limpiar cuero cabelludo, mantener suavidad en medios y puntas, y evitar acabados pesados que apaguen la forma natural.",
          "Un shampoo natural puede ser una buena base si lo combinas con acondicionamiento y una crema de peinar adecuada.",
        ],
      },
      {
        heading: "Senales de que tu shampoo no esta ayudando",
        body: [
          "Si el rizo queda aspero, con frizz excesivo o pierde forma al primer dia, revisa la frecuencia de lavado, la cantidad de producto y la hidratacion posterior.",
          "No todo se resuelve cambiando de shampoo; a veces la rutina completa necesita orden.",
        ],
      },
      {
        heading: "Como armar una rutina capilar MAI",
        body: [
          "Empieza con una limpieza botanica, sigue con balsamo si tu cabello pide suavidad y termina con crema para peinar para definir sin endurecer.",
          "La meta es que el cabello se sienta limpio, flexible y con movimiento, no saturado.",
        ],
      },
    ],
  },
  {
    slug: "regalos-cosmetica-natural-artesanal",
    title: "Regalos de cosmetica natural artesanal: ideas para sorprender con bienestar",
    description:
      "Ideas de regalos de cosmetica natural artesanal para cumpleanos, fechas especiales y detalles corporativos con sentido.",
    category: "Regalos conscientes",
    publishedAt: "2026-07-02",
    readTime: "4 min",
    heroImage: "/products/Corporal/crema-corporal-rosas-cacao-mai-natural.png",
    keywords: ["regalos cosmetica natural", "cosmetica artesanal", "regalos bienestar"],
    relatedProductCategory: "corporal",
    sections: [
      {
        heading: "Un regalo de cuidado se usa, se siente y se recuerda",
        body: [
          "La cosmetica natural artesanal funciona muy bien como regalo porque transforma un detalle en ritual. No es solo un producto: es una invitacion a pausar y cuidarse.",
          "Para elegir mejor, piensa en la persona: piel seca, amor por aromas suaves, interes por rutinas simples o gusto por productos corporales.",
        ],
      },
      {
        heading: "Ideas faciles por tipo de persona",
        body: [
          "Para alguien que ama lo facial, elige tonicos, limpiadores o hidratantes. Para quien disfruta duchas largas, jabones y cremas corporales suelen ser aciertos seguros.",
          "Si no sabes por donde empezar, un kit de rutina reduce la decision y aumenta la probabilidad de uso.",
        ],
      },
      {
        heading: "Por que la produccion artesanal importa",
        body: [
          "En MAI cada producto tiene un tiempo de preparacion de 5 a 7 dias habiles. Ese ritmo permite cuidar detalles, frescura y presentacion.",
          "Para fechas especiales conviene comprar con anticipacion y dejar un margen para envio o entrega.",
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
