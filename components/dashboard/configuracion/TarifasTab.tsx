"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  DollarSign,
  Car,
  Bike,
  Truck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface Parametro {
  id: string;
  tipo_vehiculo: string;
  nombre: string;
  descripcion: string | null;
  prioridad: number;
  tarifa_1_nombre: string;
  tarifa_1_valor: number;
  tarifa_2_nombre: string;
  tarifa_2_valor: number;
  tarifa_3_nombre: string;
  tarifa_3_valor: number;
  tarifa_4_nombre: string;
  tarifa_4_valor: number;
  tarifa_5_nombre: string;
  tarifa_5_valor: number;
  tarifa_6_nombre: string;
  tarifa_6_valor: number;
  tarifa_7_nombre: string;
  tarifa_7_valor: number;
  tarifa_extra: number;
  tarifa_auxiliar: number;
  tarifa_nocturna: number;
  tarifa_fin_semana: number;
  estado: string;
}

interface TarifasTabProps {
  negocioId: string;
  parametros: Parametro[];
  onUpdate: () => void;
}

const vehicleIcons: Record<string, typeof Car> = {
  MOTO: Bike,
  AUTO: Car,
  CAMIONETA: Truck,
  PESADO: Truck,
};

const emptyParametro: Omit<Parametro, "id"> = {
  tipo_vehiculo: "",
  nombre: "",
  descripcion: "",
  prioridad: 1,
  tarifa_1_nombre: "Primera Hora",
  tarifa_1_valor: 0,
  tarifa_2_nombre: "Segunda Hora",
  tarifa_2_valor: 0,
  tarifa_3_nombre: "Tercera Hora",
  tarifa_3_valor: 0,
  tarifa_4_nombre: "Cuarta Hora",
  tarifa_4_valor: 0,
  tarifa_5_nombre: "Quinta Hora",
  tarifa_5_valor: 0,
  tarifa_6_nombre: "Sexta Hora",
  tarifa_6_valor: 0,
  tarifa_7_nombre: "Hora Adicional",
  tarifa_7_valor: 0,
  tarifa_extra: 0,
  tarifa_auxiliar: 0,
  tarifa_nocturna: 0,
  tarifa_fin_semana: 0,
  estado: "activo",
};

