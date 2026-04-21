# Database Setup Guide - Prisma + PostgreSQL

## 🎯 Overview

Este proyecto usa un adaptador debase de datos en memoria compatible con Prisma API. Para producción, sigue estos pasos para migrar a una BD real PostgreSQL.

## 📋 Archivos de Configuración

```
prisma/
  ├── schema.prisma      ← Schema con modelos User, Appointment, Order
  └── migrations/        ← Historico de migraciones
  
lib/
  └── db.ts              ← Adaptador de BD (in-memory para MVP)
  
.env.local              ← Variables de entorno (incluye DATABASE_URL)
.env.example            ← Plantilla de variables
```

## 🚀 Configuración de PostgreSQL Local

### 1. Instalar PostgreSQL

**macOS (con Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Descargar desde https://www.postgresql.org/download/windows/

### 2. Crear base de datos

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear BD
CREATE DATABASE mai_natural;
CREATE USER mai_user WITH PASSWORD 'secure_password_here';
ALTER ROLE mai_user SET client_encoding TO 'utf8';
ALTER ROLE mai_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE mai_user SET default_transaction_deferrable TO on;
ALTER ROLE mai_user SET default_time_zone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE mai_natural TO mai_user;

# Salir
\q
```

### 3. Configurar .env.local

```env
# Base de datos
DATABASE_URL="postgresql://mai_user:secure_password_here@localhost:5432/mai_natural?schema=public"

# NextAuth
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"
```

## 🔄 Migrar a Prisma

### 1. Generar Prisma Client

```bash
npm install @prisma/client prisma --legacy-peer-deps
npx prisma generate
```

### 2. Ejecutar migraciones

```bash
# Crear y ejecutar migraciones
npx prisma migrate dev --name init

# Ver estado de migraciones
npx prisma migrate status

# Ver BD en Prisma Studio (UI)
npx prisma studio
```

### 3. Seed la BD (opcional)

```bash
npx prisma db seed
```

## 📊 Schema Prisma

```prisma
model User {
  id            String          @id @default(cuid())
  email         String          @unique
  name          String?
  password      String?
  phone         String?
  role          String          @default("user")
  appointments  Appointment[]
  orders        Order[]
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}

model Appointment {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  // ... campos ...
}

model Order {
  id        String      @id @default(cuid())
  userId    String
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  // ... campos ...
}
```

## 💾 Cambiar lib/db.ts a Prisma Real

Reemplazar el adaptador en memoria con:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
```

## 🧪 Prueba

```bash
npm run dev

# Ir a /register para crear un usuario
# Ir a /login para iniciar sesión
# Ir a /dashboard/profile para editar perfil
# Ir a /admin para ver panel de admin (requiere rol: admin)
```

## 🔗 Opciones Alternativas

### Supabase (PostgreSQL Hosted)
```bash
# 1. Crear cuenta en https://supabase.com
# 2. Crear proyecto
# 3. Copiar DATABASE_URL desde settings
# 4. Actualizar .env.local
# 5. npx prisma migrate deploy
```

### Vercel Postgres
```bash
# (Si deploys en Vercel)
vercel env pull
npx prisma migrate deploy
```

### Railway
```bash
# 1. Crear proyecto en railway.app
# 2. Agregar servicio PostgreSQL
# 3. Copiar DATABASE_URL
# 4. Actualizar .env.local
```

##  Troubleshooting

**Error: Cannot find module '@prisma/client'**
- Solución: `npm install && npm install @prisma/client prisma --legacy-peer-deps`

**Error: P1000 Authentication failed**
- Check DATABASE_URL credentials
- Verify PostgreSQL está corriendo

**Error: P1001 Can't reach database**
- Check PostgreSQL service está activo
- Verify host/port en DATABASE_URL

## 📚 Recursos

- [Prisma Docs](https://www.prisma.io/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Supabase Docs](https://supabase.com/docs)

