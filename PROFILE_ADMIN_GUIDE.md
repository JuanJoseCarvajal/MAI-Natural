# User Profile & Admin Panel Guide

## 👤 User Profile (`/dashboard/profile`)

### Funcionalidades

- **Editar información personal**: Nombre, teléfono
- **Ver datos de cuenta**: Email (no editable)
- **Cerrar sesión**: Logout inmediato
- **Información del MVP**: Tips sobre la plataforma

### Archivos

```
app/(dashboard)/dashboard/profile/
  ├── page.tsx         ← UI del perfil
  └── actions.ts       ← Server actions para actualizar perfil
```

### Flujo

```
1. Usuario accede a /dashboard/profile
2. Carga datos actuales del perfil
3. Puede editar nombre y teléfono
4. Hace click en "Guardar cambios"
5. Server action actualiza en BD
6. Confirmación de éxito/error
```

### API Server Action

```typescript
async function updateProfileAction(
  email: string,
  name: string,
  phone: string
)

// Retorna:
{
  success: true,
  message: 'Perfil actualizado exitosamente',
  user: { ...userData }
}
// o
{
  error: 'Mensaje de error'
}
```

### Datos de Prueba

- **Email**: usuario@ejemplo.com (no editable)
- **Nombre**: Usuario Demo (editable)
- **Teléfono**: +34 666 666 666 (editable)

---

## 🛡️ Admin Panel (`/admin`)

### Rutas Disponibles

- `/admin` - Dashboard principal
- `/admin/appointments` - Ver todas las citas
- `/admin/orders` - Ver todas las órdenes
- `/admin/users` - Ver todos los usuarios

### Funcionalidades

**Dashboard (`/admin`)**
- Resumen estadístico: Total de citas, órdenes, usuarios
- Cards interactivas con enlaces a detalle
- Acciones rápidas

**Citas (`/admin/appointments`)**
- Tabla completa de todas las citas
- Filtro por estado (pending, confirmed, cancelled)
- Info: nombre, email, teléfono, servicio, fecha/hora

**Órdenes (`/admin/orders`)**
- Tabla de todas las órdenes
- Monto total por orden
- Estado de pago/envío
- Estadística de ingresos totales

**Usuarios (`/admin/users`)**
- Tabla con todos los usuarios registrados
- Rol (admin/user)
- Datos: email, nombre, teléfono
- Estadísticas: total de usuarios, admins, regulares

### Archivos

```
app/admin/
  ├── layout.tsx          ← Layout con sidebar
  ├── page.tsx            ← Dashboard
  ├── actions.ts          ← Server actions
  └── appointments/
      └── page.tsx
  └── orders/
      └── page.tsx
  └── users/
      └── page.tsx
```

### Server Actions

```typescript
// Obtener datos
async function getAllAppointments()
async function getAllOrders()
async function getAllUsers()
async function isUserAdmin(email: string)

// Retornan arrays de objetos o errores
```

### Seguridad

**MVP**: Sin autenticación explícita (confía en sesión)

**Próximo paso**: Agregar middleware para verificar rol=admin

```typescript
// Middleware para proteger /admin
if (!session.user || user.role !== 'admin') {
  redirect('/dashboard');
}
```

### UI Components

- **Sidebar**: Navegación principal, links a secciones
- **StatCard**: Cards con número, icono, enlace
- **Tables**: Tablas responsive con datos
- **Badges**: Estados con colores (pending, paid, etc.)

### Datos Admin Demo

- **Usuario admin**: usuario@ejemplo.com (rol: admin)
- **Contraseña**: password123
- **Permisos**: Acceso a TODO en /admin

### Cómo Promover a Admin

**En el adaptador bd.ts (MVP)**:
- Cambiar `role: 'user'` a `role: 'admin'`

**Con Prisma Real**:
```prisma
UPDATE users SET role='admin' WHERE email='usuario@email.com';
```

---

## 📊 Integraciones Futuras

### 1. Admin: Eliminar/Editar
```typescript
// Agregar botones para:
- Cambiar estado de citas
- Refundar órdenes
- Suspender usuarios
- Roles/permisos avanzados
```

### 2. Admin: Reportes
```
- PDF de citas por rango fecha
- Ingresos por período
- Usuarios más activos
- Servicios más vendidos
```

### 3. Admin: Analytics
```
- Gráficos de ingresos
- Heatmap de ocupación
- Retención de usuarios
- Conversión (views → bookings)
```

### 4. Notificaciones
```
- Email cuando se agendan/cancelen citas
- SMS de recordatorio 24h antes
- Alerts a admin de nuevas órdenes
```

---

## 🧪 Testing

### Flow 1: Usuario Regular
```
1. /register - Crear cuenta
2. /login - Iniciar sesión
3. /dashboard - Ver dashboard
4. /dashboard/profile - Editar perfil
5. /services - Agendar cita
6. /dashboard/appointments - Ver mis citas
```

### Flow 2: Admin
```
1. /login con admin (usuario@ejemplo.com)
2. /admin - Ver dashboard admin
3. /admin/appointments - Ver todas las citas
4. /admin/orders - Ver ingresos
5. /admin/users - Ver usuarios registrados
```

---

## 📝 Notas Importantes

- **MVP**: Datos en memoria (se pierden al reiniciar)
- **Producción**: Usar Prisma + PostgreSQL
- **Auth**: Sesión JWT con 30 días de expiración
- **Roles**: "admin" y "user" básicamente
- **CRUD**: Lectura completa, escritura limitada en MVP

