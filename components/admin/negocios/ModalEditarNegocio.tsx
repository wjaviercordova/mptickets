"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Building2,
  Loader2,
  CheckCircle2,
  MapPin,
  Mail,
  Phone,
  Building,
  Power,
  Save,
} from "lucide-react";
import type { NegocioExtended, EstadoNegocio } from "@/types/admin";

interface ModalEditarNegocioProps {
  negocio: NegocioExtended;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ModalEditarNegocio({
  negocio,
  isOpen,
  onClose,
  onSuccess,
}: ModalEditarNegocioProps) {
  const [formData, setFormData] = useState({
    nombre: negocio.nombre,
    direccion: negocio.direccion || "",
    telefono: negocio.telefono || "",
    email: negocio.email,
    ciudad: negocio.ciudad,
    estado: negocio.estado,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEstadoToggle = (estado: EstadoNegocio) => {
    setFormData((prev) => ({ ...prev, estado }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre.trim()) {
      setError("El nombre es requerido");
      return;
    }

    if (!formData.email.trim()) {
      setError("El email es requerido");
      return;
    }

    if (!formData.ciudad.trim()) {
      setError("La ciudad es requerida");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/negocios/${negocio.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Error al actualizar negocio");
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
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-blue-500/30 bg-gradient-to-br from-[#1e293b]/95 to-[#0f172a]/95 p-8 backdrop-blur-xl shadow-2xl"
          >
            {/* Header */}
            <div className="mb-8 flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 to-blue-600/10">
                  <Building2 className="h-7 w-7 text-cyan-400" />
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-bold text-white">
                    Editar Negocio
                  </h2>
                  <p className="mt-1 text-sm text-blue-200/60">
                    Código: {negocio.codigo}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="rounded-xl border border-red-400/30 bg-red-500/10 p-2 text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Control de Estado (destacado) */}
              <div className="mb-8 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-600/5 p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Power className="h-5 w-5 text-purple-400" />
                  <h3 className="font-semibold text-purple-200">Estado del Negocio</h3>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Activo */}
                  <button
                    type="button"
                    onClick={() => handleEstadoToggle("activo")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-4 transition ${
                      formData.estado === "activo"
                        ? "border-emerald-400/50 bg-gradient-to-br from-emerald-500/30 to-green-600/20 shadow-lg shadow-emerald-500/25"
                        : "border-emerald-500/20 bg-[#0f172a]/40 hover:border-emerald-400/30"
                    }`}
                  >
                    <CheckCircle2 className={`h-5 w-5 ${formData.estado === "activo" ? "text-emerald-300" : "text-emerald-400/50"}`} />
                    <span className={`font-medium ${formData.estado === "activo" ? "text-emerald-200" : "text-emerald-300/60"}`}>
                      Activo
                    </span>
                  </button>

                  {/* Inactivo */}
                  <button
                    type="button"
                    onClick={() => handleEstadoToggle("inactivo")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-4 transition ${
                      formData.estado === "inactivo"
                        ? "border-red-400/50 bg-gradient-to-br from-red-500/30 to-rose-600/20 shadow-lg shadow-red-500/25"
                        : "border-red-500/20 bg-[#0f172a]/40 hover:border-red-400/30"
                    }`}
                  >
                    <X className={`h-5 w-5 ${formData.estado === "inactivo" ? "text-red-300" : "text-red-400/50"}`} />
                    <span className={`font-medium ${formData.estado === "inactivo" ? "text-red-200" : "text-red-300/60"}`}>
                      Inactivo
                    </span>
                  </button>

                  {/* Suspendido */}
                  <button
                    type="button"
                    onClick={() => handleEstadoToggle("suspendido")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-4 transition ${
                      formData.estado === "suspendido"
                        ? "border-yellow-400/50 bg-gradient-to-br from-yellow-500/30 to-amber-600/20 shadow-lg shadow-yellow-500/25"
                        : "border-yellow-500/20 bg-[#0f172a]/40 hover:border-yellow-400/30"
                    }`}
                  >
                    <Power className={`h-5 w-5 ${formData.estado === "suspendido" ? "text-yellow-300" : "text-yellow-400/50"}`} />
                    <span className={`font-medium ${formData.estado === "suspendido" ? "text-yellow-200" : "text-yellow-300/60"}`}>
                      Suspendido
                    </span>
                  </button>
                </div>

                <p className="mt-4 text-xs text-purple-200/60">
                  {formData.estado === "activo" && "El negocio puede operar normalmente"}
                  {formData.estado === "inactivo" && "El negocio no podrá acceder al sistema"}
                  {formData.estado === "suspendido" && "Acceso temporal restringido al negocio"}
                </p>
              </div>

              {/* Grid de 2 columnas para los campos */}
              <div className="mb-6 grid gap-6 md:grid-cols-2">
                {/* Nombre */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-200">
                    <Building2 className="h-4 w-4 text-blue-400" />
                    Nombre del Negocio <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleChange("nombre", e.target.value)}
                    placeholder="Nombre del negocio"
                    className="w-full rounded-xl border border-blue-400/30 bg-[#0f172a]/60 px-4 py-3 text-white placeholder:text-blue-200/40 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-200">
                    <Mail className="h-4 w-4 text-blue-400" />
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full rounded-xl border border-blue-400/30 bg-[#0f172a]/60 px-4 py-3 text-white placeholder:text-blue-200/40 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-200">
                    <Phone className="h-4 w-4 text-blue-400" />
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => handleChange("telefono", e.target.value)}
                    placeholder="+51 999 999 999"
                    className="w-full rounded-xl border border-blue-400/30 bg-[#0f172a]/60 px-4 py-3 text-white placeholder:text-blue-200/40 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                  />
                </div>

                {/* Ciudad */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-200">
                    <Building className="h-4 w-4 text-blue-400" />
                    Ciudad <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ciudad}
                    onChange={(e) => handleChange("ciudad", e.target.value)}
                    placeholder="Lima, Arequipa, etc."
                    className="w-full rounded-xl border border-blue-400/30 bg-[#0f172a]/60 px-4 py-3 text-white placeholder:text-blue-200/40 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                  />
                </div>

                {/* Dirección (ocupa 2 columnas) */}
                <div className="md:col-span-2">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-200">
                    <MapPin className="h-4 w-4 text-blue-400" />
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => handleChange("direccion", e.target.value)}
                    placeholder="Dirección completa del negocio"
                    className="w-full rounded-xl border border-blue-400/30 bg-[#0f172a]/60 px-4 py-3 text-white placeholder:text-blue-200/40 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* Botones de Acción */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 rounded-xl border border-blue-400/40 bg-gradient-to-r from-blue-500/25 to-cyan-600/15 px-4 py-3 font-medium text-blue-200 transition hover:from-blue-500/35 hover:to-cyan-600/25 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/25 to-green-600/15 px-4 py-3 font-medium text-emerald-200 transition hover:from-emerald-500/35 hover:to-green-600/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