export function TarifasTab({ negocioId, parametros, onUpdate }: TarifasTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingParam, setEditingParam] = useState<Parametro | null>(null);
  const [formData, setFormData] = useState<Omit<Parametro, "id">>(emptyParametro);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingParam(null);
    setFormData(emptyParametro);
    setShowModal(true);
  };

  const handleEdit = (param: Parametro) => {
    setEditingParam(param);
    setFormData({ ...param });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.tipo_vehiculo || !formData.nombre) {
      setMessage({ type: "error", text: "Complete los campos obligatorios" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/configuracion/parametros", {
        method: editingParam ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          negocioId,
          parametroId: editingParam?.id,
          data: formData,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: editingParam
            ? "Tarifa actualizada exitosamente"
            : "Tarifa creada exitosamente",
        });
        setShowModal(false);
        setTimeout(() => onUpdate(), 1000);
      } else {
        setMessage({ type: "error", text: result.message || "Error al guardar" });
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/configuracion/parametros", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ negocioId, parametroId: id }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Tarifa eliminada exitosamente" });
        setDeleteConfirm(null);
        setTimeout(() => onUpdate(), 1000);
      } else {
        setMessage({ type: "error", text: result.message || "Error al eliminar" });
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-6 transition-all duration-300 ${showModal ? 'min-h-[700px] xl:min-h-[800px] 2xl:min-h-[900px]' : ''}`}>
      {/* Header con botón agregar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-xl text-white">
            Tarifas por Tipo de Vehículo
          </h3>
          <p className="text-sm text-blue-200/70">
            Configure las tarifas y precios para cada tipo de vehículo
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/30 to-green-600/30 px-5 py-2.5 font-semibold text-white backdrop-blur-xl transition hover:from-emerald-500/50 hover:to-green-600/50 hover:shadow-xl hover:shadow-emerald-500/30"
        >
          <Plus className="h-5 w-5" />
          Agregar Tarifa
        </motion.button>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
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
            <AlertCircle className="h-5 w-5" />
          )}
          <span className="font-medium">{message.text}</span>
        </motion.div>
      )}

      {/* Lista de tarifas */}
      <div className="grid gap-4 md:grid-cols-2">
        {parametros.map((param) => {
          const Icon = vehicleIcons[param.tipo_vehiculo] || Car;
          return (
            <motion.div
              key={param.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-[#1e293b]/60 to-[#0a0e27]/80 p-5 backdrop-blur-xl transition hover:border-cyan-400/40 hover:shadow-xl hover:shadow-cyan-500/10"
            >
              {/* Estado badge */}
              <div className="absolute right-4 top-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    param.estado === "activo"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-red-500/20 text-red-300"
                  }`}
                >
                  {param.estado === "activo" ? "Activo" : "Inactivo"}
                </span>
              </div>

              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 to-blue-600/10 shadow-lg shadow-cyan-500/20">
                  <Icon className="h-7 w-7 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-heading text-lg text-white">{param.nombre}</h4>
                  <p className="text-sm font-medium text-cyan-400">
                    {param.tipo_vehiculo}
                  </p>
                  {param.descripcion && (
                    <p className="mt-1 text-xs text-blue-200/60">
                      {param.descripcion}
                    </p>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-5 flex gap-2 border-t border-blue-500/10 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEdit(param)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-200 backdrop-blur-sm transition hover:bg-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/20"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteConfirm(param.id)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-200 backdrop-blur-sm transition hover:bg-red-500/30 hover:shadow-lg hover:shadow-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal de confirmación de eliminación */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
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
                  <p className="text-sm text-red-200/70">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>

              <p className="mb-6 text-blue-200/80">
                ¿Está seguro que desea eliminar esta tarifa? Se perderá toda la
                configuración asociada.
              </p>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 font-semibold text-blue-200 backdrop-blur-xl transition hover:bg-blue-500/20"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={loading}
                  className="flex-1 rounded-2xl border border-red-400/40 bg-gradient-to-r from-red-500/30 to-pink-600/30 px-4 py-3 font-semibold text-white backdrop-blur-xl transition hover:from-red-500/50 hover:to-pink-600/50 disabled:opacity-50"
                >
                  {loading ? "Eliminando..." : "Eliminar"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de crear/editar */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <div className="flex min-h-full items-center justify-center py-8">
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#1e293b] to-[#0f172a] shadow-2xl shadow-cyan-500/20"
              >
                {/* Modal Header */}
                <div className="border-b border-blue-500/20 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/20">
                        <DollarSign className="h-6 w-6 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {editingParam ? "Editar Tarifa" : "Nueva Tarifa"}
                        </h3>
                        <p className="text-sm text-blue-200/70">
                          Configure todos los valores de la tarifa
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowModal(false)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/30 bg-[#1e293b]/60 text-blue-200 backdrop-blur-xl transition hover:bg-red-500/20 hover:text-red-300"
                    >
                      <X className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="space-y-6 p-6">
                {/* Información básica */}
                <div className="space-y-4 rounded-2xl border border-blue-500/20 bg-[#0a0e27]/40 p-5">
                  <h4 className="font-heading text-lg text-white">
                    Información Básica
                  </h4>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-blue-200">
                        Tipo de Vehículo *
                      </label>
                      <select
                        value={String(formData.tipo_vehiculo)}
                        onChange={(e) =>
                          setFormData({ ...formData, tipo_vehiculo: e.target.value })
                        }
                        className="glass-input w-full rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:shadow-lg focus:shadow-cyan-500/20"
                      >
                        <option value="">Seleccione...</option>
                        <option value="MOTO">MOTO</option>
                        <option value="AUTO">AUTO</option>
                        <option value="CAMIONETA">CAMIONETA</option>
                        <option value="PESADO">PESADO</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-blue-200">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={String(formData.nombre)}
                        onChange={(e) =>
                          setFormData({ ...formData, nombre: e.target.value })
                        }
                        placeholder="Ej: Tarifa para Automóviles"
                        className="glass-input w-full rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:shadow-lg focus:shadow-cyan-500/20"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-blue-200">
                        Descripción
                      </label>
                      <textarea
                        value={String(formData.descripcion || "")}
                        onChange={(e) =>
                          setFormData({ ...formData, descripcion: e.target.value })
                        }
                        rows={2}
                        className="glass-input w-full rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:shadow-lg focus:shadow-cyan-500/20"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-blue-200">
                        Prioridad
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={Number(formData.prioridad)}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            prioridad: parseInt(e.target.value) || 0,
                          })
                        }
                        className="glass-input w-full rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:shadow-lg focus:shadow-cyan-500/20"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-blue-200">
                        Estado
                      </label>
                      <select
                        value={String(formData.estado)}
                        onChange={(e) =>
                          setFormData({ ...formData, estado: e.target.value })
                        }
                        className="glass-input w-full rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:shadow-lg focus:shadow-cyan-500/20"
                      >
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tarifas progresivas (1-7) */}
                <div className="space-y-4 rounded-2xl border border-purple-500/20 bg-[#0a0e27]/40 p-5">
                  <h4 className="font-heading text-lg text-white">
                    Tarifas Progresivas (Horas)
                  </h4>
                  
                  <div className="grid gap-4">
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <div key={num} className="grid gap-3 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-xs font-medium text-blue-200/80">
                            Nombre Tarifa {num}
                          </label>
                          <input
                            type="text"
                            value={formData[`tarifa_${num}_nombre` as keyof typeof formData] as string}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [`tarifa_${num}_nombre`]: e.target.value,
                              })
                            }
                            className="glass-input w-full rounded-xl border border-blue-500/30 bg-[#1e293b]/60 px-3 py-2 text-sm text-white backdrop-blur-xl outline-none transition focus:border-purple-400/60 focus:shadow-lg focus:shadow-purple-500/20"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-medium text-blue-200/80">
                            Valor ($)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData[`tarifa_${num}_valor` as keyof typeof formData] as number}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [`tarifa_${num}_valor`]: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="glass-input w-full rounded-xl border border-blue-500/30 bg-[#1e293b]/60 px-3 py-2 text-sm text-white backdrop-blur-xl outline-none transition focus:border-purple-400/60 focus:shadow-lg focus:shadow-purple-500/20"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tarifas adicionales */}
                <div className="space-y-4 rounded-2xl border border-emerald-500/20 bg-[#0a0e27]/40 p-5">
                  <h4 className="font-heading text-lg text-white">
                    Tarifas Adicionales
                  </h4>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-blue-200">
                        Tarifa Extra ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={Number(formData.tarifa_extra)}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tarifa_extra: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="glass-input w-full rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-emerald-400/60 focus:shadow-lg focus:shadow-emerald-500/20"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-blue-200">
                        Tarifa Auxiliar ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={Number(formData.tarifa_auxiliar)}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tarifa_auxiliar: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="glass-input w-full rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-emerald-400/60 focus:shadow-lg focus:shadow-emerald-500/20"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-blue-200">
                        Tarifa Nocturna ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={Number(formData.tarifa_nocturna)}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tarifa_nocturna: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="glass-input w-full rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-emerald-400/60 focus:shadow-lg focus:shadow-emerald-500/20"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-blue-200">
                        Tarifa Fin de Semana ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={Number(formData.tarifa_fin_semana)}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tarifa_fin_semana: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="glass-input w-full rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-emerald-400/60 focus:shadow-lg focus:shadow-emerald-500/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-blue-500/20 p-6">
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowModal(false)}
                    className="flex-1 rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-6 py-3 font-semibold text-blue-200 backdrop-blur-xl transition hover:bg-blue-500/20"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={loading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 px-6 py-3 font-semibold text-white backdrop-blur-xl transition hover:from-cyan-500/50 hover:to-blue-600/50 hover:shadow-xl hover:shadow-cyan-500/30 disabled:opacity-50"
                  >
                    <Save className="h-5 w-5" />
                    {loading ? "Guardando..." : "Guardar Tarifa"}
                  </motion.button>
                </div>
              </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
