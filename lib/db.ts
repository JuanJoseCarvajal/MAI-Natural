// Adaptador de base de datos compatible
// Nota: Para producción, configurar Prisma adecuadamente
// Ver: SETUP.md para instrucciones de Prisma + PostgreSQL

import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

// Pre-hash de la contraseña del usuario demo
const DEMO_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

export interface User {
  id: string;
  email: string;
  name?: string | null;
  password?: string | null;
  phone?: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PasswordResetToken {
  id: string;
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt: Date;
}

export interface Appointment {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  service: string;
  notes?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    id: string;
    name: string;
    price: string;
    amountInCents: number;
    quantity: number;
  }>;
  total: number;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string | null;
  shippingStatus?: string;
  trackingNumber?: string | null;
  discountCode?: string | null;
  proofInstructions?: string | null;
  proofSubmittedAt?: Date | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory store para MVP (será reemplazado por Prisma en producción)
const users: Map<string, User> = new Map();
const passwordResetTokens: Map<string, PasswordResetToken> = new Map();
const appointments: Map<string, Appointment> = new Map();
const orders: Map<string, Order> = new Map();

// Flag para controlar si se ha inicializado la BD
let isInitialized = false;

function initializeDatabase() {
  if (isInitialized) return;
  
  const demoUser: User = {
    id: 'demo-user-1',
    email: 'hola@mainatural.com',
    name: 'Administracion MAI',
    password: DEMO_PASSWORD_HASH,
    phone: '+34 666 666 666',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  users.set(demoUser.id, demoUser);
  isInitialized = true;
}

// Inicializar inmediatamente
initializeDatabase();

export const db = {
  // User operations
  user: {
    async findUnique(args: { where: { email?: string; id?: string } }) {
      // Asegurar que la DB está inicializada
      initializeDatabase();
      const lookupEmail = args.where.email?.toLowerCase();
      
      // Buscar usuario en la store
      for (const user of users.values()) {
        if (
          (lookupEmail && user.email.toLowerCase() === lookupEmail) ||
          (args.where.id && user.id === args.where.id)
        ) {
          return user;
        }
      }
      
      return null;
    },
    async create(args: { data: Partial<User> & { email: string; password: string; name?: string } }) {
      const id = randomUUID();
      const user: User = {
        id,
        role: 'user',
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.set(id, user);
      return user;
    },
    async update(args: { where: { email?: string; id?: string }; data: Partial<User> }) {
      for (const [id, user] of users) {
        if (
          (args.where.email && user.email === args.where.email) ||
          (args.where.id && user.id === args.where.id)
        ) {
          const updated = { ...user, ...args.data, updatedAt: new Date() };
          users.set(id, updated);
          return updated;
        }
      }
      return null;
    },
    async findMany() {
      return Array.from(users.values());
    },
  },

  passwordResetToken: {
    async create(args: {
      data: Omit<PasswordResetToken, 'id' | 'createdAt' | 'usedAt'> & {
        usedAt?: Date | null;
      };
    }) {
      const id = randomUUID();
      const token: PasswordResetToken = {
        id,
        ...args.data,
        usedAt: args.data.usedAt ?? null,
        createdAt: new Date(),
      };
      passwordResetTokens.set(id, token);
      return token;
    },
    async findUnique(args: { where: { tokenHash: string } }) {
      for (const token of passwordResetTokens.values()) {
        if (token.tokenHash === args.where.tokenHash) {
          return token;
        }
      }
      return null;
    },
    async update(args: {
      where: { id: string };
      data: Partial<PasswordResetToken>;
    }) {
      const current = passwordResetTokens.get(args.where.id);
      if (!current) return null;
      const updated = { ...current, ...args.data };
      passwordResetTokens.set(args.where.id, updated);
      return updated;
    },
    async deleteMany(args: { where: { userId?: string; tokenHash?: string } }) {
      let count = 0;
      for (const [id, token] of passwordResetTokens) {
        if (
          (args.where.userId && token.userId === args.where.userId) ||
          (args.where.tokenHash && token.tokenHash === args.where.tokenHash)
        ) {
          passwordResetTokens.delete(id);
          count += 1;
        }
      }
      return { count };
    },
  },

  // Appointment operations
  appointment: {
    async findUnique(args: { where: { id: string } }) {
      return appointments.get(args.where.id) ?? null;
    },
    async create(args: { data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'> }) {
      const id = randomUUID();
      const appointment: Appointment = {
        id,
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      appointments.set(id, appointment);
      return appointment;
    },
    async findMany(args?: { where?: { email?: string; userId?: string } }) {
      let result = Array.from(appointments.values());
      if (args?.where) {
        if (args.where.email) {
          result = result.filter((a) => a.email === args.where?.email);
        }
        if (args.where.userId) {
          result = result.filter((a) => a.userId === args.where?.userId);
        }
      }
      return result;
    },
    async update(args: { where: { id: string }; data: Partial<Appointment> }) {
      const current = appointments.get(args.where.id);
      if (!current) return null;
      const updated: Appointment = {
        ...current,
        ...args.data,
        updatedAt: new Date(),
      };
      appointments.set(args.where.id, updated);
      return updated;
    },
    async delete(args: { where: { id: string } }) {
      appointments.delete(args.where.id);
      return { id: args.where.id };
    },
  },

  // Order operations
  order: {
    async findUnique(args: { where: { id: string } }) {
      return orders.get(args.where.id) ?? null;
    },
    async create(args: { data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> }) {
      const id = randomUUID();
      const order: Order = {
        id,
        ...args.data,
        status: args.data.status ?? 'pending_confirmation',
        paymentStatus: args.data.paymentStatus ?? 'pending_confirmation',
        shippingStatus: args.data.shippingStatus ?? 'pending_confirmation',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      orders.set(id, order);
      return order;
    },
    async findMany(args?: { where?: { userId: string } }) {
      let result = Array.from(orders.values());
      if (args?.where?.userId) {
        result = result.filter((o) => o.userId === args.where?.userId);
      }
      return result;
    },
    async update(args: { where: { id: string }; data: Partial<Order> }) {
      const current = orders.get(args.where.id);
      if (!current) return null;
      const updated: Order = {
        ...current,
        ...args.data,
        updatedAt: new Date(),
      };
      orders.set(args.where.id, updated);
      return updated;
    },
  },
};
