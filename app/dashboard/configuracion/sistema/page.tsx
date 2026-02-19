import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { SistemaForm } from "@/components/dashboard/configuracion/SistemaForm";
import { redirect } from "next/navigation";

// Revalidar cada 60 segundos para balance entre performance y datos frescos
export const revalidate = 60;

export default async function SistemaConfigPage() {
  const cookieStore = await cookies();
  const negocioId = cookieStore.get("mp_negocio_id")?.value;
  const usuarioId = cookieStore.get("mp_user_id")?.value;

  if (!negocioId || !usuarioId) {
    redirect("/");
  }

  const supabase = createServerClient();

  // Obtener configuración actual del sistema
  const { data: configs } = await supabase
    .from("configuracion_sistema")
    .select("*")
    .eq("negocio_id", negocioId);

  // Obtener parámetros de tarifas por tipo de vehículo
  const { data: parametros } = await supabase
    .from("parametros")
    .select("id, tipo_vehiculo, nombre, descripcion, prioridad, tarifa_1_nombre, tarifa_1_valor, tarifa_2_nombre, tarifa_2_valor, tarifa_3_nombre, tarifa_3_valor, tarifa_4_nombre, tarifa_4_valor, tarifa_5_nombre, tarifa_5_valor, tarifa_6_nombre, tarifa_6_valor, tarifa_7_nombre, tarifa_7_valor, tarifa_extra, tarifa_auxiliar, tarifa_nocturna, tarifa_fin_semana, estado")
    .eq("negocio_id", negocioId)
    .order("prioridad", { ascending: true });

  // Convertir array de configs a objeto clave-valor
  const configMap: Record<string, string | number | boolean> = {};
  configs?.forEach((config) => {
    let valor: string | number | boolean = config.valor;
    
    // Parsear según tipo
    if (config.tipo === "number") {
      const parsed = parseFloat(config.valor);
      valor = isNaN(parsed) ? 0 : parsed;
    } else if (config.tipo === "boolean") {
      valor = config.valor === "true";
    } else if (config.tipo === "json" && config.valor) {
      try {
        valor = JSON.parse(config.valor);
      } catch {
        valor = config.valor;
      }
    }
    
    configMap[config.clave] = valor;
  });

  return (
    <div className="space-y-6">
      <div className="glass-card border border-blue-500/20 bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/80 p-6 backdrop-blur-xl shadow-xl shadow-blue-500/5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-500/20 to-pink-600/10 shadow-lg shadow-purple-500/10">
            <svg
              className="h-6 w-6 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-purple-300/70">
              Configuración
            </p>
            <h1 className="font-heading text-2xl text-white">
              Parámetros del Sistema
            </h1>
          </div>
        </div>
      </div>

      <SistemaForm
        negocioId={negocioId}
        configActual={configMap}
        parametros={parametros || []}
      />
    </div>
  );
}
