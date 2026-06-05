'use client'

import React from 'react'
import Image from 'next/image'
import { Calendar, Clock, MapPin, User, CreditCard, Armchair, Ticket, AlertCircle, Bus as BusIcon } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
interface BoletoData {
  id: string
  origenTramo: string
  destinoTramo: string
  pasajeroNombre: string
  pasajeroCedula: string
  tipoPasajero: string
  precioBase: any
  descuento: any
  precioFinal: any
  estado: string
  codigoQr?: string | null
  ruta: {
    fecha: Date | string
    frecuencia: { hora: string }
    bus: { numero: string }
  }
  asiento: {
    etiqueta: string
    categoria: { nombre: string }
  }
}

interface ConfigData {
  nombreCooperativa: string
  logoUrl?: string | null
  colorPrimario?: string | null
}

interface BoletoQRProps {
  boleto: BoletoData
  configuracion?: ConfigData | null
}

export function BoletoQR({ boleto, configuracion }: BoletoQRProps) {
  // Estado colors
  const stateColors: Record<string, string> = {
    PENDIENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    PAGADO: 'bg-green-100 text-green-800 border-green-200',
    ABORDADO: 'bg-blue-100 text-blue-800 border-blue-200',
    CANCELADO: 'bg-red-100 text-red-800 border-red-200',
    NO_ABORDADO: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  const primaryColor = configuracion?.colorPrimario || '#2563eb' // Default blue-600
  
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200 relative print:shadow-none print:border-none">
      {/* Header - Cooperativa */}
      <div 
        className="p-6 text-center text-white relative"
        style={{ backgroundColor: primaryColor }}
      >
        {/* Semi-circle cutouts for ticket effect */}
        <div className="absolute -left-4 top-[80%] w-8 h-8 bg-gray-50 rounded-full print:bg-white" />
        <div className="absolute -right-4 top-[80%] w-8 h-8 bg-gray-50 rounded-full print:bg-white" />
        
        {configuracion?.logoUrl ? (
          <div className="relative w-20 h-20 mx-auto mb-2 bg-white rounded-full p-2">
            <Image 
              src={configuracion.logoUrl} 
              alt={configuracion.nombreCooperativa} 
              fill
              className="object-contain rounded-full"
            />
          </div>
        ) : (
          <div className="w-16 h-16 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center">
            <BusIcon className="w-8 h-8 text-white" />
          </div>
        )}
        <h2 className="text-xl font-bold uppercase tracking-wider">
          {configuracion?.nombreCooperativa || 'Cooperativa de Transporte'}
        </h2>
        <p className="text-sm opacity-90 mt-1 uppercase tracking-widest">Pase a bordo</p>
      </div>

      {/* Dotted separator */}
      <div className="flex items-center w-full px-4 -mt-[1px]">
        <div className="w-full border-t-2 border-dashed border-gray-300"></div>
      </div>

      {/* Main Info */}
      <div className="p-6 space-y-6">
        {/* Origin / Destination */}
        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="text-center flex-1">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Origen</p>
            <p className="text-lg font-bold text-gray-900 truncate" title={boleto.origenTramo}>
              {boleto.origenTramo}
            </p>
          </div>
          <div className="px-4 text-gray-400 flex flex-col items-center">
            <BusIcon className="w-5 h-5 mb-1 text-gray-600" />
            <div className="w-12 border-t-2 border-dotted border-gray-300"></div>
          </div>
          <div className="text-center flex-1">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Destino</p>
            <p className="text-lg font-bold text-gray-900 truncate" title={boleto.destinoTramo}>
              {boleto.destinoTramo}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-gray-500" />
              <p className="text-xs text-gray-500 font-medium">FECHA</p>
            </div>
            <p className="font-bold text-gray-900">{formatDate(boleto.ruta.fecha)}</p>
          </div>
          
          <div className="flex flex-col p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <p className="text-xs text-gray-500 font-medium">HORA</p>
            </div>
            <p className="font-bold text-gray-900">{boleto.ruta.frecuencia.hora}</p>
          </div>

          <div className="flex flex-col p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Armchair className="w-4 h-4 text-gray-500" />
              <p className="text-xs text-gray-500 font-medium">ASIENTO</p>
            </div>
            <p className="font-bold text-blue-600 text-lg leading-none mt-1">{boleto.asiento.etiqueta}</p>
          </div>

          <div className="flex flex-col p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <BusIcon className="w-4 h-4 text-gray-500" />
              <p className="text-xs text-gray-500 font-medium">UNIDAD</p>
            </div>
            <p className="font-bold text-gray-900 text-lg leading-none mt-1">#{boleto.ruta.bus.numero}</p>
          </div>
        </div>

        {/* Passenger Info */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 font-medium">PASAJERO</p>
              <p className="font-semibold text-gray-900">{boleto.pasajeroNombre}</p>
              <p className="text-sm text-gray-600">CI: {boleto.pasajeroCedula}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Ticket className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="w-full">
              <p className="text-xs text-gray-500 font-medium">TIPO DE BOLETO</p>
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-900">{boleto.tipoPasajero.replace('_', ' ')}</p>
                <p className="text-sm text-gray-600">{boleto.asiento.categoria.nombre}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Precio Base</span>
            <span className="font-medium">{formatCurrency(Number(boleto.precioBase))}</span>
          </div>
          {Number(boleto.descuento) > 0 && (
            <div className="flex justify-between items-center mb-2 text-green-600">
              <span>Descuento</span>
              <span>-{formatCurrency(Number(boleto.descuento))}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-lg font-bold mt-2 pt-2 border-t border-gray-100">
            <span>TOTAL PAGADO</span>
            <span style={{ color: primaryColor }}>{formatCurrency(Number(boleto.precioFinal))}</span>
          </div>
        </div>

        {/* Status */}
        <div className="flex justify-center pt-2">
          <span className={cn(
            "px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border",
            stateColors[boleto.estado] || stateColors['PENDIENTE']
          )}>
            {boleto.estado}
          </span>
        </div>
      </div>

      {/* Dotted separator for QR */}
      <div className="flex items-center w-full px-4 -mt-3 relative z-10">
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-50 rounded-full print:bg-white" />
        <div className="w-full border-t-2 border-dashed border-gray-300"></div>
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-50 rounded-full print:bg-white" />
      </div>

      {/* QR Code Section */}
      <div className="p-6 bg-gray-50 flex flex-col items-center">
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-3">
          {boleto.codigoQr ? (
            <div className="relative w-40 h-40">
              <Image 
                src={boleto.codigoQr} 
                alt={`QR Boleto ${boleto.id}`}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="w-40 h-40 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p className="text-xs text-center px-2">Código QR no generado</p>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 font-mono tracking-widest text-center">
          TICKET: {boleto.id.split('-')[0].toUpperCase()}
        </p>
        <p className="text-xs text-gray-400 mt-2 text-center max-w-[250px]">
          Presente este código al conductor o azafata al momento de abordar la unidad
        </p>
      </div>
    </div>
  )
}
