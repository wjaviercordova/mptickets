"use client";

import { motion } from "framer-motion";
import { DollarSign, Receipt, Clock } from "lucide-react";

interface TotalAPagarCardProps {
  total: number;
  tiempoTranscurrido?: string;
}

export function TotalAPagarCard({ total, tiempoTranscurrido = "00:00:00" }: TotalAPagarCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card space-y-4 border border-emerald-500/20 bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/80 p-5 shadow-xl backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-4">
        <div className="rounded-xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/20 to-green-600/20 p-2.5">
          <Receipt className="h-5 w-5 text-emerald-400" />
        </div>
        <h3 className="font-heading text-lg text-white">Total a Pagar</h3>
      </div>

      {/* Display del Total - Estilo Caja Registradora */}
      <div
        className="relative overflow-hidden rounded-2xl border border-emerald-400/30 p-8 shadow-lg"
        style={{
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)",
        }}
      >
        {/* Ícono $ como Marca de Agua */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-48 w-48 opacity-5">
          <DollarSign className="h-full w-full" strokeWidth={1.5} />
        </div>

        {/* Número del Total */}
        <div className="relative z-10 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-emerald-300/70">
            Monto Total
          </p>
          <motion.p
            key={total}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="font-mono text-6xl font-bold tracking-tight text-white drop-shadow-lg"
          >
            ${total.toFixed(2)}
          </motion.p>
          
          {/* Tiempo Transcurrido */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <Clock className="h-5 w-5 text-emerald-300" />
            <p className="font-mono text-lg text-emerald-200">
              Tiempo: {tiempoTranscurrido}
            </p>
          </div>
          
          {/* Línea decorativa */}
          <div className="mx-auto mt-4 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
        </div>

        {/* Brillo decorativo */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent" />
      </div>

      {/* Información Adicional */}
      <div className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3">
        <DollarSign className="h-4 w-4 text-emerald-400" />
        <p className="text-sm text-emerald-200/80">
          {total === 0 ? "Selecciona una tarjeta para calcular" : "Total calculado con tarifas vigentes"}
        </p>
      </div>
    </motion.div>
  );
}
