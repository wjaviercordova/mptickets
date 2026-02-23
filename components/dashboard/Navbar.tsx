"use client";

import { motion } from "framer-motion";
import { Menu, ParkingCircle, Search, Star } from "lucide-react";
import { usePageHeader } from "@/contexts/PageHeaderContext";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { headerInfo } = usePageHeader();
  return (
    <div className="sticky top-0 z-30 border-b border-blue-500/20 bg-[#0f172a]/80 backdrop-blur-xl shadow-lg shadow-blue-500/5">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onToggleSidebar}
            className="rounded-xl border border-blue-500/30 bg-blue-950/30 p-2.5 text-blue-200 backdrop-blur-sm transition hover:border-blue-400/60 hover:bg-blue-900/40 hover:text-white hover:shadow-lg hover:shadow-blue-500/20"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </motion.button>
          <div className="flex items-center gap-3">
            {headerInfo ? (
              // Mostrar información del módulo actual
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 shadow-lg shadow-cyan-500/30"
                >
                  <headerInfo.icon className="h-5 w-5 text-cyan-400" />
                </motion.div>
                <div>
                  <h1 className="font-heading text-lg text-white">{headerInfo.title}</h1>
                  <p className="text-xs text-blue-200/70">{headerInfo.subtitle}</p>
                </div>
              </>
            ) : (
              // Mostrar navbar por defecto (página de inicio)
              <>
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-blue-500/40 to-cyan-500/30 shadow-lg shadow-cyan-500/30"
                >
                  <ParkingCircle className="h-5 w-5 text-blue-300" />
                </motion.div>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">
                      MP Tickets
                    </p>
                    <h1 className="font-heading text-white">Dashboard</h1>
                  </div>
                  <div className="flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/40 px-2 py-1 backdrop-blur-sm shadow-lg shadow-emerald-500/20">
                    <Star className="h-3 w-3 text-emerald-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                      DEMO
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="hidden items-center gap-3 rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-2.5 text-blue-100/80 backdrop-blur-xl shadow-lg md:flex"
        >
          <Search className="h-4 w-4 text-white/60" />
          <input
            type="text"
            placeholder="Buscar vehículos, tickets, pagos..."
            className="w-64 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
          />
        </motion.div>
      </div>
    </div>
  );
}
