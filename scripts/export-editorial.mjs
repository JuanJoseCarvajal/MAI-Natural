import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

// Uses original product photography unchanged within an editorial HTML layout.
// MAI_PLAYWRIGHT_MODULE can point at a bundled Playwright installation.
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.MAI_PLAYWRIGHT_MODULE || "playwright");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "docs", "editorial-assets");
const campaigns = JSON.parse(await readFile(join(root, "lib/editorial-campaigns.json"), "utf8"));
const escape = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const logo = `data:image/svg+xml;base64,${(await readFile(join(root, "public/ima/MAI-Logo.svg"))).toString("base64")}`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
const gallery = [];

function layout({ title, body, photo, number, type, cover, campaign }) {
  const story = type === "story";
  const height = story ? 1920 : 1350;
  return `<!doctype html><html lang="es"><meta charset="utf-8"><style>
    *{box-sizing:border-box}body{margin:0;color:#203c32;background:#f6f3eb;font-family:Arial,sans-serif}.canvas{width:1080px;height:${height}px;position:relative;overflow:hidden}
    .photo{position:absolute;object-fit:cover;${cover ? `top:0;left:0;width:1080px;height:${story ? 1080 : 790}px` : `top:0;right:0;width:360px;height:${height}px`}}
    .shade{position:absolute;inset:0;background:${cover ? "linear-gradient(0deg,#f6f3eb 22%,transparent 59%)" : "linear-gradient(90deg,#f6f3eb 64%,transparent 64%)"}}
    .brand{position:absolute;top:${story ? 150 : 48}px;left:60px;display:flex;align-items:center;gap:26px;background:#f6f3ebed;padding:18px 22px}.brand img{width:92px;height:56px;filter:brightness(0) saturate(100%) invert(19%) sepia(12%) saturate(1340%) hue-rotate(105deg) brightness(92%)}.brand span{font-size:16px;letter-spacing:4px;line-height:1.4}
    .content{position:absolute;left:64px;right:${cover ? 64 : 420}px;${cover ? `top:${story ? 1130 : 850}px` : `top:${story ? 590 : 375}px`}}.eyebrow{font-size:17px;letter-spacing:4px;text-transform:uppercase;line-height:1.5;color:#627453;margin-bottom:24px}h1{font:400 ${cover ? 86 : 78}px/1.03 Georgia,serif;letter-spacing:-3px;margin:0 0 32px;overflow-wrap:break-word}p{font-size:27px;line-height:1.55;margin:0;max-width:840px}
    .footer{position:absolute;left:64px;right:64px;bottom:${story ? 200 : 52}px;border-top:1px solid #aebba0;padding-top:24px;display:flex;justify-content:space-between;font-size:16px;letter-spacing:2px}.index{position:absolute;right:48px;top:${story ? 155 : 58}px;background:#f6f3ebeb;padding:16px 20px;font-size:18px;letter-spacing:3px}.ornament{font:400 110px Georgia;line-height:1;color:#7b8b63;margin-bottom:55px}
    </style><div class="canvas"><img class="photo" src="${photo}" alt=""><div class="shade"></div><div class="brand"><img src="${logo}" alt="MAI"><span>DIARIO<br>MAI</span></div><span class="index">${number}</span><div class="content">${!cover ? '<div class="ornament">✳</div>' : ''}<div class="eyebrow">${escape(campaign.category)}</div><h1>${escape(title)}</h1><p>${escape(body)}</p></div><div class="footer"><span>@melina.jza</span><span>VOLVER A TI. ↗</span></div></div></html>`;
}

