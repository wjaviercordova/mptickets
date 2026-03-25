import { NextRequest, NextResponse } from "next/server";
import { obtenerFechaHoraActual } from "@/lib/timezone";

/**
 * GET: Obtener fecha y hora actual del negocio
 */
export async function GET(request: NextRequest) {
  try {
    const negocioId = request.nextUrl.searchParams.get("negocioId");
    if (!negocioId) {
      return NextResponse.json(
        { error: "negocioId es requerido" },
        { status: 400 }
      );
    }

    const fechaHora = await obtenerFechaHoraActual(negocioId);

    return NextResponse.json({ fechaHora });
  } catch (error) {
    console.error("Error al obtener fecha/hora actual:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
