'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { createAppointment, getDayAvailability } from './actions';
import BookingCalendar from '@/components/ui/BookingCalendar';

const SERVICES = [
  { id: '1', name: 'Consulta general', duration: '30 min', priceLabel: '$50.000', amountInCents: 5000000 },
  { id: '2', name: 'Tratamiento facial', duration: '60 min', priceLabel: '$120.000', amountInCents: 12000000 },
  { id: '3', name: 'Tratamiento capilar', duration: '45 min', priceLabel: '$90.000', amountInCents: 9000000 },
  { id: '4', name: 'Package premium', duration: '90 min', priceLabel: '$200.000', amountInCents: 20000000 },
];
const CALENDLY_BASE_URL = process.env.NEXT_PUBLIC_CALENDLY_URL ?? '';
const ENABLE_CALENDLY = Boolean(CALENDLY_BASE_URL);
const BANK_NAME = process.env.NEXT_PUBLIC_BANCOLOMBIA_BANK_NAME ?? 'Bancolombia';
const BANK_ACCOUNT_TYPE = process.env.NEXT_PUBLIC_BANCOLOMBIA_ACCOUNT_TYPE ?? 'Cuenta de ahorros';
const BANK_ACCOUNT_NUMBER = process.env.NEXT_PUBLIC_BANCOLOMBIA_ACCOUNT_NUMBER ?? '678-901234-56';
const BANK_ACCOUNT_HOLDER = process.env.NEXT_PUBLIC_BANCOLOMBIA_ACCOUNT_HOLDER ?? 'MAI Natural SAS';
const BANK_QR_STATIC_URL = process.env.NEXT_PUBLIC_BANCOLOMBIA_QR_URL ?? '';

type ConfirmedAppointment = {
  id: string;
  paymentDueAtIso: string;
};

function formatCOP(amountInCents: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amountInCents / 100);
}

