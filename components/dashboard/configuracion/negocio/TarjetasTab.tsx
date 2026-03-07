"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  CreditCard,
  Hash,
  Barcode,
  QrCode,
  AlertCircle,
  Calendar,
} from "lucide-react";

interface Tarjeta {
  id: string;
  negocio_id: string;
  codigo: string;
  codigo_interno: string;
  codigo_barras: string | null;
  qr_code: string | null;
  estado: string;
  perdida: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

interface TarjetasTabProps {
  negocioId: string;
  tarjetas: Tarjeta[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const emptyTarjeta = {
  codigo: "",
  codigo_interno: "",
  codigo_barras: "",
  qr_code: "",
  perdida: "0",
};

export function TarjetasTab({
  negocioId,
  tarjetas,
  onSuccess,
  onError,
}: TarjetasTabProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<Tarjeta | null>(null);
  const [formData, setFormData] = useState(emptyTarjeta);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingCard(null);
    setFormData(emptyTarjeta);
    setShowModal(true);
  };

  const handleEdit = (card: Tarjeta) => {
    setEditingCard(card);
    setFormData({
      codigo: card.codigo,
      codigo_interno: card.codigo_interno,
      codigo_barras: card.codigo_barras || "",
      qr_code: card.qr_code || "",
      perdida: card.perdida,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        negocioId,
        codigo: formData.codigo,
        codigo_interno: formData.codigo_interno,
        codigo_barras: formData.codigo_barras || null,
        qr_code: formData.qr_code || null,
        perdida: formData.perdida,
      };

      const response = await fetch("/api/configuracion/tarjetas", {
        method: editingCard ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingCard ? { ...payload, tarjetaId: editingCard.id } : payload
        ),
      });

      const result = await response.json();

      if (response.ok) {
        onSuccess(
          editingCard
            ? "Tarjeta actualizada exitosamente"
            : "Tarjeta creada exitosamente"
        );
        setShowModal(false);
        router.refresh();
      } else {
        onError(result.message || "Error al guardar tarjeta");
      }
    } catch {
      onError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tarjetaId: string) => {
    setLoading(true);

    try {
      const response = await fetch("/api/configuracion/tarjetas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tarjetaId }),
      });

      const result = await response.json();

      if (response.ok) {
        onSuccess("Tarjeta eliminada exitosamente");
        setDeleteConfirm(null);
        router.refresh();
      } else {
        onError(result.message || "Error al eliminar tarjeta");
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

  const getEstadoBadge = (estado: string) => {
    return estado === "1"
      ? {
          label: "Disponible",
          color:
            "from-emerald-500/20 to-green-600/20 text-emerald-300 border-emerald-400/30",
        }
      : {
          label: "En Uso",
          color:
            "from-amber-500/20 to-yellow-600/20 text-amber-300 border-amber-400/30",
        };
  };

  const getPerdidaBadge = (perdida: string) => {
    return perdida === "1"
      ? {
          label: "Inactiva",
          color: "from-red-500/20 to-red-600/20 text-red-300 border-red-400/30",
        }
      : {
          label: "Activa",
          color:
            "from-cyan-500/20 to-blue-600/20 text-cyan-300 border-cyan-400/30",
        };
  };

  return (
    <div className={`space-y-6 transition-all duration-300 ${showModal ? 'min-h-[700px] xl:min-h-[800px] 2xl:min-h-[900px]' : ''}`}>
      {/* Header con botón agregar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-xl text-white">
            Gestión de Tarjetas
          </h3>
          <p className="text-sm text-blue-200/70">
            Administre las tarjetas del negocio para control de accesos
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/30 to-green-600/30 px-5 py-2.5 font-semibold text-white backdrop-blur-xl transition hover:from-emerald-500/50 hover:to-green-600/50 hover:shadow-xl hover:shadow-emerald-500/30"
        >
          <Plus className="h-5 w-5" />
          Agregar Tarjeta
        </motion.button>
      </div>

      {/* Lista de tarjetas */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tarjetas.map((card) => {
          const estadoInfo = getEstadoBadge(card.estado);
          const perdidaInfo = getPerdidaBadge(card.perdida);
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl border border-blue-400/20 bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-6 shadow-lg backdrop-blur-xl transition hover:border-cyan-400/40 hover:shadow-cyan-500/20"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/20">
                    <CreditCard className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-mono text-lg font-bold text-white">
                      {card.codigo}
                    </h4>
                    <p className="text-xs text-blue-200/70">
                      Interno: {card.codigo_interno}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div
                    className={`rounded-3xl border bg-gradient-to-r px-2 py-1 text-xs font-semibold backdrop-blur-sm ${estadoInfo.color}`}
                  >
                    {estadoInfo.label}
                  </div>
                  <div
                    className={`rounded-3xl border bg-gradient-to-r px-2 py-1 text-xs font-semibold backdrop-blur-sm ${perdidaInfo.color}`}
                  >
                    {perdidaInfo.label}
                  </div>
                </div>
              </div>

              <div className="mb-4 space-y-2 text-sm text-blue-200/80">
                {card.codigo_barras && (
                  <div className="flex items-center gap-2">
                    <Barcode className="h-4 w-4 text-cyan-400" />
                    <span className="font-mono text-xs">
                      {card.codigo_barras}
                    </span>
                  </div>
                )}
                {card.qr_code && (
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-cyan-400" />
                    <span className="truncate font-mono text-xs">
                      {card.qr_code.substring(0, 20)}...
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-4 space-y-1 border-t border-blue-400/20 pt-3 text-xs text-blue-300/70">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Creación: {formatDate(card.fecha_creacion)}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Actualización: {formatDate(card.fecha_actualizacion)}
                </div>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEdit(card)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-200 backdrop-blur-sm transition hover:bg-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/20"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteConfirm(card.id)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-200 backdrop-blur-sm transition hover:bg-red-500/30 hover:shadow-lg hover:shadow-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal de creación/edición */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-8 shadow-2xl shadow-cyan-500/20"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/20">
                    <CreditCard className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {editingCard ? "Editar Tarjeta" : "Nueva Tarjeta"}
                    </h3>
                    <p className="text-sm text-blue-200/70">
                      Complete los datos de la tarjeta
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowModal(false)}
                  className="rounded-xl p-2 text-blue-200 transition hover:bg-blue-950/50"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Código */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-200">
                      <CreditCard className="h-4 w-4 text-cyan-400" />
                      Código (impreso en tarjeta)
                    </label>
                    <input
                      type="text"
                      value={formData.codigo}
                      onChange={(e) =>
                        setFormData({ ...formData, codigo: e.target.value })
                      }
                      className="glass-input w-full rounded-3xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 font-mono text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20"
                      required
                    />
                  </div>

                  {/* Código Interno */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-200">
                      <Hash className="h-4 w-4 text-cyan-400" />
                      Código Interno
                    </label>
                    <input
                      type="text"
                      value={formData.codigo_interno}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          codigo_interno: e.target.value,
                        })
                      }
                      className="glass-input w-full rounded-3xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 font-mono text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20"
                      required
                    />
                  </div>

                  {/* Código de Barras */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-200">
                      <Barcode className="h-4 w-4 text-cyan-400" />
                      Código de Barras
                    </label>
                    <input
                      type="text"
                      value={formData.codigo_barras}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          codigo_barras: e.target.value,
                        })
                      }
                      className="glass-input w-full rounded-3xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 font-mono text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20"
                    />
                  </div>

                  {/* QR Code */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-200">
                      <QrCode className="h-4 w-4 text-cyan-400" />
                      Código QR
                    </label>
                    <input
                      type="text"
                      value={formData.qr_code}
                      onChange={(e) =>
                        setFormData({ ...formData, qr_code: e.target.value })
                      }
                      className="glass-input w-full rounded-3xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 font-mono text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20"
                    />
                  </div>
                </div>

                {/* Estado de Pérdida */}
                <div>
                  <label className="mb-3 flex items-center gap-2 text-sm font-medium text-blue-200">
                    <AlertCircle className="h-4 w-4 text-cyan-400" />
                    Estado de la Tarjeta
                  </label>
                  <div className="flex gap-4">
                    <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-blue-400/20 bg-blue-950/30 px-4 py-3 transition hover:border-cyan-400/40">
                      <input
                        type="radio"
                        name="perdida"
                        value="0"
                        checked={formData.perdida === "0"}
                        onChange={(e) =>
                          setFormData({ ...formData, perdida: e.target.value })
                        }
                        className="text-cyan-500"
                      />
                      <div>
                        <div className="font-semibold text-white">Activa</div>
                        <div className="text-xs text-blue-300/70">
                          Tarjeta disponible para uso
                        </div>
                      </div>
                    </label>
                    <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-blue-400/20 bg-blue-950/30 px-4 py-3 transition hover:border-red-400/40">
                      <input
                        type="radio"
                        name="perdida"
                        value="1"
                        checked={formData.perdida === "1"}
                        onChange={(e) =>
                          setFormData({ ...formData, perdida: e.target.value })
                        }
                        className="text-red-500"
                      />
                      <div>
                        <div className="font-semibold text-white">Inactiva</div>
                        <div className="text-xs text-blue-300/70">
                          Tarjeta perdida o extraviada
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Información adicional */}
                {editingCard && (
                  <div className="rounded-2xl border border-blue-400/20 bg-blue-950/20 p-4 backdrop-blur-sm">
                    <div className="mb-2 text-sm font-medium text-blue-300">
                      Información del Sistema
                    </div>
                    <div className="space-y-1 text-xs text-blue-300/70">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Creación: {formatDate(editingCard.fecha_creacion)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Última Actualización:{" "}
                        {formatDate(editingCard.fecha_actualizacion)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-blue-400/30 bg-blue-950/30 px-6 py-3 font-semibold text-blue-200 backdrop-blur-xl transition hover:border-blue-400/50 hover:bg-blue-900/40"
                  >
                    <X className="h-5 w-5" />
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 px-6 py-3 font-semibold text-white backdrop-blur-xl transition hover:from-cyan-500/50 hover:to-blue-600/50 hover:shadow-xl hover:shadow-cyan-500/30 disabled:opacity-50"
                  >
                    <Save className="h-5 w-5" />
                    {loading
                      ? "Guardando..."
                      : editingCard
                      ? "Actualizar Tarjeta"
                      : "Crear Tarjeta"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de confirmación de eliminación */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl border border-red-500/30 bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-8 shadow-2xl shadow-red-500/20"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-400/30 bg-red-500/20">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Confirmar Eliminación
                  </h3>
                  <p className="text-sm text-blue-200/70">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>

              <p className="mb-6 text-blue-200/80">
                ¿Está seguro que desea eliminar esta tarjeta? No podrá ser
                utilizada en el sistema.
              </p>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeleteConfirm(null)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-blue-400/30 bg-blue-950/30 px-6 py-3 font-semibold text-blue-200 backdrop-blur-xl transition hover:border-blue-400/50 hover:bg-blue-900/40"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-400/40 bg-gradient-to-r from-red-500/30 to-red-600/30 px-6 py-3 font-semibold text-white backdrop-blur-xl transition hover:from-red-500/50 hover:to-red-600/50 hover:shadow-xl hover:shadow-red-500/30 disabled:opacity-50"
                >
                  {loading ? "Eliminando..." : "Eliminar"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
