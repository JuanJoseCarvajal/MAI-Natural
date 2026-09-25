# Catálogo de autor — septiembre 2026

- 18 productos; acondicionador líquido y Leave In unificados por confirmación del usuario.
- 34 fotografías originales copiadas a public/products/autor; 20 anteriores retiradas del sitio y recuperables en Git.
- Agua de rosas incluye la foto entregada el 25 de septiembre. Solo Tónico capilar usa una imagen explícita de fotografía pendiente.
- Cinco precios conservados del catálogo previo: shampoo líquido, crema para peinar, leches día/noche y agua de rosas. No están verificados contra WhatsApp.
- Los otros 13 productos tienen precio cero como estado interno pendiente, no como oferta gratis: no pueden comprarse. No se inventaron precios ni fichas de WhatsApp.
- Bálsamos: Maracuyá, Hierbabuena & Albahaca, Mandarina. El servidor resuelve el identificador canónico de variante y su precio; valida inventario compartido entre variantes.
- Las rutinas son selecciones a precios individuales, no kits retirados.
- El importador CSV histórico se bloquea para evitar restaurar referencias, imágenes y precios retirados.

## Pago

La espera de redirección usa un diálogo modal nativo sin acciones, bloquea Escape y muestra un aviso adicional a los ocho segundos. Conserva el carrito y el pedido al fallar. La petición del enlace Wompi tiene un límite de 30 segundos y valida su origen; no se aborta la creación de una orden, para no sugerir que no existe si el servidor ya la guardó.

## Verificación

114 pruebas unitarias/integración: precios canónicos, variantes, stock compartido, totales, tarifas Medellín/exterior, seguridad administrativa y Wompi.
La prueba local de interacción cubrió carrusel, ampliación, variantes, modal lento sin botones, conservación del carrito y reintento del mismo pedido. No se realizaron cobros ni nuevas mutaciones de producción.
La comprobación directa de la compilación reiniciada confirmó la carga de la foto principal y su presentación móvil. Hubo timeouts en las repeticiones anteriores de navegación local. Estas pruebas no certifican cobros reales en producción.
