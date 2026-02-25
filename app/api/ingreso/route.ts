import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("📥 [API INGRESO] Body recibido:", JSON.stringify(body, null, 2));
    
    const {
      codigoBarras,
      parametroId,
      tipoVehiculo,
      tarjetaId,
      negocioId,
      usuarioId,
    } = body;

    // Validaciones
    if (!codigoBarras || !parametroId || !tipoVehiculo || !tarjetaId || !negocioId || !usuarioId) {
      console.error("❌ [API INGRESO] Validación fallida:", {
        codigoBarras: !!codigoBarras,
        parametroId: !!parametroId,
        tipoVehiculo: !!tipoVehiculo,
        tarjetaId: !!tarjetaId,
        negocioId: !!negocioId,
        usuarioId: !!usuarioId
      });
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    console.log("✅ [API INGRESO] Validación inicial pasada");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("🔍 [API INGRESO] Buscando tarjeta:", { tarjetaId, codigoBarras });

    // Verificar que la tarjeta esté disponible (estado "1" = libre)
    let tarjeta;
    try {
      const { data, error: tarjetaError } = await supabase
        .from("tarjetas")
        .select("*")
        .eq("id", tarjetaId)
        .eq("estado", "1")
        .single();

      if (tarjetaError) {
        console.error("❌ [API INGRESO] Error al verificar tarjeta:", tarjetaError);
        console.error("❌ [API INGRESO] Error detalles:", JSON.stringify(tarjetaError, null, 2));
        return NextResponse.json(
          { error: "La tarjeta no está disponible o ya está en uso" },
          { status: 400 }
        );
      }

      if (!data) {
        console.error("❌ [API INGRESO] Tarjeta no encontrada o no disponible");
        return NextResponse.json(
          { error: "La tarjeta no está disponible o ya está en uso" },
          { status: 400 }
        );
      }

      tarjeta = data;
      console.log("✅ [API INGRESO] Tarjeta disponible:", {
        id: tarjeta.id,
        codigo: tarjeta.codigo,
        codigo_barras: tarjeta.codigo_barras,
        estado: tarjeta.estado
      });
    } catch (error) {
      console.error("❌❌ [API INGRESO] Excepción al buscar tarjeta:", error);
      return NextResponse.json(
        { error: "Error al verificar la tarjeta", details: String(error) },
        { status: 500 }
      );
    }
    
    // Verificar que no exista un ingreso pendiente (estado "1") con esta tarjeta
    console.log("🔍 [API INGRESO] Verificando ingresos pendientes...");
    const { data: ingresosPendientes, error: pendientesError } = await supabase
      .from("codigos")
      .select("id, estado, hora_entrada")
      .eq("tarjeta_id", tarjetaId)
      .eq("estado", "1")
      .order("hora_entrada", { ascending: false })
      .limit(1);

    if (pendientesError) {
      console.error("❌ [API INGRESO] Error al verificar pendientes:", pendientesError);
      return NextResponse.json(
        { error: "Error al verificar el estado de la tarjeta" },
        { status: 500 }
      );
    }

    console.log("📋 [API INGRESO] Ingresos pendientes encontrados:", ingresosPendientes);

    if (ingresosPendientes && Array.isArray(ingresosPendientes) && ingresosPendientes.length > 0) {
      console.error("❌ [API INGRESO] Tarjeta tiene ingreso pendiente:", ingresosPendientes[0]);
      return NextResponse.json(
        { error: "Esta tarjeta tiene un ingreso pendiente de pago. No se puede registrar un nuevo ingreso." },
        { status: 400 }
      );
    }
    
    console.log("✅ [API INGRESO] No hay ingresos pendientes");

    // Obtener datos del parámetro
    console.log("🔍 [API INGRESO] Buscando parámetro:", parametroId);
    const { data: parametro, error: parametroError } = await supabase
      .from("parametros")
      .select("*")
      .eq("id", parametroId)
      .single();

    if (parametroError || !parametro) {
      console.error("❌ [API INGRESO] Error al obtener parámetro:", parametroError);
      return NextResponse.json(
        { error: "Parámetro no encontrado" },
        { status: 404 }
      );
    }
    
    console.log("✅ [API INGRESO] Parámetro encontrado:", {
      id: parametro.id,
      tipo_vehiculo: parametro.tipo_vehiculo
    });

    // Crear registro en tabla codigos
    console.log("💾 [API INGRESO] Creando nuevo ingreso...");
    const nuevoIngreso = {
      negocio_id: negocioId,
      tarjeta_id: tarjetaId,
      parametro_id: parametroId,
      usuario_entrada_id: usuarioId,
      codigo: tarjeta.codigo,
      codigo_barras: codigoBarras,
      qr_code: tarjeta.qr_code || "",
      tipo_vehiculo: tipoVehiculo,
      placa: "",
      color: "",
      marca: "",
      modelo: "",
      hora_entrada: new Date().toISOString(),
      hora_salida: null,
      costo: 0,
      descuento: 0,
      total: 0,
      metodo_pago: "",
      estado: "1", // 1 = Pendiente de pago (vehículo dentro)
      observaciones: "",
      datos_adicionales: {},
    };
    
    console.log("📝 [API INGRESO] Datos del ingreso:", nuevoIngreso);

    let ingreso;
    try {
      const { data, error: ingresoError } = await supabase
        .from("codigos")
        .insert(nuevoIngreso)
        .select()
        .single();

      if (ingresoError) {
        console.error("❌ [API INGRESO] Error al crear ingreso:", ingresoError);
        console.error("❌ [API INGRESO] Error code:", ingresoError.code);
        console.error("❌ [API INGRESO] Error message:", ingresoError.message);
        console.error("❌ [API INGRESO] Error details:", ingresoError.details);
        console.error("❌ [API INGRESO] Error hint:", ingresoError.hint);
        return NextResponse.json(
          { 
            error: "Error al registrar el ingreso",
            details: ingresoError.message,
            hint: ingresoError.hint
          },
          { status: 500 }
        );
      }

      if (!data) {
        console.error("❌ [API INGRESO] No se pudo crear el ingreso - data es null");
        return NextResponse.json(
          { error: "Error al registrar el ingreso - no se obtuvieron datos" },
          { status: 500 }
        );
      }

      ingreso = data;
      console.log("✅ [API INGRESO] Ingreso creado:", ingreso.id);
    } catch (error) {
      console.error("❌❌ [API INGRESO] Excepción al crear ingreso:", error);
      return NextResponse.json(
        { error: "Error al registrar el ingreso", details: String(error) },
        { status: 500 }
      );
    }

    // Actualizar estado de la tarjeta a "0" (ocupada/en uso)
    console.log("🔄 [API INGRESO] Actualizando estado de tarjeta...");
    const { error: updateError } = await supabase
      .from("tarjetas")
      .update({ estado: "0", ultima_actualizacion: new Date().toISOString() })
      .eq("id", tarjetaId);
      
    if (updateError) {
      console.error("❌ [API INGRESO] Error al actualizar tarjeta:", updateError);
    } else {
      console.log("✅ [API INGRESO] Tarjeta actualizada a estado ocupado");
    }

    // Registrar en auditoría
    console.log("📋 [API INGRESO] Registrando auditoría...");
    const { error: auditoriaError } = await supabase.from("auditoria").insert({
      negocio_id: negocioId,
      usuario_id: usuarioId,
      tabla_afectada: "codigos",
      accion: "INSERT",
      registro_id: ingreso.id,
      datos_nuevos: {
        tarjeta: tarjeta.codigo,
        codigo_barras: codigoBarras,
        tipo_vehiculo: tipoVehiculo,
        hora_entrada: ingreso.hora_entrada
      },
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
    });
    
    if (auditoriaError) {
      console.error("⚠️ [API INGRESO] Error al registrar auditoría:", auditoriaError);
    } else {
      console.log("✅ [API INGRESO] Auditoría registrada");
    }

    // Retornar datos del ingreso para mostrar en el resumen
    const ingresoResumen = {
      id: ingreso.id,
      numeroTarjeta: tarjeta.codigo,
      codigoBarras: codigoBarras,
      horaEntrada: ingreso.hora_entrada,
      tipoVehiculo: ingreso.tipo_vehiculo,
      estado: ingreso.estado,
      placa: ingreso.placa,
      color: ingreso.color,
      marca: ingreso.marca,
      modelo: ingreso.modelo,
    };
    
    console.log("✅✅✅ [API INGRESO] INGRESO REGISTRADO EXITOSAMENTE");
    console.log("📊 [API INGRESO] Resumen:", ingresoResumen);

    return NextResponse.json({
      success: true,
      message: "Ingreso registrado exitosamente",
      ingreso: ingresoResumen,
    });
  } catch (error) {
    console.error("❌❌❌ [API INGRESO] ERROR FATAL:", error);
    console.error("❌ [API INGRESO] Stack trace:", error instanceof Error ? error.stack : 'No stack');
    console.error("❌ [API INGRESO] Error message:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
