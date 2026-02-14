"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";

interface SubMenuItem {
  label: string;
  icon: any;
}

interface NavItem {
  label: string;
  icon: any;
  subItems?: SubMenuItem[];
}

const navItems: NavItem[] = [
  { label: "Inicio", icon: Home },
  { label: "Ingreso Vehicular", icon: LogIn },
  { label: "Pago y Salida", icon: CreditCard },
  {
    label: "Consultas",
    icon: Search,
    subItems: [
      { label: "Tarjetas Emitidas", icon: Ticket },
      { label: "Costos Registrados", icon: DollarSign },
      { label: "Vehículos", icon: Car },
      { label: "Actividad", icon: Activity },
    ],
  },
  { label: "Reportes", icon: BarChart3 },
  {
    label: "Configuración",
    icon: Settings,
    subItems: [
      { label: "Tarjetas", icon: Receipt },
      { label: "Usuarios", icon: Users },
      { label: "Negocio", icon: Building2 },
      { label: "Sistema", icon: Server },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  negocioNombre: string;
}

export function Sidebar({ isOpen, onClose, negocioNombre }: SidebarProps) {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const toggleSubMenu = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label);
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
                            <motion.button
                              key={subItem.label}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              whileHover={{ scale: 1.02, y: -2, x: 4 }}
                              whileTap={{ scale: 0.98 }}
                              className="group flex w-full items-center gap-3 rounded-2xl border border-blue-500/10 bg-[#0a0e27]/60 px-4 py-3 text-sm font-medium text-blue-200/70 backdrop-blur-sm transition hover:border-cyan-400/30 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-cyan-500/10 hover:text-cyan-200 hover:shadow-md hover:shadow-cyan-500/10"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/10 bg-blue-950/20 transition group-hover:border-cyan-400/30 group-hover:bg-cyan-500/10 group-hover:shadow-lg group-hover:shadow-cyan-400/20">
                                <SubIcon className="h-4 w-4 text-cyan-400/80 transition group-hover:text-cyan-300" />
                              </div>
                              {subItem.label}
                            </motion.button>
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
            className="flex w-full items-center justify-between rounded-2xl border border-red-400/40 bg-gradient-to-r from-red-500/25 to-pink-600/15 px-4 py-3 text-sm font-medium text-red-200 backdrop-blur-sm shadow-lg shadow-red-500/15 transition hover:border-red-400/60 hover:from-red-500/35 hover:to-pink-600/25 hover:text-red-100 hover:shadow-red-500/25"
            type="button"
          >
            <span className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/40 bg-red-500/25 shadow-inner shadow-red-500/20">
                <LogOut className="h-4 w-4" />
              </div>
              Cerrar sesión
            </span>
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
}
