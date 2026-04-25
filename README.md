# MAI-Natural

Proyecto con Next.js y arquitectura modular para e-commerce + booking + admin panel.

## 🚀 Quick Start

```bash
pnpm install
pnpm dev
```

> Este proyecto usa **pnpm** como package manager. La versión está fijada en `package.json` (campo `packageManager`). Si no tienes pnpm, instálalo con `npm install -g pnpm` o habilita corepack (`corepack enable`).

Abre http://localhost:3000

## 🔐 Demo Credentials

**Usuario/Admin:**
- Email: `hola@mainatural.com`
- Contraseña: `password123`

## 📁 Rutas Principales

### Public
- `/` - Home
- `/products` - Listado de productos
- `/products/[id]` - Detalle del producto
- `/services` - Agendar citas

### Auth
- `/login` - Iniciar sesión
- `/register` - Registrarse

### User Account (Protegido)
- `/account` - Cuenta principal
- `/account/appointments` - Mis citas
- `/account/orders` - Mis órdenes
- `/account/profile` - Editar perfil

> Las rutas antiguas `/dashboard/*` redirigen automáticamente a `/account/*` vía middleware.

### Admin (Solo admins)
- `/admin` - Dashboard admin
- `/admin/appointments` - Todas las citas
- `/admin/orders` - Todas las órdenes
- `/admin/users` - Todos los usuarios

## ✨ Características Implementadas

### ✅ Autenticación
- NextAuth + Credentials provider
- JWT sessions (30 días)
- Middleware protection para `/account` y `/admin`
- Login/Register con validación

### ✅ Sistema de Citas
- Agendar desde `/services`
- 4 servicios predefinidos
- Dashboard de mis citas
- Cancelación de citas
- API REST completa

### ✅ Perfil de Usuario
- Editar información personal
- Ver datos de cuenta
- Logout desde perfil

### ✅ Panel de Administracion
- Dashboard con estadísticas
- Ver todas las citas
- Ver todas las órdenes y ingresos
- Ver todos los usuarios

### ✅ Base de Datos
- Schema Prisma configurado
- Adaptador en memoria (MVP)
- Listo para Prisma + PostgreSQL

## 📖 Documentacion

- **[AUTH_GUIDE.md](./AUTH_GUIDE.md)** - Autenticación y NextAuth
- **[APPOINTMENTS_GUIDE.md](./APPOINTMENTS_GUIDE.md)** - Sistema de citas
- **[PROFILE_ADMIN_GUIDE.md](./PROFILE_ADMIN_GUIDE.md)** - Perfil de usuario y admin panel
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Configuración Prisma + PostgreSQL

## 🏗️ Arquitectura

```
app/
  ├── (public)/        # Rutas públicas
  ├── (auth)/          # Login/Register
  ├── (dashboard)/     # Dashboard de usuario
  ├── admin/           # Admin panel
  └── api/             # Endpoints API

components/
  ├── ui/              # Design system
  ├── common/          # Layout components
  └── features/        # Feature-specific

lib/
  ├── auth.ts          # NextAuth config
  ├── db.ts            # Database adapter
  ├── wompi.ts         # Wompi checkout helpers
  └── utils.ts         # Utilities

prisma/
  ├── schema.prisma    # Database schema
  └── migrations/      # Migration history
```

## 🛠️ Stack Tecnológico

- **Next.js 14** - App router, Server components
- **React 18** - UI framework
- **TypeScript 5.3** - Type safety
- **Tailwind CSS 3.4** - Styling
- **NextAuth 5.0 (beta)** - Authentication
- **Prisma** - ORM (schema ready, adaptador en memoria por ahora)
- **PostgreSQL** - Database (pendiente de conectar)

## 📊 Build Status

✅ **17 rutas compiladas exitosamente**

```
Routes:
- ○ / (home)
- ○ /services (booking)
- ○ /dashboard (user)
- ○ /dashboard/appointments
- ○ /dashboard/orders  
- ○ /dashboard/profile
- ○ /admin (admin)
- ○ /admin/appointments
- ○ /admin/orders
- ○ /admin/users
- ○ /login
- ○ /register
- ○ /products
- ƒ /products/[id]
- ƒ /api/appointments
- ƒ /api/auth/[...nextauth]
- ƒ /api/trpc/[trpc]
```

## 🔄 Próximos Pasos

1. **Prisma + PostgreSQL** - Base de datos real
2. **Email Notifications** - Confirmación y recordatorios
3. **Admin Reports** - PDF/Excel de citas
4. **SMS Reminders** - Recordatorio 24h antes
5. **Advanced Analytics** - Gráficos en admin

## 📦 Build & Deploy

```bash
# Build (también corre type-check vía Next)
pnpm build

# Run localmente
pnpm start
```

## 💡 Notas MVP

- Datos en memoria (se pierden en restart)
- Admin demo: usuario@ejemplo.com
- Migración a Prisma + BD real está documentada
- NextAuth ready para más providers (Google, GitHub, etc)

## 📝 License

MIT
