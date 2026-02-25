"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Printer } from "lucide-react";
import type { DatosRecibo } from "@/types/pago";

interface ReciboModalProps {
  datos: DatosRecibo;
  onCerrar: () => void;
}

export function ReciboModal({ datos, onCerrar }: ReciboModalProps) {
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
          className="glass-card w-full max-w-md overflow-hidden border border-blue-500/30 bg-gradient-to-br from-[#1e293b]/95 to-[#0f172a]/95 shadow-2xl backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-blue-500/20 p-4">
            <div className="flex items-center gap-3">
              <Printer className="h-5 w-5 text-blue-400" />
              <h2 className="font-heading text-lg text-white">Recibo de Pago</h2>
            </div>
            <button
              onClick={onCerrar}
              className="rounded-xl border border-red-500/30 bg-red-950/30 p-2 text-red-400 transition hover:bg-red-950/50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Recibo - Simulación de ticket térmico 80mm */}
          <div className="p-6">
            <div
              id="ticket-recibo"
              className="mx-auto w-full max-w-[300px] rounded-lg border border-gray-600/30 bg-white p-6 font-mono text-sm text-gray-900"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              {/* Header del Ticket */}
              <div className="border-b-2 border-dashed border-gray-400 pb-3 text-center">
                <h3 className="text-lg font-bold uppercase">MP Tickets</h3>
                <p className="text-xs">TICKET ESTACIONAMIENTO</p>
              </div>

              {/* Contenido del Ticket */}
              <div className="space-y-2 py-4 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold">FECHA:</span>
                  <span>{datos.fecha}</span>
                </div>

                <div className="border-t border-dashed border-gray-300 pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">HORA ENTRADA:</span>
                    <span>{datos.horaEntrada}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">HORA SALIDA:</span>
                    <span>{datos.horaSalida}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-300 pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">TARJETA:</span>
                    <span className="text-base font-bold">{datos.numeroTarjeta}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-300 pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">TIEMPO TOTAL:</span>
                    <span>{datos.tiempoTotal}</span>
                  </div>
                </div>

                {datos.descuento > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span className="font-semibold">DESCUENTO:</span>
                    <span>-${datos.descuento.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-dashed border-gray-300 pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">MÉTODO PAGO:</span>
                    <span>{datos.metodoPago}</span>
                  </div>
                </div>

                <div className="border-t-2 border-gray-400 pt-2">
                  <div className="flex justify-between text-base font-bold">
                    <span>COSTO TOTAL:</span>
                    <span>${datos.costoTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer del Ticket */}
              <div className="border-t-2 border-dashed border-gray-400 pt-3 text-center text-xs">
                <p>¡Gracias por su visita!</p>
                <p className="mt-1 text-[10px] text-gray-600">
                  {new Date().toLocaleString("es-EC")}
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-400/40 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 px-4 py-3 font-semibold text-blue-300 backdrop-blur-xl transition hover:from-blue-500/30 hover:to-cyan-600/30"
              >
                <Printer className="h-5 w-5" />
                Imprimir
              </button>
              <button
                onClick={onCerrar}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-400/40 bg-gradient-to-r from-gray-500/20 to-gray-600/20 px-4 py-3 font-semibold text-gray-300 backdrop-blur-xl transition hover:from-gray-500/30 hover:to-gray-600/30"
              >
                Cerrar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
