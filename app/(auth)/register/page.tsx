'use client';
import { SiteText , useSiteContentText} from "@/components/common/SiteText";


import { useState } from 'react';
import { registerAction } from '../actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
 const editorialText=useSiteContentText();

  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const result = await registerAction(name, email, password);

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (result?.success) {
        router.push('/account');
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
      <h1 className="text-2xl font-bold text-brand-900"><SiteText id="c32a3b3109c3c062d922">{"Crear cuenta"}</SiteText></h1>
      
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="text"
          placeholder={editorialText("bd660bb9dab006a73517","Nombre")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          autoComplete="name"
          required
        />
        <input
          type="email"
          placeholder={editorialText("46cb0f7d7bed445067a6","Correo")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          autoComplete="email"
          required
        />
        <input
          type="password"
          placeholder={editorialText("60554bdbaf84226f582a","Contraseña")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <input
          type="password"
          placeholder={editorialText("4e5ae47d9e819cebdc13","Confirmar contraseña")}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-brand-700 py-2 text-white font-semibold hover:bg-brand-900 disabled:opacity-50"
        >
          {loading ? <SiteText id="5e68f11dbdd621d426c1">{"Cargando..."}</SiteText> : <SiteText id="3ecf365f6b0962f072dc">{"Registrarme"}</SiteText>}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600"><SiteText id="c2feeac2357da3cbc227">{"¿Ya tienes cuenta?"}</SiteText>{' '}
        <Link href="/login" className="text-brand-700 hover:text-brand-900 font-semibold"><SiteText id="e261948776a4b3e2ba7c">{"Inicia sesión"}</SiteText></Link>
      </p>
    </div>
  );
}
