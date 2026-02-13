"use client";

import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Building2,
  Car,
  CreditCard,
  Home,
  LogOut,
  Settings,
  Shield,
  Users,
} from "lucide-react";

const navItems = [
  { label: "Inicio", icon: Home },
  { label: "Tickets", icon: CreditCard },
  { label: "Vehículos", icon: Car },
  { label: "Clientes", icon: Users },
  { label: "Reportes", icon: BarChart3 },
  { label: "Seguridad", icon: Shield },
  { label: "Actividad", icon: Activity },
  { label: "Configuración", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  negocioNombre: string;
}

export function Sidebar({ isOpen, onClose, negocioNombre }: SidebarProps) {
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

        <nav className="mt-8 space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2, x: 4 }}
                whileTap={{ scale: 0.98 }}
                key={item.label}
                className="group flex w-full items-center gap-3 rounded-2xl border border-blue-500/20 bg-[#1e293b]/40 px-4 py-3 text-sm font-medium text-blue-100/80 backdrop-blur-sm transition hover:border-cyan-400/50 hover:bg-gradient-to-r hover:from-blue-500/30 hover:to-cyan-500/20 hover:text-white hover:shadow-lg hover:shadow-cyan-500/20"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-950/30 transition group-hover:border-cyan-400/40 group-hover:bg-cyan-500/20 group-hover:shadow-lg group-hover:shadow-cyan-400/30">
                  <Icon className="h-4 w-4 text-cyan-400 transition group-hover:text-cyan-300" />
                </div>
                {item.label}
              </motion.button>
            );
          })}
        </nav>

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
