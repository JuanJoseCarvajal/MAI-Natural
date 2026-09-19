# Pagos con Wompi

Wompi es la única pasarela admitida por el checkout y las asesorías. La API rechaza métodos retirados. Los pedidos anteriores conservan su historial sin ofrecer instrucciones de pago antiguas.

Productos y Tu Ritual: el servidor calcula precios, descuentos y envío: $15.000 COP en Medellín y $25.000 COP fuera de Medellín. El checkout muestra el total y lo verifica de nuevo antes de crear el pedido y abrir directamente Wompi. La tarifa corresponde a la ciudad indicada; se toleran mayúsculas, tildes y el sufijo Antioquia. Otros municipios usan la tarifa de $25.000. El pedido creado se puede retomar si falla la apertura de Wompi.

Asesorías: el formulario abre directamente Wompi después de guardar la solicitud; el importe se fija en el servidor. Si falla la apertura, se conserva la referencia y se ofrece retomar el pago. El pago verificado no confirma automáticamente el horario.

Si Wompi no está disponible, la selección se conserva y no se ofrece otro método. El endpoint retirado de confirmación manual responde 410 y no modifica registros.

Configuración, migración y verificaciones: `docs/WOMPI_PRODUCTION.md`.
