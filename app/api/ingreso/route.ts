import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      codigoTarjeta,
      parametroId,
      tipoVehiculo,
      tarjetaId,
      negocioId,
      usuarioId,
    } = body;

    // Validaciones
    if (!codigoTarjeta || !parametroId || !tipoVehiculo || !tarjetaId || !negocioId || !usuarioId) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar que la tarjeta esté disponible
    const { data: tarjeta, error: tarjetaError } = await supabase
      .from("tarjetas")
      .select("*")
      .eq("id", tarjetaId)
      .eq("estado", "1")
      .single();

    if (tarjetaError || !tarjeta) {
      return NextResponse.json(
        { error: "La tarjeta no está disponible" },
        { status: 400 }
      );
    }

    // Obtener datos del parámetro
    const { data: parametro, error: parametroError } = await supabase
      .from("parametros")
      .select("*")
      .eq("id", parametroId)
      .single();

    if (parametroError || !parametro) {
      return NextResponse.json(
        { error: "Parámetro no encontrado" },
        { status: 404 }
      );
    }

    // Crear registro en tabla codigos
    const nuevoIngreso = {
      negocio_id: negocioId,
      tarjeta_id: tarjetaId,
      parametro_id: parametroId,
      usuario_entrada_id: usuarioId,
      codigo: codigoTarjeta,
      codigo_barras: tarjeta.codigo_barras || "",
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
      estado: "1", // 1 = Activo (vehículo dentro del parqueadero)
      observaciones: "",
      datos_adicionales: {},
    };

    const { data: ingreso, error: ingresoError } = await supabase
      .from("codigos")
      .insert(nuevoIngreso)
      .select()
      .single();

    if (ingresoError) {
      console.error("Error al crear ingreso:", ingresoError);
      return NextResponse.json(
        { error: "Error al registrar el ingreso" },
        { status: 500 }
      );
    }

    // Actualizar estado de la tarjeta a "0" (ocupada)
    await supabase
      .from("tarjetas")
      .update({ estado: "0", ultima_actualizacion: new Date().toISOString() })
      .eq("id", tarjetaId);

    // Registrar en auditoría
    await supabase.from("auditoria").insert({
      negocio_id: negocioId,
      usuario_id: usuarioId,
      tabla_afectada: "codigos",
      accion: "INSERT",
      registro_id: ingreso.id,
      detalles: `Ingreso de vehículo - Tarjeta: ${codigoTarjeta}, Tipo: ${tipoVehiculo}`,
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
    });

    // Retornar datos del ingreso para mostrar en el resumen
    const ingresoResumen = {
      id: ingreso.id,
      numeroTarjeta: codigoTarjeta,
      horaEntrada: ingreso.hora_entrada,
      tipoVehiculo: ingreso.tipo_vehiculo,
      estado: ingreso.estado,
      placa: ingreso.placa,
      color: ingreso.color,
      marca: ingreso.marca,
      modelo: ingreso.modelo,
    };

    return NextResponse.json({
      success: true,
      message: "Ingreso registrado exitosamente",
      ingreso: ingresoResumen,
    });
  } catch (error) {
    console.error("Error en API ingreso:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
