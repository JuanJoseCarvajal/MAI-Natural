/** Only known, actionable messages may cross the server boundary. */
export function adminSaveError(error: unknown): string {
 const message = error instanceof Error ? error.message : '';
 if (/^(Otra sesión|Ya existe|Producto no encontrado|Descuento no encontrado|La dirección|Para publicar|Escribe un título|Elige una fecha)/.test(message)) return message;
 return 'No se pudo confirmar el guardado. Tus cambios siguen en el editor. Comprueba la conexión e inténtalo de nuevo; si persiste, contacta al administrador.';
}
