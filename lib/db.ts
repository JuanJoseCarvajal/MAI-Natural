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
  total: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory store para MVP (será reemplazado por Prisma en producción)
const users: Map<string, User> = new Map();
const appointments: Map<string, Appointment> = new Map();
const orders: Map<string, Order> = new Map();

// Flag para controlar si se ha inicializado la BD
let isInitialized = false;

function initializeDatabase() {
  if (isInitialized) return;
  
  const demoUser: User = {
    id: 'demo-user-1',
    email: 'usuario@ejemplo.com',
    name: 'Usuario Demo',
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
    async findUnique(args: { where: { email: string } }) {
      // Asegurar que la DB está inicializada
      initializeDatabase();
      
      // Buscar usuario en la store
      for (const user of users.values()) {
        if (user.email === args.where.email) {
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
    async update(args: { where: { email: string }; data: Partial<User> }) {
      for (const [id, user] of users) {
        if (user.email === args.where.email) {
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
    async create(args: { data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> }) {
      const id = randomUUID();
      const order: Order = {
        id,
        ...args.data,
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
  },
};
