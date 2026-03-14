import { cookies } from "next/headers";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import { getAdminFromToken } from "@/lib/admin/auth";

export const metadata = {
  title: "Panel de Administración - MPTickets",
  description: "Sistema de gestión multi-tenant para MPTickets",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Obtener token de cookie
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");

  console.log('🎨 [ADMIN LAYOUT] Cookie admin_session presente:', !!adminSession);

  // Si no hay sesión, renderizar solo children (página de login)
  if (!adminSession) {
    console.log('🎨 [ADMIN LAYOUT] Sin sesión, renderizando solo login');
    return <>{children}</>;
  }

  console.log('🎨 [ADMIN LAYOUT] Verificando token en Node.js runtime...');

  // Obtener datos del usuario admin (esto valida el token)
  const adminUser = await getAdminFromToken(adminSession.value);

  console.log('🎨 [ADMIN LAYOUT] Usuario obtenido:', !!adminUser, adminUser?.usuario);

  // Si el token es inválido, renderizar solo children
  if (!adminUser) {
    console.log('❌ [ADMIN LAYOUT] Token inválido o expirado');
    // Aquí podríamos eliminar la cookie, pero el usuario tendrá que hacer login de nuevo
    return <>{children}</>;
  }

  console.log('✅ [ADMIN LAYOUT] Renderizando layout completo para:', adminUser.usuario);

  // Usuario válido: renderizar layout completo con sidebar y navbar

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#16213e] to-[#0f1729]">
      {/* Efectos de fondo globales */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(147,51,234,0.1),_transparent_50%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(236,72,153,0.08),_transparent_50%)]" />

      {/* Layout principal */}
      <div className="relative z-10 flex">
        {/* Sidebar */}
        <Sidebar userNombre={adminUser.nombre} userRol={adminUser.rol} />

        {/* Contenido principal */}
        <div className="flex-1 overflow-x-hidden">
          {/* Navbar */}
          <Navbar userName={adminUser.nombre} />

          {/* Contenido de página */}
          <main className="min-h-[calc(100vh-5rem)] p-8">{children}</main>

          {/* Footer */}
          <footer className="border-t border-purple-400/10 bg-[#0a0e27]/50 px-8 py-6 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="font-caption text-sm text-blue-200/60">
                © 2026 MPTickets Admin Panel. Sistema de gestión multi-tenant.
              </p>
              <div className="flex items-center gap-6">
                <a
                  href="#"
                  className="font-caption text-sm text-purple-300/60 transition-colors hover:text-purple-300"
                >
                  Documentación
                </a>
                <a
                  href="#"
                  className="font-caption text-sm text-purple-300/60 transition-colors hover:text-purple-300"
                >
                  Soporte
                </a>
                <span className="font-caption text-sm text-blue-200/40">v1.0.0</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
