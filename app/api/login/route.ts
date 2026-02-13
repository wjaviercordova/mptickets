import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const usuario = (body?.usuario ?? "").toString().trim();
    const password = (body?.password ?? "").toString();
    const negocioCodigo = (body?.negocioCodigo ?? "").toString().trim();

    if (!usuario || !password || !negocioCodigo) {
      return NextResponse.json(
        { message: "Completa usuario, contraseña y código de negocio." },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data: negocios, error: negocioError } = await supabase
      .from("negocios")
      .select("id, nombre, estado")
      .ilike("codigo", negocioCodigo)
      .limit(1);

    if (negocioError) {
      return NextResponse.json(
        {
          message:
            "No se pudo consultar el negocio. Verifica RLS o la SERVICE_ROLE_KEY.",
          detail: negocioError.message,
        },
        { status: 500 }
      );
    }

    const negocio = negocios?.[0];

    if (!negocio) {
      return NextResponse.json(
        { message: "Negocio no encontrado." },
        { status: 401 }
      );
    }

    if (negocio.estado !== "activo") {
      return NextResponse.json(
        { message: "Negocio inactivo o suspendido." },
        { status: 403 }
      );
    }

    const { data: usuarioData, error: usuarioError } = await supabase
      .from("usuarios")
      .select("id, usuario, email, nombre, apellido, password, estado, rol")
      .eq("negocio_id", negocio.id)
      .eq("usuario", usuario)
      .single();

    if (usuarioError || !usuarioData) {
      return NextResponse.json(
        { message: "Usuario o contraseña inválidos." },
        { status: 401 }
      );
    }

    if (usuarioData.estado !== "1") {
      return NextResponse.json(
        { message: "Usuario inactivo." },
        { status: 403 }
      );
    }

    const isValid = await bcrypt.compare(password, usuarioData.password);

    if (!isValid) {
      return NextResponse.json(
        { message: "Usuario o contraseña inválidos." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      message: "Acceso concedido.",
      user: {
        id: usuarioData.id,
        usuario: usuarioData.usuario,
        nombre: usuarioData.nombre,
        apellido: usuarioData.apellido,
        rol: usuarioData.rol,
        email: usuarioData.email,
      },
      negocio: {
        id: negocio.id,
        nombre: negocio.nombre,
        codigo: negocioCodigo,
      },
    });

    response.cookies.set("mp_user_id", usuarioData.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 12,
      path: "/",
    });

    response.cookies.set("mp_negocio_id", negocio.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 12,
      path: "/",
    });

    response.cookies.set("mp_usuario", usuarioData.usuario, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 12,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Error interno de autenticación." },
      { status: 500 }
    );
  }
}
