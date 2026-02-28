"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Building2,
  Car,
  ChevronDown,
  CreditCard,
  DollarSign,
  Home,
  LogIn,
  LogOut,
  Receipt,
  Search,
  Server,
  Settings,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";

interface SubMenuItem {
  label: string;
  icon: LucideIcon;
  href?: string;
}

interface NavItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  subItems?: SubMenuItem[];
}

// Mapeo de rutas
const navItems: NavItem[] = [
  { label: "Inicio", icon: Home, href: "/dashboard" },
  { label: "Ingreso Vehicular", icon: LogIn, href: "/dashboard/ingreso" },
  { label: "Pago y Salida", icon: CreditCard, href: "/dashboard/pago" },
  {
    label: "Consultas",
    icon: Search,
    subItems: [
      { label: "Tarjetas Emitidas", icon: Ticket, href: "/dashboard/consultas/tarjetas" },
      { label: "Costos Registrados", icon: DollarSign, href: "/dashboard/consultas/costos" },
      { label: "Vehículos", icon: Car, href: "/dashboard/consultas/vehiculos" },
      { label: "Actividad", icon: Activity, href: "/dashboard/consultas/actividad" },
    ],
  },
  { label: "Reportes", icon: BarChart3, href: "/dashboard/reportes" },
  {
    label: "Configuración",
    icon: Settings,
    subItems: [
      { label: "Tarjetas", icon: Receipt, href: "/dashboard/configuracion/tarjetas" },
      { label: "Usuarios", icon: Users, href: "/dashboard/configuracion/usuarios" },
      { label: "Negocio", icon: Building2, href: "/dashboard/configuracion/negocio" },
      { label: "Sistema", icon: Server, href: "/dashboard/configuracion/sistema" },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  negocioNombre: string;
}

export function Sidebar({ isOpen, negocioNombre }: SidebarProps) {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();

  const toggleSubMenu = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href;
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // 1. Llamar al endpoint de logout para eliminar cookies del servidor
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // 2. Limpiar localStorage del navegador
        if (typeof window !== "undefined") {
          localStorage.clear();
          sessionStorage.clear();
        }

        // 3. Forzar recarga completa para limpiar el Context y estado de React
        // Usamos window.location.href en lugar de router.push para:
        // - Limpiar completamente el estado de React
        // - Eliminar datos en memoria del Context
        // - Recargar la aplicación desde cero
        window.location.href = "/";
      } else {
        console.error("Error al cerrar sesión");
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setIsLoggingOut(false);
    }
  };
  return (
    <>
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -288 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 z-50 h-full w-72 border-r border-blue-500/20 bg-[#0f172a]/90 p-6 backdrop-blur-xl shadow-2xl shadow-blue-500/10"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 to-green-600/10 p-3 backdrop-blur-sm shadow-lg shadow-emerald-500/10"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 shadow-lg shadow-emerald-500/20">
            <Building2 className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">
              Negocio
            </p>
            <h2 className="font-heading text-white">{negocioNombre}</h2>
          </div>
        </motion.div>

        <nav className="mt-8 space-y-2 overflow-y-auto overflow-x-hidden pr-2 sidebar-scroll" style={{ maxHeight: "calc(100vh - 240px)" }}>
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isExpanded = expandedMenu === item.label;
            const hasSubItems = item.subItems && item.subItems.length > 0;

            return (
              <div key={item.label}>
                {/* Opción principal */}
                {item.href && !hasSubItems ? (
                  <Link href={item.href} prefetch={true}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -2, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium backdrop-blur-sm transition ${
                        isActive(item.href)
                          ? "border-cyan-400/50 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-white shadow-lg shadow-cyan-500/20"
                          : "border-blue-500/20 bg-[#1e293b]/40 text-blue-100/80 hover:border-cyan-400/50 hover:bg-gradient-to-r hover:from-blue-500/30 hover:to-cyan-500/20 hover:text-white hover:shadow-lg hover:shadow-cyan-500/20"
                      }`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                        isActive(item.href)
                          ? "border-cyan-400/40 bg-cyan-500/20 shadow-lg shadow-cyan-400/30"
                          : "border-blue-500/20 bg-blue-950/30 group-hover:border-cyan-400/40 group-hover:bg-cyan-500/20 group-hover:shadow-lg group-hover:shadow-cyan-400/30"
                      }`}>
                        <Icon className="h-4 w-4 text-cyan-400 transition group-hover:text-cyan-300" />
                      </div>
                      <span className="flex-1 text-left">{item.label}</span>
                    </motion.div>
                  </Link>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => hasSubItems ? toggleSubMenu(item.label) : null}
                    className="group flex w-full items-center gap-3 rounded-2xl border border-blue-500/20 bg-[#1e293b]/40 px-4 py-3 text-sm font-medium text-blue-100/80 backdrop-blur-sm transition hover:border-cyan-400/50 hover:bg-gradient-to-r hover:from-blue-500/30 hover:to-cyan-500/20 hover:text-white hover:shadow-lg hover:shadow-cyan-500/20"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-950/30 transition group-hover:border-cyan-400/40 group-hover:bg-cyan-500/20 group-hover:shadow-lg group-hover:shadow-cyan-400/30">
                      <Icon className="h-4 w-4 text-cyan-400 transition group-hover:text-cyan-300" />
                    </div>
                    <span className="flex-1 text-left">{item.label}</span>
                    {hasSubItems && (
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-4 w-4 text-cyan-400" />
                      </motion.div>
                    )}
                  </motion.button>
                )}

                {/* Submenú */}
                <AnimatePresence>
                  {hasSubItems && isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 space-y-1">
                        {item.subItems?.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <Link key={subItem.label} href={subItem.href || "#"} prefetch={true}>
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ scale: 1.02, y: -2, x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                className={`group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium backdrop-blur-sm transition ${
                                  isActive(subItem.href)
                                    ? "border-cyan-400/40 bg-gradient-to-r from-cyan-500/25 to-blue-600/20 text-cyan-200 shadow-md shadow-cyan-500/20"
                                    : "border-blue-500/10 bg-[#0a0e27]/60 text-blue-200/70 hover:border-cyan-400/30 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-cyan-500/10 hover:text-cyan-200 hover:shadow-md hover:shadow-cyan-500/10"
                                }`}
                              >
                                <div className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                                  isActive(subItem.href)
                                    ? "border-cyan-400/40 bg-cyan-500/20 shadow-lg shadow-cyan-400/20"
                                    : "border-blue-500/10 bg-blue-950/20 group-hover:border-cyan-400/30 group-hover:bg-cyan-500/10 group-hover:shadow-lg group-hover:shadow-cyan-400/20"
                                }`}>
                                  <SubIcon className="h-4 w-4 text-cyan-400/80 transition group-hover:text-cyan-300" />
                                </div>
                                {subItem.label}
                              </motion.div>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <style jsx global>{`
          .sidebar-scroll::-webkit-scrollbar {
            width: 6px;
          }
          
          .sidebar-scroll::-webkit-scrollbar-track {
            background: rgba(15, 23, 42, 0.3);
            border-radius: 10px;
            backdrop-filter: blur(10px);
          }
          
          .sidebar-scroll::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, rgba(6, 182, 212, 0.4), rgba(34, 211, 238, 0.3));
            border-radius: 10px;
            border: 1px solid rgba(6, 182, 212, 0.2);
          }
          
          .sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, rgba(6, 182, 212, 0.6), rgba(34, 211, 238, 0.5));
            box-shadow: 0 0 8px rgba(6, 182, 212, 0.3);
          }
        `}</style>

        <div className="absolute bottom-6 left-6 right-6">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center justify-between rounded-2xl border border-red-400/40 bg-gradient-to-r from-red-500/25 to-pink-600/15 px-4 py-3 text-sm font-medium text-red-200 backdrop-blur-sm shadow-lg shadow-red-500/15 transition hover:border-red-400/60 hover:from-red-500/35 hover:to-pink-600/25 hover:text-red-100 hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            <span className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/40 bg-red-500/25 shadow-inner shadow-red-500/20">
                <LogOut className={isLoggingOut ? "h-4 w-4 animate-pulse" : "h-4 w-4"} />
              </div>
              {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
            </span>
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
}
