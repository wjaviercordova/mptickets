"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Save,
  Settings,
  DollarSign,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Palette,
  Printer,
} from "lucide-react";
import { TarifasTab } from "./TarifasTab";
import { AparienciaTab } from "./AparienciaTab";
import { ImpresionTab } from "./ImpresionTab";
import { HorariosTab } from "./HorariosTab";
import { type ThemeConfig, defaultThemeConfig } from "@/lib/theme-config";
import { usePageHeader } from "@/contexts/PageHeaderContext";

interface ParametroCompleto {
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

interface SistemaFormProps {
  negocioId: string;
  configActual: Record<string, string | number | boolean>;
  parametros: ParametroCompleto[];
}

type TabType = "general" | "tarifas" | "capacidad" | "horarios" | "impresion" | "apariencia";

export function SistemaForm({
  negocioId,
  configActual,
  parametros,
}: SistemaFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const { setHeaderInfo } = usePageHeader();

  // Setear información del header al montar el componente
  useEffect(() => {
    setHeaderInfo({
      icon: Settings,
      title: "Configuración",
      subtitle: "Parámetros del Sistema",
    });
    
    // Limpiar al desmontar
    return () => setHeaderInfo(null);
  }, [setHeaderInfo]);

  // Estados para Configuración General
  const [configGeneral, setConfigGeneral] = useState({
    tiempo_gracia_minutos: (configActual.tiempo_gracia_minutos as number) ?? 15,
    fraccion_cobro_minutos: (configActual.fraccion_cobro_minutos as number) ?? 30,
    tipo_redondeo: (configActual.tipo_redondeo as string) ?? "hacia_arriba",
    permitir_salida_sin_pago:
      (configActual.permitir_salida_sin_pago as boolean) ?? false,
    placa_obligatoria: (configActual.placa_obligatoria as boolean) ?? true,
    maximo_horas_parqueo: (configActual.maximo_horas_parqueo as number) ?? 24,
    alerta_ocupacion_porcentaje: (configActual.alerta_ocupacion_porcentaje as number) ?? 90,
    iva_porcentaje: (configActual.iva_porcentaje as number) ?? 12,
    aplicar_iva: (configActual.aplicar_iva as boolean) ?? false,
    prefijo_codigo: (configActual.prefijo_codigo as string) ?? "MP",
    longitud_codigo: (configActual.longitud_codigo as number) ?? 4,
    moneda: (configActual.moneda as string) ?? "USD",
    moneda_simbolo: (configActual.moneda_simbolo as string) ?? "$",
  });

  // Estados para Capacidad
  const [capacidad, setCapacidad] = useState({
    capacidad_total: (configActual.capacidad_total as number) ?? 100,
    capacidad_motos: (configActual.capacidad_motos as number) ?? 30,
    capacidad_autos: (configActual.capacidad_autos as number) ?? 50,
    capacidad_camionetas: (configActual.capacidad_camionetas as number) ?? 15,
    capacidad_pesados: (configActual.capacidad_pesados as number) ?? 5,
    espacios_reservados: (configActual.espacios_reservados as number) ?? 0,
  });

  const handleSaveGeneral = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/configuracion/sistema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "general",
          negocioId,
          data: configGeneral,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Configuración guardada exitosamente" });
      } else {
        setMessage({ type: "error", text: result.message || "Error al guardar" });
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCapacidad = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/configuracion/sistema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "capacidad",
          negocioId,
          data: capacidad,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Capacidad actualizada exitosamente" });
      } else {
        setMessage({ type: "error", text: result.message || "Error al guardar" });
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "general" as TabType, label: "General", icon: Settings },
    { id: "tarifas" as TabType, label: "Tarifas", icon: DollarSign },
    { id: "capacidad" as TabType, label: "Capacidad", icon: Building2 },
    { id: "horarios" as TabType, label: "Horarios", icon: Clock },
    { id: "impresion" as TabType, label: "Impresión", icon: Printer },
    { id: "apariencia" as TabType, label: "Apariencia", icon: Palette },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-2xl border px-6 py-3 font-medium backdrop-blur-sm transition ${
                isActive
                  ? "border-cyan-400/50 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-white shadow-lg shadow-cyan-500/20"
                  : "border-blue-500/20 bg-[#1e293b]/40 text-blue-100/80 hover:border-cyan-400/30 hover:bg-blue-500/20"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </motion.button>
          );
        })}
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

      {/* Contenido de tabs */}
      <div className="glass-card border border-blue-500/20 bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/80 p-8 backdrop-blur-xl shadow-xl shadow-blue-500/5">
        {activeTab === "general" && (
          <div className="space-y-6">
            <h3 className="font-heading text-xl text-white">Configuración General</h3>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Tiempo de Gracia */}
              <div>
                <label className="mb-2 block text-sm font-medium text-blue-200">
                  Tiempo de Gracia (minutos)
                </label>
                <input
                  type="number"
                  min="0"
                  value={configGeneral.tiempo_gracia_minutos}
                  onChange={(e) =>
                    setConfigGeneral({
                      ...configGeneral,
                      tiempo_gracia_minutos: parseInt(e.target.value) || 0,
                    })
                  }
                  className="glass-input w-full rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20"
                />
                <p className="mt-1 text-xs text-blue-300/60">Tiempo gratis inicial</p>
              </div>

              {/* Fracción de Cobro */}
              <div>
                <label className="mb-2 block text-sm font-medium text-blue-200">
                  Fracción de Cobro (minutos)
                </label>
                <select
                  value={configGeneral.fraccion_cobro_minutos}
                  onChange={(e) =>
                    setConfigGeneral({
                      ...configGeneral,
                      fraccion_cobro_minutos: parseInt(e.target.value),
                    })
                  }
                  className="glass-input w-full rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:shadow-lg focus:shadow-cyan-500/20"
                >
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="60">1 hora</option>
                </select>
              </div>

              {/* Tipo de Redondeo */}
              <div>
                <label className="mb-2 block text-sm font-medium text-blue-200">
                  Tipo de Redondeo
                </label>
                <select
                  value={configGeneral.tipo_redondeo}
                  onChange={(e) =>
                    setConfigGeneral({
                      ...configGeneral,
                      tipo_redondeo: e.target.value,
                    })
                  }
                  className="glass-input w-full rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:shadow-lg focus:shadow-cyan-500/20"
                >
                  <option value="hacia_arriba">Hacia Arriba</option>
                  <option value="hacia_abajo">Hacia Abajo</option>
                  <option value="exacto">Exacto</option>
                </select>
              </div>

              {/* Máximo de Horas */}
              <div>
                <label className="mb-2 block text-sm font-medium text-blue-200">
                  Máximo de Horas de Parqueo
                </label>
                <input
                  type="number"
                  min="0"
                  value={configGeneral.maximo_horas_parqueo}
                  onChange={(e) =>
                    setConfigGeneral({
                      ...configGeneral,
                      maximo_horas_parqueo: parseInt(e.target.value) || 0,
                    })
                  }
                  className="glass-input w-full rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20"
                />
              </div>

              {/* IVA */}
              <div>
                <label className="mb-2 block text-sm font-medium text-blue-200">
                  IVA (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={configGeneral.iva_porcentaje}
                  onChange={(e) =>
                    setConfigGeneral({
                      ...configGeneral,
                      iva_porcentaje: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="glass-input w-full rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20"
                />
              </div>

              {/* Alerta de Ocupación */}
              <div>
                <label className="mb-2 block text-sm font-medium text-blue-200">
                  Alerta de Ocupación (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={configGeneral.alerta_ocupacion_porcentaje}
                  onChange={(e) =>
                    setConfigGeneral({
                      ...configGeneral,
                      alerta_ocupacion_porcentaje: parseInt(e.target.value) || 0,
                    })
                  }
                  className="glass-input w-full rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20"
                />
              </div>

              {/* Prefijo de Código */}
              <div>
                <label className="mb-2 block text-sm font-medium text-blue-200">
                  Prefijo de Código
                </label>
                <input
                  type="text"
                  value={configGeneral.prefijo_codigo}
                  onChange={(e) =>
                    setConfigGeneral({
                      ...configGeneral,
                      prefijo_codigo: e.target.value.toUpperCase(),
                    })
                  }
                  className="glass-input w-full rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20"
                  maxLength={5}
                />
              </div>

              {/* Moneda */}
              <div>
                <label className="mb-2 block text-sm font-medium text-blue-200">
                  Moneda
                </label>
                <input
                  type="text"
                  value={configGeneral.moneda}
                  onChange={(e) =>
                    setConfigGeneral({
                      ...configGeneral,
                      moneda: e.target.value.toUpperCase(),
                    })
                  }
                  className="glass-input w-full rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20"
                  maxLength={3}
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={configGeneral.placa_obligatoria}
                  onChange={(e) =>
                    setConfigGeneral({
                      ...configGeneral,
                      placa_obligatoria: e.target.checked,
                    })
                  }
                  className="h-5 w-5 rounded border-blue-500/30 bg-[#1e293b]/60 text-cyan-500 focus:ring-2 focus:ring-cyan-500/50"
                />
                <span className="text-sm font-medium text-blue-200">
                  Placa obligatoria
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={configGeneral.aplicar_iva}
                  onChange={(e) =>
                    setConfigGeneral({
                      ...configGeneral,
                      aplicar_iva: e.target.checked,
                    })
                  }
                  className="h-5 w-5 rounded border-blue-500/30 bg-[#1e293b]/60 text-cyan-500 focus:ring-2 focus:ring-cyan-500/50"
                />
                <span className="text-sm font-medium text-blue-200">
                  Aplicar IVA
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={configGeneral.permitir_salida_sin_pago}
                  onChange={(e) =>
                    setConfigGeneral({
                      ...configGeneral,
                      permitir_salida_sin_pago: e.target.checked,
                    })
                  }
                  className="h-5 w-5 rounded border-blue-500/30 bg-[#1e293b]/60 text-cyan-500 focus:ring-2 focus:ring-cyan-500/50"
                />
                <span className="text-sm font-medium text-blue-200">
                  Permitir salida sin pago
                </span>
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveGeneral}
              disabled={loading}
              className="glass-button flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 px-6 py-3 font-semibold text-white backdrop-blur-xl transition hover:from-cyan-500/50 hover:to-blue-600/50 hover:shadow-xl hover:shadow-cyan-500/30 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {loading ? "Guardando..." : "Guardar Configuración General"}
            </motion.button>
          </div>
        )}

        {activeTab === "tarifas" && (
          <TarifasTab
            negocioId={negocioId}
            parametros={parametros}
            onUpdate={() => window.location.reload()}
          />
        )}

        {activeTab === "capacidad" && (
          <div className="space-y-6">
            <h3 className="font-heading text-xl text-white">
              Capacidad del Parqueadero
            </h3>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-blue-200">
                  Capacidad Total
                </label>
                <input
                  type="number"
                  min="0"
                  value={capacidad.capacidad_total}
                  onChange={(e) =>
                    setCapacidad({
                      ...capacidad,
                      capacidad_total: parseInt(e.target.value) || 0,
                    })
                  }
                  className="glass-input w-full rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:shadow-lg focus:shadow-cyan-500/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-blue-200">
                  Espacios para Motos
                </label>
                <input
                  type="number"
                  min="0"
                  value={capacidad.capacidad_motos}
                  onChange={(e) =>
                    setCapacidad({
                      ...capacidad,
                      capacidad_motos: parseInt(e.target.value) || 0,
                    })
                  }
                  className="glass-input w-full rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:shadow-lg focus:shadow-cyan-500/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-blue-200">
                  Espacios para Autos
                </label>
                <input
                  type="number"
                  min="0"
                  value={capacidad.capacidad_autos}
                  onChange={(e) =>
                    setCapacidad({
                      ...capacidad,
                      capacidad_autos: parseInt(e.target.value) || 0,
                    })
                  }
                  className="glass-input w-full rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:shadow-lg focus:shadow-cyan-500/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-blue-200">
                  Espacios para Camionetas
                </label>
                <input
                  type="number"
                  min="0"
                  value={capacidad.capacidad_camionetas}
                  onChange={(e) =>
                    setCapacidad({
                      ...capacidad,
                      capacidad_camionetas: parseInt(e.target.value) || 0,
                    })
                  }
                  className="glass-input w-full rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:shadow-lg focus:shadow-cyan-500/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-blue-200">
                  Espacios para Pesados
                </label>
                <input
                  type="number"
                  min="0"
                  value={capacidad.capacidad_pesados}
                  onChange={(e) =>
                    setCapacidad({
                      ...capacidad,
                      capacidad_pesados: parseInt(e.target.value) || 0,
                    })
                  }
                  className="glass-input w-full rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:shadow-lg focus:shadow-cyan-500/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-blue-200">
                  Espacios Reservados
                </label>
                <input
                  type="number"
                  min="0"
                  value={capacidad.espacios_reservados}
                  onChange={(e) =>
                    setCapacidad({
                      ...capacidad,
                      espacios_reservados: parseInt(e.target.value) || 0,
                    })
                  }
                  className="glass-input w-full rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:shadow-lg focus:shadow-cyan-500/20"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveCapacidad}
              disabled={loading}
              className="glass-button flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 px-6 py-3 font-semibold text-white backdrop-blur-xl transition hover:from-cyan-500/50 hover:to-blue-600/50 hover:shadow-xl hover:shadow-cyan-500/30 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {loading ? "Guardando..." : "Guardar Capacidad"}
            </motion.button>
          </div>
        )}

        {activeTab === "horarios" && (
          <HorariosTab
            horariosActuales={(configActual.horarios_atencion as string) ?? ""}
            onSave={async (horarios) => {
              setLoading(true);
              setMessage(null);

              try {
                const response = await fetch("/api/configuracion/sistema", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    tipo: "horarios",
                    negocioId,
                    data: {
                      horarios_atencion: JSON.stringify(horarios),
                    },
                  }),
                });

                const result = await response.json();

                if (!response.ok) {
                  throw new Error(result.message || "Error al guardar");
                }

                setMessage({
                  type: "success",
                  text: "Horarios actualizados exitosamente",
                });
                
                // Refrescar para obtener datos actualizados del servidor
                setTimeout(() => {
                  router.refresh();
                }, 500);
              } catch (error) {
                setMessage({
                  type: "error",
                  text: error instanceof Error ? error.message : "Error de conexión",
                });
                throw error;
              } finally {
                setLoading(false);
              }
            }}
          />
        )}

        {activeTab === "impresion" && (
          <ImpresionTab
            configActual={{
              habilitada: (configActual.impresion_habilitada as boolean) ?? true,
              cola_impresion: (configActual.impresion_cola as string) ?? "",
              nombre_impresora: (configActual.impresion_nombre as string) ?? "",
              ancho_papel: (configActual.impresion_ancho_papel as number) ?? 80,
              tipo_formato: (configActual.impresion_formato as "basico" | "detallado") ?? "basico",
              imprimir_logo: (configActual.impresion_logo as boolean) ?? true,
              imprimir_en_ingreso: (configActual.impresion_en_ingreso as boolean) ?? true,
              imprimir_en_pago: (configActual.impresion_en_pago as boolean) ?? true,
              copias_por_ticket: (configActual.impresion_copias as number) ?? 1,
            }}
            onSave={async (configImpresion) => {
              setLoading(true);
              setMessage(null);

              try {
                const response = await fetch("/api/configuracion/sistema", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    tipo: "impresion",
                    negocioId,
                    data: {
                      impresion_habilitada: configImpresion.habilitada,
                      impresion_cola: configImpresion.cola_impresion,
                      impresion_nombre: configImpresion.nombre_impresora,
                      impresion_ancho_papel: configImpresion.ancho_papel,
                      impresion_formato: configImpresion.tipo_formato,
                      impresion_logo: configImpresion.imprimir_logo,
                      impresion_en_ingreso: configImpresion.imprimir_en_ingreso,
                      impresion_en_pago: configImpresion.imprimir_en_pago,
                      impresion_copias: configImpresion.copias_por_ticket,
                    },
                  }),
                });

                const result = await response.json();

                if (response.ok) {
                  setMessage({
                    type: "success",
                    text: "Configuración de impresión actualizada exitosamente",
                  });
                } else {
                  setMessage({
                    type: "error",
                    text: result.message || "Error al guardar",
                  });
                }
              } catch {
                setMessage({ type: "error", text: "Error de conexión" });
              } finally {
                setLoading(false);
              }
            }}
          />
        )}

        {activeTab === "apariencia" && (
          <AparienciaTab
            configActual={
              configActual.tema_config
                ? (JSON.parse(configActual.tema_config as string) as ThemeConfig)
                : defaultThemeConfig
            }
            onSave={async (themeConfig) => {
              setLoading(true);
              setMessage(null);

              try {
                const response = await fetch("/api/configuracion/sistema", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    tipo: "apariencia",
                    negocioId,
                    data: { tema_config: JSON.stringify(themeConfig) },
                  }),
                });

                const result = await response.json();

                if (response.ok) {
                  setMessage({
                    type: "success",
                    text: "Apariencia actualizada exitosamente",
                  });
                } else {
                  setMessage({
                    type: "error",
                    text: result.message || "Error al guardar",
                  });
                }
              } catch {
                setMessage({ type: "error", text: "Error de conexión" });
              } finally {
                setLoading(false);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
