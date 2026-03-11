import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { NegocioForm } from "@/components/dashboard/configuracion/NegocioForm";
import { redirect } from "next/navigation";

// Revalidar cada 60 segundos para balance entre performance y datos frescos
export const revalidate = 60;

export default async function NegocioConfigPage() {
  const cookieStore = await cookies();
  const negocioId = cookieStore.get("mp_negocio_id")?.value;
  const usuarioId = cookieStore.get("mp_user_id")?.value;

  if (!negocioId || !usuarioId) {
    redirect("/");
  }

  const supabase = createServerClient();

  // Obtener datos del negocio
  const { data: negocio } = await supabase
    .from("negocios")
    .select("*")
    .eq("id", negocioId)
    .single();

  // Obtener días restantes de la licencia (para plan Demo)
  const { data: diasRestantes } = await supabase
    .rpc('get_dias_restantes_licencia', { negocio_uuid: negocioId });

  // Obtener usuarios del negocio
  const { data: usuarios } = await supabase
    .from("usuarios")
    .select("*")
    .eq("negocio_id", negocioId)
    .order("fecha_creacion", { ascending: false });

  // Obtener tarjetas del negocio
  const { data: tarjetas } = await supabase
    .from("tarjetas")
    .select("*")
    .eq("negocio_id", negocioId)
    .order("codigo", { ascending: true });

  return (
    <div className="space-y-6">
      <NegocioForm
        negocio={negocio}
        usuarios={usuarios || []}
        tarjetas={tarjetas || []}
        negocioId={negocioId}
        diasRestantes={diasRestantes}
      />
    </div>
  );
}
