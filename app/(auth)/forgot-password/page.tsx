'use client';

import Link from 'next/link';
import { useState } from 'react';
import { requestPasswordResetAction } from '../actions';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSent(false);
    setLoading(true);

    try {
      const result = await requestPasswordResetAction(email);

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (result?.success) {
        setSent(true);
      }
    } catch {
      setError('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">Recuperar contraseña</h1>
      <p className="mt-2 text-sm text-gray-600">
        Ingresa tu correo y te enviaremos un enlace para crear una contraseña nueva.
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {sent && (
        <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          Si el correo existe, recibirás un enlace de recuperación en unos minutos.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          autoComplete="email"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-brand-700 py-2 font-semibold text-white hover:bg-brand-900 disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar enlace'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-900">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}
