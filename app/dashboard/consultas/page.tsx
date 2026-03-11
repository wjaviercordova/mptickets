import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { ConsultasForm } from "@/components/dashboard/consultas/ConsultasForm";
import { redirect } from "next/navigation";

// Revalidar cada 30 segundos para datos frescos (módulo de consultas)
export const revalidate = 30;

export default async function ConsultasPage() {
  const cookieStore = await cookies();
  const negocioId = cookieStore.get("mp_negocio_id")?.value;
  const usuarioId = cookieStore.get("mp_user_id")?.value;

  if (!negocioId || !usuarioId) {
    redirect("/");
  }

  const supabase = createServerClient();

  // Obtener TODAS las tarjetas activas (sin importar si están en uso o disponibles)
  const { data: tarjetasEmitidas } = await supabase
    .from("tarjetas")
    .select("*")
    .eq("negocio_id", negocioId)
    .eq("perdida", "0")  // Solo tarjetas activas (no perdidas)
    .order("fecha_actualizacion", { ascending: false });

  console.log("📇 Tarjetas query result:", tarjetasEmitidas?.length || 0);

  // Obtener códigos (registros de uso de tarjetas)
  const { data: codigos, error: codigosError } = await supabase
    .from("codigos")
    .select(`
      *,
      tarjetas (
        codigo,
        codigo_barras,
        codigo_interno
      )
    `)
    .eq("negocio_id", negocioId)
    .order("hora_entrada", { ascending: false });

  if (codigosError) {
    console.error("❌ ERROR en query de códigos:", codigosError);
  }
  
  console.log("🔍 Códigos query result:", {
    count: codigos?.length || 0,
    hasError: !!codigosError,
    errorMessage: codigosError?.message,
    errorDetails: codigosError?.details,
    errorHint: codigosError?.hint,
    sample: codigos?.[0],
  });

  // Obtener información del negocio para límites
  const { data: negocio } = await supabase
    .from("negocios")
    .select("nombre, plan, capacidad_maxima")
    .eq("id", negocioId)
    .single();

  return (
    <div className="space-y-6">
      <ConsultasForm
        tarjetasEmitidas={tarjetasEmitidas || []}
        codigos={codigos || []}
        negocio={negocio}
        negocioId={negocioId}
      />
    </div>
  );
}
