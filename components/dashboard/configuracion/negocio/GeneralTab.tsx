"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Save,
  Building2,
  Activity,
} from "lucide-react";

interface Negocio {
  id: string;
  nombre: string;
  descripcion: string | null;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  ciudad: string | null;
  logo_url: string | null;
  plan: string;
  estado: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  codigo: string;
}

interface GeneralTabProps {
  negocio: Negocio;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function GeneralTab({ negocio, onSuccess, onError }: GeneralTabProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: negocio.nombre || "",
    descripcion: negocio.descripcion || "",
    direccion: negocio.direccion || "",
    telefono: negocio.telefono || "",
    email: negocio.email || "",
    ciudad: negocio.ciudad || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/configuracion/negocio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          negocioId: negocio.id,
          data: formData,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        onSuccess("Configuración del negocio actualizada exitosamente");
        router.refresh();
      } else {
        onError(result.message || "Error al actualizar");
      }
    } catch {
      onError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPlanBadge = (plan: string) => {
    const plans: Record<string, { label: string; color: string }> = {
      basic: { label: "Básico", color: "from-gray-500/20 to-gray-600/20 text-gray-300 border-gray-400/30" },
      premium: { label: "Premium", color: "from-amber-500/20 to-yellow-600/20 text-amber-300 border-amber-400/30" },
      enterprise: { label: "Enterprise", color: "from-purple-500/20 to-indigo-600/20 text-purple-300 border-purple-400/30" },
    };
    return plans[plan] || plans.basic;
  };

  const getEstadoBadge = (estado: string) => {
    const estados: Record<string, { label: string; color: string }> = {
      activo: { label: "Activo", color: "from-emerald-500/20 to-green-600/20 text-emerald-300 border-emerald-400/30" },
      inactivo: { label: "Inactivo", color: "from-red-500/20 to-red-600/20 text-red-300 border-red-400/30" },
      suspendido: { label: "Suspendido", color: "from-orange-500/20 to-orange-600/20 text-orange-300 border-orange-400/30" },
    };
    return estados[estado] || estados.inactivo;
  };

  const planInfo = getPlanBadge(negocio.plan);
  const estadoInfo = getEstadoBadge(negocio.estado);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sección: Datos Editables */}
      <div className="glass-card space-y-6 rounded-3xl border border-blue-400/20 bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-8 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-blue-400/20 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/20">
            <Building2 className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-white">
              Datos del Negocio
            </h3>
            <p className="text-sm text-blue-200/70">
              Configure la información principal del negocio
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Nombre */}
          <div>
            <label className="mb-2 block text-sm font-medium text-blue-200">
              Nombre del Negocio
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              className="glass-input w-full rounded-3xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20"
              required
            />
          </div>

          {/* Ciudad */}
          <div>
            <label className="mb-2 block text-sm font-medium text-blue-200">
              Ciudad
            </label>
            <input
              type="text"
              value={formData.ciudad}
              onChange={(e) =>
                setFormData({ ...formData, ciudad: e.target.value })
              }
              className="glass-input w-full rounded-3xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20"
            />
          </div>

          {/* Dirección */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-blue-200">
              Dirección
            </label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) =>
                setFormData({ ...formData, direccion: e.target.value })
              }
              className="glass-input w-full rounded-3xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="mb-2 block text-sm font-medium text-blue-200">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
              className="glass-input w-full rounded-3xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-blue-200">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="glass-input w-full rounded-3xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20"
            />
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-blue-200">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              rows={3}
              className="glass-input w-full rounded-3xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20"
            />
          </div>
        </div>

        {/* Botón Guardar */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="glass-button flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 px-6 py-3 font-semibold text-white backdrop-blur-xl transition hover:from-cyan-500/50 hover:to-blue-600/50 hover:shadow-xl hover:shadow-cyan-500/30 disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          {loading ? "Guardando..." : "Guardar Configuración Negocio"}
        </motion.button>
      </div>

      {/* Sección: Información del Sistema (Solo lectura) */}
      <div className="glass-card space-y-6 rounded-3xl border border-blue-400/20 bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-8 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-blue-400/20 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/30 bg-blue-500/20">
            <Activity className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-white">
              Información del Sistema
            </h3>
            <p className="text-sm text-blue-200/70">
              Datos administrativos y de seguimiento
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Plan */}
          <div className="rounded-2xl border border-blue-400/20 bg-blue-950/20 p-4 backdrop-blur-sm">
            <div className="mb-2 text-sm font-medium text-blue-300">
              Plan
            </div>
            <div
              className={`inline-flex items-center gap-2 rounded-3xl border bg-gradient-to-r px-3 py-1.5 text-sm font-semibold backdrop-blur-sm ${planInfo.color}`}
            >
              {planInfo.label}
            </div>
          </div>

          {/* Estado */}
          <div className="rounded-2xl border border-blue-400/20 bg-blue-950/20 p-4 backdrop-blur-sm">
            <div className="mb-2 text-sm font-medium text-blue-300">
              Estado
            </div>
            <div
              className={`inline-flex items-center gap-2 rounded-3xl border bg-gradient-to-r px-3 py-1.5 text-sm font-semibold backdrop-blur-sm ${estadoInfo.color}`}
            >
              {estadoInfo.label}
            </div>
          </div>

          {/* Código */}
          <div className="rounded-2xl border border-blue-400/20 bg-blue-950/20 p-4 backdrop-blur-sm">
            <div className="mb-2 text-sm font-medium text-blue-300">
              Código
            </div>
            <div className="font-mono text-lg font-bold text-white">
              {negocio.codigo}
            </div>
          </div>

          {/* Fecha Creación */}
          <div className="rounded-2xl border border-blue-400/20 bg-blue-950/20 p-4 backdrop-blur-sm md:col-span-2 lg:col-span-1.5">
            <div className="mb-2 text-sm font-medium text-blue-300">
              Fecha Creación
            </div>
            <div className="text-base font-medium text-white">
              {formatDate(negocio.fecha_creacion)}
            </div>
          </div>

          {/* Última Actualización */}
          <div className="rounded-2xl border border-blue-400/20 bg-blue-950/20 p-4 backdrop-blur-sm md:col-span-2 lg:col-span-1.5">
            <div className="mb-2 text-sm font-medium text-blue-300">
              Última Actualización
            </div>
            <div className="text-base font-medium text-white">
              {formatDate(negocio.fecha_actualizacion)}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
