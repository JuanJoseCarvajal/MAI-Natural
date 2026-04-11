'use client';

import { useState } from 'react';
import { updateProfileAction } from './actions';
import { signOut } from 'next-auth/react';

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: 'Usuario Demo',
    email: 'usuario@ejemplo.com',
    phone: '+34 666 666 666',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = await updateProfileAction(
        formData.email,
        formData.name,
        formData.phone
      );

      if (result.success) {
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
    <div>
      <h1 className="text-2xl font-bold text-brand-900">Perfil</h1>
      <p className="mt-2 text-slate-700">Configura tus datos personales y preferencias.</p>

      <div className="mt-8 max-w-2xl space-y-6">
        {/* Formulario de perfil */}
        <form
          onSubmit={handleSubmit}
          className="rounded-lg bg-white p-6 shadow ring-1 ring-brand-100 space-y-4"
        >
          <h2 className="text-lg font-semibold text-brand-900">Información personal</h2>

          {message && (
            <div
              className={`rounded-lg p-3 text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Nombre completo
            </label>
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
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2 bg-slate-50"
              disabled
            />
            <p className="text-xs text-slate-500 mt-1">No se puede cambiar el correo</p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
              Teléfono
            </label>
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
            className="w-full rounded-lg bg-brand-700 px-6 py-2 text-white font-semibold hover:bg-brand-900 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>

        {/* Sección de sesión */}
        <div className="rounded-lg bg-white p-6 shadow ring-1 ring-brand-100 space-y-4">
          <h2 className="text-lg font-semibold text-brand-900">Sesión</h2>
          <p className="text-slate-600 text-sm">
            Estás conectado como <strong>{formData.email}</strong>
          </p>
          <button
            onClick={() => signOut()}
            className="w-full rounded-lg border-2 border-red-600 px-6 py-2 text-red-600 font-semibold hover:bg-red-50"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Información de cuenta */}
        <div className="rounded-lg bg-blue-50 p-6 ring-1 ring-blue-200 space-y-3">
          <h3 className="font-semibold text-blue-900">💡 Información</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Datos de prueba del MVP</li>
            <li>• En producción: integración con Prisma + PostgreSQL</li>
            <li>• Cambio de contraseña: en desarrollo</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
