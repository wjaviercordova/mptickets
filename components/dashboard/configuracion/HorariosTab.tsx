"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Clock, Copy, CheckCircle2, AlertCircle } from "lucide-react";
import { motionButtonProps } from "@/lib/button-styles";

interface HorarioDia {
  open: boolean;
  "24h": boolean;
  from: string;
  to: string;
}

interface HorariosAtencion {
  lunes: HorarioDia;
  martes: HorarioDia;
  miercoles: HorarioDia;
  jueves: HorarioDia;
  viernes: HorarioDia;
  sabado: HorarioDia;
  domingo: HorarioDia;
}

interface HorariosTabProps {
  horariosActuales: string; // JSON string
  onSave: (horarios: HorariosAtencion) => Promise<void>;
}

const DIAS_SEMANA = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
] as const;

// Generar opciones de horario (00:00 a 23:30 en intervalos de 30 min)
const generarOpcionesHorario = (): string[] => {
  const opciones: string[] = [];
  for (let h = 0; h < 24; h++) {
    opciones.push(`${String(h).padStart(2, "0")}:00`);
    opciones.push(`${String(h).padStart(2, "0")}:30`);
  }
  return opciones;
};

const HORARIOS_DEFAULT: HorariosAtencion = {
  lunes: { open: true, "24h": false, from: "08:00", to: "20:00" },
  martes: { open: true, "24h": false, from: "08:00", to: "20:00" },
  miercoles: { open: true, "24h": false, from: "08:00", to: "20:00" },
  jueves: { open: true, "24h": false, from: "08:00", to: "20:00" },
  viernes: { open: true, "24h": false, from: "08:00", to: "20:00" },
  sabado: { open: true, "24h": false, from: "09:00", to: "18:00" },
  domingo: { open: false, "24h": false, from: "", to: "" },
};

