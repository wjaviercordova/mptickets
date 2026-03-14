"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

interface NavbarProps {
  userName?: string;
}

const routeNames: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/negocios": "Gestión de Negocios",
  "/admin/negocios/nuevo": "Nuevo Negocio",
  "/admin/usuarios": "Usuarios Administradores",
  "/admin/consultas": "Consultas y Búsquedas",
  "/admin/reportes": "Reportes e Informes",
};

export default function Navbar({ userName = "Admin" }: NavbarProps) {
  const pathname = usePathname();
  const pageName = routeNames[pathname] || "Panel de Administración";

  return (
    <nav className="glass-card sticky top-0 z-40 border-b border-purple-400/10 bg-[#0a0e27]/80 backdrop-blur-xl shadow-lg shadow-purple-500/5">
      <div className="flex h-20 items-center justify-between px-8">
        {/* Título de página */}
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{pageName}</h1>
          <p className="font-caption text-sm text-blue-200/60">
            Sistema de gestión multi-tenant MPTickets
          </p>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-4">
          {/* Búsqueda */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400/60" />
            <input
              type="text"
              placeholder="Buscar..."
              className="glass-input w-64 border-purple-500/20 bg-[#0f172a]/60 pl-10 text-sm text-white placeholder:text-blue-200/40 focus:border-purple-400/40 focus:ring-purple-400/20"
            />
          </div>

          {/* Notificaciones */}
          <button
            className="relative rounded-xl border border-purple-400/20 bg-purple-500/10 p-2.5 text-purple-300 transition-all hover:border-purple-400/40 hover:bg-purple-500/20"
            aria-label="Notificaciones"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-pink-500"></span>
            </span>
          </button>

          {/* Usuario */}
          <div className="flex items-center gap-3 rounded-xl border border-purple-400/20 bg-purple-500/10 px-4 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-500 font-display text-xs font-bold text-white shadow-lg shadow-purple-500/20">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden font-body text-sm font-medium text-white md:block">
              {userName}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
