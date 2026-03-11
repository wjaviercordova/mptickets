"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  TrendingUp,
  Car,
  CreditCard,
  Users,
  BarChart3,
  Calendar,
  Filter,
  Printer,
  Download,
  RefreshCcw,
  Loader2,
} from "lucide-react";
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { DatosReportes } from "./types";
import { ReporteConsolidado } from "./ReporteConsolidado";
import { ReporteOcupacion } from "./ReporteOcupacion";
import { ReporteTipoVehiculo } from "./ReporteTipoVehiculo";
import { ReporteMetodosPago } from "./ReporteMetodosPago";
import { ReporteProductividad } from "./ReporteProductividad";
import { ReporteEjecutivo } from "./ReporteEjecutivo";
import { ReporteImprimible } from "./ReporteImprimible";

interface ReportesFormProps {
  negocioId: string;
}

const tiposReporte = [
  {
    id: "ejecutivo",
    nombre: "Dashboard Ejecutivo",
    descripcion: "Vista general de KPIs y métricas clave",
    icon: BarChart3,
    color: "from-purple-500/20 to-pink-600/10",
    borderColor: "border-purple-400/30",
  },
  {
    id: "consolidado",
    nombre: "Ingresos Consolidado",
    descripcion: "Análisis completo de ingresos y tendencias",
    icon: TrendingUp,
    color: "from-emerald-500/20 to-green-600/10",
    borderColor: "border-emerald-400/30",
  },
  {
    id: "ocupacion",
    nombre: "Ocupación y Performance",
    descripcion: "Tasa de ocupación y horas pico",
    icon: BarChart3,
    color: "from-blue-500/20 to-cyan-600/10",
    borderColor: "border-blue-400/30",
  },
  {
    id: "vehiculos",
    nombre: "Análisis por Tipo de Vehículo",
    descripcion: "Distribución y preferencias de vehículos",
    icon: Car,
    color: "from-orange-500/20 to-amber-600/10",
    borderColor: "border-orange-400/30",
  },
  {
    id: "metodos_pago",
    nombre: "Métodos de Pago",
    descripcion: "Preferencias y distribución de pagos",
    icon: CreditCard,
    color: "from-cyan-500/20 to-blue-600/10",
    borderColor: "border-cyan-400/30",
  },
  {
    id: "productividad",
    nombre: "Productividad de Usuarios",
    descripcion: "Desempeño por operador del sistema",
    icon: Users,
    color: "from-indigo-500/20 to-purple-600/10",
    borderColor: "border-indigo-400/30",
  },
];

