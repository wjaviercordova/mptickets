import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ImpresionConfigProvider } from "@/contexts/ImpresionConfigContext";
import { defaultThemeConfig, type ThemeConfig } from "@/lib/theme-config";
import type { ConfigImpresion } from "@/lib/impresion";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const negocioId = cookieStore.get("mp_negocio_id")?.value;

  let negocioNombre = "Parking Premium";
  let themeConfig: ThemeConfig = defaultThemeConfig;
  let negocioDatos = null;
  let configImpresionInicial: ConfigImpresion | null = null;
  let diasAtencion = "Lun-Dom";
  let horariosAtencion = null;

  if (negocioId) {
    try {
      const supabase = createServerClient();
      
      // Obtener datos completos del negocio (nombre, dirección, teléfono)
      const { data: negocioData } = await supabase
        .from("negocios")
        .select("nombre, direccion, telefono")
        .eq("id", negocioId)
        .single();

      negocioNombre = negocioData?.nombre ?? "Parking Premium";
      negocioDatos = negocioData ? {
        nombre: negocioData.nombre,
        direccion: negocioData.direccion || "",
        telefono: negocioData.telefono || "",
      } : null;

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

      // Obtener configuración de impresión
      const { data: configImpresionData } = await supabase
        .from("configuracion_sistema")
        .select("clave, valor")
        .eq("negocio_id", negocioId)
        .eq("categoria", "impresion");

      if (configImpresionData && configImpresionData.length > 0) {
        const config: Partial<ConfigImpresion> = {};
        
        configImpresionData.forEach((item) => {
          const { clave, valor } = item;
          
          switch (clave) {
            case "impresion_habilitada":
              config.habilitada = valor === "true";
              break;
            case "impresion_cola":
              config.cola_impresion = valor;
              break;
            case "impresion_nombre":
              config.nombre_impresora = valor;
              break;
            case "impresion_ancho_papel":
              config.ancho_papel = parseInt(valor, 10);
              break;
            case "impresion_formato":
              config.tipo_formato = valor as "basico" | "detallado";
              break;
            case "impresion_logo":
              config.imprimir_logo = valor === "true";
              break;
            case "impresion_en_ingreso":
              config.imprimir_en_ingreso = valor === "true";
              break;
            case "impresion_en_pago":
              config.imprimir_en_pago = valor === "true";
              break;
            case "impresion_copias":
              config.copias_por_ticket = parseInt(valor, 10);
              break;
          }
        });

        configImpresionInicial = config as ConfigImpresion;
      }

      // Obtener días de atención
      const { data: diasData } = await supabase
        .from("configuracion_sistema")
        .select("valor")
        .eq("negocio_id", negocioId)
        .eq("clave", "dias_atencion")
        .single();

      diasAtencion = diasData?.valor || "Lun-Dom";

      // Obtener horarios de atención
      const { data: horariosData } = await supabase
        .from("configuracion_sistema")
        .select("valor")
        .eq("negocio_id", negocioId)
        .eq("clave", "horarios_atencion")
        .single();

      if (horariosData?.valor) {
        try {
          horariosAtencion = JSON.parse(horariosData.valor);
        } catch (error) {
          console.error("Error parseando horarios de atención:", error);
        }
      }

    } catch (error) {
      console.error("Error obteniendo datos del negocio:", error);
    }
  }

  return (
    <ThemeProvider themeConfig={themeConfig}>
      <ImpresionConfigProvider
        negocioId={negocioId || ""}
        initialNegocio={negocioDatos}
        initialConfigImpresion={configImpresionInicial}
        initialDiasAtencion={diasAtencion}
        initialHorariosAtencion={horariosAtencion}
      >
        <DashboardLayoutClient negocioNombre={negocioNombre}>
          {children}
        </DashboardLayoutClient>
      </ImpresionConfigProvider>
    </ThemeProvider>
  );
}
