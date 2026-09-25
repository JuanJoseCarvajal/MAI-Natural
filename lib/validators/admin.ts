import { z } from 'zod';
const text = (max:number) => z.string().trim().max(max);
const category = z.enum(['facial','capilar','corporal','kits']);
const money = z.number().int().min(0).max(10000000000);
export const adminProductSchema = z.object({
  id:text(160).optional(), image:text(500).refine(value => (value.startsWith('/') && !value.startsWith('//') && !/[\\\u0000-\u0020]/.test(value)) || /^https:\/\/mainatural\.com\//.test(value),'Imagen fuera del dominio permitido'),
  name:text(160).min(2),price:text(100),amountInCents:money,description:text(12000),category,
  badge:text(120).optional(),benefits:z.array(text(1000)).max(30).optional(),rating:z.number().min(0).max(5).optional(),reviewsCount:z.number().int().min(0).optional(),
  sku:text(120).optional(),stock:z.number().int().min(0).max(1000000).optional(),active:z.boolean().optional(),
}).strict();
export const adminDiscountSchema = z.object({
  id:text(160).optional(),code:text(60).min(1).regex(/^[A-Za-z0-9_-]+$/),label:text(160).min(1),description:text(2000).optional(),active:z.boolean(),
  kind:z.enum(['percentage','fixed']),percentage:z.number().min(0).max(100).optional(),amountInCents:money.optional(),scope:z.enum(['all','category','products','kits']),category:category.optional(),productIds:z.array(text(160)).max(500).optional(),minimumSubtotalInCents:money.optional(),
}).strict().refine(value => value.kind === 'percentage' ? (value.percentage ?? 0) > 0 : (value.amountInCents ?? 0) > 0,'Descuento inválido');
