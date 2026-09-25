'use client';
import { SiteText } from "@/components/common/SiteText";


import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { updateProfileAction } from '@/app/(dashboard)/dashboard/profile/actions';

type AccountProfileFormProps = {
  initialUser: {
    name: string;
    email: string;
    phone: string;
  };
};

export default function AccountProfileForm({ initialUser }: AccountProfileFormProps) {
  const [formData, setFormData] = useState(initialUser);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = await updateProfileAction(formData.name, formData.phone);

      if (result.success && result.user) {
        setFormData((current) => ({
          ...current,
          name: result.user?.name ?? current.name,
          phone: result.user?.phone ?? '',
        }));
        setMessage({
          type: 'success',
          text: 'Perfil actualizado exitosamente',
        });
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Error al actualizar perfil',
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
    <div className="mt-8 max-w-2xl space-y-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg bg-white p-6 shadow ring-1 ring-brand-100"
      >
        <h2 className="text-lg font-semibold text-brand-900"><SiteText id="cb145e86a8ed76b28e56">{"Informacion personal"}</SiteText></h2>

        {message ? (
          <div
            className={`rounded-lg p-3 text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700"><SiteText id="7452f715cfe2ec3562ff">{"Nombre completo"}</SiteText></label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-lg border px-3 py-2"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700"><SiteText id="5ddf50b6a1b03b12210e">{"Correo electronico"}</SiteText></label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            className="w-full rounded-lg border bg-slate-50 px-3 py-2"
            disabled
          />
          <p className="mt-1 text-xs text-slate-500"><SiteText id="f1b1a6f0817bffc185cb">{"Tu correo se gestiona desde la cuenta de acceso."}</SiteText></p>
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700"><SiteText id="d9ac71ce7040e3a5002b">{"Telefono"}</SiteText></label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full rounded-lg border px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-700 px-6 py-2 font-semibold text-white hover:bg-brand-900 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      <div className="space-y-4 rounded-lg bg-white p-6 shadow ring-1 ring-brand-100">
        <h2 className="text-lg font-semibold text-brand-900"><SiteText id="d0a431d98c4536a81647">{"Sesion"}</SiteText></h2>
        <p className="text-sm text-slate-600"><SiteText id="957469d88be717f22d1c">{"Estas conectado como "}</SiteText><strong>{formData.email}</strong>
        </p>
        <button
          onClick={() => signOut()}
          className="w-full rounded-lg border-2 border-red-600 px-6 py-2 font-semibold text-red-600 hover:bg-red-50"
        ><SiteText id="6a269dc3f1710acb9f00">{"Cerrar sesion"}</SiteText></button>
      </div>
    </div>
  );
}
