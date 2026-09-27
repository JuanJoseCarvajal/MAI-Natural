# Registro de ejecución editorial MAI

Fecha de preparación: 16 de septiembre de 2026, America/Bogota.

| Campaña | Blog local | Instagram | Evidencia externa |
| --- | --- | --- | --- |
| mai-ritual-01-rosas | Disponible | Aplazado por el usuario | Sin publicación ni permalink |
| mai-ritual-02-jardin | Fecha futura: 1 octubre | Preparado | Sin publicación ni permalink |
| mai-ritual-03-limpieza | Fecha futura: 16 octubre | Preparado | Sin publicación ni permalink |
| mai-ritual-04-corporal | Fecha futura: 31 octubre | Preparado | Sin publicación ni permalink |
| mai-ritual-05-regalos | Fecha futura: 15 noviembre | Preparado | Sin publicación ni permalink |
| mai-ritual-06-esencial | Fecha futura: 30 noviembre | Preparado | Sin publicación ni permalink |

## Hechos verificados

- La cuenta indicada inicialmente fue @melina.jza. Después el usuario solicitó hacer todo para la web e integrar redes más adelante. Se cerró la ventana de comprobación sin iniciar sesión ni publicar.
- Se generaron 42 JPG y seis paquetes de textos/guiones en `docs/editorial-assets`.
- No se cambió el enlace del perfil ni se publicó contenido externo.
- La nueva versión se está sirviendo localmente en http://127.0.0.1:3000. No se ha desplegado esta campaña en mainatural.com.
- Los guiones de reels están redactados; los vídeos no están grabados ni renderizados.
- Automatización creada y activa: diario-mai-calendario-quincenal. Revisión diaria a las 09:00 de Colombia, entregas editoriales cada quince días, alcance exclusivamente web.

Registrar cada futura acción con fecha real, campaña, pieza, estado y URL verificable. No reemplazar un bloqueo sin comprobarlo.

## Validación de la versión web — 17 septiembre 2026

- 39 pruebas automatizadas aprobadas, incluidas cinco de programación y selección editorial.
- TypeScript sin errores; revisión de ESLint sin advertencias ni errores.
- Navegador: portada 200, navegación anterior/siguiente, selección directa, pausa desde el primer clic, reproducción automática y pausa por foco.
- Vista móvil de 390 px sin desbordamiento horizontal, controles accesibles y movimiento reducido respetado. El botón flotante de WhatsApp se oculta mientras la portada está visible en móvil para no taparlos.
- Primera guía accesible y enlazada a sus productos. Entrega futura devuelve 404 y no aparece en sitemap.
- Sin errores de ejecución en el navegador durante el recorrido comprobado.

## Revisión del calendario — 18 septiembre 2026

- Fecha de referencia del heartbeat: 18 septiembre, 09:06 America/Bogota. Comprobación ejecutada localmente el mismo día; no constituye verificación HTTP de producción.
- Leídos estrategia, registro y las seis campañas del JSON. No corresponde una nueva entrega: continúa vigente `mai-ritual-01-rosas`; la siguiente es `mai-ritual-02-jardin`, el 1 de octubre a las 09:00 de Colombia.
- Ejecutado `pnpm exec vitest run lib/editorial.test.ts`: cinco pruebas aprobadas sobre fechas, orden del carrusel, exclusión de productos no disponibles, cadencia y referencias de productos/imágenes.
- No se modificaron fechas ni contenidos, no se desplegó y no se publicaron redes sociales. No se comprobó disponibilidad pública en esta revisión sin nueva entrega.

## Revisión del calendario — 20 septiembre 2026

- Referencia: 20 septiembre, 09:01 America/Bogota; comprobación local ejecutada a las 09:02. Leídos estrategia, registro y calendario de seis campañas.
- No corresponde una nueva entrega. Sigue vigente `mai-ritual-01-rosas`; la siguiente está prevista para el 1 de octubre a las 09:00, sin adelantar fechas.
- Ejecutado `pnpm exec vitest run lib/editorial.test.ts`: cinco pruebas aprobadas sobre programación, carrusel y referencias de productos/imágenes.
- Esta revisión no comprueba el servidor local ni producción por HTTP y no acredita publicación pública. No se modificaron campañas, no se desplegó ni se publicaron redes sociales. No hay novedades accionables que notificar.

## Revisión del calendario — 21 septiembre 2026

- Referencia: 21 septiembre, 09:00 America/Bogota. Leídos estrategia, registro y las seis campañas; solo la primera cumple `publishedAt` a esta fecha.
- No corresponde nueva entrega. Continúa `mai-ritual-01-rosas`; próxima entrega: 1 de octubre a las 09:00 de Colombia.
- Ejecutado `pnpm exec vitest run lib/editorial.test.ts`: cinco pruebas aprobadas sobre programación, selección del carrusel y referencias de productos/imágenes.
- Verificación de archivos y pruebas locales, sin comprobación HTTP del servidor local ni producción. No acredita publicación pública. Sin cambios de fechas o contenidos, despliegues ni actividad en redes. Sin novedades accionables.

## Revisión del calendario — 22 septiembre 2026

