# Imágenes de productos

Las 49 fotografías del catálogo se organizan en `assets/product-images/{facial,capilar,corporal,kits}/`. La URL pública única es `/products/media/<categoria>/<archivo>`. Las antiguas URLs `/products/autor/` redirigen a su nueva ubicación. El marcador genérico sin foto sigue en `public/products/autor/foto-pendiente.svg`.

## Hostinger

Las nuevas fotos se guardan en PostgreSQL cuando `DATABASE_DRIVER=postgres`, usando la conexión existente `DATABASE_URL` del backoffice. Ya no se requiere `PRODUCT_IMAGES_DIR`. La tabla privada `mai_product_images` se inicializa en la primera carga administrativa; la cuenta de conexión necesita permiso de creación de tabla. Las fotos se conservan entre despliegues e instancias y deben incluirse en las copias de seguridad de la base de datos. Límite: 5 MB por foto. Para catálogos de gran volumen conviene migrar los binarios a almacenamiento de objetos.

Las fotos iniciales se leen desde `assets/product-images/`. Si anteriormente se configuró `PRODUCT_IMAGES_DIR`, se conserva la lectura de esa carpeta para imágenes anteriores; no se elimina ni mueve su contenido. En desarrollo sin PostgreSQL se mantiene la escritura en archivos. No se conecta ni modifica producción al compilar: el esquema se inicializa únicamente durante una carga autenticada.

## Edición

En Productos → Editar → Imágenes y carrusel, seleccionar PNG, JPEG o WebP desde el computador (máximo 5 MB por archivo y 20 fotos). La carga requiere la sesión administrativa y verifica origen, tamaño y firma del archivo. Cada foto recibe un nombre único para evitar sobrescrituras y caché obsoleta. Después pulsar Guardar producto para publicar la selección. Quitar una foto de la galería no borra el archivo del servidor; cancelar conserva las fotos ya cargadas sin publicarlas.

La categoría elegida al cargar determina la carpeta. Cambiar después la categoría del producto conserva las URLs de sus imágenes anteriores.

El catálogo aún se guarda en `lib/products.catalog.json`: respaldarlo y conservar las ediciones del backoffice antes de cualquier despliegue. La carpeta persistente de imágenes no hace persistente por sí sola el catálogo.
