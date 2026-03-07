import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";

// PUT - Actualizar datos del negocio
export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const usuarioId = cookieStore.get("mp_user_id")?.value;

    if (!usuarioId) {
      return NextResponse.json(
        { message: "No autenticado" },
        { status: 401 }
      );
    }

    const supabase = createServerClient();
    const body = await request.json();
    const { negocioId, data } = body;

    if (!negocioId) {
      return NextResponse.json(
        { message: "negocioId es requerido" },
        { status: 400 }
      );
    }

    // Actualizar datos del negocio
    const { error } = await supabase
      .from("negocios")
      .update({
        nombre: data.nombre,
        descripcion: data.descripcion,
        direccion: data.direccion,
        telefono: data.telefono,
        email: data.email,
        ciudad: data.ciudad,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq("id", negocioId);

    if (error) {
      console.error("Error al actualizar negocio:", error);
      return NextResponse.json(
        { message: "Error al actualizar negocio" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Negocio actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error en PUT /api/configuracion/negocio:", error);
    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 }
    );
  }
}