export function HorariosTab({ horariosActuales, onSave }: HorariosTabProps) {
  const [horarios, setHorarios] = useState<HorariosAtencion>(() => {
    try {
      if (horariosActuales) {
        return JSON.parse(horariosActuales);
      }
      return HORARIOS_DEFAULT;
    } catch {
      return HORARIOS_DEFAULT;
    }
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [diaParaCopiar, setDiaParaCopiar] = useState<string | null>(null);

  // Actualizar horarios cuando cambien las props (al volver al tab después de guardar)
  useEffect(() => {
    try {
      if (horariosActuales) {
        const parsed = JSON.parse(horariosActuales);
        setHorarios(parsed);
      }
    } catch (error) {
      console.error("Error parseando horarios:", error);
    }
  }, [horariosActuales]);

  const opcionesHorario = generarOpcionesHorario();

  const handleToggleDia = (dia: keyof HorariosAtencion) => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        open: !prev[dia].open,
      },
    }));
  };

  const handleToggle24h = (dia: keyof HorariosAtencion) => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        "24h": !prev[dia]["24h"],
        from: !prev[dia]["24h"] ? "" : prev[dia].from,
        to: !prev[dia]["24h"] ? "" : prev[dia].to,
      },
    }));
  };

  const handleChangeHorario = (
    dia: keyof HorariosAtencion,
    field: "from" | "to",
    value: string
  ) => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [field]: value,
      },
    }));
  };

  const handleCopiarHorario = (diaOrigen: keyof HorariosAtencion) => {
    setDiaParaCopiar(diaOrigen);
  };

  const handleAplicarATodos = () => {
    if (!diaParaCopiar) return;

    const horarioOrigen = horarios[diaParaCopiar as keyof HorariosAtencion];
    const nuevoHorario = { ...horarios };

    DIAS_SEMANA.forEach(({ key }) => {
      nuevoHorario[key as keyof HorariosAtencion] = { ...horarioOrigen };
    });

    setHorarios(nuevoHorario);
    setDiaParaCopiar(null);
    setMessage({
      type: "success",
      text: `✅ Horario copiado a todos los días`,
    });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      await onSave(horarios);
      setMessage({
        type: "success",
        text: "✅ Horarios guardados exitosamente",
      });
      setTimeout(() => setMessage(null), 5000);
    } catch {
      setMessage({
        type: "error",
        text: "❌ Error al guardar horarios",
      });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-heading text-xl text-white">Horarios de Atención</h3>
          <p className="text-sm text-blue-200/70">
            Configura los días y horarios en que tu negocio está abierto
          </p>
        </div>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 rounded-2xl border p-4 backdrop-blur-sm ${
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
          <span className="text-sm font-medium">{message.text}</span>
        </motion.div>
      )}

      {/* Lista de días */}
      <div className="space-y-3">
        {DIAS_SEMANA.map(({ key, label }) => {
          const horarioDia = horarios[key as keyof HorariosAtencion];
          const isOpen = horarioDia.open;
          const is24h = horarioDia["24h"];

          return (
            <motion.div
              key={key}
              whileHover={{ scale: 1.005 }}
              className={`rounded-2xl border backdrop-blur-sm transition ${
                isOpen
                  ? "border-cyan-400/30 bg-gradient-to-r from-cyan-500/10 to-blue-600/10"
                  : "border-blue-500/20 bg-[#1e293b]/40"
              }`}
            >
              <div className="p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  {/* Día y Toggle Abierto/Cerrado */}
                  <div className="flex items-center gap-4">
                    <div className="flex min-w-[120px] items-center gap-3">
                      <Clock className="h-5 w-5 text-cyan-400" />
                      <span className="font-medium text-white">{label}</span>
                    </div>

                    {/* Toggle Abierto/Cerrado */}
                    <button
                      onClick={() => handleToggleDia(key as keyof HorariosAtencion)}
                      className={`relative h-7 w-12 rounded-full transition ${
                        isOpen
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600"
                          : "bg-gray-600"
                      }`}
                    >
                      <motion.div
                        animate={{ x: isOpen ? 20 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-lg"
                      />
                    </button>

                    <span className={`text-sm ${isOpen ? "text-cyan-200" : "text-gray-400"}`}>
                      {isOpen ? "Abierto" : "Cerrado"}
                    </span>
                  </div>

                  {/* Configuración de horarios */}
                  {isOpen && (
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Toggle 24 horas */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle24h(key as keyof HorariosAtencion)}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                            is24h
                              ? "border-purple-400/40 bg-purple-500/20 text-purple-200"
                              : "border-blue-500/20 bg-[#1e293b]/40 text-blue-200/70 hover:border-purple-400/30"
                          }`}
                        >
                          24 Horas
                        </button>
                      </div>

                      {/* Selectores de hora */}
                      {!is24h && (
                        <>
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-blue-200/70">Apertura:</label>
                            <select
                              value={horarioDia.from}
                              onChange={(e) =>
                                handleChangeHorario(
                                  key as keyof HorariosAtencion,
                                  "from",
                                  e.target.value
                                )
                              }
                              className="rounded-lg border border-cyan-400/30 bg-[#1e293b]/60 px-3 py-2 text-sm text-white backdrop-blur-sm transition hover:border-cyan-400/50 focus:border-cyan-400/70 focus:outline-none"
                            >
                              <option value="">Seleccionar</option>
                              {opcionesHorario.map((hora) => (
                                <option key={hora} value={hora}>
                                  {hora}
                                </option>
                              ))}
                            </select>
                          </div>

                          <span className="text-blue-200/50">—</span>

                          <div className="flex items-center gap-2">
                            <label className="text-xs text-blue-200/70">Cierre:</label>
                            <select
                              value={horarioDia.to}
                              onChange={(e) =>
                                handleChangeHorario(
                                  key as keyof HorariosAtencion,
                                  "to",
                                  e.target.value
                                )
                              }
                              className="rounded-lg border border-cyan-400/30 bg-[#1e293b]/60 px-3 py-2 text-sm text-white backdrop-blur-sm transition hover:border-cyan-400/50 focus:border-cyan-400/70 focus:outline-none"
                            >
                              <option value="">Seleccionar</option>
                              {opcionesHorario.map((hora) => (
                                <option key={hora} value={hora}>
                                  {hora}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}

                      {/* Botón copiar */}
                      <motion.button
                        {...motionButtonProps}
                        onClick={() => handleCopiarHorario(key as keyof HorariosAtencion)}
                        className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200 backdrop-blur-sm transition hover:border-emerald-400/50 hover:bg-emerald-500/20"
                        title="Copiar este horario a todos los días"
                      >
                        <Copy className="h-4 w-4" />
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Mensaje de copiar */}
      {diaParaCopiar && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-2xl border border-yellow-400/40 bg-yellow-500/20 p-4 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <Copy className="h-5 w-5 text-yellow-200" />
            <span className="text-sm font-medium text-yellow-200">
              ¿Aplicar el horario de{" "}
              {DIAS_SEMANA.find((d) => d.key === diaParaCopiar)?.label} a todos los días?
            </span>
          </div>
          <div className="flex gap-2">
            <motion.button
              {...motionButtonProps}
              onClick={handleAplicarATodos}
              className="rounded-lg border border-emerald-400/40 bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-200 backdrop-blur-sm transition hover:border-emerald-400/60 hover:bg-emerald-500/30"
            >
              Sí, aplicar
            </motion.button>
            <motion.button
              {...motionButtonProps}
              onClick={() => setDiaParaCopiar(null)}
              className="rounded-lg border border-gray-400/40 bg-gray-500/20 px-4 py-2 text-sm font-medium text-gray-200 backdrop-blur-sm transition hover:border-gray-400/60 hover:bg-gray-500/30"
            >
              Cancelar
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Botón guardar */}
      <div className="flex justify-end pt-4">
        <motion.button
          {...motionButtonProps}
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 rounded-2xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 px-6 py-3 font-medium text-white shadow-lg shadow-cyan-500/20 backdrop-blur-sm transition hover:border-cyan-400/60 hover:from-cyan-500/40 hover:to-blue-600/40 hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          {loading ? "Guardando..." : "Guardar Horarios"}
        </motion.button>
      </div>
    </div>
  );
}
