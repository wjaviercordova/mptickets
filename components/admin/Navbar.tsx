"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Search } from "lucide-react";

const routeNames: Record<string, { title: string; subtitle: string }> = {
  "/admin": { 
    title: "Inicio", 
    subtitle: "Panel de control principal" 
  },
  "/admin/negocios": { 
    title: "Gestión de Negocios", 
    subtitle: "Administración multi-tenant" 
  },
  "/admin/negocios/nuevo": { 
    title: "Nuevo Negocio", 
    subtitle: "Registro de nuevo cliente" 
  },
  "/admin/usuarios": { 
    title: "Usuarios Administradores", 
    subtitle: "Control de acceso administrativo" 
  },
  "/admin/consultas": { 
    title: "Consultas y Búsquedas", 
    subtitle: "Sistema de consultas avanzadas" 
  },
  "/admin/reportes": { 
    title: "Reportes e Informes", 
    subtitle: "Análisis y estadísticas" 
  },
};

export default function Navbar() {
  const pathname = usePathname();
  const pageInfo = routeNames[pathname] || { 
    title: "Panel de Administración", 
    subtitle: "Sistema MPTickets" 
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-purple-400/10 bg-[#0f172a]/80 backdrop-blur-xl shadow-lg shadow-purple-500/5">
      <div className="flex h-20 items-center justify-between px-8">
        {/* Logo + Título de página */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-purple-400/40 bg-gradient-to-br from-purple-500/40 to-pink-500/30 shadow-lg shadow-purple-500/30"
          >
            <Image
              src="/images/logos/mptickets.png"
              alt="MPTickets Logo"
              width={28}
              height={28}
              className="object-contain"
              priority
            />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">
                MP Tickets Admin
              </p>
            </div>
            <h1 className="font-heading text-lg text-white">{pageInfo.title}</h1>
          </div>
        </div>

        {/* Control de búsqueda */}
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="hidden items-center gap-3 rounded-2xl border border-purple-500/30 bg-[#1e293b]/60 px-4 py-2.5 text-blue-100/80 backdrop-blur-xl shadow-lg md:flex"
          >
            <Search className="h-4 w-4 text-purple-400/60" />
            <input
              type="text"
              placeholder="Buscar negocios, usuarios, reportes..."
              className="w-80 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
            />
          </motion.div>
        </div>
      </div>
    </nav>
  );
}
