import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";
import { validarAgregarUsuario } from "@/lib/planes-limites-db";

// POST - Crear nuevo usuario
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
      usuario,
      nombre,
      apellido,
      email,
      telefono,
      password,
      rol,
      permisos,
      avatar_url,
    } = body;

    // Validar campos requeridos
    if (!negocioId || !usuario || !nombre || !apellido || !password) {
      return NextResponse.json(
        { message: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // ============================================================================
    // VALIDACIÓN DE LÍMITE DEL PLAN
    // ============================================================================
    const validacionLimite = await validarAgregarUsuario(negocioId);
    
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

    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from("usuarios")
      .select("id")
      .eq("negocio_id", negocioId)
      .eq("usuario", usuario)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { message: "El usuario ya existe" },
        { status: 400 }
      );
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const { error } = await supabase.from("usuarios").insert({
      negocio_id: negocioId,
      usuario,
      nombre,
      apellido,
      email: email || null,
      telefono: telefono || null,
      password: hashedPassword,
      rol: rol || "operador",
      permisos: permisos || {},
      avatar_url: avatar_url || null,
      estado: "1",
    });

    if (error) {
      console.error("Error al crear usuario:", error);
      return NextResponse.json(
        { message: "Error al crear usuario" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Usuario creado exitosamente",
    });
  } catch (error) {
    console.error("Error en POST /api/configuracion/usuarios:", error);
    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar usuario existente
export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const usuarioIdActual = cookieStore.get("mp_user_id")?.value;

    if (!usuarioIdActual) {
      return NextResponse.json(
        { message: "No autenticado" },
        { status: 401 }
      );
    }

    const supabase = createServerClient();
    const body = await request.json();
    const {
      userId,
      usuario,
      nombre,
      apellido,
      email,
      telefono,
      password,
      rol,
      permisos,
      avatar_url,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { message: "userId es requerido" },
        { status: 400 }
      );
    }

    // Preparar datos de actualización
    const updateData: Record<string, unknown> = {
      usuario,
      nombre,
      apellido,
      email: email || null,
      telefono: telefono || null,
      rol: rol || "operador",
      permisos: permisos || {},
      avatar_url: avatar_url || null,
      fecha_actualizacion: new Date().toISOString(),
    };

    // Si se proporciona nueva contraseña, hashearla
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Actualizar usuario
    const { error } = await supabase
      .from("usuarios")
      .update(updateData)
      .eq("id", userId);

    if (error) {
      console.error("Error al actualizar usuario:", error);
      return NextResponse.json(
        { message: "Error al actualizar usuario" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Usuario actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error en PUT /api/configuracion/usuarios:", error);
    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar usuario
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const usuarioIdActual = cookieStore.get("mp_user_id")?.value;

    if (!usuarioIdActual) {
      return NextResponse.json(
        { message: "No autenticado" },
        { status: 401 }
      );
    }

    const supabase = createServerClient();
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { message: "userId es requerido" },
        { status: 400 }
      );
    }

    // No permitir que un usuario se elimine a sí mismo
    if (userId === usuarioIdActual) {
      return NextResponse.json(
        { message: "No puede eliminar su propio usuario" },
        { status: 400 }
      );
    }

    // Eliminar usuario
    const { error } = await supabase
      .from("usuarios")
      .delete()
      .eq("id", userId);

    if (error) {
      console.error("Error al eliminar usuario:", error);
      return NextResponse.json(
        { message: "Error al eliminar usuario" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Usuario eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error en DELETE /api/configuracion/usuarios:", error);
    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 }
    );
  }
}
