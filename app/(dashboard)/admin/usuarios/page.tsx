"use client";

import { useEffect, useState } from "react";

interface RolOption {
  id: string;
  nombre: string;
}

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  cedula: string | null;
  telefono: string | null;
  activo: boolean;
  createdAt: string;
  rol: RolOption;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<RolOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function loadUsuarios() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/usuarios");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudieron cargar los usuarios");
      setUsuarios(data.usuarios);
      setRoles(data.roles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsuarios();
  }, []);

  async function updateUsuario(usuarioId: string, payload: { rolId?: string; activo?: boolean }) {
    setSavingId(usuarioId);
    setError("");
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo actualizar el usuario");
      await loadUsuarios();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSavingId(null);
    }
  }

  if (loading) return <p className="text-gray-600">Cargando usuarios...</p>;

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <p className="text-sm text-gray-600">Administra roles y estado de acceso.</p>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Contacto</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Accion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{usuario.nombre}</p>
                  <p className="text-xs text-gray-500">{usuario.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  <p>{usuario.cedula || "Sin cedula"}</p>
                  <p className="text-xs text-gray-500">{usuario.telefono || "Sin telefono"}</p>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={usuario.rol.id}
                    disabled={savingId === usuario.id}
                    onChange={(event) => updateUsuario(usuario.id, { rolId: event.target.value })}
                    className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
                  >
                    {roles.map((rol) => (
                      <option key={rol.id} value={rol.id}>
                        {rol.nombre}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${usuario.activo ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    {usuario.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={savingId === usuario.id}
                    onClick={() => updateUsuario(usuario.id, { activo: !usuario.activo })}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {usuario.activo ? "Desactivar" : "Activar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
