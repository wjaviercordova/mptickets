import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { defaultThemeConfig, type ThemeConfig } from "@/lib/theme-config";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const negocioId = cookieStore.get("mp_negocio_id")?.value;

  let negocioNombre = "Parking Premium";
  let themeConfig: ThemeConfig = defaultThemeConfig;

  if (negocioId) {
    try {
      const supabase = createServerClient();
      
      // Obtener nombre del negocio
      const { data: negocioData } = await supabase
        .from("negocios")
        .select("nombre")
        .eq("id", negocioId)
        .single();

      negocioNombre = negocioData?.nombre ?? "Parking Premium";

      // Obtener configuración del tema
      const { data: temaData } = await supabase
        .from("configuracion_sistema")
        .select("valor")
        .eq("negocio_id", negocioId)
        .eq("categoria", "apariencia")
        .eq("clave", "tema_config")
        .single();

      // Parsear configuración del tema si existe
      if (temaData?.valor) {
        try {
          const parsedTheme = JSON.parse(temaData.valor);
          themeConfig = parsedTheme;
        } catch (error) {
          console.error("Error parseando configuración del tema:", error);
        }
      }
    } catch (error) {
      console.error("Error obteniendo datos del negocio:", error);
    }
  }

  return (
    <ThemeProvider themeConfig={themeConfig}>
      <DashboardLayoutClient negocioNombre={negocioNombre}>
        {children}
      </DashboardLayoutClient>
    </ThemeProvider>
  );
}
