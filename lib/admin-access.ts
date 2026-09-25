import { auth } from './auth';
import { db } from './db';
import { isAdministrativeAccount } from './admin-policy';
import { persistentDatabaseEnabled } from './postgres-store';

export async function requireAdmin() {
  const session = await auth();
  if (!persistentDatabaseEnabled() || !session?.user?.id || !isAdministrativeAccount(session.user)) throw new Error('No autorizado');
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!isAdministrativeAccount(user)) throw new Error('No autorizado');
  return { id: user!.id, email: user!.email };
}
