# Publicación en Hostinger

El sitio usa Next.js en Hostinger, con hPanel. No requiere integración ni variables de Vercel.

## Estado comprobado el 27 de septiembre de 2026

- mainatural.com respondió HTTP 200 con las cabeceras platform: hostinger y panel: hpanel.
- GitHub main apuntaba a c400c0b. El commit local dd8f110 aún no había sido subido.
- El sitio público mostraba Shampoo Líquido a $78.000 y agotado, mientras el catálogo de Git contiene $68.000 sin stock definido. No se modificaron esos datos en producción.

## Antes de desplegar

El administrador guarda actualmente el catálogo en lib/products.catalog.json del servidor. Una publicación que sustituya ese archivo puede reemplazar las ediciones realizadas desde el panel.

1. Descargar una copia del archivo del servidor antes del despliegue.
2. Comparar los precios, stock y demás datos editados con la versión de Git. Conservar las ediciones comerciales que correspondan antes de sustituirlo.
3. Subir main a GitHub y publicar esa revisión desde hPanel.
4. Usar pnpm install --frozen-lockfile, pnpm build y pnpm start según la configuración de la aplicación Node de Hostinger.
5. Conservar NEXT_PUBLIC_APP_URL y NEXTAUTH_URL con https://mainatural.com.
6. Verificar /admin/products con una sesión administrativa: tarjetas de dos columnas, miniaturas, botón superior para crear, edición en modal y galería con opción de agregar fotos.
7. Confirmar en /products y /products/[id] que los carruseles comparten el mismo marco 3:4 y muestran los controles transparentes sobre la foto.

Las pruebas de navegador de scripts/verify-product-overlays.cjs aíslan las acciones del servidor con respuestas simuladas. La persistencia se verifica separadamente en lib/products.server.test.ts. No se realizaron cobros ni escrituras en el admin de producción.
