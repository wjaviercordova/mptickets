import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";
import { validarAgregarParametro } from "@/lib/planes-limites-db";

/**
 * GET: Obtener parámetros con filtros opcionales
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const negocioId = cookieStore.get("mp_negocio_id")?.value;

    if (!negocioId) {
      return NextResponse.json(
        { message: "No autenticado" },
        { status: 401 }
      );
    }

    const supabase = createServerClient();
    const searchParams = request.nextUrl.searchParams;
    
    // Filtros opcionales
    const id = searchParams.get("id");
    const tipo_vehiculo = searchParams.get("tipo_vehiculo");
    const estado = searchParams.get("estado");

    console.log("🔍 [API PARAMETROS GET] Filtros recibidos:", { 
      id, 
      tipo_vehiculo, 
      estado, 
      negocioId 
    });

    let query = supabase
      .from("parametros")
      .select("*")
      .eq("negocio_id", negocioId)
      .order("prioridad", { ascending: true });

    // Aplicar filtros
    if (id) {
      console.log("🔧 [API PARAMETROS GET] Aplicando filtro por ID:", id);
      query = query.eq("id", id);
    }
    if (tipo_vehiculo) {
      console.log("🔧 [API PARAMETROS GET] Aplicando filtro por tipo_vehiculo:", tipo_vehiculo);
      query = query.eq("tipo_vehiculo", tipo_vehiculo);
    }
    if (estado) {
      console.log("🔧 [API PARAMETROS GET] Aplicando filtro por estado:", estado);
      query = query.eq("estado", estado);
    }

    const { data, error } = await query;
    
    console.log("✅ [API PARAMETROS GET] Resultado de query:", {
      count: data?.length,
      data: data?.map(p => ({ id: p.id, nombre: p.nombre, tipo_vehiculo: p.tipo_vehiculo }))
    });

    if (error) {
      console.error("Error al obtener parámetros:", error);
      return NextResponse.json(
        { message: "Error al obtener parámetros" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error en API parametros (GET):", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

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

    // ============================================================================
    // VALIDACIÓN DE LÍMITE DEL PLAN (PARÁMETROS)
    // ============================================================================
    const validacionLimite = await validarAgregarParametro(negocioId);
    
    if (!validacionLimite.permitido) {
      return NextResponse.json(
        { 
          message: validacionLimite.mensaje,
          error: "LIMITE_ALCANZADO",
          actual: validacionLimite.actual,
          maximo: validacionLimite.maximo,
        },
        { status: 403 } // 403 Forbidden
      );
    }

    // Nota: Se permite crear múltiples tarifas para el mismo tipo de vehículo
    // con diferentes nombres (ej: varios "SERVICIOS" para lavados de distintos tamaños)

    // Limpiar campos que la base de datos maneja automáticamente
    const { fecha_creacion: _fc, fecha_actualizacion: _fa, ...cleanData } = data;

    // Insertar nuevo parámetro
    const { error: insertError } = await supabase
      .from("parametros")
      .insert({
        negocio_id: negocioId,
        ...cleanData,
        configuracion_avanzada: cleanData.configuracion_avanzada || {},
        horarios_especiales: cleanData.horarios_especiales || {},
      });

    if (insertError) {
      console.error("Error al crear parámetro:", insertError);
      console.error("Datos enviados:", { negocio_id: negocioId, ...cleanData });
      return NextResponse.json(
        { 
          message: "Error al crear tarifa",
          error: insertError.message,
          details: insertError.details || insertError.hint,
        },
        { status: 500 }
      );
    }

    // Registrar en auditoría
    await supabase.from("auditoria").insert({
      negocio_id: negocioId,
      usuario_id: userId,
      accion: "CREAR",
      tabla_afectada: "parametros",
      descripcion: `Creación de tarifa para ${cleanData.tipo_vehiculo}`,
      datos_nuevos: cleanData,
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

    // Limpiar campos que la base de datos maneja automáticamente
    const { fecha_creacion: _fc2, fecha_actualizacion: _fa2, ...cleanData } = data;

    // Actualizar parámetro
    const { error: updateError } = await supabase
      .from("parametros")
      .update({
        ...cleanData,
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
      descripcion: `Actualización de tarifa para ${cleanData.tipo_vehiculo}`,
      datos_anteriores: oldData,
      datos_nuevos: cleanData,
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
