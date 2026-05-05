import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";

const workspaceRoot = process.cwd();
const csvPath = path.join(workspaceRoot, "data", "products.csv");
const outPath = path.join(workspaceRoot, "lib", "products.catalog.json");

const csvText = fs.readFileSync(csvPath, "utf8");
const records = parse(csvText, {
  columns: true,
  skip_empty_lines: true,
  relax_quotes: true,
  bom: true,
});

function stripHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&amp;|&quot;|&#39;|\"/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parsePriceToPesos(value) {
  const digits = String(value || "").replace(/[^\d]/g, "");
  if (!digits) return 0;
  const parsed = Number(digits);
  // Some exports come as "74" instead of "74000".
  return parsed > 0 && parsed < 1000 ? parsed * 1000 : parsed;
}

function formatCOP(pesos) {
  return `$${new Intl.NumberFormat("es-CO").format(pesos)}`;
}

function mapCategory(raw) {
  const text = String(raw || "").toLowerCase();
  if (text.includes("facial")) return "facial";
  if (text.includes("capilar")) return "capilar";
  if (text.includes("corporal")) return "corporal";
  return "kits";
}

function cleanDescription(text, fallbackName) {
  const raw = stripHtml(text);
  const isCorrupted = /text-token-text-primary|data-start=|conversation-turn|data-testid|agent-turn/i.test(raw);
  if (!raw || isCorrupted) {
    return `${fallbackName}. Fórmula botánica de MAI Natural.`;
  }

  const firstSentence = raw.split(/(?<=[.!?])\s+/)[0]?.trim() || raw;
  return firstSentence.slice(0, 240);
}

function buildMarketingDescription(name, category, seedDescription) {
  const n = String(name || "").toLowerCase();
  const s = String(seedDescription || "").toLowerCase();

  if (n.includes("suero") || s.includes("bakuchiol")) {
    return "Ilumina tu rostro desde la primera aplicación con una fórmula botánica que hidrata, suaviza y potencia tu glow natural. Agrégalo hoy a tu rutina y siente una piel más viva, fresca y luminosa.";
  }

  if (n.includes("leche nutritiva") && n.includes("noche")) {
    return "Mientras duermes, tu piel se regenera con una mezcla nutritiva de activos botánicos que reconforta y revitaliza. Despierta con el rostro más suave, descansado y visiblemente radiante.";
  }

  if (n.includes("leche nutritiva") && n.includes("día")) {
    return "Empieza cada mañana con hidratación profunda, textura sedosa y un acabado saludable que enamora a primera vista. Tu piel se ve equilibrada, luminosa y lista para el día.";
  }

  if (n.includes("tonico") || n.includes("rocio") || n.includes("agua de rosas")) {
    return "Refresca, equilibra y prepara tu piel con una bruma botánica que se siente como un ritual de bienestar instantáneo. Úsalo a diario y convierte cada aplicación en un momento de autocuidado irresistible.";
  }

  if (n.includes("shampoo") || n.includes("jardin herbal")) {
    return "Limpieza profunda y gentil en un solo paso para un cabello más fuerte, suelto y con brillo natural. Dale a tu melena el cuidado consciente que merece y notarás la diferencia desde el primer lavado.";
  }

  if (n.includes("balsamo") || n.includes("acondicion")) {
    return "Nutre de medios a puntas con una textura cremosa que desenreda, suaviza y devuelve vida al cabello. Tu ritual capilar se vuelve más fácil, más sensorial y mucho más efectivo.";
  }

  if (n.includes("perfume") || n.includes("capilar")) {
    return "Perfuma y protege tu cabello con una bruma botánica que deja una estela elegante, suave y memorable. Llévalo contigo y enamora con cada movimiento.";
  }

  if (n.includes("mousse") || n.includes("limpiador")) {
    return "Purifica sin resecar con una espuma botánica que limpia a profundidad y deja una sensación de piel limpia, cómoda y luminosa. Ideal para convertir tu limpieza diaria en un ritual que sí provoca repetir.";
  }

  if (n.includes("body milk") || category === "corporal") {
    return "Envuelve tu piel en nutrición intensa y suavidad aterciopelada con una fórmula corporal que hidrata y realza su luminosidad. Un mimo diario que se siente y se nota.";
  }

  if (category === "kits") {
    return "Ahorra y simplifica tu rutina con una selección inteligente de productos que se complementan entre sí. Todo lo que necesitas para resultados visibles, en un solo kit listo para enamorarte.";
  }

  return "Descubre una fórmula botánica pensada para transformar tu rutina en una experiencia sensorial, efectiva y consciente. Pruébalo hoy y enamórate de una piel y cabello que se ven tan bien como se sienten.";
}

function makeKit({ id, name, image, productList, discountPct, benefits }) {
  const subtotal = productList.reduce((acc, item) => acc + item.amountInCents, 0);
  const discounted = Math.round((subtotal * (100 - discountPct)) / 100);
  return {
    id,
    image,
    name,
    price: formatCOP(Math.round(discounted / 100)),
    amountInCents: discounted,
    description: `Incluye ${productList.map((p) => p.name).join(" + ")}.`,
    category: "kits",
    badge: `Ahorra ${discountPct}%`,
    benefits,
    rating: 4.9,
    reviewsCount: 48,
  };
}

