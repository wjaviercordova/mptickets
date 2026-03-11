import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const negocioId = searchParams.get("negocio_id");
    const fechaInicio = searchParams.get("fecha_inicio");
    const fechaFin = searchParams.get("fecha_fin");

    if (!negocioId) {
      return NextResponse.json(
        { error: "negocio_id es requerido" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Construir query base con filtros
    let query = supabase
      .from("codigos")
      .select(`
        id,
        tipo_vehiculo,
        hora_entrada,
        hora_salida,
        costo,
        descuento,
        total,
        metodo_pago,
        usuario_entrada_id,
        usuario_salida_id
      `)
      .eq("negocio_id", negocioId)
      .not("hora_salida", "is", null)
      .not("total", "is", null);

    // Aplicar filtros de fecha si existen
    if (fechaInicio) {
      query = query.gte("hora_salida", `${fechaInicio}T00:00:00`);
    }
    if (fechaFin) {
      query = query.lte("hora_salida", `${fechaFin}T23:59:59`);
    }

    const { data: codigosData, error } = await query;

    if (error) {
      console.error("Error al obtener datos de reportes:", error);
      return NextResponse.json(
        { error: "Error al obtener datos" },
        { status: 500 }
      );
    }

    // Calcular métricas según el tipo de reporte
    const resultado = calcularMetricas(codigosData || []);

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Error en API de reportes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

interface CodigoData {
  id: string;
  tipo_vehiculo: string;
  hora_entrada: string;
  hora_salida: string | null;
  costo: number | null;
  descuento: number | null;
  total: number | null;
  metodo_pago: string | null;
  usuario_entrada_id: string | null;
  usuario_salida_id: string | null;
}

function calcularMetricas(codigos: CodigoData[]) {
  const totalRegistros = codigos.length;
  const totalIngresos = codigos.reduce((sum, c) => sum + (Number(c.total) || 0), 0);
  const totalDescuentos = codigos.reduce((sum, c) => sum + (Number(c.descuento) || 0), 0);
  const totalCostos = codigos.reduce((sum, c) => sum + (Number(c.costo) || 0), 0);

  // Calcular duraciones promedio
  const duraciones = codigos
    .filter((c) => c.hora_entrada && c.hora_salida)
    .map((c) => {
      const entrada = new Date(c.hora_entrada as string).getTime();
      const salida = new Date(c.hora_salida as string).getTime();
      return (salida - entrada) / (1000 * 60); // minutos
    });

  const duracionPromedio =
    duraciones.length > 0
      ? duraciones.reduce((sum, d) => sum + d, 0) / duraciones.length
      : 0;

  // Métricas por tipo de vehículo
  const porTipoVehiculo = codigos.reduce((acc: Record<string, {cantidad: number; ingresos: number; descuentos: number; duraciones: number[]; duracionPromedio?: number}>, c) => {
    const tipo = c.tipo_vehiculo || "Sin especificar";
    if (!acc[tipo]) {
      acc[tipo] = {
        cantidad: 0,
        ingresos: 0,
        descuentos: 0,
        duraciones: [],
      };
    }
    acc[tipo].cantidad += 1;
    acc[tipo].ingresos += Number(c.total) || 0;
    acc[tipo].descuentos += Number(c.descuento) || 0;
    
    if (c.hora_entrada && c.hora_salida) {
      const entrada = new Date(c.hora_entrada).getTime();
      const salida = new Date(c.hora_salida as string).getTime();
      acc[tipo].duraciones.push((salida - entrada) / (1000 * 60));
    }
    
    return acc;
  }, {});

  // Calcular promedio de duración por tipo
  Object.keys(porTipoVehiculo).forEach((tipo) => {
    const dur = porTipoVehiculo[tipo].duraciones;
    porTipoVehiculo[tipo].duracionPromedio =
      dur.length > 0 ? dur.reduce((sum: number, d: number) => sum + d, 0) / dur.length : 0;
  });

  // Métricas por método de pago
  const porMetodoPago = codigos.reduce((acc: Record<string, {cantidad: number; ingresos: number}>, c) => {
    const metodo = c.metodo_pago || "Sin especificar";
    if (!acc[metodo]) {
      acc[metodo] = {
        cantidad: 0,
        ingresos: 0,
      };
    }
    acc[metodo].cantidad += 1;
    acc[metodo].ingresos += Number(c.total) || 0;
    return acc;
  }, {});

  // Distribución por hora del día
  const porHora = codigos.reduce((acc: Record<number, number>, c) => {
    if (!c.hora_entrada) return acc;
    const hora = new Date(c.hora_entrada).getHours();
    if (!acc[hora]) {
      acc[hora] = 0;
    }
    acc[hora] += 1;
    return acc;
  }, {});

  // Distribución por día de la semana
  const porDiaSemana = codigos.reduce((acc: Record<string, {cantidad: number; ingresos: number}>, c) => {
    if (!c.hora_entrada) return acc;
    const dia = new Date(c.hora_entrada).getDay();
    const nombresDias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const nombreDia = nombresDias[dia];
    if (!acc[nombreDia]) {
      acc[nombreDia] = {
        cantidad: 0,
        ingresos: 0,
      };
    }
    acc[nombreDia].cantidad += 1;
    acc[nombreDia].ingresos += Number(c.total) || 0;
    return acc;
  }, {});

  // Tendencia temporal (últimos 30 días)
  const tendenciaTemporal = calcularTendenciaTemporal(codigos);

  // Métricas por usuario (productividad)
  const porUsuario = codigos.reduce((acc: Record<string, {transacciones: number; ingresos: number; descuentos: number}>, c) => {
    const usuarioId = c.usuario_salida_id || c.usuario_entrada_id || "Sin asignar";
    if (!acc[usuarioId]) {
      acc[usuarioId] = {
        transacciones: 0,
        ingresos: 0,
        descuentos: 0,
      };
    }
    acc[usuarioId].transacciones += 1;
    acc[usuarioId].ingresos += Number(c.total) || 0;
    acc[usuarioId].descuentos += Number(c.descuento) || 0;
    return acc;
  }, {});

  return {
    resumen: {
      totalRegistros,
      totalIngresos,
      totalDescuentos,
      totalCostos,
      ingresoPromedio: totalRegistros > 0 ? totalIngresos / totalRegistros : 0,
      duracionPromedio,
      tasaDescuento: totalCostos > 0 ? (totalDescuentos / totalCostos) * 100 : 0,
    },
    porTipoVehiculo,
    porMetodoPago,
    porHora,
    porDiaSemana,
    tendenciaTemporal,
    porUsuario,
  };
}

function calcularTendenciaTemporal(codigos: CodigoData[]) {
  const agrupadoPorDia = codigos.reduce((acc: Record<string, {fecha: string; cantidad: number; ingresos: number}>, c) => {
    if (!c.hora_salida) return acc;
    const fecha = new Date(c.hora_salida).toISOString().split("T")[0];
    if (!acc[fecha]) {
      acc[fecha] = {
        fecha,
        cantidad: 0,
        ingresos: 0,
      };
    }
    acc[fecha].cantidad += 1;
    acc[fecha].ingresos += Number(c.total) || 0;
    return acc;
  }, {});

  return Object.values(agrupadoPorDia).sort((a, b) =>
    a.fecha.localeCompare(b.fecha)
  );
}
