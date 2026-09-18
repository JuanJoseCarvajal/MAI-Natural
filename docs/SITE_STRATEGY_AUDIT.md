# MAI: estrategia unificada, SEO y seguridad

Revisión del 18 de septiembre de 2026. Alcance: repositorio y servidor local; no constituye un pentest externo ni una medición de posiciones en Google.

## Un único recorrido

MAI Natural es la marca de cosmética natural colombiana. El Diario MAI ayuda a conocer y elegir; la tienda y las rutinas permiten comparar; Asesorías ofrece escucha individual con Melina Jimenez Isaza; Círculo MAI presenta la continuidad quincenal todavía en preparación. Las páginas deben dar un siguiente paso concreto sin forzar la compra o prometer resultados clínicos.

| Página | Intención de búsqueda / propósito | Siguiente paso |
| --- | --- | --- |
| Inicio | Marca y cosmética natural colombiana | Productos o ritual |
| Tienda | Cosmética facial, capilar y corporal en Colombia | Ficha específica |
| Ficha | Nombre real del producto y tipo de cuidado | Carrito, preguntas o rutina |
| Rutinas | Elegir cuidado facial/capilar/corporal | Productos seleccionados |
| Diario y artículos | Preguntas concretas sobre elección y uso documentado | Productos relacionados o asesoría |
| Asesorías | Asesoría personalizada con Melina | Solicitud de encuentro |
| Círculo MAI | Estudio quincenal y continuidad | Conocer el encuentro individual |
| Información de compra | Envío, pago pendiente y contacto | Resolver una duda |
| Cuenta, acceso, administración y pago | Operación privada/transaccional | Fuera del índice de búsqueda |

No se crean páginas repetidas para variantes de palabras clave. Las URLs filtradas del catálogo comparten canonical con la colección principal. Se conservan los artículos fechados y el sitemap dinámico; los borradores futuros no son páginas indexables. La navegación incluye Círculo MAI y usa los mismos nombres que el footer y el contenido.

## Cambios aplicados

- Metadatos públicos y URLs canónicas revisados; acentos y denominación Diario MAI corregidos. Añadidos datos estructurados Organization/WebSite a la portada, sin inventar perfiles, reseñas o certificaciones.
- Cuenta, autenticación, administración y checkout tienen noindex; cabecera X-Robots-Tag también para rutas transaccionales y API. Robots.txt no se considera una medida de autorización.
- Un solo landmark principal por página; el carrito cerrado deja de estar disponible para teclado y lectores de pantalla. La versión móvil se verifica por ruta.
- Unificada la información de envío: cotización y aceptación del total antes de transferir. No se anuncia una tarifa que el checkout no calcula.
- Eliminado el administrador demo con contraseña conocida. La provisión de administradores requiere un procedimiento legítimo con almacenamiento persistente; no se inventó una nueva contraseña.
- Acceso al grupo de cuenta verificado en servidor además del middleware. Listado y cancelación de citas comprueban identidad de cuenta, no coincidencia de un correo sin verificar. Las citas de invitado no se atribuyen retroactivamente a una cuenta que registre ese correo.
- Registro no toma control de usuarios existentes sin contraseña. No se envían hashes de contraseña en listados administrativos ni se imprimen enlaces de recuperación en logs.
- Webhook Calendly antiguo cerrado (503), pues carecía de validación e idempotencia fiables. El wizard propio sigue disponible; reactivar Calendly exige integración autenticada y persistente.
- API del Círculo rechaza altas y sus antiguas pantallas redirigen a la propuesta; no se simulan membresías o correos.
- Cabeceras nosniff, anti-iframe, referrer y permisos restrictivos. CSP parcial para frame-ancestors, object-src y base-uri; no se presenta como una CSP completa contra XSS.
- Actualización incremental a Next.js 15.5.25, Auth.js beta.32 y React 19; parámetros de rutas migrados a async y tipos actualizados. Versiones transitivas corregidas fijadas en pnpm. Runtime declarado Node 22–24; pruebas ejecutadas en Node 24.

## Verificación y límites

- Compilación de producción con TypeScript y ESLint; pruebas unitarias y scripts de navegador `verify-site.mjs`, `verify-consultation.mjs`, `verify-subscriptions.mjs` y `verify-editorial.mjs`.
- Auditoría `pnpm audit --prod`: 44 avisos al inicio (5 críticos) y cero avisos conocidos tras actualizar. No significa ausencia de vulnerabilidades de lógica o cobertura de dependencias de desarrollo.
- Las páginas administrativas se revisan en código y para rechazo de visitantes sin sesión; no se ejercitan operaciones administrativas reales ni se crean cuentas privilegiadas para esta auditoría.
- No hay datos de Search Console, Core Web Vitals de usuarios reales ni analítica de conversión disponibles para afirmar mejoras cuantificadas. No se promete posicionamiento.

## Pendientes reales antes de operar a escala

1. Usuarios, citas, pedidos y recuperación de contraseña siguen en memoria: requieren base persistente, migración, copias de seguridad y transacciones. Catálogo y descuentos se guardan en JSON local; la edición en despliegues efímeros no es durable.
2. Configurar verificación de correo y controles distribuidos contra abuso en registro, login, recuperación y formularios. La autorización por ID evita exponer citas ajenas por coincidencia de correo, pero no equivale a verificar identidad de correo.
3. Validar correo transaccional, recepción por el equipo y flujo de atención en el dominio real. No se han enviado mensajes reales en estas pruebas.
4. Mantener pagos en vivo y membresías cerrados hasta contar con persistencia, verificación de eventos, idempotencia, cancelación y condiciones confirmadas. Las pruebas sandbox no confirman pagos reales.
5. Revisar configuración del hosting, HTTPS, secretos y rotación de sesiones tras retirar la cuenta demo. No se inspeccionaron secretos ni se alteró producción.
6. Tras el despliegue autorizado, enviar sitemap en Search Console y registrar cobertura, consultas, clics a productos y solicitudes verificadas. Evaluar rendimiento móvil con datos reales antes de afirmar mejoras.

## Fuentes primarias

- Google: https://developers.google.com/search/docs/crawling-indexing/control-what-you-share
- Google: https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
- Next.js: https://nextjs.org/docs/app/guides/upgrading/version-15
- Avisos de seguridad de Next.js: https://github.com/vercel/next.js/security/advisories

Las recomendaciones de indexación distinguen canonical, noindex y protección de acceso. Las versiones instaladas y sus avisos se comprobaron contra el registro de paquetes durante la revisión.

## Resultado ejecutado

- 61 rutas verificadas en navegador: páginas públicas, 24 productos, artículos publicados y rutas privadas que redirigen al acceso. H1 único, main único, canonical/noindex, cabeceras y ancho móvil comprobados.
- 48 pruebas unitarias aprobadas. Compilación de producción con comprobación TypeScript y ESLint aprobada.
- Recorridos de asesoría (incluye solicitud ficticia local), Círculo cerrado y carrusel/Diario aprobados tras migrar Next/React. El carrito y checkout se prueban sin enviar pedidos válidos ni correos.
- Corregido enlace del checkout a información sobre uso de datos: sección `terms#privacidad` y etiqueta ajustada para no presentarla como una política legal completa revisada.
- No se desplegó ni se subieron estos cambios al remoto. La auditoría de dependencias corresponde al 18 de septiembre de 2026 y al lockfile de esta revisión.
