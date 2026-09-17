# Checkout y pagos — estado de implementación

El flujo público crea un pedido sin cobrar y solicita ciudad/dirección. El precio de productos y descuentos se calcula en servidor. El costo de envío no está configurado: se cotiza y acepta antes de transferir. No se anuncia envío gratis ni medios digitales activos.

El checkout admite invitados; no crea ni modifica cuentas por un correo sin verificar. Valida correo, celular colombiano, cantidad entera 1–20, IDs únicos, productos activos y stock cuando existe. El resultado consulta el pedido en servidor y nunca usa `status` del URL como prueba de pago. Datos personales no aparecen en el resultado.

## Sandbox Wompi

`POST /api/payments/wompi/checkout` recibe `{ "orderId": "UUID" }`. Solo responde si `WOMPI_SANDBOX_ENABLED=true`, `WOMPI_PUBLIC_KEY` comienza por `pub_test_` y `WOMPI_INTEGRITY_SECRET` por `test_integrity_`. Usa el subtotal guardado en servidor y referencia estable por pedido. Es una herramienta técnica de prueba, no un medio anunciado al comprador.

El retorno valida el ID contra API sandbox de Wompi, cotejando referencia, monto y COP. Muestra explícitamente que es simulación, sin marcar el pedido pagado. Una prueba rechazada no debe reutilizarse como nuevo intento con la misma referencia: hace falta un modelo persistente de intentos antes de habilitar reintentos reales.

El endpoint de citas también bloquea producción; su tarifa sigue siendo cliente en el código heredado y necesita catálogo de servicios autoritativo antes de cualquier habilitación real.

## Requisitos pendientes para operar en producción

- Reemplazar `lib/db.ts` (Map en memoria) por almacenamiento persistente. Los pedidos actuales desaparecen en reinicios y no se comparten entre procesos. Tampoco hay idempotencia durable ni reserva transaccional de stock.
- Guardar dirección, tarifa de envío aceptada, detalle fiscal y total final en campos estructurados. Hoy dirección queda en notas del pedido.
- Definir tarifas, transportadora y plazos reales; no hay tarifa automática ni cargo de envío en el subtotal.
- Crear intentos de pago persistentes, referencia única por intento, control de reintentos e idempotencia servidor.
- Implementar webhook `transaction.updated` con secreto de eventos, checksum sobre propiedades dinámicas + timestamp + secreto, comparación segura, cotejo de referencia/moneda/monto y transiciones idempotentes. El redirect NO sustituye el webhook.
- Conciliar estados pendientes y pruebas de aprobado/rechazado/anulado; habilitar llaves productivas únicamente después de estas verificaciones.
- Configurar correo transaccional, datos bancarios y revisar políticas de compra, privacidad, entrega y retracto con responsable comercial/legal.

Fuentes oficiales consultadas:
- https://docs.wompi.co/docs/colombia/widget-checkout-web/
- https://docs.wompi.co/en/docs/colombia/eventos/

Pruebas unitarias añadidas: `lib/validators/checkout.test.ts`. No se realizaron transacciones reales.
