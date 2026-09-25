import { createHash } from 'node:crypto';
import { persistentDatabaseEnabled, withPersistentDatabase } from './postgres-store';

// Shared by all server instances; stores neither raw email nor IP.
export async function consumeLoginAttempt(email: string) {
  if (!persistentDatabaseEnabled()) {
    if (process.env.NODE_ENV === 'production') throw new Error('Autenticación persistente requerida');
    return;
  }
  const key = createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
  const allowed = await withPersistentDatabase(async client => {
    const result = await client.query(`INSERT INTO mai_login_limits (key, attempts, expires_at)
      VALUES ($1, 1, now() + interval '15 minutes')
      ON CONFLICT (key) DO UPDATE SET
        attempts = CASE WHEN mai_login_limits.expires_at <= now() THEN 1 ELSE mai_login_limits.attempts + 1 END,
        expires_at = CASE WHEN mai_login_limits.expires_at <= now() THEN now() + interval '15 minutes' ELSE mai_login_limits.expires_at END
      RETURNING attempts`, [key]);
    return result.rows[0].attempts <= 10;
  });
  if (!allowed) throw new Error('Inténtalo más tarde');
}