- Heartbeat previsto a las 09:00; comprobación local ejecutada a las 09:16 America/Bogota. Leídos estrategia, registro y las seis campañas del calendario.
- No corresponde nueva entrega: continúa `mai-ritual-01-rosas`. La próxima es el 1 de octubre a las 09:00 de Colombia; no se adelantaron fechas.
- Ejecutado `pnpm exec vitest run lib/editorial.test.ts`: cinco pruebas aprobadas de programación, selección del carrusel y referencias de productos/imágenes.
- Verificación local de archivos y pruebas, sin comprobación HTTP de servidor local o producción; no acredita publicación pública. No se modificaron contenidos, no se desplegó ni se publicaron redes sociales. Sin novedades accionables.

## Revisión del calendario — heartbeat del 23 septiembre 2026

- Se evaluaron las seis campañas con la referencia del heartbeat `2026-09-23T14:07:36.436Z`. No corresponde nueva entrega: continúa `mai-ritual-01-rosas`; próxima entrega el 1 de octubre a las 09:00 de Colombia.
- Leídos estrategia, registro y calendario. Ejecutado `pnpm exec vitest run lib/editorial.test.ts`: cinco pruebas aprobadas. Registro añadido el 24 de septiembre tras actualizarse la fecha de la sesión; no se atribuye la ejecución a la hora programada.
- Verificación local de archivos y pruebas, sin comprobación HTTP de servidor local o producción. No acredita publicación pública. Sin cambios de fechas o contenidos, despliegues ni actividad en redes. Sin novedades accionables.

## Revisión del calendario — 24 septiembre 2026

- Referencia del heartbeat: `2026-09-24T22:14:21.746Z` (17:14 Colombia). Pruebas ejecutadas con hora local de consola 18:44; no se atribuye esta comprobación a las 09:00 programadas.
- Leídos estrategia, registro y las seis campañas. No corresponde nueva entrega: sigue vigente `mai-ritual-01-rosas`; próxima entrega el 1 de octubre a las 09:00 de Colombia.
- Ejecutado `pnpm exec vitest run lib/editorial.test.ts`: cinco pruebas aprobadas sobre programación, carrusel y referencias de productos/imágenes.
- Verificación local de archivos y pruebas, sin comprobación HTTP del servidor local ni de producción; no acredita publicación pública. Sin cambios de fechas o contenidos, despliegues ni actividad en redes. Sin novedades accionables.

## Revisión del calendario — 25 septiembre 2026

- Referencia del heartbeat: `2026-09-25T14:18:24.861Z` (09:18 Colombia); pruebas ejecutadas con hora de consola 11:01. No se atribuye la ejecución a las 09:00 programadas.
- Leídos estrategia, registro y calendario. No corresponde nueva entrega: continúa `mai-ritual-01-rosas`; próxima entrega el 1 de octubre a las 09:00 de Colombia.
- El JSON actual contiene referencias de productos actualizadas respecto de los registros anteriores, incluidas `fa-lnd-70`, `acondicionador-leave-in`, `espuma-lavanda-ortiga` y `crema-corporal`. Esta revisión no las modificó ni adelantó fechas.
- Ejecutado `pnpm exec vitest run lib/editorial.test.ts`: cinco pruebas aprobadas sobre programación, carrusel y referencias de productos/imágenes.
- Verificación local de archivos y pruebas, sin comprobación HTTP del servidor local ni de producción; no acredita publicación pública. No se desplegó ni se publicaron redes sociales. Sin nueva entrega ni fallos detectados en estas comprobaciones.

## Revisión del calendario — heartbeat del 26 septiembre 2026

- Evaluadas las seis campañas con la referencia `2026-09-26T14:14:08.196Z` (09:14 Colombia). No corresponde nueva entrega: continúa `mai-ritual-01-rosas`; próxima entrega el 1 de octubre a las 09:00.
- Leídos estrategia, registro y calendario. Ejecutado `pnpm exec vitest run lib/editorial.test.ts`: cinco pruebas aprobadas. La consola indicó 10:33; registro añadido el 27 de septiembre tras actualizarse la fecha de la sesión, sin atribuir la ejecución a las 09:00 programadas.
- Verificación local de archivos, fechas y pruebas de selección editorial/productos/imágenes. No se comprobó por HTTP el servidor local ni producción y no se acredita publicación pública. Sin cambios de contenido o fechas, despliegues ni actividad en redes. Sin novedades accionables.

## Revisión del calendario — 27 septiembre 2026

- Referencia del heartbeat: `2026-09-27T15:36:18.769Z` (10:36 Colombia); pruebas ejecutadas a las 10:36 según consola, sin atribuir la revisión a las 09:00 programadas.
- Leídos estrategia, registro y calendario de seis campañas. No corresponde nueva entrega: continúa `mai-ritual-01-rosas`; próxima entrega el 1 de octubre a las 09:00 de Colombia.
- Ejecutado `pnpm exec vitest run lib/editorial.test.ts`: cinco pruebas aprobadas sobre fechas, selección del carrusel y referencias de productos/imágenes.
- Verificación local de archivos y pruebas; no se comprobó por HTTP el servidor local ni producción, por lo que no acredita publicación pública. Sin cambios de contenido o fechas, despliegues ni actividad en redes. Sin novedades accionables.
