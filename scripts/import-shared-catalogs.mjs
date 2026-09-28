import { readFile } from 'node:fs/promises';
import pg from 'pg';
// Explicit paths must point to backups of the LIVE catalogs, not a fresh Git checkout.
const [productsPath, discountsPath] = process.argv.slice(2);
if (!productsPath || !discountsPath || !process.env.DATABASE_URL) {
  throw new Error('Uso: node scripts/import-shared-catalogs.mjs /backup/products.catalog.json /backup/discounts.catalog.json (DATABASE_URL requerida).');
}
const catalogs = await Promise.all([productsPath, discountsPath].map(async file => {
  const items = JSON.parse(await readFile(file, 'utf8'));
  if (!Array.isArray(items) || items.some(item => !item || typeof item.id !== 'string') || new Set(items.map(item => item.id)).size !== items.length) throw new Error('Catálogo inválido. No se importaron datos.');
  return items.map(item => ({...item, revision: Number.isSafeInteger(item.revision) && item.revision >= 0 ? item.revision : 0}));
}));
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  await client.query('BEGIN');
  await client.query('SELECT pg_advisory_xact_lock(73401921)');
  for (const [i, name] of ['products', 'discounts'].entries()) {
    const result = await client.query('INSERT INTO mai_catalogs (name,items) VALUES ($1,$2::jsonb) ON CONFLICT DO NOTHING RETURNING name', [name, JSON.stringify(catalogs[i])]);
    console.log(`${name}: ${result.rows.length ? `${catalogs[i].length} registros importados` : 'ya existe; se conserva sin sobrescribir'}`);
  }
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  console.error('Importación cancelada. Comprueba esquema, archivos y conexión; no se sobrescribieron catálogos existentes.');
  process.exitCode = 1;
} finally { await client.end(); }
