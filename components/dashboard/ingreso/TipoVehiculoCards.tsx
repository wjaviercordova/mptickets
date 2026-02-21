"use client";

import { motion } from "framer-motion";
import { Car, Bike, Truck, Bus, CircleDot } from "lucide-react";
import type { Parametro } from "@/types/ingreso";

interface TipoVehiculoCardsProps {
  parametros: Parametro[];
  seleccionado: Parametro | null;
  onSeleccionar: (parametro: Parametro) => void;
}

// Mapeo de iconos según tipo de vehículo
const getIcono = (tipoVehiculo: string) => {
  const tipo = tipoVehiculo.toLowerCase();
  if (tipo.includes("auto") || tipo.includes("carro") || tipo.includes("liviano")) {
    return Car;
  }
  if (tipo.includes("moto") || tipo.includes("bici")) {
    return Bike;
  }
  if (tipo.includes("camion") || tipo.includes("camioneta")) {
    return Truck;
  }
  if (tipo.includes("bus")) {
    return Bus;
  }
  return CircleDot;
};

export function TipoVehiculoCards({
  parametros,
  seleccionado,
  onSeleccionar,
}: TipoVehiculoCardsProps) {
  if (parametros.length === 0) {
    return (
      <div className="glass-card border border-blue-500/20 bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/80 p-6 text-center backdrop-blur-xl">
        <p className="text-blue-200/70">No hay tipos de vehículo configurados</p>
      </div>
    );
  }

  return (
    <div className="glass-card space-y-4 border border-blue-500/20 bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/80 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg text-white">Tipo de Vehículo</h3>
        {seleccionado && (
          <div className="rounded-full border border-emerald-400/40 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-300">
            Seleccionado
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {parametros.map((parametro) => {
          const Icono = getIcono(parametro.tipo_vehiculo);
          const isSeleccionado = seleccionado?.id === parametro.id;
          const isPrioridad = parametro.prioridad === 1;

          return (
            <motion.button
              key={parametro.id}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSeleccionar(parametro)}
              className={`group relative overflow-hidden rounded-2xl border p-4 text-center transition ${
                isSeleccionado
                  ? "border-cyan-400/60 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 shadow-lg shadow-cyan-500/30"
                  : "border-blue-500/30 bg-gradient-to-br from-[#1e293b]/40 to-[#0f172a]/60 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/10"
              }`}
            >
              {/* Badge Prioridad */}
              {isPrioridad && !isSeleccionado && (
                <div className="absolute right-2 top-2 rounded-full border border-yellow-400/40 bg-yellow-950/40 px-2 py-0.5 text-[10px] font-bold text-yellow-300">
                  ★
                </div>
              )}

              {/* Icono */}
              <div
                className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl border transition ${
                  isSeleccionado
                    ? "border-cyan-400/50 bg-cyan-500/20"
                    : "border-blue-500/30 bg-blue-950/30 group-hover:border-cyan-400/40 group-hover:bg-cyan-500/10"
                }`}
              >
                <Icono
                  className={`h-7 w-7 transition ${
                    isSeleccionado ? "text-cyan-300" : "text-blue-300 group-hover:text-cyan-400"
                  }`}
                />
              </div>

              {/* Nombre */}
              <div>
                <p
                  className={`mb-1 text-sm font-bold transition ${
                    isSeleccionado ? "text-white" : "text-blue-100 group-hover:text-white"
                  }`}
                >
                  {parametro.nombre}
                </p>
                <p
                  className={`text-xs transition ${
                    isSeleccionado
                      ? "text-cyan-200/80"
                      : "text-blue-200/60 group-hover:text-cyan-200/70"
                  }`}
                >
                  {parametro.tipo_vehiculo}
                </p>
              </div>

              {/* Tarifa */}
              <div className="mt-3 border-t border-blue-500/20 pt-2">
                <p className="text-[10px] text-blue-200/60">Primera hora</p>
                <p
                  className={`font-semibold ${
                    isSeleccionado ? "text-cyan-300" : "text-blue-300"
                  }`}
                >
                  ${Number(parametro.tarifa_1_valor).toFixed(2)}
                </p>
              </div>

              {/* Indicador de Selección */}
              {isSeleccionado && (
                <motion.div
                  layoutId="seleccion-tipo-vehiculo"
                  className="absolute inset-0 rounded-2xl border-2 border-cyan-400/60"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {parametros.length === 0 && (
        <p className="py-8 text-center text-sm text-blue-200/60">
          No hay tipos de vehículo disponibles
        </p>
      )}
    </div>
  );
}
