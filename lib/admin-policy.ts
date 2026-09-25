export const ADMIN_EMAIL = 'hola@mainatural.com';
export const ADMIN_SESSION_SECONDS = 60 * 60;
export function isAdministrativeAccount(user: { email?: string | null; role?: string } | null | undefined) {
  return user?.role === 'admin' && user.email?.trim().toLowerCase() === ADMIN_EMAIL;
}
