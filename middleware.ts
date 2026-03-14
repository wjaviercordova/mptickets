import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ========================================
  // PROTECCIÓN RUTAS ADMIN
  // ========================================
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const adminSession = request.cookies.get("admin_session");

    console.log('🔐 [MIDDLEWARE] Protegiendo ruta:', pathname);
    console.log('🔐 [MIDDLEWARE] Cookie admin_session presente:', !!adminSession);

    // Si no hay cookie de sesión, redirigir a login admin
    // La validación del token se hará en el layout (Node.js runtime)
    if (!adminSession) {
      console.log('❌ [MIDDLEWARE] Sin cookie, redirigiendo a /admin/login');
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    console.log('✅ [MIDDLEWARE] Cookie presente, permitiendo acceso');
    // No verificamos el token aquí porque jwt.verify no funciona en Edge Runtime
    // La verificación se hace en el layout (server component con Node.js runtime)
  }

  // ========================================
  // PROTECCIÓN RUTAS DASHBOARD NORMAL
  // ========================================
  if (pathname.startsWith("/dashboard")) {
    const userId = request.cookies.get("mp_user_id")?.value;
    const negocioId = request.cookies.get("mp_negocio_id")?.value;

    if (!userId || !negocioId) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
