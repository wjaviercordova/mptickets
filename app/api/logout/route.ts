import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("mp_user_id")?.value;
    const negocioId = cookieStore.get("mp_negocio_id")?.value;

    // Registrar logout en auditoría antes de eliminar cookies
    if (userId && negocioId) {
      try {
        const supabase = createServerClient();
        await supabase.from("auditoria").insert({
          negocio_id: negocioId,
          usuario_id: userId,
          accion: "LOGOUT",
          tabla_afectada: "usuarios",
          descripcion: "Cierre de sesión del usuario",
          datos_nuevos: {
            fecha_logout: new Date().toISOString(),
            ip: "N/A" // Puedes agregar la IP si la necesitas
          }
        });
      } catch (auditError) {
        console.error("Error al registrar logout en auditoría:", auditError);
        // No fallar el logout si falla la auditoría
      }
    }

    const response = NextResponse.json({
      message: "Sesión cerrada exitosamente",
      success: true,
    });

    // Eliminar todas las cookies de sesión con configuración segura
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 0 // Expirar inmediatamente
    };

    response.cookies.set("mp_user_id", "", cookieOptions);
    response.cookies.set("mp_negocio_id", "", cookieOptions);
    response.cookies.set("mp_usuario", "", cookieOptions);

    // Header para limpiar caché del navegador
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return NextResponse.json(
      { message: "Error al cerrar sesión", success: false },
      { status: 500 }
    );
  }
}
