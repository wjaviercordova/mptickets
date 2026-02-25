"use client";

import { motion } from "framer-motion";
import { Car, Calendar, Clock, CreditCard, AlertCircle } from "lucide-react";
import type { InformacionVehicular } from "@/types/pago";

interface InformacionVehicularCardProps {
  informacion: InformacionVehicular | null;
}

export function InformacionVehicularCard({ informacion }: InformacionVehicularCardProps) {
  if (!informacion) {
    return (
      <div className="glass-card flex min-h-[350px] flex-col items-center justify-center gap-4 border border-blue-500/20 bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/80 p-8 shadow-xl backdrop-blur-xl">
        <AlertCircle className="h-16 w-16 text-blue-500/40" />
        <div className="text-center">
          <h3 className="mb-2 font-heading text-lg text-white">Sin Información</h3>
          <p className="text-sm text-blue-200/60">
            Selecciona una tarjeta para ver la información vehicular
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card space-y-5 border border-blue-500/20 bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/80 p-5 shadow-xl backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-blue-500/20 pb-4">
        <div className="rounded-xl border border-blue-400/40 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 p-2.5">
          <Car className="h-5 w-5 text-blue-400" />
        </div>
        <h3 className="font-heading text-lg text-white">Información Vehicular</h3>
      </div>

      {/* Grid de Información */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Tipo de Vehículo */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-cyan-400" />
            <p className="text-xs font-medium uppercase tracking-wider text-cyan-300/70">
              Tipo de Vehículo
            </p>
          </div>
          <p className="font-heading text-lg text-white pl-6">
            {informacion.tipoVehiculo}
          </p>
        </div>

        {/* Placa */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-blue-400" />
            <p className="text-xs font-medium uppercase tracking-wider text-blue-300/70">
              Placa
            </p>
          </div>
          <p className="font-mono text-lg text-white pl-6">
            {informacion.placa || "N/A"}
          </p>
        </div>

        {/* Fecha Entrada */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-violet-400" />
            <p className="text-xs font-medium uppercase tracking-wider text-violet-300/70">
              Fecha Entrada
            </p>
          </div>
          <p className="text-base text-white pl-6">
            {informacion.fechaEntrada}
          </p>
        </div>

        {/* Hora Entrada */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-400" />
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-300/70">
              Hora Entrada
            </p>
          </div>
          <p className="font-mono text-base text-white pl-6">
            {informacion.horaEntrada}
          </p>
        </div>
      </div>

      {/* Información Adicional (opcional) */}
      {(informacion.color || informacion.marca || informacion.modelo) && (
        <div className="border-t border-blue-500/10 pt-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-blue-300/50">
            Detalles Adicionales
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {informacion.color && (
              <div className="rounded-lg border border-blue-500/20 bg-blue-950/20 p-3">
                <p className="mb-1 text-xs text-blue-300/60">Color</p>
                <p className="text-sm font-medium text-white">{informacion.color}</p>
              </div>
            )}
            {informacion.marca && (
              <div className="rounded-lg border border-blue-500/20 bg-blue-950/20 p-3">
                <p className="mb-1 text-xs text-blue-300/60">Marca</p>
                <p className="text-sm font-medium text-white">{informacion.marca}</p>
              </div>
            )}
            {informacion.modelo && (
              <div className="rounded-lg border border-blue-500/20 bg-blue-950/20 p-3">
                <p className="mb-1 text-xs text-blue-300/60">Modelo</p>
                <p className="text-sm font-medium text-white">{informacion.modelo}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
