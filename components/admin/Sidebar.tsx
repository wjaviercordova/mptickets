"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  Search,
  FileBarChart,
  LogOut,
} from "lucide-react";

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const menuItems: MenuItem[] = [
  {
    name: "Inicio",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Negocios",
    href: "/admin/negocios",
    icon: Building2,
  },
  {
    name: "Usuarios Admin",
    href: "/admin/usuarios",
    icon: ShieldCheck,
  },
  {
    name: "Consultas",
    href: "/admin/consultas",
    icon: Search,
  },
  {
    name: "Reportes",
    href: "/admin/reportes",
    icon: FileBarChart,
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      console.log('🔐 [LOGOUT] Iniciando cierre de sesión...');
      
      const response = await fetch("/api/admin/auth/logout", { 
        method: "POST",
        credentials: "include", // Incluir cookies
        cache: "no-store", // No cachear la respuesta
      });

      const data = await response.json();
      console.log('🔐 [LOGOUT] Respuesta del servidor:', data);

      if (!response.ok) {
        console.error('❌ [LOGOUT] Error en respuesta del servidor:', response.status);
      } else {
        console.log('✅ [LOGOUT] Sesión cerrada exitosamente');
      }

      // Pequeño delay para asegurar que la cookie se procese
      await new Promise(resolve => setTimeout(resolve, 200));

      // Forzar redirección completa con replace (no deja historial)
      console.log('🔄 [LOGOUT] Redirigiendo a login...');
      window.location.replace("/admin/login");
    } catch (error) {
      console.error('❌ [LOGOUT] Error al cerrar sesión:', error);
      // Aún así redirigir al login
      await new Promise(resolve => setTimeout(resolve, 100));
      window.location.replace("/admin/login");
    }
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1, width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
      className="sticky top-0 flex h-screen flex-col border-r border-blue-500/20 bg-[#0f172a]/90 shadow-2xl shadow-blue-500/10 backdrop-blur-xl"
    >
      {/* Logo */}
      <div className="flex h-20 items-center px-6">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key="logo-expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/30 to-blue-600/20 shadow-lg shadow-cyan-500/20">
                <Image
                  src="/images/logos/mptickets.png"
                  alt="MPTickets"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">
                  Admin
                </p>
                <h2 className="font-heading text-white">MPTickets</h2>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {menuItems.map((item) => {
          // Para "Inicio" (/admin) solo activar cuando estés exactamente en esa ruta
          // Para otras rutas, activar cuando coincida exactamente o sea una subruta
          const isActive = item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium backdrop-blur-sm transition-all ${
                isActive
                  ? "border-cyan-400/50 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-white shadow-lg shadow-cyan-500/20"
                  : "border-blue-500/20 bg-[#1e293b]/40 text-blue-100/80 hover:border-cyan-400/50 hover:bg-gradient-to-r hover:from-blue-500/30 hover:to-cyan-500/20 hover:text-white hover:shadow-lg hover:shadow-cyan-500/20"
              }`}
            >
              {/* Indicador activo */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-cyan-400 to-blue-500"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              {/* Contenedor del ícono con efecto Modern Glass */}
              <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border transition ${
                isActive
                  ? "border-cyan-400/40 bg-cyan-500/20 shadow-lg shadow-cyan-400/30"
                  : "border-blue-500/20 bg-blue-950/30 group-hover:border-cyan-400/40 group-hover:bg-cyan-500/20 group-hover:shadow-lg group-hover:shadow-cyan-400/30"
              }`}>
                <Icon className="h-4 w-4 text-cyan-400 transition group-hover:text-cyan-300" />
              </div>

              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    key="menu-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 text-left font-body font-medium"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>

              {!collapsed && item.badge && (
                <span className="ml-auto rounded-full bg-cyan-500/20 px-2 py-0.5 font-caption text-xs text-cyan-300">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer con botón de cerrar sesión */}
      <div className="border-t border-blue-500/20 p-4">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.button
              key="logout-expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="flex w-full items-center justify-between rounded-xl border border-red-400/40 bg-gradient-to-r from-red-500/25 to-pink-600/15 px-4 py-3 text-sm font-medium text-red-200 backdrop-blur-sm shadow-lg shadow-red-500/15 transition hover:border-red-400/60 hover:from-red-500/35 hover:to-pink-600/25 hover:text-red-100 hover:shadow-red-500/25"
              type="button"
            >
              <span className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/40 bg-red-500/25 shadow-inner shadow-red-500/20">
                  <LogOut className="h-4 w-4" />
                </div>
                Cerrar Sesión
              </span>
            </motion.button>
          ) : (
            <motion.button
              key="logout-collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleLogout}
              className="flex w-full items-center justify-center rounded-lg border border-red-400/40 bg-red-500/25 p-3 text-red-200 transition hover:bg-red-500/35"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut className="h-5 w-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
