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

interface SidebarProps {
  userNombre?: string;
  userRol?: string;
}

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

export default function Sidebar({ userNombre = "Admin", userRol = "Superadmin" }: SidebarProps) {
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
      className="glass-card sticky top-0 flex h-screen flex-col border-r border-purple-400/20 bg-[#0a0e27]/95 shadow-xl shadow-purple-500/5"
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
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-purple-400/40 bg-gradient-to-br from-purple-500/30 to-pink-600/20 shadow-lg shadow-purple-500/20">
                <Image
                  src="/images/logos/mptickets.png"
                  alt="MPTickets"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="font-display text-sm font-bold text-white">MPTickets</h2>
                <p className="font-caption text-xs text-purple-300/60">Admin Panel</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg border border-purple-400/20 bg-purple-500/10 p-1.5 text-purple-300 transition-colors hover:border-purple-400/40 hover:bg-purple-500/20"
          aria-label={collapsed ? "Expandir sidebar" : "Contraer sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
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
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                isActive
                  ? "bg-gradient-to-r from-purple-500/20 to-pink-600/10 text-white shadow-lg shadow-purple-500/10"
                  : "text-blue-200/70 hover:bg-purple-500/10 hover:text-white"
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

      {/* Footer con usuario */}
      <div className="border-t border-purple-400/10 p-4">
        <div
          className={`flex items-center gap-3 rounded-xl border border-purple-400/20 bg-purple-500/5 p-3 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-500 font-display text-sm font-bold text-white shadow-lg shadow-purple-500/20">
            {userNombre.charAt(0).toUpperCase()}
          </div>

          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                key="user-info"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-hidden"
              >
                <p className="truncate font-body text-sm font-semibold text-white">{userNombre}</p>
                <p className="truncate font-caption text-xs text-purple-300/60">{userRol}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!collapsed && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-purple-300/60 transition-colors hover:bg-purple-500/10 hover:text-purple-300"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-caption text-xs">Cerrar Sesión</span>
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
