'use client'

import React, { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Calendar, Plus, MapPin, Bus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface HojaRutaProps {
  id: string
  fechaInicio: string
  tipo: string
}

export function HabilitarRutaModal({ hojaRuta, children }: { hojaRuta: HojaRutaProps, children?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [fecha, setFecha] = useState('')
  const [frecuenciaId, setFrecuenciaId] = useState('')
  const [busId, setBusId] = useState('')
  
  const [frecuencias, setFrecuencias] = useState<any[]>([])
  const [buses, setBuses] = useState<any[]>([])
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Calcular límite de fecha para el input type="date"
  const inicioRango = hojaRuta.fechaInicio.split('T')[0]
  const diasLimite = hojaRuta.tipo === 'SEMANAL' ? 6 : 29
  const fechaObj = new Date(hojaRuta.fechaInicio)
  fechaObj.setDate(fechaObj.getDate() + diasLimite)
  const finRango = fechaObj.toISOString().split('T')[0]

  useEffect(() => {
    if (open) {
      // Cargar frecuencias activas y buses disponibles
      fetch('/api/frecuencias/activas')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setFrecuencias(data)
        })
        .catch(console.error)

      fetch('/api/buses/disponibles')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setBuses(data)
        })
        .catch(console.error)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/rutas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          frecuenciaId, 
          busId, 
          fecha, 
          hojaRutaId: hojaRuta.id 
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Ocurrió un error al habilitar la ruta')
      }

      setOpen(false)
      // Limpiar formulario
      setFecha('')
      setFrecuenciaId('')
      setBusId('')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {children || (
          <button className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all shadow-sm active:scale-95">
            <Plus className="w-5 h-5 mr-2 -ml-1" />
            Habilitar Ruta
          </button>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl z-50 p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold text-gray-900">
              Habilitar Nueva Ruta
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Fecha de la Ruta
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  min={inicioRango}
                  max={finRango}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all text-gray-900"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                Debe estar entre {inicioRango} y {finRango}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Frecuencia
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="w-5 h-5 text-gray-400" />
                </div>
                <select
                  value={frecuenciaId}
                  onChange={(e) => setFrecuenciaId(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all text-gray-900"
                  required
                >
                  <option value="" disabled>Seleccione una frecuencia</option>
                  {frecuencias.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.ciudadOrigen} → {f.ciudadDestino} a las {f.hora}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Bus Asignado
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Bus className="w-5 h-5 text-gray-400" />
                </div>
                <select
                  value={busId}
                  onChange={(e) => setBusId(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all text-gray-900"
                  required
                >
                  <option value="" disabled>Seleccione un bus</option>
                  {buses.map(b => (
                    <option key={b.id} value={b.id}>
                      Bus #{b.numero} ({b.placa})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !fecha || !frecuenciaId || !busId}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70 flex justify-center items-center shadow-sm"
              >
                {loading ? 'Habilitando...' : 'Habilitar Ruta'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
