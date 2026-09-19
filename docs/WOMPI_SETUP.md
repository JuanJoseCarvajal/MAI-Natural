# Wompi Colombia — integración de pruebas

Implementación del 18 de septiembre de 2026. Las tres credenciales de pruebas están configuradas localmente. La API sandbox reconoció la llave pública (HTTP 200), el endpoint local informa disponibilidad y el checkout habilita la opción. No se ha verificado una transacción completa ni la recepción de eventos HTTPS. La opción permanece deshabilitada en otros entornos hasta configurar sus propias variables. No se requiere llave privada para este checkout alojado.

## Configuración segura

En las variables del servidor (localmente `.env.local`, nunca en Git o en un mensaje de chat), configurar:

```dotenv
WOMPI_SANDBOX_ENABLED=true
WOMPI_PUBLIC_KEY=pub_test_...
WOMPI_INTEGRITY_SECRET=test_integrity_...
WOMPI_EVENTS_SECRET=test_events_...
NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000
```

Obtener los valores en el panel de comercio Wompi, entorno de pruebas, sección de desarrolladores/integración. Los valores con `...` son marcadores, no llaves válidas. Reiniciar el servidor después de cambiarlos. Una llave `pub_prod_` no habilita cobros en esta implementación.

Configurar en el panel de Wompi la URL de eventos de un despliegue de pruebas HTTPS confirmado:

`https://<dominio-de-pruebas>/api/webhooks/wompi`

Wompi no puede enviar eventos a localhost. No se creó un túnel, no se expuso el equipo ni se eligió un dominio de despliegue por cuenta del usuario. Usar ese mismo dominio en `NEXT_PUBLIC_APP_URL` para el retorno del checkout.

## Flujo

1. Añadir productos al carrito y seleccionar Wompi de pruebas. La API recalcula catálogo, cantidades y descuentos.
2. Se crea un pedido `wompi_sandbox`; no se envía correo de pedido real para esa simulación.
3. La página de resultado permite abrir el checkout oficial de Wompi. El servidor firma referencia única por pedido, COP y subtotal en centavos. No acepta montos enviados por el navegador.
4. El retorno consulta la transacción en Wompi y compara referencia, moneda e importe. Un parámetro `status=APPROVED` no confirma nada.
5. El webhook valida checksum con comparación de tiempo constante y campos dinámicos, rechaza producción y consulta de nuevo el estado del proveedor. Asocia la transacción al pedido, rechaza importe/referencia incorrectos y no degrada un estado aprobado al recibir eventos repetidos.
6. Los estados se guardan como `sandbox_*`, nunca como pago real confirmado; no activan despacho. El importe simulado no incluye envío, aún pendiente de cotización.

Se usa una referencia estable `mai-<id-del-pedido>` para evitar generar varias sesiones con referencias nuevas al hacer doble clic. Si Wompi ya consumió la referencia o devuelve un estado fallido, no se crea automáticamente otro cobro: revisar la transacción antes de intentar nuevamente.

## Pruebas

Pruebas automatizadas con fixtures, sin llamar al proveedor ni usar tarjetas: activación solo con claves de prueba, firma válida/manipulada, propiedades inseguras, precio del servidor, rechazo temprano de eventos falsificados, verificación de importe, repetición idempotente y fallo temporal de la API. El resultado no equivale a una certificación ni a un pago real en sandbox.

## Requisitos pendientes para producción

Pedidos y estados de pago siguen en memoria. Antes de habilitar dinero real: adaptar almacenamiento persistente y transaccional, definir envío/total aceptado, control de inventario, reconciliación e idempotencia durable, política de reintentos y devoluciones, avisos al equipo, credenciales de producción y prueba extremo a extremo del webhook en HTTPS. La integración permite simulaciones de pedidos y asesorías iniciales; no habilita suscripciones ni cobros reales.

Fuentes oficiales consultadas:
- https://docs.wompi.co/docs/colombia/widget-checkout-web/
- https://docs.wompi.co/docs/colombia/eventos/
- https://docs.wompi.co/en/docs/colombia/transacciones/

## Integración en main

Verificación local del 18 de septiembre: 54 pruebas automatizadas aprobadas. `.env.local` se retira del seguimiento de Git y se conserva únicamente en el equipo; cada despliegue requiere variables privadas propias. Retirarlo no borra versiones anteriores del historial: revisar y rotar credenciales que hayan estado presentes en commits anteriores antes de producción.

## Asesorías

La solicitud abre exclusivamente Wompi al finalizar el formulario, en el entorno configurado. La API de asesorías toma los $50.000 COP del servidor, exige solicitud inicial pendiente dentro de 24 horas y usa referencia estable `mai-appointment-<id>`. El retorno `/services/payment` compara referencia e importe con el proveedor. El webhook guarda el estado de prueba sin confirmar la cita; aprobaciones repetidas son idempotentes. Verificación de esta sesión: comercio sandbox HTTP 200; producción `/api/payments/wompi/status` HTTP 200 con `available:false`. Faltan variables privadas en Hostinger y prueba extremo a extremo para verificar la integración allí.
