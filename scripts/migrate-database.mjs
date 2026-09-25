import { readFile } from 'node:fs/promises';
import pg from 'pg';
if (!process.env.DATABASE_URL) throw new Error('Configura DATABASE_URL en el entorno privado antes de migrar.');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
try {
  await client.connect();
  await client.query(await readFile(new URL('../migrations/001-persistent-records.sql', import.meta.url), 'utf8'));
  await client.query(await readFile(new URL('../migrations/002-admin-content.sql', import.meta.url), 'utf8'));
  console.log('Esquema MAI v2 listo. No se importaron datos del almacenamiento temporal.');
} catch { console.error('No se pudo migrar la base de datos. Revisa conexión, TLS y permisos.'); process.exitCode = 1; }
finally { await client.end(); }
