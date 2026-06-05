"use client";

import { useEffect, useMemo, useState } from "react";

interface Rol {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  usuarios: number;
  permisos: string[];
}

interface Permiso {
  id: string;
  clave: string;
  nombre: string;
  descripcion: string | null;
  modulo: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [selectedRolId, setSelectedRolId] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState("");
  const [error, setError] = useState("");

  const selectedRol = roles.find((rol) => rol.id === selectedRolId) || roles[0];
  const permisosPorModulo = useMemo(() => {
    return permisos.reduce<Record<string, Permiso[]>>((acc, permiso) => {
      acc[permiso.modulo] = acc[permiso.modulo] || [];
      acc[permiso.modulo].push(permiso);
      return acc;
    }, {});
  }, [permisos]);

  async function loadRoles() {
    setError("");
    try {
      const res = await fetch("/api/admin/roles");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudieron cargar roles");
      setRoles(data.roles);
      setPermisos(data.permisos);
      setSelectedRolId((current) => current || data.roles[0]?.id || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRoles();
  }, []);

  async function togglePermiso(permisoId: string, asignado: boolean) {
    if (!selectedRol) return;
    const key = `${selectedRol.id}-${permisoId}`;
    setSavingKey(key);
    setError("");

    try {
      const res = await fetch("/api/admin/roles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rolId: selectedRol.id, permisoId, asignado }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo actualizar el permiso");
      await loadRoles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSavingKey("");
    }
  }

  if (loading) return <p className="text-gray-600">Cargando roles...</p>;

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Roles y Permisos</h1>
        <p className="text-sm text-gray-600">Asigna permisos por rol del sistema.</p>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="space-y-2">
            {roles.map((rol) => (
              <button
                key={rol.id}
                type="button"
                onClick={() => setSelectedRolId(rol.id)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm ${selectedRol?.id === rol.id ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"}`}
              >
                <p className="font-semibold">{rol.nombre}</p>
                <p className="text-xs text-gray-500">{rol.usuarios} usuarios</p>
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-4">
          {selectedRol &&
            Object.entries(permisosPorModulo).map(([modulo, items]) => (
              <div key={modulo} className="rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-4 py-3">
                  <h2 className="text-sm font-bold uppercase text-gray-700">{modulo}</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {items.map((permiso) => {
                    const checked = selectedRol.permisos.includes(permiso.id);
                    const key = `${selectedRol.id}-${permiso.id}`;
                    return (
                      <label key={permiso.id} className="flex items-start gap-3 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={savingKey === key}
                          onChange={(event) => togglePermiso(permiso.id, event.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-gray-300"
                        />
                        <span>
                          <span className="block text-sm font-semibold text-gray-900">{permiso.nombre}</span>
                          <span className="block text-xs text-gray-500">{permiso.descripcion || permiso.clave}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
