import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { PagoSalida } from "@/components/dashboard/pago/PagoSalida";
import type { Parametro } from "@/types/ingreso";

export const revalidate = 10; // Revalidar cada 10 segundos

export default async function PagoPage() {
  const cookieStore = await cookies();
  const negocioId = cookieStore.get("mp_negocio_id")?.value;
  const usuarioId = cookieStore.get("mp_user_id")?.value;

  if (!negocioId || !usuarioId) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-red-400">No hay sesión activa</p>
      </div>
    );
  }

  const supabase = createServerClient();

  // Obtener parámetros (tipos de vehículo con sus tarifas)
  const { data: parametros = [] } = await supabase
    .from("parametros")
    .select("*")
    .eq("negocio_id", negocioId)
    .eq("estado", "activo")
    .order("prioridad", { ascending: false })
    .order("nombre");

  return (
    <PagoSalida
      parametros={parametros as Parametro[]}
      negocioId={negocioId}
      usuarioId={usuarioId}
    />
  );
}
