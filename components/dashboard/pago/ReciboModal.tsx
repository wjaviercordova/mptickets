"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Printer, Receipt, Loader2 } from "lucide-react";
import type { DatosRecibo } from "@/types/pago";
import { useImpresionConfig } from "@/contexts/ImpresionConfigContext";

interface ReciboModalProps {
  datos: DatosRecibo;
  onCerrar: () => void;
}

export function ReciboModal({ datos, onCerrar }: ReciboModalProps) {
  const [imprimiendo, setImprimiendo] = useState(false);
  const [mensaje, setMensaje] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const { configImpresion } = useImpresionConfig();

  const handleImprimir = async () => {
    setImprimiendo(true);
    setMensaje(null);

    try {
      if (!configImpresion) {
        throw new Error("No se pudo obtener la configuración de impresión");
      }

      // Preparar datos para el servidor de impresión
      const datosImpresion = {
        tipo: "PAGO",
        datos: {
          nombre_negocio: datos.nombreNegocio,
          direccion: datos.direccion,
          telefono: datos.telefono,
          fecha: datos.fecha,
          hora_entrada: datos.horaEntrada,
          hora_salida: datos.horaSalida,
          numero_tarjeta: datos.numeroTarjeta,
          total: datos.costoTotal,
        },
        config: {
          cola_impresion: configImpresion.cola_impresion || "_3nStar",
          copias_por_ticket: configImpresion.copias_por_ticket || 1,
        },
      };

      console.log("🖨️ [RECIBO] Enviando datos a imprimir:", datosImpresion);

      // Enviar a imprimir
      const response = await fetch("http://localhost:3003/imprimir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosImpresion),
      });

      if (response.ok) {
        setMensaje({
          type: "success",
          text: "✅ Recibo enviado a imprimir",
        });
        setTimeout(() => setMensaje(null), 3000);
      } else {
        const data = await response.json();
        throw new Error(data.error || "Error al imprimir");
      }
    } catch (error) {
      console.error("Error al imprimir:", error);
      setMensaje({
        type: "error",
        text: `❌ Error: ${error instanceof Error ? error.message : "No se pudo imprimir"}`,
      });
      setTimeout(() => setMensaje(null), 5000);
    } finally {
      setImprimiendo(false);
    }
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
          className="glass-card w-full max-w-md overflow-hidden border border-blue-500/30 bg-gradient-to-br from-[#1e293b]/95 to-[#0f172a]/95 shadow-2xl backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-blue-500/20 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-blue-400/40 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 p-2.5">
                <Receipt className="h-5 w-5 text-blue-400" />
              </div>
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
              className="mx-auto w-full max-w-[320px] rounded-lg border border-gray-600/30 bg-white p-6 font-mono text-sm text-gray-900"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              {/* ==================== ENCABEZADO ==================== */}
              <div className="pb-3 text-center">
                <p className="text-base font-bold">{datos.nombreNegocio}</p>
                <p className="text-xs">{datos.direccion}</p>
                <p className="text-xs">Tel: {datos.telefono}</p>
              </div>

              {/* Línea separadora */}
              <div className="border-t-2 border-dashed border-gray-400 my-2"></div>

              {/* ==================== TÍTULO ==================== */}
              <div className="py-2 text-center">
                <p className="text-sm font-bold">RECIBO DE PAGO</p>
              </div>

              {/* ==================== CONTENIDO ==================== */}
              <div className="space-y-1 py-2 text-xs">
                <div className="flex justify-between">
                  <span>Fecha:</span>
                  <span>{datos.fecha}</span>
                </div>

                <div className="flex justify-between">
                  <span>Entrada:</span>
                  <span>{datos.horaEntrada}</span>
                </div>

                <div className="flex justify-between">
                  <span>Salida:</span>
                  <span>{datos.horaSalida}</span>
                </div>

                <div className="flex justify-between pt-1">
                  <span>Tarjeta:</span>
                  <span className="font-bold">{datos.numeroTarjeta}</span>
                </div>

                <div className="flex justify-between items-baseline pt-2 text-sm font-bold">
                  <span>Total:</span>
                  <span className="text-right">${datos.costoTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Línea separadora */}
              <div className="border-t-2 border-gray-400 my-2"></div>

              {/* ==================== PIE DE PÁGINA ==================== */}
              <div className="pt-2 text-center text-xs space-y-1">
                <p>Recibo No valido como factura</p>
                <p>Gracias su preferencia</p>
              </div>
            </div>

            {/* Mensaje de estado */}
            {mensaje && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-4 rounded-lg p-3 text-sm text-center ${
                  mensaje.type === "success"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-red-500/20 text-red-300 border border-red-500/30"
                }`}
              >
                {mensaje.text}
              </motion.div>
            )}

            {/* Botones */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleImprimir}
                disabled={imprimiendo}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-400/40 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 px-4 py-3 font-semibold text-blue-300 backdrop-blur-xl transition hover:from-blue-500/30 hover:to-cyan-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {imprimiendo ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Printer className="h-5 w-5" />
                )}
                {imprimiendo ? "Imprimiendo..." : "Imprimir"}
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
