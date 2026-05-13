"use client";

import { useState } from "react";

type SeatType = "normal" | "vip";

type Seat = {
  id: number;
  number: string;
  occupied: boolean;
  type: SeatType;
};

const firstFloorSeats: Seat[] = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  number: `P1-${i + 1}`,
  occupied: [3, 7, 12].includes(i + 1),
  type: i < 4 ? "vip" : "normal",
}));

const secondFloorSeats: Seat[] = Array.from({ length: 24 }, (_, i) => ({
  id: i + 101,
  number: `P2-${i + 1}`,
  occupied: [104, 110, 118].includes(i + 101),
  type: i < 6 ? "vip" : "normal",
}));

const getSeatPrice = (type: SeatType) => {
  return type === "vip" ? 18 : 12.5;
};

export default function SelectorAsientos() {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [floor, setFloor] = useState(1);

  const seats = floor === 1 ? firstFloorSeats : secondFloorSeats;
  const selectedSeatData = seats.find((seat) => seat.id === selectedSeat);

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-6 text-center text-black">
        Selecciona tu asiento
      </h2>

      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setFloor(1)}
          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
            floor === 1
              ? "bg-amber-500 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Piso 1
        </button>

        <button
          onClick={() => setFloor(2)}
          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
            floor === 2
              ? "bg-amber-500 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Piso 2
        </button>
      </div>

      <div className="flex justify-center mb-6">
        <div className="w-32 h-10 bg-gray-300 rounded-t-3xl flex items-center justify-center text-sm font-medium text-gray-700">
          Conductor
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {seats.map((seat) => {
          const isSelected = selectedSeat === seat.id;
          const seatPrice = getSeatPrice(seat.type);

          const seatStyle = seat.occupied
            ? "bg-red-200 text-red-700 cursor-not-allowed"
            : isSelected
            ? "bg-amber-500 text-white scale-105"
            : seat.type === "vip"
            ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
            : "bg-gray-100 text-gray-800 hover:bg-amber-100";

          const seatButton = (
            <button
              key={seat.id}
              disabled={seat.occupied}
              onClick={() => setSelectedSeat(seat.id)}
              className={`h-16 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg ${seatStyle}`}
            >
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <span>{seat.number}</span>

                  {seat.type === "vip" && (
                    <span className="text-[10px] px-1 py-0.5 bg-purple-700 text-white rounded">
                      VIP
                    </span>
                  )}
                </div>

                <span className="text-xs mt-1">${seatPrice.toFixed(2)}</span>
              </div>
            </button>
          );

          if (seat.id % 4 === 3) {
            return (
              <>
                <div key={`space-${seat.id}`} />
                {seatButton}
              </>
            );
          }

          return seatButton;
        })}
      </div>

      <div className="flex flex-wrap gap-6 mt-8 justify-center text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-100 border" />
          Disponible
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-100 border" />
          VIP
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

      {selectedSeatData && (
        <div className="mt-6 text-center bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-lg font-medium text-gray-800">
            Asiento seleccionado:
            <span className="ml-2 text-amber-600 font-bold">
              {selectedSeatData.number}
            </span>
          </p>

          <p className="text-sm text-gray-600 mt-1">
            Tipo:{" "}
            <span className="font-semibold uppercase">
              {selectedSeatData.type}
            </span>
          </p>

          <p className="text-sm text-gray-600 mt-1">
            Precio del asiento:{" "}
            <span className="font-semibold">
              ${getSeatPrice(selectedSeatData.type).toFixed(2)}
            </span>
          </p>

          <button className="mt-4 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-all duration-200">
            Continuar compra
          </button>
        </div>
      )}
    </div>
  );
}