try {
  await mkdir(output, { recursive: true });
  for (const campaign of campaigns) {
    const folder = join(output, campaign.social.campaignId);
    await mkdir(folder, { recursive: true });
    const photo = `data:image/png;base64,${(await readFile(join(root, "public", campaign.heroImage))).toString("base64")}`;
    const assets = [];
    for (const [index, slide] of campaign.social.slides.entries()) {
      const name = `feed-${String(index + 1).padStart(2, "0")}.jpg`;
      await page.setViewportSize({ width: 1080, height: 1350 });
      await page.setContent(layout({ ...slide, photo, number: `0${index + 1} / 04`, type: "feed", cover: index === 0, campaign }));
      await page.evaluate(() => Promise.all(Array.from(document.images).map(img => img.decode())));
      const collision = await page.evaluate(() => document.querySelector(".content").getBoundingClientRect().bottom > document.querySelector(".footer").getBoundingClientRect().top - 20);
      if (collision) throw new Error(`Text overflow: ${campaign.slug} ${name}`);
      await page.screenshot({ path: join(folder, name), type: "jpeg", quality: 92 });
      assets.push(name);
    }
    for (const [index, story] of campaign.social.stories.entries()) {
      const name = `story-${String(index + 1).padStart(2, "0")}.jpg`;
      // Interactive Instagram stickers are described in copy, never faked in pixels.
      const title = index === 0 ? campaign.promotion.headline : index === 1 ? "Un momento para ti." : "Sigue la historia.";
      const body = index === 2 ? "Descubre la guía completa en el Diario MAI." : story.replace(/ Encuesta:.*/, "");
      await page.setViewportSize({ width: 1080, height: 1920 });
      await page.setContent(layout({ title, body, photo, number: `0${index + 1} / 03`, type: "story", cover: true, campaign }));
      await page.evaluate(() => Promise.all(Array.from(document.images).map(img => img.decode())));
      const collision = await page.evaluate(() => document.querySelector(".content").getBoundingClientRect().bottom > document.querySelector(".footer").getBoundingClientRect().top - 20);
      if (collision) throw new Error(`Text overflow: ${campaign.slug} ${name}`);
      await page.screenshot({ path: join(folder, name), type: "jpeg", quality: 92 });
      assets.push(name);
    }
    const trackingLink = `https://mainatural.com/blog/${campaign.slug}?utm_source=instagram&utm_medium=organic_social&utm_campaign=${campaign.social.campaignId}`;
    await writeFile(join(folder, "publicacion.md"), `# ${campaign.title}\n\nCuenta: @melina.jza\nFecha editorial: ${campaign.publishedAt}\nEstado externo: preparado, no publicado.\nVerificar URL pública antes de subir o decir «enlace en el perfil».\n\n## Caption de Instagram\n\n${campaign.social.caption}\n\n## Link para perfil o sticker\n\n${trackingLink}\n\n## Facebook — opcional, sin cuenta autorizada\n\n${campaign.social.facebookCaption}\n${trackingLink.replace("utm_source=instagram", "utm_source=facebook")}\n\n## Guion de reel (requiere grabación)\n\n${campaign.social.reel.join("\n\n")}\n\n## Stories: stickers e instrucciones\n\n${campaign.social.stories.join("\n\n")}\n\n## Accesibilidad\n\n${campaign.social.slides.map((s,i) => `Foto ${i+1}: ${s.title} ${s.body} Fotografía del producto MAI que acompaña el artículo.`).join("\n\n")}\n`);
    gallery.push(`<section><h2>${escape(campaign.title)}</h2><p>${escape(campaign.publishedAt)} · Preparado, no publicado en Instagram</p><div class="grid">${assets.map(file => `<a href="${campaign.social.campaignId}/${file}"><img src="${campaign.social.campaignId}/${file}" loading="lazy" alt="${escape(file)}"><span>${escape(file)}</span></a>`).join("")}</div><a href="${campaign.social.campaignId}/publicacion.md">Texto, enlaces y guion</a></section>`);
  }
  await writeFile(join(output, "index.html"), `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MAI · Campaña editorial</title><style>body{margin:0;padding:40px 5%;background:#f6f3eb;color:#203c32;font:16px/1.6 Arial,sans-serif}h1,h2{font-family:Georgia,serif;font-weight:400}h1{font-size:52px}section{padding:35px 0;border-top:1px solid #c7cdbd}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:18px;margin:24px 0}img{width:100%;height:260px;object-fit:contain;background:#e5e8db}a{color:inherit}span{display:block;font-size:12px}</style><h1>Un ritual, una historia.</h1><p>Seis entregas · @melina.jza · Feed 1080 × 1350 · Stories 1080 × 1920</p><p>Archivos preparados. La publicación externa y los reels grabados requieren ejecución en la cuenta conectada.</p>${gallery.join("")}</html>`);
  console.log(`Exported ${campaigns.length * 7} images and ${campaigns.length} caption packs to ${output}`);
} finally {
  await browser.close();
}
