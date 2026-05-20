'use client';

import { useState } from 'react';
import { loginAction } from '../actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await loginAction(email, password);

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (result?.success) {
        const params = new URLSearchParams(window.location.search);
        const callbackUrl = params.get('callbackUrl');
        const nextUrl =
          callbackUrl?.startsWith('/') && !callbackUrl.startsWith('//')
            ? callbackUrl
            : '/account';

        router.push(nextUrl);
        router.refresh();
      }
    } catch {
      setError('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">Iniciar sesión</h1>
      
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
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
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          autoComplete="current-password"
          required
        />
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm font-semibold text-brand-700 hover:text-brand-900">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-brand-700 py-2 text-white font-semibold hover:bg-brand-900 disabled:opacity-50"
        >
          {loading ? 'Cargando...' : 'Entrar'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-brand-700 hover:text-brand-900 font-semibold">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
