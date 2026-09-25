# Catálogo de autor — septiembre 2026

- 22 productos; acondicionador líquido y Leave In unificados por confirmación del usuario.
- 34 fotografías originales copiadas a public/products/autor; 20 anteriores retiradas del sitio y recuperables en Git.
- Agua de rosas incluye la foto entregada el 25 de septiembre. Tónico capilar y las cuatro referencias añadidas usan una imagen explícita de fotografía pendiente.
- Los 18 precios fueron confirmados con las capturas del catálogo de WhatsApp entregadas por el usuario el 25 de septiembre de 2026 (16:29–16:34). Todos los productos del catálogo tienen compra habilitada según su disponibilidad.
- Se transcribieron las descripciones y presentaciones visibles, incluido el modo de uso del elixir. Las capturas que solo muestran un precio no se usaron para inventar beneficios ni instrucciones; se conserva la descripción previa o una identificación breve.
- El usuario confirmó añadir Bálsamo Botánico ($72.000), Jabón Corporal Saponificado ($32.000, agotado y sin compra habilitada), C/Activa Vitamina C ($86.000) y Ritual Mineral Exfoliante ($129.000). Sus fotos están pendientes; Bálsamo Botánico se clasifica provisionalmente en corporal.
- Bálsamos: Maracuyá, Hierbabuena & Albahaca, Mandarina. El servidor resuelve el identificador canónico de variante y su precio; valida inventario compartido entre variantes.
- Las rutinas son selecciones a precios individuales, no kits retirados.
- El importador CSV histórico se bloquea para evitar restaurar referencias, imágenes y precios retirados.

## Pago

La espera de redirección usa un diálogo modal nativo sin acciones, bloquea Escape y muestra un aviso adicional a los ocho segundos. Conserva el carrito y el pedido al fallar. La petición del enlace Wompi tiene un límite de 30 segundos y valida su origen; no se aborta la creación de una orden, para no sugerir que no existe si el servidor ya la guardó.

## Verificación

116 pruebas unitarias/integración: los 22 precios de las capturas, variantes, stock compartido, totales, tarifas Medellín/exterior, seguridad administrativa y Wompi.
La prueba local de interacción cubrió carrusel, ampliación, variantes, modal lento sin botones, conservación del carrito y reintento del mismo pedido. No se realizaron cobros ni nuevas mutaciones de producción.
La comprobación directa de la compilación reiniciada confirmó la carga de la foto principal y su presentación móvil. Hubo timeouts en las repeticiones anteriores de navegación local. Estas pruebas no certifican cobros reales en producción.
