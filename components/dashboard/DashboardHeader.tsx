"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { DigitalClock } from "./DigitalClock";
import type { ThemeConfig } from "@/lib/theme-config";

interface DashboardHeaderProps {
  negocioNombre: string;
  usuarioNombre: string;
  warningMessage: string | null;
  themeConfig: ThemeConfig;
}

export function DashboardHeader({
  negocioNombre,
  usuarioNombre,
  warningMessage,
  themeConfig,
}: DashboardHeaderProps) {
  const useCustomBackground = themeConfig.useDashboardBackground;
  
  // Estilo base del contenedor
  const containerBaseClasses = "glass-card border border-blue-500/20 p-6 shadow-xl shadow-blue-500/5 backdrop-blur-xl";
  
  // Estilo condicional: imagen de fondo o gradiente del tema
  const containerStyle = useCustomBackground
    ? {
        backgroundImage: "url('/images/backgrounds/bg_dashboard.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : {
        background: "linear-gradient(to bottom right, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))",
      };

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

      <div 
        className={containerBaseClasses}
        style={containerStyle}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/40 px-2 py-1 backdrop-blur-sm shadow-lg shadow-emerald-500/20 w-fit">
              <Star className="h-3 w-3 text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-300">
                Versión Demo
              </span>
            </div>
            <div>
              <h2 className="font-display text-2xl text-white">
                ¡Hola, {usuarioNombre}! 👋
              </h2>
              <p className="text-sm font-medium text-blue-200/80">
                Gestiona tu parqueadero - {negocioNombre}
              </p>
            </div>
          </div>

          <div className="p-4">
            <DigitalClock />
          </div>
        </div>
      </div>
    </>
  );
}
