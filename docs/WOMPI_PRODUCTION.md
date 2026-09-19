# Activar Wompi en Hostinger

El código admite sandbox y producción. No basta cambiar la llave pública: los pedidos necesitan PostgreSQL y las tres credenciales del mismo ambiente. No se han configurado ni verificado los secretos ni la base de Hostinger desde esta implementación.

## Preparar almacenamiento

1. Provisionar PostgreSQL persistente con copias de seguridad. Guardar `DATABASE_URL` exclusivamente en el entorno privado del servidor; usar TLS con verificación de certificado según el proveedor. Nunca incluir credenciales en Git ni desactivar verificación TLS.
2. Con esa variable disponible, ejecutar `pnpm db:migrate` desde el repositorio. La migración es idempotente y no borra tablas.
3. Configurar `DATABASE_DRIVER=postgres` en Hostinger y redesplegar. No hay fallback a memoria si PostgreSQL falla. Reiniciar y comprobar que el pedido de prueba sigue en el backoffice.
4. Registrar la cuenta del administrador en esta base. Ejecutar `node scripts/promote-admin.mjs` con `ADMIN_EMAIL` y `DATABASE_URL` privados; volver a iniciar sesión. No se crean usuarios ni contraseñas predeterminados.

Los registros de la versión antigua estaban en memoria: no se importan automáticamente y se pierden al reiniciar esa versión. Antes del cambio, conservar los pedidos/solicitudes necesarios desde el backoffice y reconciliar las operaciones existentes. El catálogo y los descuentos siguen usando su almacenamiento actual; esta migración cubre usuarios, tokens de recuperación, pedidos y asesorías.

## Configurar cobros reales

En Hostinger:

- `WOMPI_MODE=production`
- `WOMPI_PRODUCTION_ENABLED=false` durante preparación.
- `WOMPI_SANDBOX_ENABLED=false`
- `WOMPI_PUBLIC_KEY`: llave con prefijo `pub_prod_`.
- `WOMPI_INTEGRITY_SECRET`: secreto con prefijo `prod_integrity_`.
- `WOMPI_EVENTS_SECRET`: secreto con prefijo `prod_events_`.
- `NEXT_PUBLIC_APP_URL=https://mainatural.com` y `NEXTAUTH_URL=https://mainatural.com`.
- `DATABASE_DRIVER=postgres` y `DATABASE_URL` de la base migrada.

En Wompi producción, registrar `https://mainatural.com/api/webhooks/wompi/production`. Sandbox conserva `/api/webhooks/wompi`; cada endpoint rechaza el ambiente incorrecto. El estado y la referencia se consultan de nuevo en el API oficial antes de registrar pagos. Los callbacks se siguen procesando al poner `WOMPI_PRODUCTION_ENABLED=false`, mientras las credenciales, modo y base sigan configurados.

Tras verificar almacenamiento, cuenta de administrador, credenciales y URL de eventos, poner `WOMPI_PRODUCTION_ENABLED=true` y redesplegar. `/api/payments/wompi/status` debe devolver `available: true, mode: production`. Esto comprueba configuración y acceso al esquema, **no demuestra por sí solo que un cobro real o el webhook funcionen**.

## Operación y validación final

- Productos: el cliente solicita el pedido; el administrador confirma disponibilidad y guarda envío en «Revisar y gestionar pedido». Comparte el enlace del pedido. El cliente ve subtotal, envío y total; al aceptar se bloquea la cotización. El navegador nunca fija el importe.
- Asesorías: el importe viene del servidor. El pago queda registrado aparte; el equipo confirma el horario. Un pago tardío no reserva automáticamente un horario ocupado.
- Confirmar un pago Wompi desde un selector manual no está permitido. Usar la consulta del proveedor en el backoffice cuando sea necesaria la reconciliación de un pedido.
- Verificar una compra real autorizada por el titular: resultado en Wompi, evento recibido, pedido confirmado en backoffice y conservación tras reinicio. No realizar cargos de prueba reales sin acuerdo del titular. Las pruebas automatizadas no realizan cargos.
- Si un pago queda pendiente, falla o requiere otro intento, consultar su referencia con el equipo antes de generar otro pedido. No se generan automáticamente nuevas referencias ni reembolsos.
- Los eventos repetidos no duplican registros; una aprobación no se degrada con eventos atrasados. Pagos de pedidos cancelados quedan `paid_needs_review` y no habilitan despacho.

## Verificación de desarrollo

`pnpm test:run` incluye PostgreSQL embebido (PGlite) con reapertura del almacenamiento, rollback, exclusión de reservas concurrentes, aceptación de cotización, importe del servidor y eventos de producción simulados. El cliente de red `pg` está simulado en esa suite; TLS, conectividad y comportamiento entre procesos deben verificarse contra la base de Hostinger antes de activar cobros.

Fuente: [ambientes y llaves](https://docs.wompi.co/docs/colombia/ambientes-y-llaves/) y [eventos](https://docs.wompi.co/docs/colombia/eventos/).

## Supabase conectado desde Hostinger

La integración usa `pg` y la conexión PostgreSQL del servidor. No necesita `@supabase/supabase-js` ni el `db.js` genérico del panel. Las variables de API Supabase agregadas automáticamente por Hostinger no sustituyen `DATABASE_URL`.

1. En Supabase, abrir **Connect → Session pooler** y copiar la URI PostgreSQL (puerto 5432, compatible con IPv4). Sustituir el marcador de contraseña por la contraseña de la base; codificar caracteres especiales de la contraseña para URI.
2. Guardar esa URI como `DATABASE_URL` privada en Hostinger. Usar TLS con verificación del certificado según la configuración de Supabase.
3. En **SQL Editor → New query**, ejecutar todo `migrations/001-persistent-records.sql` con el rol `postgres`. Es equivalente a `pnpm db:migrate`; no es necesario ejecutar ambos. Incluye RLS y revoca acceso de `anon`/`authenticated` a las tablas privadas.
4. Solo después de crear las tablas, configurar `DATABASE_DRIVER=postgres` y redesplegar. Mantener `WOMPI_PRODUCTION_ENABLED=false` hasta verificar la conexión y configurar Wompi.

Referencia: https://supabase.com/docs/guides/database/connecting-to-postgres
