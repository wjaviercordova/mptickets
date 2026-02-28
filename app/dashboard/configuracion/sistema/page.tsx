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
      // Para horarios_atencion, mantener como string (HorariosTab lo parseará)
      if (config.clave === "horarios_atencion") {
        valor = config.valor;
      } else {
        // Para otros JSON, parsear normalmente
        try {
          valor = JSON.parse(config.valor);
        } catch {
          valor = config.valor;
        }
      }
    }
    
    configMap[config.clave] = valor;
  });

  return (
    <div className="space-y-6">
      <SistemaForm
        negocioId={negocioId}
        configActual={configMap}
        parametros={parametros || []}
      />
    </div>
  );
}
