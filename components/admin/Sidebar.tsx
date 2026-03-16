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
  ChevronLeft,
  ChevronRight,
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
    name: "Dashboard",
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
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1, width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 flex h-screen flex-col border-r border-purple-400/20 bg-[#0f172a]/90 shadow-2xl shadow-purple-500/10 backdrop-blur-xl"
    >
      {/* Logo y Toggle */}
      <div className="flex h-20 items-center justify-between border-b border-purple-400/10 px-6">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key="logo-expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-purple-400/40 bg-gradient-to-br from-purple-500/30 to-pink-600/20 shadow-lg shadow-purple-500/20">
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

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-xl border border-purple-400/30 bg-purple-950/30 p-2 text-purple-300 backdrop-blur-sm transition hover:border-purple-400/60 hover:bg-purple-900/40 hover:text-white hover:shadow-lg hover:shadow-purple-500/20"
          aria-label={collapsed ? "Expandir sidebar" : "Contraer sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </motion.button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all ${
                isActive
                  ? "bg-gradient-to-r from-purple-500/30 to-pink-600/20 text-white shadow-lg shadow-purple-500/20 border border-purple-400/30"
                  : "text-blue-200/70 hover:bg-purple-500/20 hover:text-white hover:border hover:border-purple-400/20"
              }`}
            >
              {/* Indicador activo */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-purple-400 to-pink-500"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-purple-300" : ""}`} />

              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    key="menu-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-body text-sm font-medium"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>

              {!collapsed && item.badge && (
                <span className="ml-auto rounded-full bg-purple-500/20 px-2 py-0.5 font-caption text-xs text-purple-300">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer con botón de cerrar sesión */}
      <div className="border-t border-purple-400/10 p-4">
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
