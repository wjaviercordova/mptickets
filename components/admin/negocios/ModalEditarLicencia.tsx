"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import type { NegocioExtended } from "@/types/admin";

interface ModalEditarLicenciaProps {
  negocio: NegocioExtended | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ModalEditarLicencia({
  negocio,
  isOpen,
  onClose,
  onSuccess,
}: ModalEditarLicenciaProps) {
  const [selectedPlan, setSelectedPlan] = useState<"demo" | "premium">(
    negocio?.plan || "demo"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!negocio) return null;

  const puedeActualizar = negocio.plan === "demo" && selectedPlan === "premium";

  const handleActualizar = async () => {
    if (!puedeActualizar) {
      setError("Solo se puede actualizar de DEMO a PREMIUM");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/negocios/${negocio.id}/plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "premium" }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Error al actualizar plan");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
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
            className="relative w-full max-w-lg rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#1e293b]/95 to-[#0f172a]/95 p-8 backdrop-blur-xl shadow-2xl"
          >
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Editar Licencia
                </h2>
                <p className="mt-1 text-sm text-blue-200/60">
                  {negocio.nombre}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl border border-red-400/30 bg-red-500/10 p-2 text-red-300 transition hover:bg-red-500/20"
                disabled={loading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Plan Actual */}
            <div className="mb-6 rounded-2xl border border-blue-500/20 bg-[#0f172a]/60 p-4">
              <p className="mb-2 text-sm text-blue-200/60">Plan Actual</p>
              <div className="inline-flex items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/20 px-4 py-2">
                <span className="font-semibold text-blue-300">
                  {negocio.plan.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Selector de Plan */}
            <div className="mb-6">
              <label className="mb-3 block text-sm font-medium text-blue-200">
                Nuevo Plan
              </label>

              <div className="space-y-3">
                {/* Opción DEMO (deshabilitada si ya es PREMIUM) */}
                <button
                  onClick={() => setSelectedPlan("demo")}
                  disabled={negocio.plan === "premium"}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedPlan === "demo"
                      ? "border-blue-400/50 bg-gradient-to-br from-blue-500/20 to-cyan-600/10"
                      : "border-blue-500/20 bg-[#0f172a]/40 hover:border-blue-400/30"
                  } ${
                    negocio.plan === "premium"
                      ? "cursor-not-allowed opacity-40"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-white">DEMO</h4>
                      <p className="mt-1 text-sm text-blue-200/60">
                        30 días de prueba
                      </p>
                    </div>
                    {negocio.plan === "premium" && (
                      <span className="text-xs text-red-300">
                        No permitido
                      </span>
                    )}
                  </div>
                </button>

                {/* Opción PREMIUM */}
                <button
                  onClick={() => setSelectedPlan("premium")}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedPlan === "premium"
                      ? "border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-pink-600/10"
                      : "border-blue-500/20 bg-[#0f172a]/40 hover:border-purple-400/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-white">PREMIUM</h4>
                      <p className="mt-1 text-sm text-blue-200/60">
                        Sin fecha de vencimiento • Ilimitado
                      </p>
                    </div>
                    {puedeActualizar && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Advertencia */}
            {puedeActualizar && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-yellow-400/30 bg-yellow-500/10 p-4">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-yellow-400" />
                <div className="text-sm text-yellow-200">
                  <p className="font-semibold">Cambio de licencia</p>
                  <p className="mt-1 text-yellow-200/80">
                    Al cambiar a PREMIUM, la fecha de expiración se eliminará y
                    el negocio tendrá acceso ilimitado.
                  </p>
                </div>
              </div>
            )}

            {/* Mensaje no permitido */}
            {negocio.plan === "premium" && selectedPlan === "demo" && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-400" />
                <div className="text-sm text-red-200">
                  <p className="font-semibold">Cambio no permitido</p>
                  <p className="mt-1 text-red-200/80">
                    No se puede cambiar de PREMIUM a DEMO.
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Botones de Acción */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-xl border border-blue-400/40 bg-gradient-to-r from-blue-500/25 to-cyan-600/15 px-4 py-3 font-medium text-blue-200 transition hover:from-blue-500/35 hover:to-cyan-600/25 disabled:opacity-50"
              >
                Cerrar
              </button>

              <button
                onClick={handleActualizar}
                disabled={!puedeActualizar || loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/25 to-green-600/15 px-4 py-3 font-medium text-emerald-200 transition hover:from-emerald-500/35 hover:to-green-600/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Actualizar"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
