# Revisión de suscripciones — 18 septiembre 2026

Alcance: código y servidor local http://127.0.0.1:3000. No se verificó producción, no se realizaron cobros ni se modificó el módulo. Navegación con agent-browser y peticiones HTTP locales, sin sesión de usuario; datos ficticios `Prueba local MAI`, `suscripcion-test@example.com`.

## Resultado: no apto para activar inscripciones

| Prioridad | Hallazgo | Evidencia y reproducción |
| --- | --- | --- |
| Alta | Alta simulada presentada como inscripción real | Abrir `/club-mai/checkout?plan=ritual`, completar nombre/correo y confirmar. Navega a `/club-mai/bienvenida?plan=ritual`. `app/api/club-mai/join/route.ts` solo devuelve `{ok:true}`; no persiste membresía ni integra cobro o correo. |
| Alta | Bienvenida accesible sin inscripción | Abrir directamente `/club-mai/bienvenida?plan=embajadora`: anuncia inscripción recibida, membresía activa y correo/código de referidos dentro de 24 horas. No consulta sesión, pago o registro. |
| Alta | API acepta datos inválidos | POST con `plan:no-existe`, `email:no-es-correo`, `billing:invalido` y nombre ficticio devuelve 200 `{ok:true}`. También acepta plan numérico, nombre como arreglo y correo booleano. Solo comprueba que tres campos sean truthy. |
| Media | JSON malformado provoca error de servidor | POST con cuerpo `{` devuelve 500 en lugar de error de entrada controlado. |
| Media | Oferta contradictoria y condiciones sin soporte | `/subscriptions` anuncia Próximamente; checkout sigue abierto por URL y ofrece planes de $59.000/$99.000/$149.000, descuentos y reuniones mensuales. La propuesta actual de Asesorías plantea grupos quincenales con condiciones por definir. |
| Media | Promesa de cancelación sin implementación identificada | Checkout dice que se puede cancelar desde la cuenta; revisión de rutas y referencias no encontró gestión de membresía/cancelación que respalde esa promesa. |

## Comprobaciones aprobadas y límites

- API con objeto vacío: 400 `Datos incompletos`.
- Navegación local del checkout Ritual a bienvenida reproducida con datos ficticios.
- `pnpm test:run`: 44 pruebas aprobadas en seis archivos. Ninguna prueba existente cubre el módulo de suscripciones; este resultado no valida el alta, renovaciones o cancelaciones.
- No hay cobro recurrente que probar en el endpoint actual: contiene un TODO de Wompi. No se probaron tarjetas, renovaciones, reembolsos ni correos reales.

## Orden recomendado para corregir

1. Mientras el Club está en preparación, cerrar checkout y bienvenida directa y hacer que la API rechace altas con un mensaje de indisponibilidad.
2. Confirmar oferta, cadencia, precios y condiciones; unificar Club MAI/Círculo MAI.
3. Implementar persistencia, identidad del titular, pagos verificados, notificaciones y cancelación antes de anunciar membresías activas.
4. Añadir pruebas para rechazo de altas deshabilitadas, validación de entradas y acceso a confirmación; después cubrir pago pendiente/fallido, eventos repetidos y cancelaciones con el proveedor en modo de pruebas.

## Corrección y nueva verificación — 18 septiembre 2026

- Sustituido el checkout y la bienvenida antigua por redirecciones a `/subscriptions`, sin conservar planes inexistentes.
- La API responde 403 `ENROLLMENT_CLOSED`, `ok:false`, `Cache-Control:no-store`; no interpreta ni retiene datos personales. Objetos vacíos, entradas inválidas y JSON malformado reciben la misma negativa controlada sin error 500.
- Nueva página Círculo MAI con propuesta quincenal, preguntas frecuentes y acceso al encuentro individual, sin precios, descuentos, correos o cancelaciones ficticias. Actualizados footer, términos y dashboard; retirados botones inactivos y código de referido ficticio del dashboard.
- 45 pruebas unitarias aprobadas; build de producción, TypeScript y ESLint aprobados.
- `scripts/verify-subscriptions.mjs`: navegador local escritorio/móvil, redirecciones de ambas rutas antiguas, cuatro variantes de POST rechazadas, ausencia de campos de alta, sin desbordamiento móvil, CTA hacia Asesorías y apertura del wizard, sin errores de ejecución.
- Las correcciones cierran el flujo inseguro y mejoran la invitación; **no implementan una membresía operativa**. Persistencia, cobros recurrentes, notificaciones, renovación y cancelación requieren implementación y validación antes de habilitar altas. No se hicieron cobros ni despliegues.
