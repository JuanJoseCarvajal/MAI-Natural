import { db, databaseTransaction } from './db';
import { initialConsultation } from './consultation';
import { wompiTransactionSchema } from './wompi-server';
import type { z } from 'zod';

export async function reconcileWompi(transaction: z.infer<typeof wompiTransactionSchema>, mode: string) {
  return databaseTransaction(async () => {
    const sandbox = mode === 'sandbox';
    if (transaction.reference.startsWith('mai-appointment-')) {
      const id = transaction.reference.slice('mai-appointment-'.length);
      const appointment = await db.appointment.findUnique({ where: { id } });
      if (!appointment || appointment.service !== initialConsultation.name || (appointment.paymentMode ?? 'sandbox') !== mode || transaction.amount_in_cents !== (appointment.paymentAmountInCents ?? initialConsultation.amountInCents)) throw new Error('El pago no coincide con la asesoría');
      if (appointment.wompiTransactionId && appointment.wompiTransactionId !== transaction.id) throw new Error('Otra transacción ya está asociada');
      if (appointment.wompiStatus === 'APPROVED') return;
      await db.appointment.update({ where: { id }, data: { wompiTransactionId: transaction.id, wompiStatus: transaction.status, ...(!sandbox ? { paymentStatus: transaction.status === 'APPROVED' ? 'confirmed' : transaction.status.toLowerCase() } : {}) } });
      // Payment is separate from scheduling: late payments never reserve a conflicting slot.
      return;
    }
    const id = transaction.reference.replace(/^mai-/, '');
    const order = await db.order.findUnique({ where: { id } });
    if (!order || order.paymentMethod !== (sandbox ? 'wompi_sandbox' : 'wompi') || transaction.reference !== `mai-${order.id}` || transaction.amount_in_cents !== order.total || (!sandbox && (!order.paymentStarted || !order.quoteVersion || order.acceptedQuoteVersion !== order.quoteVersion))) throw new Error('El pago no coincide con el pedido');
    if (order.wompiTransactionId && order.wompiTransactionId !== transaction.id) throw new Error('Otra transacción ya está asociada');
    if (order.wompiStatus === 'APPROVED') return;
    await db.order.update({ where: { id }, data: { wompiTransactionId: transaction.id, wompiStatus: transaction.status, paymentStatus: sandbox ? `sandbox_${transaction.status.toLowerCase()}` : transaction.status === 'APPROVED' ? (order.status === 'cancelled' ? 'paid_needs_review' : 'confirmed') : transaction.status.toLowerCase() } });
  });
}
