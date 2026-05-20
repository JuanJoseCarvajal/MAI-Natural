'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { resetPasswordAction } from '../actions';

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('El enlace de recuperación no es válido');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPasswordAction(token, password);

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (result?.success) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 1200);
      }
    } catch {
      setError('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">Nueva contraseña</h1>
      <p className="mt-2 text-sm text-gray-600">
        Crea una contraseña segura para volver a entrar a tu cuenta.
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          Tu contraseña fue actualizada. Te llevaremos al inicio de sesión.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <input
          type="password"
          placeholder="Confirmar nueva contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <button
          type="submit"
          disabled={loading || success}
          className="w-full rounded-full bg-brand-700 py-2 font-semibold text-white hover:bg-brand-900 disabled:opacity-50"
        >
          {loading ? 'Actualizando...' : 'Actualizar contraseña'}
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
