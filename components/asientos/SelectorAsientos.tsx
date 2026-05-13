"use client";

import { useState } from "react";

type Seat = {
  id: number;
  number: string;
  occupied: boolean;
};

const initialSeats: Seat[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  number: `${i + 1}`,
  occupied: [3, 7, 12].includes(i + 1),
}));

export default function SelectorAsientos() {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Selecciona tu asiento
        </h2>

        <div className="flex justify-center mb-6">
        <div className="w-32 h-10 bg-gray-300 rounded-t-3xl flex items-center justify-center text-sm font-medium text-gray-700">
            Conductor
        </div>
        </div>

      <div className="grid grid-cols-5 gap-4">
        {initialSeats.map((seat) => {
  const isSelected = selectedSeat === seat.id;

  if (seat.id % 4 === 3) {
    return (
      <>
        <div key={`space-${seat.id}`} />

        <button
          key={seat.id}
          disabled={seat.occupied}
          onClick={() => setSelectedSeat(seat.id)}
          className={`
            h-16 rounded-xl font-semibold transition-all duration-200
            ${
              seat.occupied
                ? "bg-red-200 text-red-700 cursor-not-allowed"
                : isSelected
                ? "bg-amber-500 text-white scale-105"
                : "bg-gray-100 text-gray-800 hover:bg-amber-100"
            }
          `}
        >
          {seat.number}
        </button>
      </>
    );
  }

  return (
    <button
      key={seat.id}
      disabled={seat.occupied}
      onClick={() => setSelectedSeat(seat.id)}
      className={`
        h-16 rounded-xl font-semibold transition-all duration-200
        ${
          seat.occupied
            ? "bg-red-200 text-red-700 cursor-not-allowed"
            : isSelected
            ? "bg-amber-500 text-white scale-105"
            : "bg-gray-100 text-gray-800 hover:bg-amber-100"
        }
      `}
    >
      {seat.number}
    </button>
  );
})}
      </div>

      <div className="flex gap-6 mt-8 justify-center text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-100 border" />
          Disponible
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-500" />
          Seleccionado
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-200" />
          Ocupado
        </div>
      </div>

      {selectedSeat && (
        <div className="mt-6 text-center bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-lg font-medium text-gray-800">
            Asiento seleccionado:
            <span className="ml-2 text-amber-600 font-bold">
                {selectedSeat}
            </span>
            </p>

            <p className="text-sm text-gray-600 mt-1">
            Precio estimado: <span className="font-semibold">$12.50</span>
            </p>

            <button className="mt-4 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-all duration-200">
            Continuar compra
            </button>
        </div>
      )}
    </div>
  );
}