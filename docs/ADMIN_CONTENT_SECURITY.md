# Backoffice y textos editables

## Acceso

- Entrada: `/admin`; editor: `/admin/content`.
- Cuenta designada: `hola@mainatural.com`. La coincidencia del correo NO concede el rol: se requieren credenciales válidas y rol `admin` persistente.
- Cada acción administrativa verifica la sesión y el usuario actual en PostgreSQL. La indisponibilidad de la base deniega acceso.
- Las sesiones administrativas requieren un login de menos de una hora. Cambiar la contraseña invalida las sesiones antiguas cuando vuelven a consultar el servidor. Las sesiones emitidas antes de esta versión requieren volver a iniciar sesión.
- Registro público bloqueado para el correo reservado. La provisión se ejecuta exclusivamente desde terminal de confianza, nunca desde un endpoint público.
- `node --env-file=.env.local scripts/provision-admin.mjs --confirm-production` crea únicamente una cuenta inexistente y un enlace privado de un solo uso (60 minutos). No ejecutarlo para cuentas existentes, ni publicar su salida en logs de CI. No existe contraseña predeterminada.
- Login: 10 intentos por cuenta cada 15 minutos, persistentes entre réplicas. Recuperación tiene un contador independiente. Consumo de token y cambio de contraseña son transaccionales.
- Los formularios de productos/descuentos validan estructura, importes y URLs en el servidor. El editor acepta solo texto plano; React escapa los valores.

## Publicación

1. Ejecutar `node --env-file=.env.local scripts/migrate-database.mjs` en la base confirmada. Añade las tablas privadas de contenido, auditoría y límites; no borra datos.
2. Configurar en el servidor `DATABASE_DRIVER=postgres`, `DATABASE_URL`, `AUTH_SECRET` y la URL pública de autenticación correcta. No utilizar la URL localhost del entorno de desarrollo en producción.
3. Configurar Resend y remitente verificado para futuras recuperaciones por correo. No se verificó el envío en producción durante esta tarea.
4. Desplegar el código. Una migración de base no publica la interfaz.
5. Entrar en `/admin`, abrir “Textos del sitio”, seleccionar sección, editar y publicar. “Restaurar texto original” prepara el valor por defecto y requiere publicar para aplicarlo.

Los textos están identificados por un catálogo cerrado (`site-text-catalog.json`). Incluye texto JSX, navegación, artículos, colecciones, preguntas frecuentes y datos editoriales de rituales/asesorías. Los cambios se guardan en PostgreSQL, con actor, valor anterior, fecha y control de revisión para evitar sobrescrituras entre sesiones. Publicar invalida el layout del sitio. No se modifican URLs, identificadores, precios, datos personales, mensajes técnicos ni lógica de pago mediante el editor. Los metadatos SEO generales y textos de atributos no son campos de este editor; los títulos/descripciones de artículos sí alimentan sus metadatos. Los productos conservan su editor específico en `/admin/products`.

## Límites de la revisión / tareas operativas pendientes

- No es una certificación ni una auditoría de penetración completa. No se implementó MFA. Para el acceso privilegiado se recomienda una segunda capa de autenticación (IdP o proxy con MFA).
- El límite por cuenta no sustituye protección de tráfico/WAF por IP. Puede ser usado para bloquear temporalmente una cuenta; supervisar y limitar tráfico en el proveedor.
- Productos y descuentos heredados aún se guardan en JSON del servidor: requieren volumen persistente y una sola instancia escritora, o una migración posterior a PostgreSQL. No se migraron ni alteraron productos reales en esta tarea.
- Los cambios de rol heredados no tienen una bitácora completa; la bitácora agregada cubre publicaciones editoriales. Revisar backups, retención, mínimo privilegio de conexión, TLS y registros del proveedor antes de certificar producción.
- Las pruebas funcionales de escritura editorial se ejecutan en PostgreSQL embebido aislado; no se publican textos de prueba en la base de producción. La verificación del editor con una sesión real en el despliegue queda pendiente de publicar el código.

Referencia de autorización por acción: https://nextjs.org/docs/15/app/guides/data-security
