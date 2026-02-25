import { Loader2 } from "lucide-react";

export default function PagoLoading() {
  return (
    <div className="flex min-h-[600px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-amber-400" />
        <p className="text-lg text-amber-200/70">Cargando módulo de Pago y Salida...</p>
      </div>
    </div>
  );
}
