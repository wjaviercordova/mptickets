import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const negocioId = searchParams.get("negocio_id");
    const codigoBarras = searchParams.get("codigo_barras");

    console.log("🔍 [API BUSCAR DISPONIBLE] Parámetros:", { negocioId, codigoBarras });

    if (!negocioId || !codigoBarras) {
      console.error("❌ [API BUSCAR DISPONIBLE] Faltan parámetros requeridos");
      return NextResponse.json(
        { error: "negocio_id y codigo_barras son requeridos" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Buscar tarjeta por código de barras (independiente del estado)
    const { data: tarjetaExistente, error: errorBuscar } = await supabase
      .from("tarjetas")
      .select("id, codigo, codigo_barras, qr_code, estado, perdida")
      .eq("negocio_id", negocioId)
      .eq("codigo_barras", codigoBarras)
      .single();

    // Si no encuentra por codigo_barras, intentar buscar por codigo (fallback)
    if (errorBuscar || !tarjetaExistente) {
      console.log("⚠️ [API BUSCAR DISPONIBLE] No encontrada por codigo_barras, intentando por codigo...");
      const { data: tarjetaPorCodigo, error: errorCodigo } = await supabase
        .from("tarjetas")
        .select("id, codigo, codigo_barras, qr_code, estado, perdida")
        .eq("negocio_id", negocioId)
        .eq("codigo", codigoBarras)
        .single();
      
      if (errorCodigo || !tarjetaPorCodigo) {
        console.error("❌ [API BUSCAR DISPONIBLE] Tarjeta no existe en la base de datos");
        return NextResponse.json(
          { error: "Tarjeta no encontrada en el sistema" },
          { status: 404 }
        );
      }
      
      // Usar la tarjeta encontrada por código
      return await validarEstadoTarjeta(tarjetaPorCodigo, supabase);
    }

    // 2. Validar estado de la tarjeta encontrada
    return await validarEstadoTarjeta(tarjetaExistente, supabase);
    
  } catch (error) {
    console.error("❌❌❌ [API BUSCAR DISPONIBLE] ERROR FATAL:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: String(error) },
      { status: 500 }
    );
  }
}

async function validarEstadoTarjeta(tarjeta: any, supabase: any) {
  console.log("🔍 [API VALIDAR] Validando tarjeta:", {
    codigo: tarjeta.codigo,
    codigo_barras: tarjeta.codigo_barras,
    estado: tarjeta.estado
  });

  // Verificar si está perdida
  if (tarjeta.perdida === "1") {
    console.error("❌ [API VALIDAR] Tarjeta marcada como perdida");
    return NextResponse.json(
      { error: `Tarjeta ${tarjeta.codigo} está marcada como perdida` },
      { status: 400 }
    );
  }

  // Verificar si está ocupada (estado = "0")
  if (tarjeta.estado === "0") {
    console.log("⚠️ [API VALIDAR] Tarjeta ocupada, verificando ingreso pendiente...");
    
    // Buscar el ingreso pendiente en la tabla codigos
    const { data: ingresoPendiente, error: errorPendiente } = await supabase
      .from("codigos")
      .select("id, codigo, codigo_barras, estado, hora_entrada")
      .eq("tarjeta_id", tarjeta.id)
      .eq("estado", "1") // Pendiente de pago
      .order("hora_entrada", { ascending: false })
      .limit(1)
      .single();

    if (ingresoPendiente) {
      console.error("❌ [API VALIDAR] Tarjeta con ingreso pendiente sin pagar");
      return NextResponse.json(
        { 
          error: `Tarjeta ${tarjeta.codigo} no está pagada`,
          tipo: "sin_pagar",
          tarjeta: tarjeta.codigo,
          ingresoPendiente: {
            hora_entrada: ingresoPendiente.hora_entrada
          }
        },
        { status: 400 }
      );
    }

    // Si no hay ingreso pendiente pero está ocupada, es un estado inconsistente
    console.error("❌ [API VALIDAR] Estado inconsistente: tarjeta ocupada sin ingreso pendiente");
    return NextResponse.json(
      { error: `Tarjeta ${tarjeta.codigo} tiene estado inconsistente. Contacte al administrador.` },
      { status: 400 }
    );
  }

  // Tarjeta disponible (estado = "1")
  console.log("✅ [API VALIDAR] Tarjeta disponible para ingreso");
  return NextResponse.json({ tarjeta });
}
