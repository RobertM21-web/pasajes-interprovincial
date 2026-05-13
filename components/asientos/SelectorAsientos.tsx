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

      <div className="grid grid-cols-4 gap-4">
        {initialSeats.map((seat) => {
          const isSelected = selectedSeat === seat.id;

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
                    : "bg-gray-100 hover:bg-amber-100"
                }
              `}
            >
              {seat.number}
            </button>
          );
        })}
      </div>

      <div className="flex gap-6 mt-8 justify-center text-sm">
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
        <div className="mt-6 text-center">
          <p className="text-lg font-medium">
            Asiento seleccionado:{" "}
            <span className="text-amber-600">{selectedSeat}</span>
          </p>
        </div>
      )}
    </div>
  );
}