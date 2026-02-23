"use client";

import { motion } from "framer-motion";
import { Clock, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import type { UltimoIngreso } from "@/types/ingreso";

interface IngresoResumenProps {
  ultimoIngreso: UltimoIngreso | null;
}

export function IngresoResumen({ ultimoIngreso }: IngresoResumenProps) {
  if (!ultimoIngreso) {
    return (
      <div className="glass-card flex min-h-[400px] flex-col items-center justify-center gap-4 border border-blue-500/20 bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/80 p-8 shadow-xl backdrop-blur-xl">
        <AlertCircle className="h-16 w-16 text-blue-500/40" />
        <div className="text-center">
          <h3 className="mb-2 font-heading text-lg text-white">Sin Ingresos Recientes</h3>
          <p className="text-sm text-blue-200/60">
            Registra el primer ingreso para ver el resumen aquí
          </p>
        </div>
      </div>
    );
  }

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return new Intl.DateTimeFormat("es-EC", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const estadoInfo = {
    "0": { label: "Ingresado", color: "emerald", icon: CheckCircle2 },
    "1": { label: "Activo", color: "cyan", icon: CheckCircle2 },
  };

  const info = estadoInfo[ultimoIngreso.estado as "0" | "1"] || estadoInfo["0"];
  const IconoEstado = info.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card space-y-4 border border-blue-500/20 bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/80 p-5 shadow-xl backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg text-white">Último Ingreso</h3>
        <div
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 ${
            info.color === "emerald"
              ? "border-emerald-400/40 bg-emerald-950/40"
              : "border-cyan-400/40 bg-cyan-950/40"
          }`}
        >
          <IconoEstado
            className={`h-3.5 w-3.5 ${
              info.color === "emerald" ? "text-emerald-400" : "text-cyan-400"
            }`}
          />
          <span
            className={`text-xs font-semibold ${
              info.color === "emerald" ? "text-emerald-300" : "text-cyan-300"
            }`}
          >
            {info.label}
          </span>
        </div>
      </div>

      {/* Tarjeta Visual */}
      <div
        className="relative overflow-hidden rounded-2xl border border-cyan-400/30 p-5 shadow-lg"
        style={{
          background: "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
        }}
      >
        <div className="absolute right-0 top-0 h-32 w-32 opacity-10">
          <CreditCard className="h-full w-full rotate-12" />
        </div>

        <div className="relative space-y-3">
          {/* Número de Tarjeta */}
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-cyan-300/70">
              Número de Tarjeta
            </p>
            <p className="font-mono text-2xl font-bold tracking-wider text-white">
              {ultimoIngreso.numeroTarjeta}
            </p>
          </div>

          {/* Hora Entrada */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-300" />
            <div>
              <p className="text-xs text-blue-200/70">Hora de Entrada</p>
              <p className="font-semibold text-white">
                {formatearFecha(ultimoIngreso.horaEntrada)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
