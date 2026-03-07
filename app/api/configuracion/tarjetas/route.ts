import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";

// POST - Crear nueva tarjeta
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const usuarioId = cookieStore.get("mp_user_id")?.value;

    if (!usuarioId) {
      return NextResponse.json(
        { message: "No autenticado" },
        { status: 401 }
      );
    }

    const supabase = createServerClient();
    const body = await request.json();
    const {
      negocioId,
      codigo,
      codigo_interno,
      codigo_barras,
      qr_code,
      perdida,
    } = body;

    // Validar campos requeridos
    if (!negocioId || !codigo || !codigo_interno) {
      return NextResponse.json(
        { message: "Faltan campos requeridos (codigo, codigo_interno)" },
        { status: 400 }
      );
    }

    // Verificar si el código ya existe
    const { data: existingCard } = await supabase
      .from("tarjetas")
      .select("id")
      .eq("negocio_id", negocioId)
      .eq("codigo", codigo)
      .single();

    if (existingCard) {
      return NextResponse.json(
        { message: "Ya existe una tarjeta con ese código" },
        { status: 400 }
      );
    }

    // Crear tarjeta
    const { error } = await supabase.from("tarjetas").insert({
      negocio_id: negocioId,
      usuario_creacion_id: usuarioId,
      codigo,
      codigo_interno,
      codigo_barras: codigo_barras || null,
      qr_code: qr_code || null,
      perdida: perdida || "0",
      estado: "1", // Disponible por defecto
    });

    if (error) {
      console.error("Error al crear tarjeta:", error);
      return NextResponse.json(
        { message: "Error al crear tarjeta" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Tarjeta creada exitosamente",
    });
  } catch (error) {
    console.error("Error en POST /api/configuracion/tarjetas:", error);
    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar tarjeta existente
export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const usuarioId = cookieStore.get("mp_user_id")?.value;

    if (!usuarioId) {
      return NextResponse.json(
        { message: "No autenticado" },
        { status: 401 }
      );
    }

    const supabase = createServerClient();
    const body = await request.json();
    const {
      tarjetaId,
      codigo,
      codigo_interno,
      codigo_barras,
      qr_code,
      perdida,
    } = body;

    if (!tarjetaId) {
      return NextResponse.json(
        { message: "tarjetaId es requerido" },
        { status: 400 }
      );
    }

    // Actualizar tarjeta
    const { error } = await supabase
      .from("tarjetas")
      .update({
        codigo,
        codigo_interno,
        codigo_barras: codigo_barras || null,
        qr_code: qr_code || null,
        perdida: perdida || "0",
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq("id", tarjetaId);

    if (error) {
      console.error("Error al actualizar tarjeta:", error);
      return NextResponse.json(
        { message: "Error al actualizar tarjeta" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Tarjeta actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error en PUT /api/configuracion/tarjetas:", error);
    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar tarjeta
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const usuarioId = cookieStore.get("mp_user_id")?.value;

    if (!usuarioId) {
      return NextResponse.json(
        { message: "No autenticado" },
        { status: 401 }
      );
    }

    const supabase = createServerClient();
    const body = await request.json();
    const { tarjetaId } = body;

    if (!tarjetaId) {
      return NextResponse.json(
        { message: "tarjetaId es requerido" },
        { status: 400 }
      );
    }

    // Verificar si la tarjeta está en uso
    const { data: tarjetaEnUso } = await supabase
      .from("codigos")
      .select("id")
      .eq("tarjeta_id", tarjetaId)
      .eq("estado", "1") // Pendiente de pago
      .single();

    if (tarjetaEnUso) {
      return NextResponse.json(
        { message: "No se puede eliminar una tarjeta en uso" },
        { status: 400 }
      );
    }

    // Eliminar tarjeta
    const { error } = await supabase
      .from("tarjetas")
      .delete()
      .eq("id", tarjetaId);

    if (error) {
      console.error("Error al eliminar tarjeta:", error);
      return NextResponse.json(
        { message: "Error al eliminar tarjeta" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Tarjeta eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error en DELETE /api/configuracion/tarjetas:", error);
    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 }
    );
  }
}
