import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const negocioId = searchParams.get("negocio_id");

    console.log("🔍 [API DISPONIBLES] Consultando tarjetas:", { negocioId });

    if (!negocioId) {
      console.error("❌ [API DISPONIBLES] negocio_id no proporcionado");
      return NextResponse.json(
        { error: "negocio_id es requerido" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Obtener tarjetas con estado = "1" (libres/disponibles)
    const { data: tarjetas, error } = await supabase
      .from("tarjetas")
      .select("id, codigo, codigo_barras, qr_code, estado")
      .eq("negocio_id", negocioId)
      .eq("estado", "1")
      .eq("perdida", "0")
      .order("codigo");

    if (error) {
      console.error("❌ [API DISPONIBLES] Error en query:", error);
      return NextResponse.json(
        { error: "Error al obtener tarjetas disponibles" },
        { status: 500 }
      );
    }

    console.log("✅ [API DISPONIBLES] Tarjetas encontradas:", tarjetas?.length || 0);
    if (tarjetas && tarjetas.length > 0) {
      console.log("📋 [API DISPONIBLES] Primeras 3 tarjetas:", tarjetas.slice(0, 3));
    }

    return NextResponse.json({ tarjetas: tarjetas || [] });
  } catch (error) {
    console.error("❌❌❌ [API DISPONIBLES] ERROR FATAL:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
