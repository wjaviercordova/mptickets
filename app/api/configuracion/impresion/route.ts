import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const { searchParams } = new URL(request.url);
    const negocioId = searchParams.get("negocio_id") || cookieStore.get("mp_negocio_id")?.value;

    if (!negocioId) {
      return NextResponse.json({ error: "negocio_id requerido" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Obtener configuración de impresión
    const { data: configs } = await supabase
      .from("configuracion_sistema")
      .select("clave, valor, tipo")
      .eq("negocio_id", negocioId)
      .eq("categoria", "impresion");

    // Convertir array a objeto
    const configMap: Record<string, string | number | boolean> = {};
    configs?.forEach((config) => {
      let valor: string | number | boolean = config.valor;
      
      if (config.tipo === "number") {
        valor = parseFloat(config.valor);
      } else if (config.tipo === "boolean") {
        valor = config.valor === "true";
      }
      
      configMap[config.clave] = valor;
    });

    // Retornar configuración con valores por defecto si no existe
    const configImpresion = {
      habilitada: configMap.impresion_habilitada ?? true,
      cola_impresion: configMap.impresion_cola ?? "",
      nombre_impresora: configMap.impresion_nombre ?? "",
      ancho_papel: configMap.impresion_ancho_papel ?? 80,
      tipo_formato: configMap.impresion_formato ?? "basico",
      imprimir_logo: configMap.impresion_logo ?? true,
      imprimir_en_ingreso: configMap.impresion_en_ingreso ?? true,
      imprimir_en_pago: configMap.impresion_en_pago ?? true,
      copias_por_ticket: configMap.impresion_copias ?? 1,
    };

    return NextResponse.json(configImpresion);
  } catch (error) {
    console.error("Error al obtener configuración de impresión:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
