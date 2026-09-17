# MAI · Un ritual, una historia, una selección

## Objetivo y recorrido

Convertir el Diario en el punto de encuentro entre la identidad botánica de MAI y decisiones de compra informadas. Instagram despierta una pregunta; el artículo la desarrolla; la portada presenta esa historia y su producto; la ficha permite consultar el precio y comprar.

Alcance vigente: **solo la web**. El usuario indicó Instagram @melina.jza para una fase futura y después aplazó explícitamente la integración de redes. No publicar ni programar piezas en redes hasta que retome esa fase. Las adaptaciones están preparadas como material reutilizable.

Voz: cercana, sensorial y clara. Hablar de preferencias, lectura de etiquetas, formatos y momentos de cuidado. No inventar resultados, certificaciones, testimonios, ingredientes completos, procedimientos de aplicación o descuentos. Mantener la fotografía existente del producto.

## Cadencia: una entrega cada 15 días

Hora de las siguientes entregas: 09:00, America/Bogota. La primera se habilita inmediatamente el 16 de septiembre de 2026. Es una campaña inicial de 90 días; hay seis entregas, y la revisión del 15 de diciembre abre el siguiente ciclo.

| Fecha local | Historia | Producto protagonista | Intención |
| --- | --- | --- | --- |
| 16 septiembre 2026 | Una pausa entre pétalos | Agua de Rosas | Descubrimiento facial |
| 1 octubre 2026 | Un ritual a tu ritmo | Shampoo Jardín Herbal | Explorar cuidado capilar |
| 16 octubre 2026 | Empieza por lo esencial | Limpiador Caléndula & Aloe Vera Manzanilla | Comparar limpiadores |
| 31 octubre 2026 | El cuidado, sin prisa | Jabón Rosas & Cacao | Descubrimiento corporal |
| 15 noviembre 2026 | Pensado para alguien | Jabón Rosas & Cacao | Regalos planificados |
| 30 noviembre 2026 | Más tuyo. Más simple. | Bálsamo Jardín Herbal | Revisar y reponer |

La hora elegida es una hipótesis operativa, no una afirmación de «mejor hora». Revisarla cuando existan Insights de esta cuenta.

## Paquete por entrega

- Día 0: artículo + portada actualizada + carrusel de Instagram de cuatro láminas.
- Día 2: reel de 24 segundos a partir del guion. Requiere grabación de planos reales y edición; no se ha producido un vídeo.
- Día 5: tres stories, con encuesta y enlace al artículo cuando esté disponible públicamente.
- Día 12: revisar resultados de la entrega y registrar la decisión para la siguiente.

Resultado inicial: 6 artículos originales, 24 imágenes de feed (1080 × 1350), 18 imágenes de stories (1080 × 1920), 6 captions de Instagram, 6 adaptaciones de Facebook, 6 guiones de reel y 6 enlaces con UTM. Galería: `docs/editorial-assets/index.html`. Textos por entrega: `publicacion.md` en cada carpeta.

## Qué se ejecuta automáticamente en el sitio

La fuente editorial única es `lib/editorial-campaigns.json`. Cada artículo define `publishedAt` con zona horaria, `promotion.productIds`, foto, título y textos sociales.

`getPublishedBlogPosts()` evalúa la fecha en cada petición o revalidación. Home, listado, páginas de artículos y sitemap utilizan la misma función. Una URL futura devuelve 404 hasta la fecha. La revalidación es de 60 segundos: en una instalación Next.js en funcionamiento, el contenido aparece en la primera regeneración posterior a la fecha, no mediante un cron que garantiza el segundo exacto. Un despliegue estático sin servidor no sirve para esta programación.

El carrusel pone primero las historias recientes y escoge un producto relacionado activo. Excluye stock conocido de cero, IDs ausentes y productos repetidos. Si no existe inventario declarado, no afirma disponibilidad verificada. Rota cada siete segundos, admite pausa, controles y gesto horizontal, se detiene con foco o interacción y respeta movimiento reducido.

Las cinco entregas futuras permanecen en el repositorio como contenido preparado. No son publicaciones públicas hasta que el servidor desplegado sirve esas fechas. Las imágenes sociales exportadas no están en `public/`: no exponen borradores por una URL del ecommerce.

## Publicación externa y controles contra duplicados

1. Confirmar sesión autenticada y usuario visible **melina.jza**. No usar otro perfil.
2. Verificar que el artículo existe en el dominio público y que el enlace del perfil realmente conduce al Diario antes de usar «enlace en el perfil». No enviar tráfico a localhost.
3. Revisar `docs/EDITORIAL_LOG.md` y las publicaciones del perfil. Usar el `campaignId` para no duplicar una entrega.
4. Subir feed-01 a feed-04, en orden; usar caption y textos alternativos de `publicacion.md`.
5. Verificar la publicación final y registrar permalink, fecha real y estado. Sin permalink o confirmación de la plataforma, el estado sigue siendo preparado.
6. Stories y reels son piezas distintas: una imagen de storyboard no equivale a un reel publicado. No inventar stickers interactivos ni resultados.

Si falta sesión, publicación del sitio o material grabado, registrar el bloqueo concreto y avisar una vez. La automatización puede preparar la siguiente entrega y verificar vencimientos, pero no simular publicaciones.

## Medición y decisiones

La portada emite `select_promotion` con artículo, producto y destino mediante la integración GA4 existente, si está configurada. El sitio conserva sus eventos de carrito. Los enlaces sociales incorporan `utm_source=instagram`, `utm_medium=organic_social` y el identificador de campaña. No se añaden UTM a navegación interna.

Establecer una línea base con las primeras dos entregas. Registrar alcance, guardados, visitas al perfil, clics al artículo, sesiones con UTM, clics desde el carrusel y adiciones al carrito de esos productos. No anunciar retorno sobre inversión ni tasas de conversión sin datos reales. La atribución de compra necesita un evento de compra verificado en el backend de pagos; no está resuelta por este carrusel.

Decisiones: muchas lecturas con pocos clics a producto → mejorar relación entre guía y ficha; muchos clics con pocos carritos → revisar información, precio y entrega; muchos guardados con poco tráfico → revisar CTA/enlace real. Las comparaciones son orientativas con muestras pequeñas y sin grupo de control.

## Referencias

- W3C, controles y pausa de carruseles: https://www.w3.org/WAI/ARIA/apg/patterns/carousel/
- Google, contenido útil orientado a las personas: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Investigación de ecommerce y Colombia realizada para MAI: `docs/UX_MARKET_RESEARCH.md`.

## Operación

La automatización activa «Diario MAI · calendario quincenal» comprueba diariamente a las 09:00 de Colombia si hay una nueva entrega web pendiente. La producción editorial sigue siendo quincenal. Verifica fechas, artículos, productos y portada; al concluir el ciclo prepara la próxima serie. Solo notifica una nueva entrega verificada, un bloqueo nuevo o una acción necesaria. El sitio debe mantenerse en línea; la programación del servidor no depende de que Codex esté ejecutándose. La automatización no publica en redes ni despliega a un destino nuevo.

Para regenerar imágenes, ejecutar `node scripts/export-editorial.mjs` con Playwright disponible. En este entorno se usó el runtime instalado mediante `MAI_PLAYWRIGHT_MODULE`. La exportación no publica en Instagram ni modifica el contenido del sitio.
