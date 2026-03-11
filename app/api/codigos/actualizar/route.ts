import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("📥 [API ACTUALIZAR CODIGO] Body recibido:", body);
    
    const {
      id,
      hora_entrada,
      hora_salida,
      costo,
      descuento,
      total,
    } = body;

    // Validaciones
    if (!id) {
      return NextResponse.json(
        { error: "ID del código es requerido" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Actualizar el registro
    const { data, error } = await supabase
      .from("codigos")
      .update({
        hora_entrada,
        hora_salida,
        costo,
        descuento,
        total,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ [API ACTUALIZAR CODIGO] Error:", error);
      return NextResponse.json(
        { error: "Error al actualizar el código" },
        { status: 500 }
      );
    }

    console.log("✅ [API ACTUALIZAR CODIGO] Registro actualizado:", data.id);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("❌ [API ACTUALIZAR CODIGO] Excepción:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
