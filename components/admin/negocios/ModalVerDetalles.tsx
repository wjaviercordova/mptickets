"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Building2,
  Calendar,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
} from "lucide-react";
import type { NegocioExtended } from "@/types/admin";

interface ModalVerDetallesProps {
  negocio: NegocioExtended | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ModalVerDetalles({ negocio, isOpen, onClose }: ModalVerDetallesProps) {
  if (!negocio) return null;

  // Calcular estado real basado en tipo de licencia y días restantes
  const getEstadoReal = () => {
    if (negocio.plan === "demo") {
      // Usar el valor ya calculado dias_restantes
      const diasRestantes = negocio.dias_restantes || 0;
      return diasRestantes > 0 ? "activo" : "inactivo";
    }
    
    return negocio.estado; // Para PREMIUM usar el estado de BD
  };

  const estadoReal = getEstadoReal();
  const esDemo = negocio.plan === "demo";

  const handleEnviarRecordatorio = () => {
    // TODO: Implementar envío de recordatorio
    alert(
      `Funcionalidad pendiente:\n\nSe enviará recordatorio a:\n` +
      `Email: ${negocio.email}\n` +
      `Teléfono: ${negocio.telefono || "No especificado"}\n\n` +
      `Mensaje: Recordatorio de adquisición de licencia definitiva para ${negocio.nombre}`
    );
  };

  const getEstadoBadge = () => {
    const configs = {
      activo: {
        color: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
        icon: CheckCircle2,
        label: "Activo",
      },
      inactivo: {
        color: "bg-red-500/20 text-red-300 border-red-400/30",
        icon: XCircle,
        label: "Inactivo",
      },
      suspendido: {
        color: "bg-yellow-500/20 text-yellow-300 border-yellow-400/30",
        icon: AlertCircle,
        label: "Suspendido",
      },
    };

    const config = configs[estadoReal as keyof typeof configs] || configs.inactivo;
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 ${config.color}`}>
        <Icon className="h-5 w-5" />
        <span className="font-semibold">{config.label}</span>
      </div>
    );
  };

  const getPlanBadge = () => {
    const configs = {
      demo: {
        color: "bg-blue-500/20 text-blue-300 border-blue-400/30",
        label: "DEMO (30 días)",
      },
      premium: {
        color: "bg-purple-500/20 text-purple-300 border-purple-400/30",
        label: "PREMIUM",
      },
    };

    const config = configs[negocio.plan as keyof typeof configs] || configs.demo;

    return (
      <div className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 ${config.color}`}>
        <span className="font-semibold">{config.label}</span>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#1e293b]/95 to-[#0f172a]/95 p-8 backdrop-blur-xl shadow-2xl"
          >
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 to-blue-600/10">
                  <Building2 className="h-8 w-8 text-cyan-400" />
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-bold text-white">
                    {negocio.nombre}
                  </h2>
                  <p className="mt-1 font-caption text-sm text-blue-200/60">
                    Código: {negocio.codigo}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl border border-red-400/30 bg-red-500/10 p-2 text-red-300 transition hover:bg-red-500/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Estado y Plan */}
            <div className="mb-6 flex flex-wrap gap-3">
              {getEstadoBadge()}
              {getPlanBadge()}
            </div>

            {/* Información de Licencia */}
            <div className="mb-6 rounded-2xl border border-blue-500/20 bg-[#0f172a]/60 p-6">
              <h3 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-white">
                <Calendar className="h-5 w-5 text-cyan-400" />
                Información de Licencia
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-200/60">Tipo de Licencia:</span>
                  <span className="font-semibold text-white">
                    {negocio.plan.toUpperCase()}
                  </span>
                </div>

                {esDemo && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-blue-200/60">Días Restantes:</span>
                      <span className={`font-semibold ${
                        (negocio.dias_restantes || 0) > 7 
                          ? "text-emerald-300" 
                          : (negocio.dias_restantes || 0) > 0
                          ? "text-yellow-300"
                          : "text-red-300"
                      }`}>
                        {negocio.dias_restantes !== null 
                          ? `${negocio.dias_restantes} días` 
                          : "0 días"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-blue-200/60">Fecha de Caducidad:</span>
                      <span className="font-semibold text-white">
                        {negocio.fecha_expiracion
                          ? new Date(negocio.fecha_expiracion).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "No especificada"}
                      </span>
                    </div>

                    {(negocio.dias_restantes || 0) <= 0 && (
                      <div className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span>Esta licencia ha expirado. El negocio está inactivo.</span>
                      </div>
                    )}
                  </>
                )}

                {!esDemo && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <span>Licencia PREMIUM sin fecha de vencimiento</span>
                  </div>
                )}
              </div>
            </div>

            {/* Datos de Contacto */}
            <div className="mb-6 rounded-2xl border border-blue-500/20 bg-[#0f172a]/60 p-6">
              <h3 className="mb-4 font-heading text-lg font-semibold text-white">
                Datos de Contacto
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-cyan-400" />
                  <div>
                    <p className="text-xs text-blue-200/60">Email</p>
                    <p className="font-medium text-white">{negocio.email}</p>
                  </div>
                </div>

                {negocio.telefono && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-cyan-400" />
                    <div>
                      <p className="text-xs text-blue-200/60">Teléfono</p>
                      <p className="font-medium text-white">{negocio.telefono}</p>
                    </div>
                  </div>
                )}

                {negocio.ciudad && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-cyan-400" />
                    <div>
                      <p className="text-xs text-blue-200/60">Ciudad</p>
                      <p className="font-medium text-white">{negocio.ciudad}</p>
                    </div>
                  </div>
                )}

                {negocio.direccion && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-cyan-400" />
                    <div>
                      <p className="text-xs text-blue-200/60">Dirección</p>
                      <p className="font-medium text-white">{negocio.direccion}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-blue-400/40 bg-gradient-to-r from-blue-500/25 to-cyan-600/15 px-4 py-3 font-medium text-blue-200 transition hover:from-blue-500/35 hover:to-cyan-600/25"
              >
                Cerrar
              </button>
              
              {esDemo && estadoReal === "activo" && (
                <button
                  onClick={handleEnviarRecordatorio}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/25 to-green-600/15 px-4 py-3 font-medium text-emerald-200 transition hover:from-emerald-500/35 hover:to-green-600/25"
                >
                  <Send className="h-4 w-4" />
                  Enviar Recordatorio
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
