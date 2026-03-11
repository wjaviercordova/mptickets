import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { calcularTarifa } from "@/lib/calcular-tarifa";
import { obtenerFechaHoraActual } from "@/lib/timezone";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("📥 [API PAGO] Body recibido:", JSON.stringify(body, null, 2));
    
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
      estado: ingreso.estado,
      hora_entrada: ingreso.hora_entrada
    });

    // Obtener parámetro por tipo de vehículo
    console.log("🔍 [API PAGO] Buscando parámetro:", {
      negocioId,
      tipo_vehiculo: ingreso.tipo_vehiculo
    });
    
    const { data: parametro, error: parametroError } = await supabase
      .from("parametros")
      .select("*")
      .eq("negocio_id", negocioId)
      .eq("tipo_vehiculo", ingreso.tipo_vehiculo)
      .eq("estado", "activo")
      .single();

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
        tiempoTotal: calculoServidor.tiempoTotal
      });
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
