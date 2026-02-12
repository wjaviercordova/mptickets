"use client";

import { motion } from "framer-motion";
import { ParkingCircle } from "lucide-react";

interface DashboardHeaderProps {
  negocioNombre: string;
  warningMessage: string | null;
}

export function DashboardHeader({
  negocioNombre,
  warningMessage,
}: DashboardHeaderProps) {
  return (
    <>
      {warningMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card border border-amber-400/40 bg-gradient-to-r from-amber-500/25 to-yellow-600/15 p-4 text-sm font-medium text-amber-100 shadow-lg shadow-amber-500/15 backdrop-blur-xl"
        >
          {warningMessage}
        </motion.div>
      )}

      <div className="glass-card border border-blue-500/20 bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/80 p-6 shadow-xl shadow-blue-500/5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-blue-500/30 to-cyan-600/20 shadow-lg shadow-cyan-500/20"
          >
            <ParkingCircle className="h-7 w-7 text-cyan-400" />
          </motion.div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300/70">
              Centro de control
            </p>
            <h2 className="font-display text-2xl text-white">
              {negocioNombre
                ? `Bienvenido, ${negocioNombre}`
                : "Bienvenido al panel comercial"}
            </h2>
            <p className="text-sm font-medium text-blue-200/70">
              Monitorea ingresos, movimientos y alertas en tiempo real.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
