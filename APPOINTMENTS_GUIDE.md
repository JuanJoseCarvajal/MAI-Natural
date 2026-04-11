# Appointments System Guide

## 🎯 Descripción

Sistema completo de reserva de citas para servicios de belleza/bienestar. Incluye frontend, backend API y dashboard de usuario.

## 📁 Archivos Creados

```
app/(public)/services/
  ├── page.tsx          ← Página de servicios con formulario
  └── actions.ts        ← Server actions para crear/cancelar citas

app/(dashboard)/dashboard/
  └── appointments/
      └── page.tsx      ← Dashboard de mis citas

app/api/appointments/
  └── route.ts          ← API para gestionar citas
```

## 🔄 Flujo de Usuario

### 1. Reservar Cita
```
/services → Seleccionar servicio, fecha, hora → Enviar
↓
Server Action valida datos
↓
Cita guardada en memoria
↓
Confirmación de reserva
```

### 2. Ver Mis Citas
```
/dashboard/appointments
↓
Fetch desde /api/appointments?email=usuario@ejemplo.com
↓
Listar todas las citas del usuario
↓
Opción de cancelar individual
```

## 📱 API Endpoints

### GET /api/appointments
```bash
# Obtener citas de un usuario
GET /api/appointments?email=usuario@ejemplo.com

# Respuesta
{
  "appointments": [
    {
      "id": "abc123",
      "name": "Juan",
      "email": "juan@ejemplo.com",
      "phone": "+34666666666",
      "date": "2026-04-15",
      "time": "14:30",
      "service": "Tratamiento facial",
      "notes": "Piel sensible",
      "created": "2026-04-09T20:30:00Z"
    }
  ]
}
```

### POST /api/appointments
```bash
curl -X POST /api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan",
    "email": "juan@ejemplo.com",
    "phone": "+34666666666",
    "date": "2026-04-15",
    "time": "14:30",
    "service": "Tratamiento facial",
    "notes": "Piel sensible"
  }'
```

### DELETE /api/appointments
```bash
# Cancelar una cita
DELETE /api/appointments?id=abc123

# Respuesta
{
  "success": true,
  "message": "Cita cancelada"
}
```

## 🔐 Validaciones

- ✅ Campos requeridos: name, email, phone, date, time
- ✅ Email formato válido
- ✅ Fecha/hora no pueden ser en el pasado
- ✅ Teléfono requerido para contacto

## 💾 Almacenamiento

**MVP**: In-memory store (arreglo de citas)
- Se reinicia cada vez que se reinicia el servidor
- Prefecto para pruebas y demostración

**Producción**: Migrar a Prisma + PostgreSQL

### Modelo Prisma (Ejemplo)
```prisma
model Appointment {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  name      String
  email     String
  phone     String
  date      DateTime
  time      String
  service   String
  notes     String?
  created   DateTime @default(now())
  updated   DateTime @updatedAt
  cancelled Boolean  @default(false)
}
```

## 📍 Servicios Disponibles

Configurados en `/services/page.tsx`:

1. **Consulta general** - 30 min - $50
2. **Tratamiento facial** - 60 min - $120
3. **Tratamiento capilar** - 45 min - $90
4. **Package premium** - 90 min - $200

## 🔗 Integración con Autenticación

**Actual**: Usa email hardcoded `usuario@ejemplo.com`

**Con NextAuth**: Cambiar en `/dashboard/appointments/page.tsx`
```typescript
// Cambiar de:
const [email, setEmail] = useState('usuario@ejemplo.com');

// A:
const { data: session } = useSession();
const email = session?.user?.email || '';
```

## 📋 Próximos Pasos

1. **Conectar a Prisma/PostgreSQL**
   ```bash
   npx prisma migrate dev --name add-appointments
   ```

2. **Implementar notificaciones por email**
   - Confirmación de reserva
   - Recordatorio 24h antes
   - Cancelación

3. **Integrar calendario**
   - Mostrar horarios disponibles
   - Evitar doble-booking
   - Visualizar ocupación

4. **Admin panel**
   - Ver todas las citas
   - Editar/confirmar citas
   - Generar reportes

5. **Recordatorios SMS**
   - Integración Twilio
   - 24h antes de la cita

## 🧪 Prueba Rápida

```bash
# 1. Inicia servidor local
npm run dev

# 2. Ve a /services
# 3. Completa formulario con:
#    Nombre: Juan
#    Email: usuario@ejemplo.com
#    Teléfono: +34666666666
#    Servicio: Tratamiento facial
#    Fecha: (cualquier día futuro)
#    Hora: 14:30

# 4. Verás confirmación
# 5. Ve a /dashboard/appointments para ver tu cita
# 6. Prueba cancelar
```

## 📊 Estadísticas

- **Endpoints API**: 3 (GET, POST, DELETE)
- **Servicios**: 4 predefinidos
- **Validaciones**: 5 reglas de negocio
- **En-memory store**: Aprox. 1MB por 100 citas

