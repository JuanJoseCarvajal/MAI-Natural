import pg from 'pg';
if (!process.env.DATABASE_URL || !process.env.ADMIN_EMAIL) throw new Error('Configura DATABASE_URL y ADMIN_EMAIL en el entorno privado. La cuenta debe estar registrada previamente.');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
try {
  await client.connect();
  const result = await client.query(`UPDATE mai_records SET data = data || '{"role":"admin"}'::jsonb WHERE kind = 'user' AND lower(data->>'email') = lower($1) RETURNING id`, [process.env.ADMIN_EMAIL.trim()]);
  if (result.rowCount !== 1) throw new Error('Cuenta no encontrada');
  console.log('Cuenta existente habilitada como administrador. Inicia sesión de nuevo.');
} catch { console.error('No se pudo habilitar la cuenta. Verifica registro, conexión y permisos.'); process.exitCode = 1; }
finally { await client.end(); }
