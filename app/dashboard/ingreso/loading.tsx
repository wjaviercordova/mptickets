import { Loader2 } from "lucide-react";

export default function IngresoLoading() {
  return (
    <div className="flex min-h-[600px] flex-col items-center justify-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
      <p className="text-lg text-blue-200/70">Cargando módulo de ingreso...</p>
    </div>
  );
}
