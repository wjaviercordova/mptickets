import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { calcularTarifa } from "@/lib/calcular-tarifa";
import { obtenerFechaHoraActual } from "@/lib/timezone";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("� [API PAGO] =============== INICIO PROCESO PAGO ===============");
    console.log("�📥 [API PAGO] Body recibido:", JSON.stringify(body, null, 2));
    
    const {
      ingresoId,
      tarjetaId,
      codigoTarjeta,
      totalAPagar,
      descuento,
      metodoPago,
      observaciones,
      negocioId,
      usuarioId,
    } = body;

    // Validaciones
    if (!ingresoId || !tarjetaId || totalAPagar === undefined || !metodoPago || !negocioId || !usuarioId) {
      console.error("❌ [API PAGO] Validación fallida:", {
        ingresoId: !!ingresoId,
        tarjetaId: !!tarjetaId,
        totalAPagar: totalAPagar,
        metodoPago: !!metodoPago,
        negocioId: !!negocioId,
        usuarioId: !!usuarioId
      });
      return NextResponse.json(
        { error: "Campos requeridos faltantes" },
        { status: 400 }
      );
    }

    console.log("✅ [API PAGO] Validación inicial pasada");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("🔍 [API PAGO] Buscando ingreso con ID:", ingresoId);

    // Obtener datos del ingreso
    const { data: ingreso, error: ingresoError } = await supabase
      .from("codigos")
      .select("*")
      .eq("id", ingresoId)
      .eq("estado", "1") // 1 = Pendiente de pago
      .single();

    if (ingresoError || !ingreso) {
      console.error("❌ [API PAGO] Error al obtener ingreso:", ingresoError);
      console.error("❌ [API PAGO] Ingreso data:", ingreso);
      return NextResponse.json(
        { error: "Ingreso no encontrado o ya fue procesado" },
        { status: 404 }
      );
    }
    
    console.log("✅ [API PAGO] Ingreso encontrado:", {
      id: ingreso.id,
      tipo_vehiculo: ingreso.tipo_vehiculo,
      parametro_id: ingreso.parametro_id,
      estado: ingreso.estado,
      hora_entrada: ingreso.hora_entrada
    });

    // Obtener parámetro por ID (guardado al momento del ingreso)
    console.log("🔍 [API PAGO] Buscando parámetro por ID:", ingreso.parametro_id);
    
    let parametro;
    let parametroError;

    if (!ingreso.parametro_id) {
      // Fallback: buscar por tipo_vehiculo (ingresos antiguos sin parametro_id)
      // IMPORTANTE: Usar prioridad (menor número = mayor prioridad) para consistencia
      console.log("⚠️ [API PAGO] parametro_id es null, buscando por tipo_vehiculo:", ingreso.tipo_vehiculo);
      
      const result = await supabase
        .from("parametros")
        .select("*")
        .eq("tipo_vehiculo", ingreso.tipo_vehiculo)
        .eq("negocio_id", negocioId)
        .eq("estado", "activo")
        .order("prioridad", { ascending: true })
        .limit(1);

      console.log("🔍 [API PAGO] Query result para fallback:", {
        error: result.error,
        count: result.data?.length,
        parametro: result.data?.[0] ? {
          id: result.data[0].id,
          nombre: result.data[0].nombre,
          prioridad: result.data[0].prioridad,
          tarifa_1_valor: result.data[0].tarifa_1_valor,
          tarifa_2_valor: result.data[0].tarifa_2_valor
        } : null
      });

      parametroError = result.error;
      parametro = result.data?.[0];

      // Actualizar el ingreso con el parametro_id encontrado
      if (parametro) {
        await supabase
          .from("codigos")
          .update({ parametro_id: parametro.id })
          .eq("id", ingresoId);
        console.log("✅ [API PAGO] Ingreso actualizado con parametro_id:", parametro.id);
      }
    } else {
      // Buscar por ID directo
      const result = await supabase
        .from("parametros")
        .select("*")
        .eq("id", ingreso.parametro_id)
        .eq("negocio_id", negocioId)
        .eq("estado", "activo")
        .single();

      parametroError = result.error;
      parametro = result.data;
    }

    if (parametroError || !parametro) {
      console.error("❌ [API PAGO] Error al obtener parámetro:", parametroError);
      console.error("❌ [API PAGO] Parámetro data:", parametro);
      return NextResponse.json(
        { error: "No se encontró configuración de tarifas para el vehículo" },
        { status: 404 }
      );
    }
    
    console.log("✅ [API PAGO] Parámetro encontrado:", {
      id: parametro.id,
      tipo_vehiculo: parametro.tipo_vehiculo
    });

    // Verificar que la tarjeta no esté en uso (debe estar ocupada, estado = "0")
    const { data: tarjeta, error: tarjetaError } = await supabase
      .from("tarjetas")
      .select("estado")
      .eq("id", tarjetaId)
      .single();

    if (tarjetaError || !tarjeta) {
      return NextResponse.json(
        { error: "Tarjeta no encontrada" },
        { status: 404 }
      );
    }

    if (tarjeta.estado !== "0") {
      return NextResponse.json(
        { error: "La tarjeta no está en uso" },
        { status: 400 }
      );
    }

    // Obtener hora actual en el timezone del negocio
    const horaSalida = await obtenerFechaHoraActual(negocioId);
    console.log("⏰ [API PAGO] Calculando tarifa:", {
      hora_entrada: ingreso.hora_entrada,
      hora_salida: horaSalida
    });
    console.log("🔧 [API PAGO] Parámetro usado para calcular:", {
      id: parametro.id,
      nombre: parametro.nombre,
      tarifa_1_valor: parametro.tarifa_1_valor,
      tarifa_2_valor: parametro.tarifa_2_valor,
      tarifa_3_valor: parametro.tarifa_3_valor,
      tarifa_4_valor: parametro.tarifa_4_valor,
      tarifa_extra: parametro.tarifa_extra,
      tarifa_auxiliar: parametro.tarifa_auxiliar
    });

    // Recalcular tarifa en el servidor para validar
    let calculoServidor;
    try {
      calculoServidor = calcularTarifa(
        ingreso.hora_entrada,
        horaSalida,
        parametro
      );
      console.log("✅ [API PAGO] Cálculo completado:", {
        totalAPagar: calculoServidor.totalAPagar,
        tiempoTotal: calculoServidor.tiempoTotal,
        desglose: calculoServidor.desglose
      });
      console.log("📥 [API PAGO] Total recibido del frontend:", totalAPagar);
    } catch (error) {
      console.error("❌ [API PAGO] Error en calcularTarifa:", error);
      throw error;
    }

    // Validar que el total coincida (con margen de error de $0.50 por descuentos)
    const diferenciaTotal = Math.abs(calculoServidor.totalAPagar - (totalAPagar + (descuento || 0)));
    if (diferenciaTotal > 0.50) {
      console.error("Diferencia de total:", {
        calculado: calculoServidor.totalAPagar,
        recibido: totalAPagar,
        descuento: descuento || 0,
        diferencia: diferenciaTotal
      });
      return NextResponse.json(
        { 
          error: "El total calculado no coincide. Por favor consulta la tarjeta nuevamente.",
          totalEsperado: calculoServidor.totalAPagar,
          totalRecibido: totalAPagar,
        },
        { status: 400 }
      );
    }

    // Actualizar registro de ingreso con datos de salida
    console.log("💾 [API PAGO] Actualizando ingreso...");
    const updateData = {
      hora_salida: horaSalida,
      usuario_salida_id: usuarioId,
      costo: calculoServidor.totalAPagar,
      descuento: descuento || 0,
      total: totalAPagar,
      metodo_pago: metodoPago,
      observaciones: observaciones || "",
      estado: "0", // 0 = Pagado/Finalizado
      fecha_actualizacion: horaSalida,
    };
    console.log("📝 [API PAGO] Datos a actualizar:", updateData);
    
    const { error: updateIngresoError } = await supabase
      .from("codigos")
      .update(updateData)
      .eq("id", ingresoId);

    if (updateIngresoError) {
      console.error("❌ [API PAGO] Error al actualizar ingreso:", updateIngresoError);
      return NextResponse.json(
        { error: "Error al procesar el pago" },
        { status: 500 }
      );
    }
    
    console.log("✅ [API PAGO] Ingreso actualizado correctamente");

    // Actualizar estado de la tarjeta a "1" (disponible)
    const { error: updateTarjetaError } = await supabase
      .from("tarjetas")
      .update({ 
        estado: "1",
        ultima_actualizacion: horaSalida,
      })
      .eq("id", tarjetaId);

    if (updateTarjetaError) {
      console.error("❌ [API PAGO] Error al actualizar tarjeta:", updateTarjetaError);
      // No fallar por esto, el pago ya se procesó
    } else {
      console.log("✅ [API PAGO] Tarjeta actualizada correctamente");
    }

    // Registrar en auditoría
    console.log("📋 [API PAGO] Registrando en auditoría...");
    const { error: auditoriaError } = await supabase.from("auditoria").insert({
      negocio_id: negocioId,
      usuario_id: usuarioId,
      tabla_afectada: "codigos",
      accion: "UPDATE",
      registro_id: ingresoId,
      datos_nuevos: {
        tarjeta: codigoTarjeta,
        total: totalAPagar,
        descuento: descuento || 0,
        metodo_pago: metodoPago,
        observaciones: observaciones || "",
        hora_salida: horaSalida
      },
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
    });
    
    if (auditoriaError) {
      console.error("⚠️ [API PAGO] Error al registrar auditoría:", auditoriaError);
      // No fallar por esto, el pago ya se procesó
    } else {
      console.log("✅ [API PAGO] Auditoría registrada correctamente");
    }

    // Retornar datos del pago
    const responseData = {
      success: true,
      message: "Pago procesado exitosamente",
      pago: {
        ingresoId,
        codigoTarjeta,
        horaEntrada: ingreso.hora_entrada,
        horaSalida,
        tiempoTotal: `${calculoServidor.tiempoTotal.horas}h ${calculoServidor.tiempoTotal.minutos}m`,
        totalPagado: totalAPagar,
        descuento: descuento || 0,
        metodoPago,
        observaciones: observaciones || "",
        desglose: calculoServidor.desglose,
      },
    };
    
    console.log("✅✅✅ [API PAGO] PAGO PROCESADO EXITOSAMENTE");
    console.log("📊 [API PAGO] Respuesta:", JSON.stringify(responseData, null, 2));
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("❌❌❌ [API PAGO] ERROR FATAL:", error);
    console.error("❌ [API PAGO] Stack trace:", error instanceof Error ? error.stack : 'No stack');
    console.error("❌ [API PAGO] Error message:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
