import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const negocioId = cookieStore.get("mp_negocio_id")?.value;

  let negocioNombre = "Parking Premium";

  if (negocioId) {
    try {
      const supabase = createServerClient();
      const { data: negocioData } = await supabase
        .from("negocios")
        .select("nombre")
        .eq("id", negocioId)
        .single();

      negocioNombre = negocioData?.nombre ?? "Parking Premium";
    } catch (error) {
      console.error("Error obteniendo nombre del negocio:", error);
    }
  }

  return <DashboardLayoutClient negocioNombre={negocioNombre}>{children}</DashboardLayoutClient>;
}
