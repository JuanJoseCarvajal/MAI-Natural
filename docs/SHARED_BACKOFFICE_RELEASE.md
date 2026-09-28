# Persistencia compartida del backoffice

## Cambios

- Productos y descuentos se leen y escriben en PostgreSQL (`mai_catalogs`), igual que textos y blogs. En producción no se permite guardar en archivos ni volver a ellos si falla la base.
- Cada operación comercial mantiene el bloqueo transaccional existente desde la lectura hasta la escritura. Las revisiones impiden que una sesión antigua sobrescriba o elimine una edición más reciente.
- El editor de textos recibe las revisiones realmente confirmadas por PostgreSQL. Una caída de la base deja de mostrar silenciosamente textos originales.
- Los errores de guardado conservan el formulario. Los editores avisan al cerrar con cambios pendientes. “Actualizar datos” permite cargar la última versión desde cualquier equipo.
- Las páginas y el sitemap se generan a petición. Una pestaña ya abierta no se actualiza en tiempo real: debe recargarse para ver ediciones de otro usuario.

## Activación obligatoria antes de desplegar

No publicar esta revisión hasta completar la importación: el catálogo compartido debe existir antes de recibir visitas. Esto evita inicializarlo accidentalmente desde la copia antigua de Git.

1. Suspender temporalmente las ediciones de productos y descuentos.
2. Desde el despliegue ACTUAL de Hostinger, descargar `lib/products.catalog.json` y `lib/discounts.catalog.json`. Conservar ambas copias fuera de las carpetas que reemplaza el despliegue.
3. Usando una copia del código nuevo y `DATABASE_URL` en el entorno privado, ejecutar `pnpm db:migrate`. Es una migración aditiva; no elimina datos anteriores.
4. Importar los archivos descargados, indicando rutas absolutas:

   ```sh
   node scripts/import-shared-catalogs.mjs /backup/products.catalog.json /backup/discounts.catalog.json
   ```

   La importación es atómica. Si un catálogo ya existe, se conserva íntegro: nunca se sustituye con una copia de Git ni con un segundo archivo.
5. Verificar en la base el número de productos/descuentos y una referencia con precio, fotos y descripción conocidos. Mantener las copias originales.
6. Desplegar con `DATABASE_DRIVER=postgres` y la MISMA `DATABASE_URL` en todas las instancias. No copiar secretos en tickets o chats.
7. Purgar la caché de Hostinger una vez. Abrir dos sesiones independientes y verificar: editar/guardar en A, recargar en B, abrir ficha pública; repetir con un texto y un borrador de blog. Confirmar que una edición obsoleta se rechaza.
8. Reanudar las ediciones. Los despliegues siguientes ya no reemplazan productos ni descuentos.

Las pruebas automatizadas usan PostgreSQL embebido aislado. No certifican el despliegue de Hostinger ni importan sus datos reales. Sin acceso al servidor o copias de sus catálogos no se puede completar esta activación de forma segura.

## Verificación de esta revisión

- 150 pruebas automatizadas aprobadas; compilación de producción y comprobación de tipos aprobadas.
- Navegador de escritorio y móvil: formulario conservado tras error, reintento, foco de teclado y ausencia de desbordamiento horizontal. Las acciones del navegador se simulan; persistencia, reinicio, concurrencia y permisos se prueban por separado en PostgreSQL embebido.
- Se ejecutó la migración aditiva 003 en la conexión configurada localmente. Después se importaron los archivos del despliegue actual adjuntados por el usuario: 24 productos y 2 descuentos. Una nueva conexión verificó la igualdad campo por campo con ambos archivos, incluyendo las revisiones iniciales. Debe verificarse que Hostinger use esa misma conexión antes de activar la revisión. El despliegue en Hostinger sigue pendiente de confirmación.
