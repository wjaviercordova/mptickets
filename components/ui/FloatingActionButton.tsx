"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface FloatingActionButtonProps {
  href: string;
  icon: LucideIcon;
  label: string;
  variant?: "ingreso" | "pago";
}

/**
 * Botón de Acción Flotante (FAB) con Glassmorphism
 * Sigue el estándar Material Design con diseño adaptativo glassmorphism
 * 
 * @param href - Ruta de destino
 * @param icon - Icono de Lucide React
 * @param label - Texto descriptivo para tooltip
 * @param variant - Variante de color: "ingreso" (cyan) o "pago" (emerald)
 */
export function FloatingActionButton({
  href,
  icon: Icon,
  label,
  variant = "ingreso",
}: FloatingActionButtonProps) {
  // Estilos según variante
  const variantStyles = {
    ingreso: {
      // Cyan/Blue para acceso a Ingreso Vehicular (igual que botones save/select)
      borderLight: "rgba(34, 211, 238, 0.7)", // cyan-400/70
      borderDark: "rgba(34, 211, 238, 0.25)", // cyan-400/25
      gradient: "from-cyan-500/20 to-blue-600/20",
      hoverGradient: "hover:from-cyan-500/40 hover:to-blue-600/40",
      shadow: "shadow-cyan-500/30",
      glowColor: "rgba(34, 211, 238, 0.3)",
      textColor: "text-cyan-100",
    },
    pago: {
      // Emerald/Green para acceso a Pago y Salida (igual que botones success)
      borderLight: "rgba(52, 211, 153, 0.7)", // emerald-400/70
      borderDark: "rgba(52, 211, 153, 0.25)", // emerald-400/25
      gradient: "from-emerald-500/20 to-green-600/20",
      hoverGradient: "hover:from-emerald-500/40 hover:to-green-600/40",
      shadow: "shadow-emerald-500/20",
      glowColor: "rgba(16, 185, 129, 0.3)",
      textColor: "text-emerald-100",
    },
  };

  const styles = variantStyles[variant];

  return (
    <>
      {/* Estilos de animación de pulse */}
      <style jsx>{`
        @keyframes soft-pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.05);
          }
        }

        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 
              0 0 0 1px rgba(255, 255, 255, 0.05) inset,
              0 8px 16px -4px rgba(0, 0, 0, 0.4),
              0 0 20px ${styles.glowColor};
          }
          50% {
            box-shadow: 
              0 0 0 1px rgba(255, 255, 255, 0.08) inset,
              0 12px 24px -6px rgba(0, 0, 0, 0.5),
              0 0 40px ${styles.glowColor},
              0 0 60px ${styles.glowColor};
          }
        }

        @keyframes border-fade {
          0%, 100% {
            border-color: ${styles.borderDark};
          }
          50% {
            border-color: ${styles.borderLight};
          }
        }

        .fab-pulse {
          animation: soft-pulse 3s ease-in-out infinite;
        }

        .fab-glow {
          animation: glow-pulse 3s ease-in-out infinite;
        }

        .fab-border {
          animation: border-fade 3.5s ease-in-out infinite;
          border-width: 3px;
          border-style: solid;
        }
      `}</style>

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.5,
        }}
        className="fixed bottom-8 right-8 z-50"
      >
        <Link href={href} className="group relative block">
          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            whileHover={{ opacity: 1, x: 0 }}
            className="absolute right-full top-1/2 mr-4 -translate-y-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-[#1e293b]/95 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-2xl opacity-0 shadow-2xl transition-all duration-300 group-hover:opacity-100"
            style={{
              boxShadow: `
                0 0 0 1px rgba(255, 255, 255, 0.05) inset,
                0 8px 24px -4px rgba(0, 0, 0, 0.6)
              `
            }}
          >
            {label}
            {/* Flecha del tooltip */}
            <div className="absolute right-0 top-1/2 h-0 w-0 -translate-y-1/2 translate-x-full border-8 border-transparent border-l-[#1e293b]/95"></div>
          </motion.div>

          {/* Botón FAB */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`
              fab-pulse fab-glow fab-border
              relative flex h-16 w-16 items-center justify-center 
              rounded-full
              bg-gradient-to-br ${styles.gradient}
              ${styles.hoverGradient}
              backdrop-blur-2xl
              transition-all duration-300
              ${styles.shadow}
              hover:shadow-2xl hover:${styles.shadow}
              ${styles.textColor}
              before:absolute before:inset-0 before:rounded-full
              before:bg-gradient-to-br before:from-white/5 before:to-transparent
              before:backdrop-blur-2xl
            `}
            style={{
              boxShadow: `
                0 0 0 1px rgba(255, 255, 255, 0.05) inset,
                0 8px 16px -4px rgba(0, 0, 0, 0.4),
                0 0 20px ${styles.glowColor}
              `
            }}
            aria-label={label}
          >
            <Icon className="relative z-10 h-7 w-7" strokeWidth={2.5} />
          </motion.button>
        </Link>
      </motion.div>
    </>
  );
}
