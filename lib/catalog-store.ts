import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import { persistentDatabaseEnabled, withPersistentDatabase, databaseTransaction } from './postgres-store';

type CatalogName = 'products' | 'discounts';
function requireSharedStorage() {
  if (process.env.NODE_ENV === 'production' && !persistentDatabaseEnabled()) {
    throw new Error('El almacenamiento compartido no está configurado. No se guardaron cambios.');
  }
}
export async function readCatalog<T>(name: CatalogName): Promise<T[]> {
  requireSharedStorage();
  if (!persistentDatabaseEnabled()) {
    return JSON.parse(await fs.readFile(path.join(process.cwd(), 'lib', `${name}.catalog.json`), 'utf8'));
  }
  return withPersistentDatabase(async client => {
    const result = await client.query('SELECT items FROM mai_catalogs WHERE name=$1', [name]);
    if (!result.rows[0]) throw new Error('Falta importar el catálogo compartido. Conserva el catálogo actual del servidor antes de desplegar.');
    return result.rows[0].items as T[];
  });
}
export async function writeCatalog<T>(name: CatalogName, items: T[]) {
  requireSharedStorage();
  if (!persistentDatabaseEnabled()) {
    await fs.writeFile(path.join(process.cwd(), 'lib', `${name}.catalog.json`), `${JSON.stringify(items, null, 2)}\n`, 'utf8');
    return;
  }
  await withPersistentDatabase(async client => {
    const result = await client.query('UPDATE mai_catalogs SET items=$2::jsonb, updated_at=now() WHERE name=$1 RETURNING name', [name, JSON.stringify(items)]);
    if (!result.rows.length) throw new Error('El catálogo compartido no está inicializado. No se guardaron cambios.');
  });
}
// Holds the existing cross-instance transaction lock across read, validation and write.
export const catalogTransaction = databaseTransaction;
export function assertCatalogRevision(current: {revision?: number}, expected?: number) {
  if ((current.revision ?? 0) !== (expected ?? 0)) {
    throw new Error('Otra sesión modificó este registro. Conserva tus cambios y recarga la versión actual antes de guardar.');
  }
}
