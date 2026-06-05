import Link from "next/link";
import SelectorAsientos from "@/components/asientos/SelectorAsientos";

export default async function SelectorAsientosPage({
  searchParams,
}: {
  searchParams: Promise<{
    rutaId?: string;
    tipoPasajero?: string;
    precio?: string;
  }>;
}) {
  const params = await searchParams;
  const rutaId = params.rutaId;

  if (!rutaId) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-2xl rounded-lg border border-blue-200 bg-white p-6 text-center shadow">
          <h1 className="text-xl font-bold text-gray-900">Selecciona una ruta primero</h1>
          <p className="mt-2 text-sm text-gray-600">
            No se recibio el identificador de la ruta para cargar el mapa de asientos.
          </p>
          <Link
            href="/cliente/compra-online"
            className="mt-5 inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Volver a compra online
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <SelectorAsientos
        rutaId={rutaId}
        tipoPasajero={params.tipoPasajero}
        precioFinal={params.precio}
      />
    </div>
  );
}
