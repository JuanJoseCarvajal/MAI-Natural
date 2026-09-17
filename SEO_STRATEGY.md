# Estrategia SEO y analitica para MAI Natural

## Objetivo

Aumentar ventas desde busquedas organicas y remarketing midiendo el recorrido completo: visita, lectura de blog, vista de producto, agregar al carrito, checkout y orden.

## Pilares de busqueda

- Cosmetica natural facial: rutinas, piel sensible, tonicos, limpiadores, hidratacion.
- Cosmetica natural capilar: shampoo natural, cabello rizado, definicion, balsamos.
- Cosmetica corporal artesanal: jabones, cremas, regalos conscientes.
- Rutinas y acompanamiento: Club MAI, asesoria, rituales personalizados.

## Contenido inicial creado

- `/blog/rutina-facial-natural-piel-sensible`
- `/blog/shampoo-natural-cabello-rizado-colombia`
- `/blog/regalos-cosmetica-natural-artesanal`

## Plan editorial recomendado

- Semana 1: 2 articulos de alta intencion comercial y 1 guia educativa.
- Semana 2: 1 comparativa de producto, 1 articulo por problema y 1 articulo de regalo/temporada.
- Semana 3: optimizar articulos con datos de Search Console y enlazar a productos con mejor conversion.
- Semana 4: crear cluster por categoria y actualizar productos con preguntas frecuentes.

## Medicion

Variables de entorno:

- `NEXT_PUBLIC_SITE_URL=https://mainatural.com`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`
- `NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXXXX`

Eventos implementados:

- `add_to_cart`
- `begin_checkout`
- `PageView` en Meta Pixel
- page views automaticos de GA4

## KPIs

- Clicks organicos por query no-marca.
- Conversion organica a carrito.
- Conversion de blog a producto.
- Productos con mayor tasa de add to cart.
- Abandono entre carrito y checkout.

## Proximos experimentos

- FAQs con schema en fichas de producto.
- Articulos por ingrediente: agua de rosas, calendula, aloe vera, romero.
- Landing por categoria: facial, capilar, corporal.
- Captura de email desde blog para Club MAI.
