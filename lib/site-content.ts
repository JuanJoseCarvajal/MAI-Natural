import catalog from './site-text-catalog.json';
import { cache } from 'react';
import { persistentDatabaseEnabled, withPersistentDatabase } from './postgres-store';
export const siteTextCatalog: Record<string, {source:string; text:string}> = catalog;
export async function readSiteContent() {
  if (!persistentDatabaseEnabled()) return [] as Array<{key:string; value:string; revision:number}>;
  return withPersistentDatabase(async client => {
    const result = await client.query('SELECT key, value, revision FROM mai_site_content');
    return result.rows as Array<{key:string; value:string; revision:number}>;
  });
}
export const publicSiteContent = cache(async () => {
  try { return Object.fromEntries((await readSiteContent()).filter(row => Object.hasOwn(siteTextCatalog,row.key)).map(row => [row.key,row.value])); }
  catch { console.error('Contenido editorial no disponible; se muestran textos originales.'); return {}; }
});
export function validateContentChanges(changes: unknown): Array<{key:string; value:string; revision:number}> {
  if (!Array.isArray(changes) || changes.length < 1 || changes.length > 200) throw new Error('Cantidad de cambios inválida');
  const seen = new Set<string>();
  for (const item of changes) {
    if (!item || typeof item.key !== 'string' || !Object.hasOwn(siteTextCatalog,item.key) || seen.has(item.key) || typeof item.value !== 'string' || item.value.length > 12000 || !item.value.trim() || /[<>\u0000]/.test(item.value) || !Number.isSafeInteger(item.revision) || item.revision < 0) throw new Error('Texto inválido: usa texto plano, sin HTML, y máximo 12000 caracteres.');
    seen.add(item.key);
  }
  return changes;
}
export async function writeSiteContent(changes: unknown, actor: string) {
  const valid = validateContentChanges(changes);
  await withPersistentDatabase(async client => {
    for (const item of valid) {
      const previous = await client.query('SELECT value, revision FROM mai_site_content WHERE key=$1 FOR UPDATE', [item.key]);
      if ((previous.rows[0]?.revision ?? 0) !== item.revision) throw new Error('Otra sesión modificó estos textos. Recarga antes de guardar.');
      await client.query(`INSERT INTO mai_site_content (key,value,updated_by) VALUES ($1,$2,$3)
        ON CONFLICT (key) DO UPDATE SET value=excluded.value, updated_by=excluded.updated_by, updated_at=now(), revision=mai_site_content.revision+1`, [item.key,item.value,actor]);
      await client.query('INSERT INTO mai_content_audit (key,previous_value,value,actor) VALUES ($1,$2,$3,$4)', [item.key,previous.rows[0]?.value ?? null,item.value,actor]);
    }
  });
}
