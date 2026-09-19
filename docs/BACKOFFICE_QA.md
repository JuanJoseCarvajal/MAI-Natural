# Backoffice MAI — revisión funcional y UX

## Cambios
- Navegación coherente en las diez pantallas, selección única, enlace de salto, foco visible, controles de 44px y movimiento reducido.
- Pedidos, pagos y envíos comparten tarjetas adaptables, búsqueda por cliente/referencia/transacción/guía, filtros y carga de 20 registros por vez.
- Guardado explícito y descarte: modificar una guía ya no borra método, pago u otros campos omitidos. El servidor valida campos y estados, bloquea despacho sin pago real y bloquea confirmaciones manuales de simulaciones.
- Ingresos y promedio de ventas consideran solo pagos reales confirmados. Wompi sandbox tiene estados legibles y referencia visible.
- Consulta administrativa de Wompi: verifica importe y referencia contra API sandbox antes de guardar el estado. No cobra ni simula recibir un webhook. Permite reparar método ausente en registros afectados por el antiguo guardado.
- Búsqueda de productos, descuentos, citas y usuarios; inventario ordenado por stock y separación entre stock bajo y agotado.
- Estados de citas y roles en español, avisos accesibles, nombres de controles en tablas, regiones desplazables por teclado y fecha uniforme de Colombia para evitar errores de hidratación.
- Validación de roles, protección contra retirar el propio rol administrador y exclusión de contraseña en respuestas de actualización de usuario.

## Verificación
60 tests pasan, incluidos autorización, conservación del método, rechazo de importes incorrectos, recuperación Wompi y bloqueo de pagos/envíos de pruebas. Build y TypeScript comprobados.

QA de navegador en copia aislada bajo /tmp, con sesión y datos ficticios; nunca se alteró autenticación de la aplicación real. Diez rutas /admin, /orders, /payments, /shipping, /sales, /appointments, /users, /products, /discounts, /inventory: HTTP 200, un H1, un main, ruta seleccionada única y sin desbordamiento de página a 390px. Búsqueda, edición explícita de guía, recarga conservando el método, filtro de simulaciones y bloqueo de despacho verificados sin errores de navegador. Inspección visual móvil realizada. No se modificaron pedidos, citas ni roles reales durante QA.

## Límites pendientes
El almacenamiento de pedidos sigue en memoria: un despliegue o reinicio puede perder registros. Esta revisión no habilita cobros reales, no sustituye persistencia transaccional ni certifica cumplimiento completo de WCAG. La entrega real de eventos Wompi debe verificarse por separado. Las ediciones simultáneas no cuentan todavía con control de concurrencia durable.