export function ReportesForm({ negocioId }: ReportesFormProps) {
  const { setHeaderInfo } = usePageHeader();

  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);

  const [tipoReporteSeleccionado, setTipoReporteSeleccionado] = useState("ejecutivo");
  const [fechaInicio, setFechaInicio] = useState(
    oneMonthAgo.toISOString().split("T")[0]
  );
  const [fechaFin, setFechaFin] = useState(today.toISOString().split("T")[0]);
  const [cargando, setCargando] = useState(false);
  const [datosReporte, setDatosReporte] = useState<DatosReportes | null>(null);

  useEffect(() => {
    setHeaderInfo({
      title: "Reportes",
      subtitle: "Análisis y métricas para toma de decisiones",
      icon: FileText,
    });
    return () => setHeaderInfo(null);
  }, [setHeaderInfo]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams({
        negocio_id: negocioId,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        tipo_reporte: tipoReporteSeleccionado,
      });

      const response = await fetch(`/api/reportes/datos-consolidados?${params}`);
      if (!response.ok) throw new Error("Error al cargar datos");

      const datos = await response.json();
      setDatosReporte(datos);
    } catch (error) {
      console.error("Error al cargar datos del reporte:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [negocioId, fechaInicio, fechaFin, tipoReporteSeleccionado]);

  const handleImprimir = () => {
    // Pequeño delay para asegurar que el DOM se actualice
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleDescargar = () => {
    // Usar la misma función de imprimir, el usuario puede "Guardar como PDF"
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handlerFechaRapida = (dias: number) => {
    const fin = new Date();
    const inicio = new Date();
    inicio.setDate(fin.getDate() - dias);
    setFechaInicio(inicio.toISOString().split("T")[0]);
    setFechaFin(fin.toISOString().split("T")[0]);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y controles */}
      <div className="print:hidden space-y-4">
        {/* Selector de tipo de reporte */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiposReporte.map((tipo) => {
            const Icon = tipo.icon;
            const isSelected = tipoReporteSeleccionado === tipo.id;

            return (
              <motion.button
                key={tipo.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTipoReporteSeleccionado(tipo.id)}
                className={`group relative overflow-hidden rounded-2xl border backdrop-blur-sm p-4 text-left transition ${
                  isSelected
                    ? `${tipo.borderColor} bg-gradient-to-br ${tipo.color} shadow-lg`
                    : "border-blue-500/20 bg-[#1e293b]/60 hover:border-cyan-400/40 hover:bg-[#1e293b]/80"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl border transition ${
                      isSelected
                        ? `${tipo.borderColor} ${tipo.color} shadow-lg`
                        : "border-blue-500/20 bg-blue-950/30 group-hover:border-cyan-400/40"
                    }`}
                  >
                    <Icon
                      className={`h-6 w-6 transition ${
                        isSelected ? "text-white" : "text-cyan-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-medium transition ${
                        isSelected ? "text-white" : "text-blue-100"
                      }`}
                    >
                      {tipo.nombre}
                    </h3>
                    <p
                      className={`text-sm transition ${
                        isSelected ? "text-white/80" : "text-blue-200/60"
                      }`}
                    >
                      {tipo.descripcion}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Barra de filtros */}
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-blue-500/20 bg-[#1e293b]/60 p-6 backdrop-blur-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 to-blue-600/20">
                <Filter className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Filtros del Reporte</h3>
                <p className="text-sm text-blue-200/60">Personaliza el período y criterios</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={cargarDatos}
                disabled={cargando}
                className="flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/25 to-green-600/15 px-4 py-2 text-sm font-medium text-emerald-200 backdrop-blur-sm transition hover:from-emerald-500/35 hover:to-green-600/25 disabled:opacity-50"
              >
                {cargando ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                Actualizar
              </motion.button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Fecha rápida */}
            <div>
              <label className="mb-2 block text-sm font-medium text-blue-200">
                Período rápido
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Hoy", dias: 0 },
                  { label: "Última semana", dias: 7 },
                  { label: "Último mes", dias: 30 },
                  { label: "Últimos 3 meses", dias: 90 },
                  { label: "Último año", dias: 365 },
                ].map((periodo) => (
                  <motion.button
                    key={periodo.label}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlerFechaRapida(periodo.dias)}
                    className="rounded-xl border border-blue-500/20 bg-blue-950/30 px-4 py-2 text-sm font-medium text-blue-200 backdrop-blur-sm transition hover:border-cyan-400/40 hover:bg-blue-900/40 hover:text-white"
                  >
                    {periodo.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Rango de fechas personalizado */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-blue-200">
                  <Calendar className="mr-2 inline h-4 w-4" />
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full rounded-xl border border-blue-500/30 bg-[#0f172a]/80 px-4 py-3 text-white backdrop-blur-sm transition focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-blue-200">
                  <Calendar className="mr-2 inline h-4 w-4" />
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full rounded-xl border border-blue-500/30 bg-[#0f172a]/80 px-4 py-3 text-white backdrop-blur-sm transition focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleImprimir}
            className="flex items-center gap-2 rounded-xl border border-blue-400/40 bg-gradient-to-r from-blue-500/25 to-cyan-600/15 px-4 py-2.5 text-sm font-medium text-blue-200 backdrop-blur-sm transition hover:from-blue-500/35 hover:to-cyan-600/25"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDescargar}
            className="flex items-center gap-2 rounded-xl border border-purple-400/40 bg-gradient-to-r from-purple-500/25 to-pink-600/15 px-4 py-2.5 text-sm font-medium text-purple-200 backdrop-blur-sm transition hover:from-purple-500/35 hover:to-pink-600/25"
          >
            <Download className="h-4 w-4" />
            Descargar PDF
          </motion.button>
        </div>
      </div>

      {/* Contenido del reporte */}
      <AnimatePresence mode="wait">
        {cargando ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[400px] items-center justify-center rounded-2xl border border-blue-500/20 bg-[#1e293b]/60 backdrop-blur-sm"
          >
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-cyan-400" />
              <p className="mt-4 text-sm text-blue-200">Generando reporte...</p>
            </div>
          </motion.div>
        ) : datosReporte ? (
          <motion.div
            key={tipoReporteSeleccionado}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {tipoReporteSeleccionado === "ejecutivo" && (
              <ReporteEjecutivo datos={datosReporte} fechaInicio={fechaInicio} fechaFin={fechaFin} />
            )}
            {tipoReporteSeleccionado === "consolidado" && (
              <ReporteConsolidado datos={datosReporte} fechaInicio={fechaInicio} fechaFin={fechaFin} />
            )}
            {tipoReporteSeleccionado === "ocupacion" && (
              <ReporteOcupacion datos={datosReporte} fechaInicio={fechaInicio} fechaFin={fechaFin} />
            )}
            {tipoReporteSeleccionado === "vehiculos" && (
              <ReporteTipoVehiculo datos={datosReporte} fechaInicio={fechaInicio} fechaFin={fechaFin} />
            )}
            {tipoReporteSeleccionado === "metodos_pago" && (
              <ReporteMetodosPago datos={datosReporte} fechaInicio={fechaInicio} fechaFin={fechaFin} />
            )}
            {tipoReporteSeleccionado === "productividad" && (
              <ReporteProductividad datos={datosReporte} fechaInicio={fechaInicio} fechaFin={fechaFin} />
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Componente para impresión - solo visible al imprimir */}
      {datosReporte && (
        <ReporteImprimible
          tipoReporte={tipoReporteSeleccionado}
          datos={datosReporte}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          nombreNegocio="MPTickets"
        />
      )}
    </div>
  );
}
