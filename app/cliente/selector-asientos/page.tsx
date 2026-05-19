import SelectorAsientos from "@/components/asientos/SelectorAsientos";

export default function SelectorAsientosPage() {
  // Pon aquí el ID alfanumérico (UUID) real de tu tabla "Ruta" de SQL Server para probar
  const idRutaReal = "ruta-test-cliente-123"; 

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <SelectorAsientos rutaId={idRutaReal} />
    </div>
  );
}