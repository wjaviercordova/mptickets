"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Printer, RefreshCw, FileText, Settings2, CheckCircle2 } from "lucide-react";
import { motionButtonProps } from "@/lib/button-styles";
import { useImpresionConfig } from "@/contexts/ImpresionConfigContext";

interface ConfigImpresion {
  habilitada: boolean;
  cola_impresion: string;
  nombre_impresora: string;
  ancho_papel: number; // en mm (ej: 58, 80)
  tipo_formato: "basico" | "detallado";
  imprimir_logo: boolean;
  imprimir_en_ingreso: boolean;
  imprimir_en_pago: boolean;
  copias_por_ticket: number;
}

interface ImpresionTabProps {
  configActual: ConfigImpresion;
  onSave: (config: ConfigImpresion) => Promise<void>;
}

const configImpresionDefault: ConfigImpresion = {
  habilitada: true,
  cola_impresion: "",
  nombre_impresora: "",
  ancho_papel: 80,
  tipo_formato: "basico",
  imprimir_logo: true,
  imprimir_en_ingreso: true,
  imprimir_en_pago: true,
  copias_por_ticket: 1,
};

export function ImpresionTab({ configActual, onSave }: ImpresionTabProps) {
  const [config, setConfig] = useState<ConfigImpresion>(configActual || configImpresionDefault);
  const [loading, setLoading] = useState(false);
  const [imprimiendo, setImprimiendo] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const { refrescar } = useImpresionConfig();

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await onSave(config);
      
      // Refrescar el Context para que todos los componentes tengan la config actualizada
      await refrescar();
      
      setMessage({
        type: "success",
        text: "✅ Configuración de impresión guardada exitosamente",
      });
      setTimeout(() => setMessage(null), 5000);
    } catch {
      setMessage({
        type: "error",
        text: "Error al guardar la configuración",
      });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleImprimirPrueba = async () => {
    if (!config.cola_impresion && !config.nombre_impresora) {
      setMessage({
        type: "error",
        text: "⚠️ Debes configurar la impresora primero",
      });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    setImprimiendo(true);
    setMessage(null);
    
    try {
      // Usar el servicio local en puerto 3003 (igual que las impresiones reales)
      const response = await fetch("http://localhost:3003/imprimir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "ENTRADA",
          datos: {
            nombre_negocio: "PRUEBA - PARQUEADERO",
            direccion: "Dirección de prueba",
            telefono: "099-9999-999",
            fecha_ingreso: new Date().toLocaleDateString('es-EC'),
            hora_ingreso: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
            numero_tarjeta: "TEST-001",
            dia: new Intl.DateTimeFormat('es-EC', { weekday: 'long' }).format(new Date()),
            horario: "9:00-19:00",
            tarifa_vehiculo: "$1.00",
            tipo_vehiculo: "AUTO"
          },
          config: {
            cola_impresion: config.cola_impresion,
            copias_por_ticket: config.copias_por_ticket || 1
          }
        }),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: "✅ Ticket de prueba enviado a imprimir",
        });
      } else {
        const data = await response.json();
        setMessage({
          type: "error",
          text: data.error || "Error al imprimir ticket de prueba",
        });
      }
      setTimeout(() => setMessage(null), 5000);
    } catch {
      setMessage({
        type: "error",
        text: "Error de conexión con el servidor de impresión",
      });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setImprimiendo(false);
    }
  };

  const handleRestore = () => {
    setConfig(configImpresionDefault);
    setMessage({
      type: "success",
      text: "Configuración restaurada a valores predeterminados",
    });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Printer className="h-6 w-6 text-purple-400" />
          <h3 className="font-heading text-2xl text-white">Configuración de Impresión</h3>
        </div>
        <p className="text-sm text-blue-200/70">
          Configura la impresora térmica para tickets de entrada y salida
        </p>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 rounded-2xl border p-4 backdrop-blur-xl ${
            message.type === "success"
              ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-200"
              : "border-red-400/40 bg-red-500/20 text-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <FileText className="h-5 w-5" />
          )}
          <span className="font-medium">{message.text}</span>
        </motion.div>
      )}

      {/* Toggle Principal - Habilitar Impresión */}
      <div className="glass-card border border-blue-500/20 bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/80 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-white mb-1">Imprimir Tickets</p>
            <p className="text-xs text-blue-200/70">
              Habilita la impresión automática de tickets en entrada y salida
            </p>
          </div>

          {/* Toggle Switch Estilo iOS */}
          <button
            onClick={() => setConfig({ ...config, habilitada: !config.habilitada })}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#0a0e27] ${
              config.habilitada
                ? "bg-gradient-to-r from-cyan-500 to-blue-600"
                : "bg-gray-600/50"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                config.habilitada ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Configuración de Impresora */}
      {config.habilitada && (
        <div className="space-y-6">
          {/* Datos de la Impresora */}
          <div className="glass-card border border-blue-500/20 bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/80 p-6 shadow-xl backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="h-5 w-5 text-cyan-400" />
              <h4 className="font-heading text-lg text-white">Datos de la Impresora</h4>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Nombre de la Impresora */}
              <div>
                <label className="mb-2 block text-sm font-medium text-blue-200">
                  Nombre de la Impresora
                </label>
                <input
                  type="text"
                  value={config.nombre_impresora}
                  onChange={(e) => setConfig({ ...config, nombre_impresora: e.target.value })}
                  placeholder="Ej: EPSON TM-T20"
                  className="w-full rounded-xl border border-blue-500/30 bg-[#0f172a]/40 px-4 py-3 text-white placeholder-blue-200/40 transition focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>

              {/* Cola de Impresión */}
              <div>
                <label className="mb-2 block text-sm font-medium text-blue-200">
                  Cola de Impresión / Puerto
                </label>
                <input
                  type="text"
                  value={config.cola_impresion}
                  onChange={(e) => setConfig({ ...config, cola_impresion: e.target.value })}
                  placeholder="Ej: COM3, /dev/usb/lp0"
                  className="w-full rounded-xl border border-blue-500/30 bg-[#0f172a]/40 px-4 py-3 text-white placeholder-blue-200/40 transition focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                />
                <p className="mt-1 text-xs text-blue-300/60">
                  Puerto USB o nombre de la cola de impresión configurada en el sistema
                </p>
              </div>

              {/* Ancho del Papel */}
              <div>
                <label className="mb-2 block text-sm font-medium text-blue-200">
                  Ancho del Papel (mm)
                </label>
                <select
                  value={config.ancho_papel}
                  onChange={(e) => setConfig({ ...config, ancho_papel: parseInt(e.target.value) })}
                  className="w-full rounded-xl border border-blue-500/30 bg-[#0f172a]/40 px-4 py-3 text-white transition focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                >
                  <option value="58">58mm (2 pulgadas)</option>
                  <option value="80">80mm (3 pulgadas)</option>
                </select>
              </div>

              {/* Tipo de Formato */}
              <div>
                <label className="mb-2 block text-sm font-medium text-blue-200">
                  Tipo de Formato
                </label>
                <select
                  value={config.tipo_formato}
                  onChange={(e) => setConfig({ ...config, tipo_formato: e.target.value as "basico" | "detallado" })}
                  className="w-full rounded-xl border border-blue-500/30 bg-[#0f172a]/40 px-4 py-3 text-white transition focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                >
                  <option value="basico">Básico</option>
                  <option value="detallado">Detallado</option>
                </select>
              </div>

              {/* Copias por Ticket */}
              <div>
                <label className="mb-2 block text-sm font-medium text-blue-200">
                  Copias por Ticket
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={config.copias_por_ticket}
                  onChange={(e) => setConfig({ ...config, copias_por_ticket: parseInt(e.target.value) || 1 })}
                  className="w-full rounded-xl border border-blue-500/30 bg-[#0f172a]/40 px-4 py-3 text-white transition focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>
            </div>
          </div>

          {/* Opciones de Impresión */}
          <div className="glass-card border border-blue-500/20 bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/80 p-6 shadow-xl backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-amber-400" />
              <h4 className="font-heading text-lg text-white">Opciones de Impresión</h4>
            </div>

            <div className="space-y-4">
              {/* Imprimir Logo */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#0f172a]/40 border border-blue-500/20">
                <div>
                  <p className="text-sm font-medium text-white">Imprimir Logo</p>
                  <p className="text-xs text-blue-200/60">Incluye el logo del negocio en los tickets</p>
                </div>
                <button
                  onClick={() => setConfig({ ...config, imprimir_logo: !config.imprimir_logo })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    config.imprimir_logo
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600"
                      : "bg-gray-600/50"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                      config.imprimir_logo ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Imprimir en Ingreso */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#0f172a]/40 border border-blue-500/20">
                <div>
                  <p className="text-sm font-medium text-white">Imprimir en Ingreso</p>
                  <p className="text-xs text-blue-200/60">Imprime ticket automáticamente al registrar entrada</p>
                </div>
                <button
                  onClick={() => setConfig({ ...config, imprimir_en_ingreso: !config.imprimir_en_ingreso })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    config.imprimir_en_ingreso
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600"
                      : "bg-gray-600/50"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                      config.imprimir_en_ingreso ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Imprimir en Pago */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#0f172a]/40 border border-blue-500/20">
                <div>
                  <p className="text-sm font-medium text-white">Imprimir en Pago</p>
                  <p className="text-xs text-blue-200/60">Imprime recibo automáticamente al procesar pago</p>
                </div>
                <button
                  onClick={() => setConfig({ ...config, imprimir_en_pago: !config.imprimir_en_pago })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    config.imprimir_en_pago
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600"
                      : "bg-gray-600/50"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                      config.imprimir_en_pago ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-wrap gap-4">
            <motion.button
              {...motionButtonProps}
              onClick={handleImprimirPrueba}
              disabled={imprimiendo}
              className="glass-button flex items-center justify-center gap-2 rounded-xl border border-purple-400/40 bg-gradient-to-r from-purple-500/30 to-pink-600/30 px-6 py-3 font-semibold text-white backdrop-blur-xl transition hover:from-purple-500/50 hover:to-pink-600/50 hover:shadow-xl hover:shadow-purple-500/30 disabled:opacity-50"
            >
              <Printer className="h-5 w-5" />
              {imprimiendo ? "Imprimiendo..." : "Imprimir Prueba"}
            </motion.button>

            <motion.button
              {...motionButtonProps}
              onClick={handleRestore}
              className="glass-button flex items-center justify-center gap-2 rounded-xl border border-gray-400/40 bg-gradient-to-r from-gray-500/20 to-gray-600/20 px-6 py-3 font-semibold text-white backdrop-blur-xl transition hover:from-gray-500/30 hover:to-gray-600/30"
            >
              <RefreshCw className="h-5 w-5" />
              Restaurar Valores
            </motion.button>

            <motion.button
              {...motionButtonProps}
              onClick={handleSave}
              disabled={loading}
              className="glass-button flex flex-1 items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 px-6 py-3 font-semibold text-white backdrop-blur-xl transition hover:from-cyan-500/50 hover:to-blue-600/50 hover:shadow-xl hover:shadow-cyan-500/30 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {loading ? "Guardando..." : "Guardar Configuración"}
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
