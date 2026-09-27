# Imágenes de productos

Las 49 fotografías del catálogo se organizan en `assets/product-images/{facial,capilar,corporal,kits}/`. La URL pública única es `/products/media/<categoria>/<archivo>`. Las antiguas URLs `/products/autor/` redirigen a su nueva ubicación. El marcador genérico sin foto sigue en `public/products/autor/foto-pendiente.svg`.

## Hostinger

Configurar `PRODUCT_IMAGES_DIR` como una ruta absoluta a una carpeta persistente y escribible **fuera del directorio reemplazado por los despliegues**. Copiar inicialmente el contenido de `assets/product-images/` a esa carpeta, conservando las subcarpetas por categoría. No sobrescribir ni eliminar las fotos subidas en futuros despliegues. Incluir esta carpeta en las copias de seguridad. Sin esta variable, en producción las fotos incluidas se pueden leer pero las nuevas cargas se rechazan con un mensaje de configuración.

La ruta exacta depende del alojamiento y debe configurarse en hPanel. No se ha aplicado esta configuración al servidor desde el repositorio.

## Edición

En Productos → Editar → Imágenes y carrusel, seleccionar PNG, JPEG o WebP desde el computador (máximo 5 MB por archivo y 20 fotos). La carga requiere la sesión administrativa y verifica origen, tamaño y firma del archivo. Cada foto recibe un nombre único para evitar sobrescrituras y caché obsoleta. Después pulsar Guardar producto para publicar la selección. Quitar una foto de la galería no borra el archivo del servidor; cancelar conserva las fotos ya cargadas sin publicarlas.

La categoría elegida al cargar determina la carpeta. Cambiar después la categoría del producto conserva las URLs de sus imágenes anteriores.

El catálogo aún se guarda en `lib/products.catalog.json`: respaldarlo y conservar las ediciones del backoffice antes de cualquier despliegue. La carpeta persistente de imágenes no hace persistente por sí sola el catálogo.