function formatTimeLeft(targetIso: string, now: number) {
  const diff = new Date(targetIso).getTime() - now;
  if (diff <= 0) return 'Tiempo vencido';
  const totalMinutes = Math.floor(diff / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

function buildCalendlyUrl(baseUrl: string, params: { name: string; email: string; service: string }) {
  if (!baseUrl) return '';
  const url = new URL(baseUrl);
  if (params.name) url.searchParams.set('name', params.name);
  if (params.email) url.searchParams.set('email', params.email);
  if (params.service) url.searchParams.set('a1', params.service);
  return url.toString();
}

function buildTransferQrUrl(params: { appointmentId: string; serviceName: string; amountInCents: number }) {
  const amountInPesos = Math.round(params.amountInCents / 100);
  const transferPayload = [
    `Banco:${BANK_NAME}`,
    `Tipo:${BANK_ACCOUNT_TYPE}`,
    `Cuenta:${BANK_ACCOUNT_NUMBER}`,
    `Titular:${BANK_ACCOUNT_HOLDER}`,
    `Valor COP:${amountInPesos}`,
    `Ref:${params.appointmentId}`,
    `Concepto:${params.serviceName}`,
  ].join('\n');

  return `https://quickchart.io/qr?text=${encodeURIComponent(transferPayload)}&size=280`;
}

export default function ServicesPage() {
  const steps = ['Servicio', 'Tus datos', 'Horario', 'Confirmar', 'Pago'];
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    service: '',
    notes: '',
  });
  const [reviewData, setReviewData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    service: '',
    notes: '',
  });
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({});
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [dayAvailability, setDayAvailability] = useState({ count: 0, remaining: 2, isFull: false });
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<ConfirmedAppointment | null>(null);
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());
  const [confirmingTransfer, setConfirmingTransfer] = useState(false);
  const [transferReference, setTransferReference] = useState('');
  const [transferMessage, setTransferMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCalendly, setShowCalendly] = useState(false);
  const [paymentConfirmation, setPaymentConfirmation] = useState<{
    method: 'transfer';
    note: string;
  } | null>(null);

  const selectedService = SERVICES.find((service) => service.name === reviewData.service);
  const paymentExpired = confirmedAppointment
    ? new Date(confirmedAppointment.paymentDueAtIso).getTime() <= nowTimestamp
    : false;
  const calendlyUrl = buildCalendlyUrl(CALENDLY_BASE_URL, {
    name: formData.name,
    email: formData.email,
    service: formData.service,
  });
  const transferQrUrl = confirmedAppointment && selectedService
    ? BANK_QR_STATIC_URL || buildTransferQrUrl({
        appointmentId: confirmedAppointment.id,
        serviceName: selectedService.name,
        amountInCents: selectedService.amountInCents,
      })
    : BANK_QR_STATIC_URL;

  const timeSlots = useMemo(
    () => ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
    []
  );

  useEffect(() => {
    const checkAvailability = async () => {
      if (!formData.date) {
        setDayAvailability({ count: 0, remaining: 2, isFull: false });
        return;
      }

      setCheckingAvailability(true);
      const availability = await getDayAvailability(formData.date);
      setDayAvailability({
        count: availability.count,
        remaining: availability.remaining,
        isFull: availability.isFull,
      });
      setCheckingAvailability(false);
    };

    checkAvailability();
  }, [formData.date]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowTimestamp(Date.now());
    }, 30000);

    return () => window.clearInterval(timer);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const canGoNext = () => {
    if (step === 0) return Boolean(formData.service);
    if (step === 1) return Boolean(formData.name && formData.email && formData.phone);
    if (step === 2) return Boolean(formData.date && formData.time && !dayAvailability.isFull);
    if (step === 3) return true;
    return true;
  };

  const goNext = () => {
    if (!canGoNext()) {
      setMessage({
        type: 'error',
        text: 'Completa los campos requeridos para continuar.',
      });
      return;
    }

    if (step >= steps.length - 2) {
      return;
    }

    if (step === 2) {
      setReviewData({ ...formData });
    }

    setMessage(null);
    setStep((prev) => Math.min(prev + 1, steps.length - 2));
  };

  const goBack = () => {
    setMessage(null);
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const getFirstIncompleteStep = () => {
    if (!formData.service) return 0;
    if (!formData.name || !formData.email || !formData.phone) return 1;
    if (!formData.date || !formData.time || dayAvailability.isFull) return 2;
    return -1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step !== steps.length - 2) {
      return;
    }

    const missingStep = getFirstIncompleteStep();
    if (missingStep !== -1) {
      setMessage(null);
      setStep(missingStep);
      return;
    }

    setLoading(true);
    setMessage(null);
    setFieldErrors({});

    try {
      const result = await createAppointment(
        formData.name,
        formData.email,
        formData.phone,
        formData.date,
        formData.time,
        formData.service,
        formData.notes
      );

      if (result.success) {
        const createdAtIso = result.appointment?.createdAt
          ? new Date(result.appointment.createdAt).toISOString()
          : new Date().toISOString();
        const dueDate = new Date(createdAtIso);
        dueDate.setDate(dueDate.getDate() + 1);

        setConfirmedAppointment({
          id: result.appointment?.id ?? '',
          paymentDueAtIso: dueDate.toISOString(),
        });
        setTransferReference('');
        setTransferMessage(null);
        setPaymentConfirmation(null);
        setMessage({
          type: 'success',
          text: 'Cita confirmada. Completa el pago o confirma consignación dentro de las próximas 24 horas.',
        });
        setStep(steps.length - 1);
      } else {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
          const contactHasError =
            result.fieldErrors.name ||
            result.fieldErrors.email ||
            result.fieldErrors.phone;
          if (contactHasError) {
            setStep(1);
          }
        }

        if (result.error === 'Completa todos los campos requeridos') {
          const fallbackStep = getFirstIncompleteStep();
          if (fallbackStep !== -1) {
            setStep(fallbackStep);
            setMessage(null);
            return;
          }
        }

        setMessage({
          type: 'error',
          text: result.error || 'Error al reservar la cita',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error inesperado',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBankTransfer = async () => {
    if (!confirmedAppointment?.id) return;
    if (!transferReference.trim()) {
      setTransferMessage({
        type: 'error',
        text: 'Ingresa el número de referencia de la consignación.',
      });
      return;
    }

    setConfirmingTransfer(true);
    setTransferMessage(null);

    try {
      const response = await fetch('/api/appointments/confirm-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: confirmedAppointment.id,
          transferReference: transferReference.trim(),
        }),
      });

      const data = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || !data.success) {
        setTransferMessage({
          type: 'error',
          text: data.error ?? 'No fue posible confirmar la consignación.',
        });
        return;
      }

      setTransferMessage({
        type: 'success',
        text: 'Recibimos tu confirmación de consignación. Verificaremos el pago y te contactaremos por correo.',
      });
      setPaymentConfirmation({
        method: 'transfer',
        note: `Referencia recibida: ${transferReference.trim()}. Tu pago quedó pendiente de validación manual por el equipo MAI.`,
      });
    } catch (error) {
      setTransferMessage({
        type: 'error',
        text: 'Error de conexión al confirmar la consignación.',
      });
    } finally {
      setConfirmingTransfer(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-900">Servicios y Agendamiento</h1>
      <p className="mt-3 text-slate-700">Agenda una asesoría personalizada en un flujo guiado paso a paso.</p>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow ring-1 ring-brand-100">
        <div className="mb-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {steps.map((label, index) => (
              <div
                key={label}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  index === step
                    ? 'bg-brand-700 text-white'
                    : index < step
                    ? 'bg-brand-100 text-brand-900'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {index + 1}. {label}
              </div>
            ))}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-brand-700 transition-all duration-300"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {message && (
          <div
            className={`mb-4 rounded-lg p-3 text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {step === 0 ? (
            <section>
              <h2 className="text-xl font-semibold text-brand-900">Paso 1: Elige tu servicio</h2>
              <p className="mt-1 text-sm text-slate-600">Selecciona la opción que mejor se adapte a tu necesidad.</p>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                {SERVICES.map((service) => {
                  const active = formData.service === service.name;
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, service: service.name }))}
                      className={`rounded-xl border p-4 text-left transition ${
                        active
                          ? 'border-brand-700 bg-brand-50 ring-1 ring-brand-300'
                          : 'border-slate-200 bg-white hover:border-brand-300'
                      }`}
                    >
                      <h3 className="font-semibold text-brand-900">{service.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">Duración: {service.duration}</p>
                      <p className="mt-2 font-bold text-brand-700">{service.priceLabel}</p>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {step === 1 ? (
            <section>
              <h2 className="text-xl font-semibold text-brand-900">Paso 2: Datos de contacto</h2>
              <p className="mt-1 text-sm text-slate-600">Usaremos estos datos para confirmar tu cita.</p>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nombre completo"
                    value={formData.name}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.name)}
                    className={`w-full rounded-lg border px-3 py-2 ${
                      fieldErrors.name ? 'border-red-500' : ''
                    }`}
                    required
                  />
                  {fieldErrors.name?.[0] ? (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.name[0]}</p>
                  ) : null}
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Correo"
                    value={formData.email}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.email)}
                    className={`w-full rounded-lg border px-3 py-2 ${
                      fieldErrors.email ? 'border-red-500' : ''
                    }`}
                    required
                  />
                  {fieldErrors.email?.[0] ? (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.email[0]}</p>
                  ) : null}
                </div>
                <div className="md:col-span-2">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Teléfono"
                    value={formData.phone}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.phone)}
                    className={`w-full rounded-lg border px-3 py-2 ${
                      fieldErrors.phone ? 'border-red-500' : ''
                    }`}
                    required
                  />
                  {fieldErrors.phone?.[0] ? (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.phone[0]}</p>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            <section>
              <h2 className="text-xl font-semibold text-brand-900">Paso 3: Fecha y hora</h2>
              <p className="mt-1 text-sm text-slate-600">Selecciona una fecha y luego una hora disponible.</p>

              {ENABLE_CALENDLY ? (
                <div className="mt-4 rounded-2xl border border-brand-200 bg-brand-50 p-4">
                  <p className="text-sm font-semibold text-brand-900">Calendly listo para agendar</p>
                  <p className="mt-1 text-sm text-slate-700">
                    Si ya tienes tu enlace de Calendly configurado, puedes usarlo aquí para mostrar disponibilidad real al cliente.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCalendly((prev) => !prev)}
                      className="rounded-full bg-brand-700 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-900"
                    >
                      {showCalendly ? 'Ocultar Calendly' : 'Abrir Calendly aquí'}
                    </button>
                    <a
                      href={calendlyUrl || CALENDLY_BASE_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-brand-300 px-4 py-2 text-xs font-semibold text-brand-900 hover:bg-white"
                    >
                      Abrir Calendly en nueva pestaña
                    </a>
                  </div>
                  {showCalendly ? (
                    <iframe
                      title="Calendly"
                      src={calendlyUrl || CALENDLY_BASE_URL}
                      className="mt-4 h-[680px] w-full rounded-xl border border-brand-100 bg-white"
                    />
                  ) : null}
                </div>
              ) : null}

              <div className="mt-4 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
                <BookingCalendar
                  currentMonth={currentMonth}
                  selectedDate={formData.date}
                  onSelectDate={(date) =>
                    setFormData((prev) => ({
                      ...prev,
                      date,
                      time: '',
                    }))
                  }
                  onPrevMonth={() =>
                    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                  }
                  onNextMonth={() =>
                    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                  }
                />

                <div className="rounded-2xl border border-brand-100 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-brand-900">Horarios del día</p>
                  {!formData.date ? (
                    <p className="mt-2 text-sm text-slate-500">Elige una fecha para ver horarios.</p>
                  ) : (
                    <>
                      <p className="mt-2 text-xs text-slate-600">
                        Cupos por día: {dayAvailability.count}/2
                        {checkingAvailability ? ' (validando...)' : ''}
                      </p>
                      {dayAvailability.isFull ? (
                        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                          Este día ya está completo. Elige otra fecha.
                        </p>
                      ) : null}
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {timeSlots.map((hour) => (
                          <button
                            key={hour}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, time: hour }))}
                            disabled={dayAvailability.isFull}
                            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                              formData.time === hour
                                ? 'border-brand-700 bg-brand-700 text-white'
                                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                            } ${dayAvailability.isFull ? 'cursor-not-allowed opacity-50' : ''}`}
                          >
                            {hour}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <textarea
                name="notes"
                placeholder="Notas adicionales (opcional)"
                value={formData.notes}
                onChange={handleChange}
                className="mt-4 w-full rounded-lg border px-3 py-2"
                rows={3}
              />
            </section>
          ) : null}

          {step === 3 ? (
            <section>
              <h2 className="text-xl font-semibold text-brand-900">Paso 4: Confirma tu cita</h2>
              <p className="mt-1 text-sm text-slate-600">Revisa la información antes de enviar.</p>
              <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50 p-4">
                <p className="text-sm text-slate-700"><strong>Servicio:</strong> {selectedService?.name || reviewData.service}</p>
                <p className="text-sm text-slate-700 mt-1"><strong>Duración:</strong> {selectedService?.duration || 'N/A'}</p>
                <p className="text-sm text-slate-700 mt-1"><strong>Precio:</strong> {selectedService?.priceLabel || 'N/A'}</p>
                <p className="text-sm text-slate-700 mt-3"><strong>Nombre:</strong> {reviewData.name}</p>
                <p className="text-sm text-slate-700 mt-1"><strong>Correo:</strong> {reviewData.email}</p>
                <p className="text-sm text-slate-700 mt-1"><strong>Teléfono:</strong> {reviewData.phone}</p>
                <p className="text-sm text-slate-700 mt-1"><strong>Fecha:</strong> {reviewData.date}</p>
                <p className="text-sm text-slate-700 mt-1"><strong>Hora:</strong> {reviewData.time}</p>
                {reviewData.notes ? (
                  <p className="text-sm text-slate-700 mt-1"><strong>Notas:</strong> {reviewData.notes}</p>
                ) : null}
              </div>
            </section>
          ) : null}

          {step === 4 ? (
            <section className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-brand-900">Paso 5: Pago y próximos pasos</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Tu cita quedó registrada en estado pendiente de pago. Para asegurarla, realiza tu transferencia Bancolombia y reporta la referencia.
                </p>
              </div>

              <div className={`rounded-xl border p-4 ${paymentExpired ? 'border-red-200 bg-red-50' : 'border-brand-100 bg-brand-50'}`}>
                <p className={`text-sm font-semibold ${paymentExpired ? 'text-red-700' : 'text-brand-900'}`}>
                  Ventana de pago: 24 horas
                </p>
                <p className={`mt-1 text-sm ${paymentExpired ? 'text-red-600' : 'text-slate-700'}`}>
                  Tiempo restante: {confirmedAppointment ? formatTimeLeft(confirmedAppointment.paymentDueAtIso, nowTimestamp) : 'N/A'}
                </p>
                <p className={`mt-1 text-xs ${paymentExpired ? 'text-red-600' : 'text-slate-600'}`}>
                  Si no recibimos pago o confirmación dentro del plazo, la reserva se libera automáticamente.
                </p>
              </div>

              <article className="rounded-2xl border border-brand-100 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Metodo disponible</p>
                <h3 className="mt-1 text-lg font-bold text-brand-900">Transferencia Bancolombia</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Esta primera version recibe pagos unicamente por transferencia. Tu cita queda reservada y el equipo la confirma manualmente al validar la referencia.
                </p>
                <p className="mt-3 text-sm font-semibold text-brand-900">
                  Total a transferir: {selectedService ? formatCOP(selectedService.amountInCents) : 'N/A'}
                </p>
                <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  <p><strong>Banco:</strong> {BANK_NAME}</p>
                  <p><strong>Tipo:</strong> {BANK_ACCOUNT_TYPE}</p>
                  <p><strong>Número:</strong> {BANK_ACCOUNT_NUMBER}</p>
                  <p><strong>Titular:</strong> {BANK_ACCOUNT_HOLDER}</p>
                  <p className="mt-1 text-xs text-slate-500">En el concepto coloca tu nombre y la fecha de la cita.</p>
                </div>
                {transferQrUrl ? (
                  <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-center">
                    <p className="text-xs font-semibold text-brand-900">QR para transferencia</p>
                    <Image
                      src={transferQrUrl}
                      alt="QR transferencia Bancolombia"
                      width={280}
                      height={280}
                      className="mx-auto mt-2 h-48 w-48 rounded-md border border-slate-200 bg-white p-2"
                    />
                    <p className="mt-2 text-xs text-slate-500">Escanea para cargar la cuenta y la referencia de esta cita.</p>
                  </div>
                ) : null}
                <input
                  type="text"
                  value={transferReference}
                  onChange={(e) => setTransferReference(e.target.value)}
                  placeholder="Referencia de transferencia"
                  className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  disabled={paymentExpired}
                />
                <button
                  type="button"
                  onClick={handleConfirmBankTransfer}
                  disabled={confirmingTransfer || paymentExpired || Boolean(paymentConfirmation)}
                  className="mt-3 w-full rounded-full border border-brand-400 px-5 py-2.5 text-sm font-semibold text-brand-900 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {confirmingTransfer ? 'Confirmando...' : 'Reportar transferencia'}
                </button>
              </article>

              {paymentConfirmation ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <h3 className="text-sm font-semibold text-green-800">Transferencia reportada</h3>
                  <p className="mt-1 text-sm text-green-700">
                    Método: Transferencia Bancolombia.
                  </p>
                  <p className="mt-1 text-sm text-green-700">{paymentConfirmation.note}</p>
                  <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-green-800">
                    <li>El equipo revisará la referencia y validará el pago manualmente.</li>
                    <li>Te contactaremos por correo o WhatsApp con la confirmación final.</li>
                    <li>Si necesitas mover la cita, gestionala primero desde Calendly si ya fue creada allí.</li>
                  </ol>
                </div>
              ) : null}

              {transferMessage ? (
                <div
                  className={`rounded-lg p-3 text-sm ${
                    transferMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}
                >
                  {transferMessage.text}
                </div>
              ) : null}

              <div className="rounded-xl border border-brand-100 bg-white p-4">
                <h3 className="text-sm font-semibold text-brand-900">Próximos pasos</h3>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-700">
                  <li>Realiza la transferencia Bancolombia y reporta la referencia dentro de 24 horas.</li>
                  <li>Recibirás una validación manual cuando el equipo confirme el pago.</li>
                  <li>Una vez validada, tu cita quedará confirmada para la fecha agendada.</li>
                </ol>
              </div>
            </section>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-2">
            {step > 0 && step < steps.length - 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="rounded-full border border-brand-300 px-6 py-2 font-semibold text-brand-900 hover:bg-brand-50"
              >
                Atrás
              </button>
            ) : null}

            {step < steps.length - 2 ? (
              <button
                type="button"
                onClick={goNext}
                className="rounded-full bg-brand-700 px-6 py-2 text-white font-semibold hover:bg-brand-900"
              >
                Continuar
              </button>
            ) : step === steps.length - 2 ? (
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-brand-700 px-6 py-2 text-white font-semibold hover:bg-brand-900 disabled:opacity-50"
              >
                {loading ? 'Reservando...' : 'Confirmar y reservar'}
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </main>
  );
}
