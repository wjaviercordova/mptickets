import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const negocioId = cookieStore.get("mp_negocio_id")?.value;
    const userId = cookieStore.get("mp_user_id")?.value;

    if (!negocioId || !userId) {
      return NextResponse.json(
        { message: "No autenticado" },
        { status: 401 }
      );
    }

    const supabase = createServerClient();
    const body = await request.json();
    const { data } = body;

    // Validar campos requeridos
    if (!data.tipo_vehiculo || !data.nombre) {
      return NextResponse.json(
        { message: "Complete los campos obligatorios" },
        { status: 400 }
      );
    }

    // Verificar si ya existe una tarifa para este tipo de vehículo
    const { data: existing } = await supabase
      .from("parametros")
      .select("id")
      .eq("negocio_id", negocioId)
      .eq("tipo_vehiculo", data.tipo_vehiculo)
      .single();

    if (existing) {
      return NextResponse.json(
        { message: "Ya existe una tarifa para este tipo de vehículo" },
        { status: 400 }
      );
    }

    // Insertar nuevo parámetro
    const { error: insertError } = await supabase
      .from("parametros")
      .insert({
        negocio_id: negocioId,
        ...data,
      });

    if (insertError) {
      console.error("Error al crear parámetro:", insertError);
      return NextResponse.json(
        { message: "Error al crear tarifa" },
        { status: 500 }
      );
    }

    // Registrar en auditoría
    await supabase.from("auditoria").insert({
      negocio_id: negocioId,
      usuario_id: userId,
      accion: "CREAR",
      tabla_afectada: "parametros",
      descripcion: `Creación de tarifa para ${data.tipo_vehiculo}`,
      datos_nuevos: data,
    });

    return NextResponse.json({
      success: true,
      message: "Tarifa creada exitosamente",
    });
  } catch (error) {
    console.error("Error en API parametros (POST):", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const negocioId = cookieStore.get("mp_negocio_id")?.value;
    const userId = cookieStore.get("mp_user_id")?.value;

    if (!negocioId || !userId) {
      return NextResponse.json(
        { message: "No autenticado" },
        { status: 401 }
      );
    }

    const supabase = createServerClient();
    const body = await request.json();
    const { parametroId, data } = body;

    if (!parametroId) {
      return NextResponse.json(
        { message: "ID de parámetro requerido" },
        { status: 400 }
      );
    }

    // Obtener datos anteriores para auditoría
    const { data: oldData } = await supabase
      .from("parametros")
      .select("*")
      .eq("id", parametroId)
      .eq("negocio_id", negocioId)
      .single();

    if (!oldData) {
      return NextResponse.json(
        { message: "Parámetro no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar parámetro
    const { error: updateError } = await supabase
      .from("parametros")
      .update({
        ...data,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq("id", parametroId)
      .eq("negocio_id", negocioId);

    if (updateError) {
      console.error("Error al actualizar parámetro:", updateError);
      return NextResponse.json(
        { message: "Error al actualizar tarifa" },
        { status: 500 }
      );
    }

    // Registrar en auditoría
    await supabase.from("auditoria").insert({
      negocio_id: negocioId,
      usuario_id: userId,
      accion: "ACTUALIZAR",
      tabla_afectada: "parametros",
      descripcion: `Actualización de tarifa para ${data.tipo_vehiculo}`,
      datos_anteriores: oldData,
      datos_nuevos: data,
    });

    return NextResponse.json({
      success: true,
      message: "Tarifa actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error en API parametros (PUT):", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const negocioId = cookieStore.get("mp_negocio_id")?.value;
    const userId = cookieStore.get("mp_user_id")?.value;

    if (!negocioId || !userId) {
      return NextResponse.json(
        { message: "No autenticado" },
        { status: 401 }
      );
    }

    const supabase = createServerClient();
    const body = await request.json();
    const { parametroId } = body;

    if (!parametroId) {
      return NextResponse.json(
        { message: "ID de parámetro requerido" },
        { status: 400 }
      );
    }

    // Obtener datos para auditoría
    const { data: oldData } = await supabase
      .from("parametros")
      .select("*")
      .eq("id", parametroId)
      .eq("negocio_id", negocioId)
      .single();

    if (!oldData) {
      return NextResponse.json(
        { message: "Parámetro no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar parámetro
    const { error: deleteError } = await supabase
      .from("parametros")
      .delete()
      .eq("id", parametroId)
      .eq("negocio_id", negocioId);

    if (deleteError) {
      console.error("Error al eliminar parámetro:", deleteError);
      return NextResponse.json(
        { message: "Error al eliminar tarifa" },
        { status: 500 }
      );
    }

    // Registrar en auditoría
    await supabase.from("auditoria").insert({
      negocio_id: negocioId,
      usuario_id: userId,
      accion: "ELIMINAR",
      tabla_afectada: "parametros",
      descripcion: `Eliminación de tarifa para ${oldData.tipo_vehiculo}`,
      datos_anteriores: oldData,
    });

    return NextResponse.json({
      success: true,
      message: "Tarifa eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error en API parametros (DELETE):", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
