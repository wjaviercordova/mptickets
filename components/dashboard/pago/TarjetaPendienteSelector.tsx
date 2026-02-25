"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Loader2, Clock } from "lucide-react";
import type { TarjetaPendiente } from "@/types/pago";

interface TarjetaPendienteSelectorProps {
  negocioId: string;
  onSeleccionar: (tarjeta: TarjetaPendiente) => void;
  onCerrar: () => void;
}

export function TarjetaPendienteSelector({
  negocioId,
  onSeleccionar,
  onCerrar,
}: TarjetaPendienteSelectorProps) {
  const [tarjetas, setTarjetas] = useState<TarjetaPendiente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTarjetasPendientes = async () => {
      try {
        const response = await fetch(`/api/tarjetas/pendientes?negocio_id=${negocioId}`);
        const data = await response.json();
        setTarjetas(data.tarjetas || []);
      } catch (error) {
        console.error("Error al cargar tarjetas pendientes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTarjetasPendientes();
  }, [negocioId]);

  const formatearHora = (fecha: string) => {
    const date = new Date(fecha);
    return new Intl.DateTimeFormat("es-EC", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onCerrar}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card w-full max-w-5xl max-h-[80vh] overflow-hidden border border-amber-500/30 bg-gradient-to-br from-[#1e293b]/95 to-[#0f172a]/95 shadow-2xl backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-amber-500/20 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-500/20 to-orange-600/20 p-2.5">
                <CreditCard className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h2 className="font-heading text-xl text-white">Tarjetas Pendientes</h2>
                <p className="text-sm text-amber-200/70">
                  Selecciona una tarjeta para procesar el pago
                </p>
              </div>
            </div>
            <button
              onClick={onCerrar}
              className="rounded-xl border border-red-500/30 bg-red-950/30 p-2 text-red-400 transition hover:bg-red-950/50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(80vh - 120px)" }}>
            {loading ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-amber-400" />
                <p className="text-amber-200/70">Cargando tarjetas pendientes...</p>
              </div>
            ) : tarjetas.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
                <CreditCard className="h-16 w-16 text-amber-500/30" />
                <p className="text-lg text-amber-200/70">No hay tarjetas pendientes</p>
                <p className="text-sm text-amber-200/50">
                  Todas las tarjetas han sido pagadas o están disponibles
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tarjetas.map((tarjeta) => (
                  <motion.button
                    key={tarjeta.id}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSeleccionar(tarjeta)}
                    className="group relative overflow-hidden rounded-2xl border border-amber-500/30 p-6 shadow-lg transition"
                    style={{
                      backgroundImage: "url('/images/backgrounds/bg_cardpending.jpg')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-orange-600/30 to-red-600/20 backdrop-blur-[2px] transition group-hover:from-amber-500/30 group-hover:via-orange-600/40 group-hover:to-red-600/30" />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <div className="rounded-full border-2 border-white/40 bg-white/10 p-3 backdrop-blur-sm">
                        <CreditCard className="h-7 w-7 text-white drop-shadow-lg" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium uppercase tracking-wider text-white/80">
                          Tarjeta Nº
                        </p>
                        <p className="font-heading text-2xl font-bold text-white drop-shadow-md">
                          {tarjeta.codigo}
                        </p>
                        {tarjeta.codigo_barras && (
                          <p className="text-[10px] font-mono text-white/60 mt-1">
                            {tarjeta.codigo_barras}
                          </p>
                        )}
                      </div>
                      
                      {/* Hora de Entrada */}
                      <div className="flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-1 backdrop-blur-sm">
                        <Clock className="h-3.5 w-3.5 text-white/80" />
                        <span className="text-xs font-medium text-white/90">
                          {formatearHora(tarjeta.hora_entrada)}
                        </span>
                      </div>

                      {/* Tipo de Vehículo */}
                      <div className="text-center">
                        <p className="text-xs font-medium text-white/70">{tarjeta.tipo_vehiculo}</p>
                      </div>
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
                      <div className="absolute inset-0 bg-gradient-to-t from-amber-500/30 to-transparent" />
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
