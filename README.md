# MAI-Natural

Proyecto con Next.js y arquitectura modular para e-commerce + booking + admin panel.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## 🔐 Demo Credentials

**Usuario/Admin:**
- Email: `usuario@ejemplo.com`
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

### User Dashboard (Protegido)
- `/dashboard` - Dashboard principal
- `/dashboard/appointments` - Mis citas
- `/dashboard/orders` - Mis órdenes
- `/dashboard/profile` - Editar perfil

### Admin (Solo admins)
- `/admin` - Dashboard admin
- `/admin/appointments` - Todas las citas
- `/admin/orders` - Todas las órdenes
- `/admin/users` - Todos los usuarios

## ✨ Características Implementadas

### ✅ Autenticación
- NextAuth + Credentials provider
- JWT sessions (30 días)
- Middleware protection para `/dashboard`
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
  ├── stripe.ts        # Stripe config
  └── utils.ts         # Utilities

prisma/
  ├── schema.prisma    # Database schema
  └── migrations/      # Migration history
```

## 🛠️ Stack Tecnológico

- **Next.js 16.2.3** - App router, Server components
- **React 19.2.5** - UI framework
- **TypeScript 5.5.4** - Type safety
- **Tailwind CSS 3.4.7** - Styling
- **NextAuth 5.0.0** - Authentication
- **Prisma** - ORM (schema ready)
- **PostgreSQL** - Database (optional)

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
- ƒ /api/webhooks/stripe
```

## 🔄 Próximos Pasos

1. **Stripe Integration** - Checkout y pagos
2. **Prisma + PostgreSQL** - Base de datos real
3. **Email Notifications** - Confirmación y recordatorios
4. **Admin Reports** - PDF/Excel de citas
5. **SMS Reminders** - Recordatorio 24h antes
6. **Advanced Analytics** - Gráficos en admin

## 📦 Build & Deploy

```bash
# Build
npm run build

# Run localmente
npm run start

# Lint
npm run lint
```

## 💡 Notas MVP

- Datos en memoria (se pierden en restart)
- Admin demo: usuario@ejemplo.com
- Migración a Prisma + BD real está documentada
- NextAuth ready para más providers (Google, GitHub, etc)

## 📝 License

MIT