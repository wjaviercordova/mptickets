import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const negocioId = searchParams.get("negocio_id");

    if (!negocioId) {
      return NextResponse.json(
        { error: "negocio_id es requerido" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Obtener tarjetas con estado = "0" (ocupadas/pendientes) que tienen ingresos pendientes de pago
    // La tabla codigos debe tener estado = "1" (pendiente de pago)
    const { data: tarjetasData, error } = await supabase
      .from("codigos")
      .select(`
        id,
        hora_entrada,
        tipo_vehiculo,
        placa,
        color,
        marca,
        modelo,
        estado,
        tarjeta_id,
        tarjetas!inner (
          id,
          codigo,
          codigo_barras,
          qr_code,
          estado
        )
      `)
      .eq("negocio_id", negocioId)
      .eq("estado", "1")
      .eq("tarjetas.estado", "0")
      .is("hora_salida", null)
      .order("hora_entrada", { ascending: false });

    if (error) {
      console.error("Error al obtener tarjetas pendientes:", error);
      return NextResponse.json(
        { error: "Error al obtener tarjetas pendientes" },
        { status: 500 }
      );
    }

    // Transformar datos para el formato esperado por el frontend
    interface CodigoConTarjeta {
      id: string;
      hora_entrada: string;
      tipo_vehiculo: string;
      placa: string;
      color: string;
      marca: string;
      modelo: string;
      estado: string;
      tarjeta_id: string;
      tarjetas: {
        id: string;
        codigo: string;
        codigo_barras: string | null;
        qr_code: string | null;
        estado: string;
      } | {
        id: string;
        codigo: string;
        codigo_barras: string | null;
        qr_code: string | null;
        estado: string;
      }[];
    }

    const tarjetas = (tarjetasData || []).map((item: CodigoConTarjeta) => {
      const tarjeta = Array.isArray(item.tarjetas) ? item.tarjetas[0] : item.tarjetas;
      return {
        id: tarjeta?.id || item.tarjeta_id || "",
        codigo: tarjeta?.codigo || "",
        codigo_barras: tarjeta?.codigo_barras || null,
        qr_code: tarjeta?.qr_code || null,
        estado: tarjeta?.estado || "",
        ingreso_id: item.id,
        hora_entrada: item.hora_entrada,
        tipo_vehiculo: item.tipo_vehiculo,
        placa: item.placa,
        color: item.color,
        marca: item.marca,
        modelo: item.modelo,
      };
    });

    return NextResponse.json({ tarjetas });
  } catch (error) {
    console.error("Error en API tarjetas pendientes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
