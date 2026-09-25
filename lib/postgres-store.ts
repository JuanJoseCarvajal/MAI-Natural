import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { appointmentsOverlap, holdsAppointmentSlot } from './consultation';
import type { Appointment } from './db';

let pool: Pool | undefined;
const transactions = new AsyncLocalStorage<PoolClient>();
export const persistentDatabaseEnabled = () => process.env.DATABASE_DRIVER === 'postgres';
function getPool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL requerida');
  if (pool) return pool;
  pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000, statement_timeout: 10000 });
  pool.on("error", () => console.error("Conexión PostgreSQL interrumpida; se requiere reconexión."));
  return pool;
}
export async function databaseReady() {
  if (!persistentDatabaseEnabled()) return false;
  try {
    const result = await getPool().query("SELECT version FROM mai_schema WHERE version = 1");
    return result.rowCount === 1;
  } catch { return false; }
}
export async function withPersistentDatabase<T>(operation: (client: PoolClient) => Promise<T>): Promise<T> {
  if (!persistentDatabaseEnabled()) throw new Error('Se requiere PostgreSQL persistente');
  return databaseTransaction(() => operation(transactions.getStore()!));
}
export async function databaseTransaction<T>(operation: () => Promise<T>): Promise<T> {
  if (!persistentDatabaseEnabled() || transactions.getStore()) return operation();
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    // Serialize short business mutations across all application instances.
    await client.query('SELECT pg_advisory_xact_lock(73401921)');
    const result = await transactions.run(client, operation);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}
const dateFields = ['createdAt', 'updatedAt', 'expiresAt', 'usedAt', 'proofSubmittedAt'];
function hydrate(data: Record<string, any>) {
  for (const field of dateFields) if (data[field]) data[field] = new Date(data[field]);
  return data;
}
export async function postgresOperation(kind: string, operation: string, args: any = {}): Promise<any> {
  return databaseTransaction(async () => {
    const client = transactions.getStore()!;
    const entries = Object.entries(args.where ?? {}).filter(([, value]) => value !== undefined);
    const join = kind === 'user' || operation === 'deleteMany' ? ' OR ' : ' AND ';
    const conditions = entries.map(([key], index) => key === 'email' && kind === 'user' ? `lower(data->>$${index * 2 + 2}) = lower($${index * 2 + 3})` : `data->>$${index * 2 + 2} = $${index * 2 + 3}`);
    const params = [kind, ...entries.flatMap(([key, value]) => [key, String(value)])];
    const where = `kind = $1${conditions.length ? ` AND (${conditions.join(join)})` : ''}`;
    if (operation === 'findUnique' && !entries.length) return null;
    if (operation === 'findUnique' || operation === 'findMany') {
      const result = await client.query(`SELECT data FROM mai_records WHERE ${where} ORDER BY id`, params);
      const records = result.rows.map(row => hydrate(row.data));
      return operation === 'findUnique' ? records[0] ?? null : records;
    }
    if (operation === 'delete' || operation === 'deleteMany') {
      if (!entries.length) throw new Error('Filtro requerido');
      const result = await client.query(`DELETE FROM mai_records WHERE ${where}`, params);
      return operation === 'delete' ? { id: args.where.id } : { count: result.rowCount };
    }
    const now = new Date();
    if (operation === 'create' || operation === 'createIfAvailable') {
      if (operation === 'createIfAvailable') {
        const active = (await postgresOperation(kind, 'findMany', { where: { date: args.data.date } }) as Appointment[]).filter(holdsAppointmentSlot);
        if (active.length >= 2) throw new Error('Este día ya alcanzó el máximo de 2 citas disponibles.');
        if (active.some(item => appointmentsOverlap(args.data.date, args.data.time, args.data.service, item))) throw new Error('Ese horario acaba de ocuparse. Elige otro momento.');
      }
      const defaults = kind === 'user' ? { role: 'user' } : kind === 'order' ? { status: 'pending_confirmation', paymentStatus: 'pending_confirmation', shippingStatus: 'pending_confirmation' } : kind === 'passwordResetToken' ? { usedAt: null } : {};
      const record = { ...defaults, ...args.data, id: randomUUID(), createdAt: now, ...(kind !== 'passwordResetToken' ? { updatedAt: now } : {}) };
      await client.query('INSERT INTO mai_records (kind, id, data) VALUES ($1, $2, $3::jsonb)', [kind, record.id, JSON.stringify(record)]);
      return record;
    }
    if (operation === 'update') {
      if (!entries.length) throw new Error('Filtro requerido');
      const patch = { ...args.data, updatedAt: now };
      delete patch.id;
      delete patch.createdAt;
      const result = await client.query(`UPDATE mai_records SET data = data || $${params.length + 1}::jsonb WHERE ${where} RETURNING data`, [...params, JSON.stringify(patch)]);
      return result.rows[0] ? hydrate(result.rows[0].data) : null;
    }
    throw new Error('Operación de base de datos no soportada');
  });
}
