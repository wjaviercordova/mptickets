import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const negocioId = searchParams.get("negocio_id");
    const codigoBarras = searchParams.get("codigo_barras");

    if (!negocioId || !codigoBarras) {
      return NextResponse.json(
        { error: "negocio_id y codigo_barras son requeridos" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("🔍 [BUSCAR PENDIENTE] Buscando tarjeta:", codigoBarras);

    // PASO 1: Buscar si la tarjeta existe en el sistema (sin filtros de estado)
    const { data: tarjetaExistente, error: errorTarjeta } = await supabase
      .from("tarjetas")
      .select("id, codigo, codigo_barras, qr_code, estado, perdida")
      .eq("negocio_id", negocioId)
      .or(`codigo_barras.eq.${codigoBarras},codigo.eq.${codigoBarras}`)
      .single();

    console.log("📋 [BUSCAR PENDIENTE] Tarjeta encontrada:", tarjetaExistente);

    // Si la tarjeta no existe en la tabla "tarjetas"
    if (errorTarjeta || !tarjetaExistente) {
      console.log("❌ [BUSCAR PENDIENTE] Tarjeta no encontrada en el sistema");
      return NextResponse.json(
        { error: "Tarjeta no encontrada en el sistema" },
        { status: 404 }
      );
    }

    // Si la tarjeta está marcada como perdida
    if (tarjetaExistente.perdida === "1") {
      console.log("❌ [BUSCAR PENDIENTE] Tarjeta marcada como perdida");
      return NextResponse.json(
        { error: `Tarjeta ${tarjetaExistente.codigo} está marcada como perdida` },
        { status: 400 }
      );
    }

    // PASO 2: Buscar ingresos de esta tarjeta en la tabla "codigos"
    console.log("🔍 [BUSCAR PENDIENTE] Buscando ingresos para tarjeta ID:", tarjetaExistente.id);
    
    const { data: ingresos, error: errorIngresos } = await supabase
      .from("codigos")
      .select("id, hora_entrada, tipo_vehiculo, placa, color, marca, modelo, estado")
      .eq("tarjeta_id", tarjetaExistente.id)
      .order("hora_entrada", { ascending: false });

    console.log("📋 [BUSCAR PENDIENTE] Ingresos encontrados:", ingresos);

    if (errorIngresos) {
      console.error("❌ [BUSCAR PENDIENTE] Error al buscar ingresos:", errorIngresos);
      return NextResponse.json(
        { error: "Error al verificar ingresos de la tarjeta" },
        { status: 500 }
      );
    }

    // Si no hay ingresos para esta tarjeta
    if (!ingresos || ingresos.length === 0) {
      console.log("❌ [BUSCAR PENDIENTE] Tarjeta sin ingresos registrados");
      return NextResponse.json(
        { error: "Tarjeta no encontrada o no está disponible para pago" },
        { status: 404 }
      );
    }

    // Buscar el ingreso pendiente (estado="1")
    const ingresoPendiente = ingresos.find(ing => ing.estado === "1");

    // Si tiene ingresos pero todos están pagados (estado="0")
    if (!ingresoPendiente) {
      const ultimoIngreso = ingresos[0]; // Ya están ordenados por fecha desc
      if (ultimoIngreso.estado === "0") {
        console.log("❌ [BUSCAR PENDIENTE] Tarjeta ya pagada");
        return NextResponse.json(
          { 
            error: `Tarjeta ${tarjetaExistente.codigo} ya está pagada`,
            tipo: "ya_pagada",
            tarjeta: tarjetaExistente.codigo
          },
          { status: 400 }
        );
      }
      
      // Caso inesperado: tiene ingresos pero ninguno pendiente ni pagado
      console.log("❌ [BUSCAR PENDIENTE] Estado inconsistente");
      return NextResponse.json(
        { error: "Tarjeta no encontrada o no está disponible para pago" },
        { status: 404 }
      );
    }

    // PASO 3: Tarjeta encontrada con ingreso pendiente - caso exitoso
    console.log("✅ [BUSCAR PENDIENTE] Tarjeta con ingreso pendiente encontrada");

    const tarjeta = {
      id: tarjetaExistente.id,
      codigo: tarjetaExistente.codigo,
      codigo_barras: tarjetaExistente.codigo_barras,
      qr_code: tarjetaExistente.qr_code,
      estado: tarjetaExistente.estado,
      ingreso_id: ingresoPendiente.id,
      hora_entrada: ingresoPendiente.hora_entrada,
      tipo_vehiculo: ingresoPendiente.tipo_vehiculo,
      placa: ingresoPendiente.placa,
      color: ingresoPendiente.color,
      marca: ingresoPendiente.marca,
      modelo: ingresoPendiente.modelo,
    };

    return NextResponse.json({ tarjeta });
  } catch (error) {
    console.error("Error al buscar tarjeta pendiente:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
