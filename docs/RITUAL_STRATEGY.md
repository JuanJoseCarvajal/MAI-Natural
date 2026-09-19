# Tu ritual — estrategia de selección y compra

## Decisión
Dos bases: ritual facial (kit Glow Facial Diario) y capilar (kit Definición Capilar). Un tercer camino «Crea el tuyo» ofrece selección libre de hasta seis referencias de rostro, cabello y cuerpo. Las bases corresponden a kits existentes, sin modificar composiciones, precios o descuentos del catálogo. La elección capilar permite adaptar Herbal Curl si la persona prefiere otro producto.

La página anterior ofrecía tres conjuntos al mismo nivel, incluido un corporal con dos jabones y un perfume capilar; el CTA fijo decía tres productos. Además exigía stock numérico en productos individuales que el catálogo y checkout permiten pedir sin ese dato. Ahora el alcance de cada base es explícito y los productos corporales forman parte de la personalización.

## Referentes observados
- The Ordinary, Regimen Builder: https://theordinary.com/en-us/skincare-regimen-builder.html — elección por necesidad y complejidad de rutina. Aplicación MAI: comenzar con una decisión sencilla y dejar el detalle para la selección. No se traslada su cuestionario de datos personales ni sus promesas clínicas.
- CeraVe, Find My Routine: https://www.cerave.com/quizzes/find-my-cerave-routine — rutina guiada como entrada al catálogo. Aplicación MAI: mostrar secuencia y función de productos en las dos bases; no atribuir aval dermatológico a MAI.
- Lush, Personalised Gifts: https://www.lush.com/uk/en/faq/personalised-lush-gifts — elegir productos y personalizar progresivamente antes del checkout. Aplicación MAI: selección editable y subtotal transparente. No se ofrece caja, etiqueta ni empaque especial.

Estos son referentes de patrones de experiencia, no evidencia de que un diseño convierta mejor en MAI. La hipótesis debe medirse con tráfico propio.

## Flujo
1. Comparar dos kits por propósito, composición y precio COP. Tercer camino libre.
2. Explorar los tres productos y consultar cada ficha. Agregar el kit como una referencia conserva su precio de catálogo.
3. «Adaptar este ritual» carga sus tres productos en la selección libre: al personalizar se muestran precios individuales, sin descuento automático.
4. Selección libre con filtros por cuidado, quitar/añadir, límite de seis referencias y resumen con subtotal. Unidades adicionales se ajustan en la bolsa. La selección se recuerda en sessionStorage y se valida contra el catálogo.
5. Productos personalizados se agregan individualmente y se suman a cantidades existentes. No se promete un SKU nuevo, empaque, formulación a medida o agrupación física por nombre. El nombre opcional identifica la consulta por WhatsApp.
6. Consulta opcional: WhatsApp recibe el listado elegido y subtotal de referencia al abrir el enlace; no se envían mensajes automáticamente. Asesorías tienen CTA propio.

## Conversión y contexto colombiano
Precios COP del catálogo; envío y total visibles en checkout. Pago exclusivamente con Wompi. Envío: $15.000 COP en Medellín y $25.000 fuera de Medellín, calculado según la ciudad y verificado por el servidor. No se exige registro, correo ni respuestas de salud para armar la selección. No se promete que todos los productos deban usarse simultáneamente.

## Medición
Eventos sin nombre personal ni texto libre: ritual_path_selected (facial/capilar/custom), ritual_customize, ritual_added_to_cart con tipo, número de referencias y valor COP. Se conservan add_to_cart por SKU. Solo se envían si el sitio tiene analytics configurado.
Comparar tasa de selección → carrito por camino; abandono antes de agregar; cantidad de referencias y valor por carrito; salida a asesorías. No declarar mejoras porcentuales sin datos. Comparar períodos equivalentes con volumen suficiente antes de cambiar el número de opciones o el orden de las bases.

## SEO y accesibilidad
URL /routines conservada, metadata específica, contenidos indexables y enlaces a productos y asesorías; revalidación de catálogo cada 60 segundos. Controles nativos, foco visible, estado de selección, avisos accesibles, imágenes de catálogo y movimiento reducido. Disponibilidad y cantidades se vuelven a verificar en checkout; la selección no reserva stock.

## Verificación realizada
64 pruebas aprobadas y compilación correcta. Navegador escritorio/móvil: agregar kit conserva SKU y precio, adaptar muestra suma individual, mezclar categorías, restaurar selección, nombre en consulta WhatsApp y tránsito de cuatro productos al checkout. Imágenes comprobadas al entrar en pantalla. Sin pedidos creados ni pagos enviados durante la prueba.
