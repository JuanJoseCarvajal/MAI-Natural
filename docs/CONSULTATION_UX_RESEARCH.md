# Encuentros con Melina: estrategia y experiencia

Investigación y propuesta del 17 de septiembre de 2026 para `/services`.

## Hallazgos y fuentes

Se compararon modelos representativos; no es un censo de todos los servicios de asesoría ni hay evidencia pública de cuál convertirá mejor para MAI.

| Referente | Patrón observado | Aplicación en MAI |
| --- | --- | --- |
| [Aesop](https://malaysia.aesop.com/pages/aesop-mid-valley-southkey-services) | Consulta de cuidado con duración explícita (15 minutos) | Explicar dedicación, duración y alcance antes de pedir datos |
| [Kiehl’s España](https://www.kiehls.es/servicio-consultavirtual/servicio-consulta-virtual.html) | Diferencia consultas de 20, 30 y 40 minutos por necesidad | Un punto de entrada claro, sin obligar a elegir entre tratamientos antes de conversar |
| [Curology](https://curology.com/why-curology/) | Evaluación, plan individual y seguimiento | Separar el primer encuentro del acompañamiento opcional. MAI no adopta sus prestaciones médicas |
| [GOV.UK: estructura de formularios](https://www.gov.uk/service-manual/design/form-structure) | Preguntas divididas en pasos comprensibles | Cinco momentos, avance visible, volver y corregir sin perder respuestas |
| [Baymard: pago](https://baymard.com/learn/payment-ux) | Claridad al revisar y terminar una operación | Resumen editable, precio visible y distinción entre solicitud, reporte de transferencia y confirmación |

La [fuente oficial de EDIPO](https://edipo.org/edipo-net/) permite identificar el nombre José Luis Parise y su enseñanza. No demuestra formación, certificación ni afiliación de Melina. La trayectoria de más de once años procede de la información aportada por la marca; no se inventan diplomas ni avales científicos.

## Propuesta

Invitación: «Tu cuidado empieza por escucharte». La persona elige un motivo, una intención, un momento, sus datos y revisa el encuentro. La respuesta al motivo reconoce su elección sin diagnosticar ni interpretar información íntima. Los detalles son opcionales; no se envían respuestas personales a analítica ni se guardan en almacenamiento del navegador.

El encuentro ofrece escucha y una orientación inicial de cuidado cosmético. La mirada simbólica de Melina se explica en una sección propia: iniciación, esoterismo, hermetismo, psicoanálisis y enseñanza de Parise. Se distingue de atención médica y psicoterapia, sin promesas de resultados ni atribuciones causales de enfermedades.

La continuidad es el Círculo MAI: grupos quincenales, belleza, cosmética y autoformulación. El interés se solicita por separado, desmarcado por defecto; no inscribe ni cobra. No se activaron redes sociales.

## Supuestos comerciales pendientes

- Se conserva la referencia existente del encuentro general: **30 minutos / $50.000 COP**. La marca debe confirmar duración y precio definitivo.
- Modalidad y horario final se coordinan personalmente. La selección es una solicitud, no una cita confirmada.
- Se conserva el límite existente de dos encuentros al día y los horarios existentes; no equivalen a una agenda externa de Melina sincronizada.
- Suscripción, precio, apertura y condiciones del Círculo pendientes de definición. Se muestra «Próximamente».
- Sin cuenta bancaria configurada no se muestran números ficticios ni un QR de pago.

## Medición

Eventos sin datos personales: `consultation_start`, `consultation_step_view` con número de paso, `consultation_request_submitted`. Analizar abandono por paso, solicitudes válidas/inicios, errores de horario y citas confirmadas/solicitudes. La confirmación y asistencia requieren seguimiento operacional; no se cuentan como compras ni pagos desde el navegador. Probar primero claridad del mensaje y abandono en selección de fecha; comparar periodos equivalentes con tráfico suficiente, sin prometer incrementos porcentuales.

## Implementación y límites

Validación de contacto y consentimiento, fechas reales y hora de Colombia, control de solicitudes concurrentes dentro de la instancia, liberación de cancelaciones y reservas impagadas vencidas, revisión de resumen, teclado, foco entre pasos y movimiento reducido. El reporte de transferencia queda pendiente de verificación y no puede reabrir citas canceladas o confirmadas.

**El adaptador de citas actual (`lib/db.ts`) usa memoria del proceso.** No garantiza persistencia al reiniciar ni exclusión de horarios entre instancias. Antes de ofrecer reservas operativas en producción se necesita almacenamiento persistente con control transaccional y un canal de notificación al equipo. La página no afirma enviar correos automáticamente. Esta implementación no despliega ni activa una suscripción.

## Verificación realizada

44 pruebas unitarias aprobadas, compilación de producción con comprobación TypeScript y ESLint aprobada. El script `scripts/verify-consultation.mjs` verificó en Chrome local escritorio de 1440 px y móvil de 390 px: validación, respuestas contextuales, corrección sin perder datos, consentimiento obligatorio, solicitud pendiente de confirmación, teclado/foco, ausencia de desbordamiento y de errores de JavaScript. Los datos usados fueron ficticios (`consulta-test@example.com`); no se realizaron pagos ni publicaciones públicas.