const result = [];
const seenIds = new Set();

for (const row of records) {
  const published = String(row.Publicado || "") === "1";
  const visibility = String(row["Visibilidad en el catálogo"] || "").toLowerCase();
  const type = String(row.Tipo || "").toLowerCase();

  if (!published || visibility !== "visible") continue;
  if (type !== "simple") continue;

  const name = stripHtml(row.Nombre);
  const image = String(row.Imágenes || "").trim();
  if (!name || !image) continue;

  const sku = String(row.SKU || "").trim();
  const baseId = sku ? slugify(sku) : slugify(name || String(row.ID || ""));
  let id = baseId || String(row.ID || "");
  let suffix = 2;
  while (seenIds.has(id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }
  seenIds.add(id);

  const normalPricePesos = parsePriceToPesos(row["Precio normal"]);
  const seedDescription = cleanDescription(
    row["Descripción corta"] || row.Descripción,
    name
  );
  const shortDescription = buildMarketingDescription(name, mapCategory(row.Categorías), seedDescription);

  result.push({
    id,
    image,
    name,
    price: formatCOP(normalPricePesos),
    amountInCents: normalPricePesos * 100,
    description: shortDescription,
    category: mapCategory(row.Categorías),
    badge: String(row["¿Está destacado?"] || "") === "1" ? "Destacado" : undefined,
    benefits: ["Cosmética natural", "Ingredientes botánicos", "Hecho con intención"],
    rating: 4.8,
    reviewsCount: 32,
  });
}

const byCategory = {
  facial: result.filter((p) => p.category === "facial"),
  capilar: result.filter((p) => p.category === "capilar"),
  corporal: result.filter((p) => p.category === "corporal"),
};

const byId = new Map(result.map((product) => [product.id, product]));

function pickProducts(ids) {
  const products = ids.map((id) => byId.get(id)).filter(Boolean);
  return products.length === ids.length ? products : [];
}

const curatedKitDefinitions = [
  {
    id: "kit-cuidado-corporal-mai",
    name: "Kit Ducha, Piel y Aroma MAI",
    imageId: "co-js-67",
    productIds: ["co-js-67", "fa-lam-120-1", "el-perfume-perfume-capilar"],
    discountPct: 10,
    benefits: ["Limpieza + frescura + aroma", "Mezcla corporal y sensorial", "Ideal para regalo consciente"],
  },
  {
    id: "kit-ritual-facial-mai",
    name: "Kit Glow Facial Diario MAI",
    imageId: "fa-ass-30",
    productIds: ["fa-cam-150", "fa-rpt-70", "fa-ass-30"],
    discountPct: 12,
    benefits: ["Limpieza + tónico + suero", "Ideal para piel sensible", "Rutina facial completa"],
  },
  {
    id: "kit-rutina-capilar-mai",
    name: "Kit Jardín Herbal Capilar MAI",
    imageId: "balsamo-jardin-herbal",
    productIds: ["mnk-001", "balsamo-jardin-herbal", "el-perfume-perfume-capilar"],
    discountPct: 10,
    benefits: ["Limpieza + nutrición + perfume", "Rutina capilar completa", "Brillo y aroma botánico"],
  },
  {
    id: "kit-trio-capilar-esencial-mai",
    name: "Kit Definición Capilar MAI",
    imageId: "ca-hcc-500",
    productIds: ["mnk-001", "balsamo-jardin-herbal", "ca-hcc-500"],
    discountPct: 9,
    benefits: ["Limpieza + nutrición + definición", "Ideal para ondas y rizos", "Control sin rigidez"],
  },
  {
    id: "kit-trio-facial-equilibrio-mai",
    name: "Kit Equilibrio Facial MAI",
    imageId: "fa-lam-120",
    productIds: ["fa-lam-120", "fa-rpt-70-1", "fa-lnd-70"],
    discountPct: 11,
    benefits: ["Limpieza + equilibrio + hidratación", "Pensado para uso diario", "Textura fresca y ligera"],
  },
  {
    id: "kit-trio-corporal-ritual-mai",
    name: "Kit Ritual MAI de Bienestar",
    imageId: "co-js-110-1",
    productIds: ["co-js-110-1", "fa-lam-120-1", "fa-lnn-70"],
    discountPct: 10,
    benefits: ["Limpieza + bruma + nutrición", "Mezcla corporal y facial", "Ideal para cerrar el día"],
  },
];

const kits = curatedKitDefinitions
  .map((kit) => {
    const productList = pickProducts(kit.productIds);
    const imageProduct = byId.get(kit.imageId) || productList[0];
    if (!productList.length || !imageProduct) return null;
    return makeKit({
      id: kit.id,
      name: kit.name,
      image: imageProduct.image,
      productList,
      discountPct: kit.discountPct,
      benefits: kit.benefits,
    });
  })
  .filter(Boolean);

result.push(...kits);

result.sort((a, b) => a.name.localeCompare(b.name, "es"));

fs.writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log(`Catalog generated: ${result.length} products -> ${path.relative(workspaceRoot, outPath)}`);
