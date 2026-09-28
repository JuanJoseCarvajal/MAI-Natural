'use client';
import { SiteText } from "@/components/common/SiteText";


import { useRef, useState } from 'react';
import { loginAction } from '../actions';
import Link from 'next/link';

export default function LoginPage() {
  const submitting = useRef(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setError(null);
    setLoading(true);
    let navigating = false;

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
          callbackUrl?.startsWith('/') && !callbackUrl.startsWith('//') && !/[\\\u0000-\u001f]/.test(callbackUrl)
            ? callbackUrl
            : result.destination;

        // Start a fresh authenticated request, avoiding a prefetched anonymous page.
        window.location.replace(nextUrl);
        navigating = true;
        return;
      }
    } catch {
      setError('Error inesperado');
    } finally {
      if (!navigating) {
        submitting.current = false;
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900"><SiteText id="b5ee06e692bef30850db">{"Iniciar sesión"}</SiteText></h1>
      
      {error && (
        <div role="alert" id="login-error" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} aria-busy={loading} className="mt-6 space-y-4">
        <label htmlFor="login-email" className="block font-medium">Correo electrónico</label>
        <input
          id="login-email"
          disabled={loading}
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          autoComplete="username"
          required
        />
        <label htmlFor="login-password" className="block font-medium">Contraseña</label>
        <input
          id="login-password"
          disabled={loading}
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          autoComplete="current-password"
          required
        />
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm font-semibold text-brand-700 hover:text-brand-900"><SiteText id="dbc75a7793cf71ac2307">{"¿Olvidaste tu contraseña?"}</SiteText></Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-brand-700 py-2 text-white font-semibold hover:bg-brand-900 disabled:opacity-50"
        >
          {loading ? 'Cargando...' : 'Entrar'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600"><SiteText id="1d1241d42ab4bb33ee5e">{"¿No tienes cuenta?"}</SiteText>{' '}
        <Link href="/register" className="text-brand-700 hover:text-brand-900 font-semibold"><SiteText id="ff4e154c507e4f5362b0">{"Regístrate"}</SiteText></Link>
      </p>
    </div>
  );
}
