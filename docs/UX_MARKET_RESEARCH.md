# MAI Natural: investigación y decisiones de experiencia

Fecha de consulta: 16 de septiembre de 2026. Investigación documental para orientar el rediseño; no sustituye entrevistas, analítica propia ni pruebas con compradores. Las propuestas son hipótesis de diseño, no resultados de conversión comprobados. Mantener las rutas y capacidades actuales: catálogo, productos, rutinas, servicios, blog, cuenta y compra.

## 1. Mercado y oportunidad en Colombia

**Evidencia comprobada.** El [informe de cierre 2025 de la CCCE](https://ccce.org.co/noticias/informe-de-cierre-ecommerce-2025-version-publica/) reporta ventas nominales por COP 145,4 billones y 684,6 millones de compras en línea. PSE/débito a cuenta representa 57,2% del valor y 46,5% del número de transacciones. Son cifras agregadas del comercio electrónico colombiano: no describen la clientela de MAI ni la cosmética específicamente. La caída del ticket promedio reportada por la entidad tampoco permite inferir elasticidad de precios de esta marca.

La [ANDI, publicación del 16 de enero de 2025](https://andi.com.co/Home/Noticia/17782--en-2024-cada-colombiano-gasto-un-prome), estimó el mercado colombiano de cosméticos y cuidado personal de 2024 en US$2.884 millones; destacó calidad y eficiencia de las rutinas. Su crecimiento de 6,3% para 2025 era una **proyección**, no un cierre observado. No presentarlo como resultado de 2025 o 2026.

**Implicaciones propuestas.** Construir valor alrededor de una rutina comprensible, información verificable y compra sin incertidumbre. Visibilizar medios locales cuando estén habilitados. Usar formato es-CO y COP, aclarar total/envío antes de salir al proveedor de pagos y conservar carrito al regresar. Probar mensajes de simplicidad y acompañamiento frente a mensajes puramente aspiracionales.

**Segmentos hipotéticos que necesitan validación:** persona que empieza y desconoce el orden de uso; comprador recurrente que busca reposición rápida; comprador de regalo que necesita seleccionar sin conocer una rutina; visitante que primero busca asesoría. No son segmentos demográficos comprobados.

## 2. Referentes y límites de la comparación

| Referente | Observación verificable | Aplicación propuesta |
| --- | --- | --- |
| [Natura Colombia: rutinas](https://www.natura.com.co/c/rostro-rutina-skincare) | Navegación por tipo de piel, necesidades y pasos; página dedicada a rutina. | Añadir caminos claros hacia categorías y rutinas; no trasladar su taxonomía extensa a un catálogo pequeño. |
| [Aesop: cuidado facial](https://www.aesop.com/skin-care/) y [guía de exfoliación](https://www.aesop.com/library/a-guide-to-exfoliation.html) | Catálogo y contenido educativo conectado al modo de uso. | Relacionar guía → producto → paso de rutina; explicar ingredientes disponibles y uso aprobado por la marca. |
| [Awwwards: e-commerce](https://www.awwwards.com/websites/e-commerce/) | La URL solicitada devolvió errores de lectura/timeout durante la consulta. El [índice público accesible](https://www.awwwards.com/websites/html5-1/?page=24) lista Koba Skincare como Honorable Mention de enero de 2025. | Utilizar la curaduría como fuente de dirección artística, no como evidencia de rendimiento comercial. No se afirma haber auditado visualmente Koba ni la galería inaccesible. |

La dirección creativa propuesta para MAI es editorial y botánica: fotografía real de producto, espacio generoso, tipografía expresiva en títulos, cuerpo legible y color cálido con contraste. Es una decisión de diseño propia, no un patrón de Awwwards comprobado por esta investigación. Evitar cursores personalizados, navegación escondida, scroll intervenido y animaciones que retrasen productos o pago.

## 3. Arquitectura de experiencia y contenido

### Inicio

1. Encabezado compacto con Catálogo, Rutinas y accesos a búsqueda/carrito. Mantener Servicios, Historia y Blog disponibles sin competir con compra.
2. Propuesta concreta: qué vende MAI, a quién ayuda y acceso directo a productos. Un CTA principal y uno secundario de orientación.
3. Entradas por categoría real: facial, capilar y corporal si están en el catálogo. No crear categorías vacías.
4. Selección editorial con nombre, fotografía, precio COP y acción clara. Usar “Selección MAI” cuando no exista evidencia para “Los más vendidos”.
5. Rutinas y contenido de marca apoyados en información real. No agregar cifras de compradores, resultados clínicos, certificaciones o reseñas sin respaldo.
6. Preguntas útiles sobre compra, entregas y uso; respuesta enlazada a las condiciones vigentes.

### Catálogo y búsqueda

Filtros comprensibles, contador, botón de limpiar y estado vacío recuperable. Ordenación por precio/nombre disponible sin asignar popularidad ficticia. Búsqueda tolerante a tildes y mayúsculas. Persistir filtros en URL cuando sea viable para volver desde el producto. En móvil, filtros accesibles y rejilla legible sin sacrificar el nombre. No introducir diagnóstico cosmético automático sin datos adecuados.

### Ficha de producto

Priorizar fotografía auténtica, nombre, presentación cuando exista, precio COP, disponibilidad y CTA. Separar beneficio cosmético, instrucciones y composición: no deducir ingredientes completos de un nombre comercial. Mostrar política de envío/cambios mediante enlaces claros. Una recomendación complementaria debe explicar su relación y ser opcional. El carrito confirma nombre/cantidad, permite editar y ofrece continuar comprando o finalizar.

**Hallazgo local:** `lib/products.catalog.json` contiene valores repetidos de `rating: 4.8` y `reviewsCount: 32` en productos revisados. No existe evidencia de procedencia en esta investigación. No usarlos como prueba social ni `AggregateRating` hasta verificar reseñas originales. Evitar reforzar textos como “desde la primera aplicación” sin documentación del producto.

### Rutinas, servicios y contenido

Cada rutina debe aclarar pasos, productos y frecuencia respaldada por la marca; no prometer tratamiento de enfermedades. Las citas deben tener duración/precio real, disponibilidad y confirmación. El blog debería responder dudas concretas y enlazar productos pertinentes, no llenar páginas con palabras clave.

## 4. Checkout: claridad y recuperación

La investigación de [Baymard sobre checkout](https://baymard.com/research-articles/current-state-of-checkout-ux) recomienda hacer prominente la compra como invitado, comunicar entrega de forma entendible, etiquetar campos requeridos/opcionales, permitir editar cantidades, explicar por qué se pide teléfono y redactar errores específicos. Su evidencia procede de sus estudios y benchmarks; no representa una medición colombiana ni una promesa de aumento para MAI.

**Aplicación propuesta al flujo actual:**

- Compra sin crear cuenta; ofrecer cuenta después como beneficio voluntario.
- Contacto, entrega y pago con progreso que corresponda a pasos reales.
- Nombre, correo, teléfono y dirección con autofill, etiquetas permanentes y teclado adecuado. Departamento/ciudad coherentes; complemento opcional. No asumir que un código postal obligatorio siempre mejora la entrega.
- Explicar si el teléfono se utiliza para coordinar entrega. Consentimiento comercial separado de lo necesario para la compra.
- Resumen con unidades, subtotal, descuento, envío y total final. No afirmar “gratis” si aún no se cotiza destino.
- CTA con acción y total, estado de carga y protección frente a doble clic.
- Conservar datos tras validación fallida o cierre del proveedor. Errores junto al campo y resumen accesible con foco.
- Pago pendiente, rechazado y aprobado con mensajes distintos. Un rechazo ofrece reintentar; un pendiente ofrece consultar estado sin inducir otro cobro.

### Wompi: requisitos técnicos y operativos

La [documentación de Widget/Web Checkout](https://docs.wompi.co/docs/colombia/widget-checkout-web/) requiere referencia única y firma de integridad; indica usar eventos del servidor para confirmar y no confiar en la redirección. [Eventos](https://docs.wompi.co/docs/colombia/eventos/) describe validación de integridad del webhook. Los [medios ofrecidos por Wompi](https://soporte.wompi.co/hc/es-419/articles/360020764334--Cu%C3%A1les-son-los-medios-de-pago-con-los-que-cuenta-la-pasarela) incluyen PSE, Nequi y tarjetas; su disponibilidad en MAI depende de la cuenta del comercio.

Diseño técnico propuesto: servidor recalcula precios/descuentos/envío, usa enteros en centavos, crea pedido durable y firma sin exponer secretos. Verificar webhook, referencia, monto y moneda antes de cambiar estado. Procesar eventos repetidos de forma idempotente y evitar disminuir inventario dos veces. Consultar al servidor al regresar del checkout. No solicitar PAN/CVV en formularios propios ni guardar datos de tarjeta. MAI admite exclusivamente Wompi; no ofrece pagos manuales.

Antes de operar en producción: verificar credenciales, URL HTTPS de webhook, persistencia de órdenes, confirmaciones y conciliación. Pruebas en sandbox: aprobación, rechazo, pendiente, cierre, timeout, duplicado, monto alterado y firma inválida. No realizar cobros reales para probar.

## 5. SEO orientado al catálogo real

Según [Google Search Central: datos de e-commerce](https://developers.google.com/search/docs/specialty/ecommerce/include-structured-data-relevant-to-ecommerce), son pertinentes Organization, BreadcrumbList y Product; su uso no garantiza un resultado enriquecido. La [guía Product](https://developers.google.com/search/docs/appearance/structured-data/product-snippet) favorece datos en HTML inicial y exige coherencia entre marcado y contenido. Las fichas individuales son el destino adecuado del marcado específico de producto.

Plan: conservar URLs actuales; títulos y descripciones únicos; canonical absoluto configurado con dominio real; sitemap solo con páginas públicas indexables; excluir compra/cuenta/admin de indexación; Product/Offer con COP, precio e inventario reales; breadcrumbs navegables; Open Graph con producto existente. No publicar ratings inventados. Validar con Rich Results Test y Search Console después de desplegar.

Mapa editorial inicial **sin volúmenes de búsqueda comprobados**: cosmética natural Colombia → inicio/catálogo; cuidado facial natural → categoría; nombre exacto del producto → ficha; orden de rutina → guía/rutinas; historia e ingredientes de MAI → historia. No crear páginas clonadas para cada ciudad sin contenido y operación específicos. Optimizar imágenes, tamaños declarados, carga diferida secundaria y carga prioritaria solo del visual principal. Medir experiencia real en móvil.

## 6. Ventas, medición y prioridades

**P0 — confianza y compra:** total correcto, inventario real, checkout recuperable, confirmación verificada, navegación móvil y ausencia de enlaces rotos. **P1 — descubrimiento:** nuevo inicio, catálogo, fichas claras, enlaces entre rutinas y productos, metadatos. **P2 — crecimiento medido:** paquetes con lógica real, contenidos, reseñas verificadas y recompra consentida.

Registrar eventos `view_item_list`, `select_item`, `view_item`, `add_to_cart`, `begin_checkout`, `add_shipping_info`, `add_payment_info`, `purchase` y fallos categorizados. `purchase` nace de orden aprobada y se deduplica por ID; nunca enviar correo, dirección, documento o teléfono a analítica. Separar consentimiento y política de medición.

| Métrica | Definición / decisión |
| --- | --- |
| Conversión de compra | Órdenes aprobadas / sesiones elegibles; segmentar dispositivo/canal. |
| Finalización checkout | Órdenes aprobadas / inicios únicos de checkout. |
| Aprobación de pago | Pagos aprobados / intentos, por medio y motivo de rechazo. |
| Agregado al carrito | Sesiones con agregado / sesiones con ficha vista. |
| Ticket y margen | Ingresos netos y margen por pedido; no mejorar ticket sacrificando margen. |
| Búsquedas sin resultado | Consultas sin coincidencia / búsquedas; prioriza catálogo y sinónimos. |
| Rendimiento | LCP, INP y CLS reales por móvil; contrastar con pruebas de laboratorio. |

No existe línea base de MAI disponible para esta investigación: no fijar porcentajes de mejora como resultados obtenidos. Medir antes/después con control de campañas y estacionalidad; si hay tráfico suficiente, experimentar una hipótesis por vez. Primeras pruebas: CTA de catálogo frente a orientación por rutina; costo de envío temprano; compra invitada prominente. Vigilar devoluciones, margen y soporte junto con conversión.

Validación cualitativa pendiente: sesiones moderadas con compradores colombianos en Android/iPhone, red móvil y distintos medios de pago; tareas de hallar un producto, entender uso, conocer costo final y recuperar pago interrumpido. Registrar errores y confianza percibida; no presentar esta investigación documental como entrevistas ya realizadas.
