'use client';

import { useEffect, useMemo, useState } from 'react';
import { createAppointment, getDayAvailability } from './actions';
import BookingCalendar from '@/components/ui/BookingCalendar';

const SERVICES = [
  { id: '1', name: 'Consulta general', duration: '30 min', price: '$50' },
  { id: '2', name: 'Tratamiento facial', duration: '60 min', price: '$120' },
  { id: '3', name: 'Tratamiento capilar', duration: '45 min', price: '$90' },
  { id: '4', name: 'Package premium', duration: '90 min', price: '$200' },
];

export default function ServicesPage() {
  const steps = ['Servicio', 'Tus datos', 'Horario', 'Confirmar'];
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
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [dayAvailability, setDayAvailability] = useState({ count: 0, remaining: 2, isFull: false });
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const selectedService = SERVICES.find((service) => service.name === reviewData.service);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const canGoNext = () => {
    if (step === 0) return Boolean(formData.service);
    if (step === 1) return Boolean(formData.name && formData.email && formData.phone);
    if (step === 2) return Boolean(formData.date && formData.time && !dayAvailability.isFull);
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

    if (step === 2) {
      setReviewData({ ...formData });
    }

    setMessage(null);
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
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

    if (step !== steps.length - 1) {
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
        setMessage({
          type: 'success',
          text: 'Cita reservada exitosamente. Te enviaremos un correo de confirmación.',
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          date: '',
          time: '',
          service: '',
          notes: '',
        });
      } else {
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
                      <p className="mt-2 font-bold text-brand-700">{service.price}</p>
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
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre completo"
                  value={formData.name}
                  onChange={handleChange}
                  className="rounded-lg border px-3 py-2"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Correo"
                  value={formData.email}
                  onChange={handleChange}
                  className="rounded-lg border px-3 py-2"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Teléfono"
                  value={formData.phone}
                  onChange={handleChange}
                  className="rounded-lg border px-3 py-2 md:col-span-2"
                  required
                />
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            <section>
              <h2 className="text-xl font-semibold text-brand-900">Paso 3: Fecha y hora</h2>
              <p className="mt-1 text-sm text-slate-600">Selecciona una fecha y luego una hora disponible.</p>

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
                <p className="text-sm text-slate-700 mt-1"><strong>Precio:</strong> {selectedService?.price || 'N/A'}</p>
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

          <div className="flex flex-wrap gap-3 pt-2">
            {step > 0 ? (
              <button
                type="button"
                onClick={goBack}
                className="rounded-full border border-brand-300 px-6 py-2 font-semibold text-brand-900 hover:bg-brand-50"
              >
                Atrás
              </button>
            ) : null}

            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="rounded-full bg-brand-700 px-6 py-2 text-white font-semibold hover:bg-brand-900"
              >
                Continuar
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-brand-700 px-6 py-2 text-white font-semibold hover:bg-brand-900 disabled:opacity-50"
              >
                {loading ? 'Reservando...' : 'Confirmar y reservar'}
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
