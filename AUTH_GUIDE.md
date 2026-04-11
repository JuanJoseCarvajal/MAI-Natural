# MAI-Natural Authentication Guide

## 🚀 Fase 1: MVP Actual (Completada)

✅ NextAuth configurado con demo users  
✅ Middleware protege `/dashboard/*`  
✅ Formularios login/register funcionales  

### Credenciales Demo
```
Email: usuario@ejemplo.com
Contraseña: password123
```

---

## 📋 Fase 2: Integración Prisma (Próximo paso)

### 1. Configurar Base de Datos PostgreSQL

```bash
# Crear archivo .env.local con:
DATABASE_URL="postgresql://user:password@localhost:5432/mai_natural"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Generar Prisma Client

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 3. Actualizar lib/auth.ts

Descomentar la lógica que usa `db.user.findUnique()` cuando Prisma esté listo.

### 4. Actualizar app/(auth)/actions.ts

Activar la lógica de registro en `registerAction()` (está comentada).

---

## 🔐 Estructura de Autenticación

```
middleware.ts                    ← Valida sesión para /dashboard/*
lib/auth.ts                      ← Configuración NextAuth + Credentials provider
lib/db.ts                        ← Cliente Prisma (placeholder)
app/(auth)/actions.ts            ← Server actions para login/register
app/(auth)/login/page.tsx        ← Formulario login
app/(auth)/register/page.tsx     ← Formulario register
prisma/schema.prisma             ← Modelo User con password
```

---

## 📦 Dependencias Instaladas

- `next-auth@5.0.0-beta.22` - Autenticación
- `bcryptjs` - Hash de contraseñas
- `@prisma/client` (opcional, para BD)
- `prisma` (opcional, para BD)

---

## ✨ Endpoints API

- `GET/POST /api/auth/signin` - NextAuth signin
- `GET /api/auth/signout` - NextAuth signout
- `GET /api/auth/session` - Obtener sesión actual

---

## 🔄 Flujo Autenticación

1. Usuario accede a `/dashboard` sin sesión
2. **Middleware** redirige a `/login`
3. Usuario completa formulario login
4. **loginAction** valida credenciales contra demo users
5. **NextAuth** crea JWT + cookie
6. Usuario redirigido a `/dashboard`

---

## 📝 Notas

- Demo users están en `lib/auth.ts` (arreglo estático)
- Para producción: Migra a Prisma + PostgreSQL
- Las contraseñas están hasheadas con bcrypt
- Las sesiones usan JWT con expiración de 30 días

