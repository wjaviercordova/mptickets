"use client";

import { motion } from "framer-motion";
import { Activity, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { BaseReporteProps } from "./types";

type ReporteOcupacionProps = BaseReporteProps;

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours <= 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
};

export function ReporteOcupacion({ datos, fechaInicio, fechaFin }: ReporteOcupacionProps) {
  const { resumen, porHora, porDiaSemana } = datos;

  // Calcular horas pico
  const horasPico = Object.entries(porHora)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const maxPorHora = Math.max(...Object.values(porHora));

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="rounded-2xl border border-blue-500/20 bg-[#1e293b]/60 p-6 backdrop-blur-sm print:bg-white">
        <h2 className="text-2xl font-bold text-white print:text-gray-900">
          Reporte de Ocupación y Performance
        </h2>
        <p className="mt-1 text-sm text-blue-200 print:text-gray-600">
          Período: {new Date(fechaInicio).toLocaleDateString("es-EC")} -{" "}
          {new Date(fechaFin).toLocaleDateString("es-EC")}
        </p>
      </div>

      {/* Métricas de ocupación */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-500/20 to-pink-600/10 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-purple-400/40 bg-purple-500/20">
            <Activity className="h-6 w-6 text-purple-400" />
          </div>
          <h3 className="text-sm font-medium text-blue-200 print:text-gray-600">
            Total de Vehículos
          </h3>
          <p className="mt-2 text-3xl font-bold text-white print:text-gray-900">
            {resumen.totalRegistros}
          </p>
          <p className="mt-1 text-sm text-blue-300/80 print:text-gray-500">
            Período completo
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 to-blue-600/10 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-500/20">
            <Clock className="h-6 w-6 text-cyan-400" />
          </div>
          <h3 className="text-sm font-medium text-blue-200 print:text-gray-600">
            Duración Promedio
          </h3>
          <p className="mt-2 text-3xl font-bold text-white print:text-gray-900">
            {formatDuration(resumen.duracionPromedio)}
          </p>
          <p className="mt-1 text-sm text-blue-300/80 print:text-gray-500">
            Por vehículo
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 to-green-600/10 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/20">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
          </div>
          <h3 className="text-sm font-medium text-blue-200 print:text-gray-600">
            Promedio Diario
          </h3>
          <p className="mt-2 text-3xl font-bold text-white print:text-gray-900">
            {Math.round(resumen.totalRegistros / Object.keys(porDiaSemana).length)}
          </p>
          <p className="mt-1 text-sm text-blue-300/80 print:text-gray-500">
            Vehículos por día
          </p>
        </motion.div>
      </div>

      {/* Distribución por hora del día */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-blue-500/20 bg-[#1e293b]/60 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow"
      >
        <h3 className="mb-6 text-lg font-medium text-white print:text-gray-900">
          Distribución de Ingresos por Hora del Día
        </h3>
        <div className="relative h-64 print:h-48">
          <div className="flex h-full items-end justify-around gap-1">
            {Array.from({ length: 24 }, (_, i) => i).map((hora) => {
              const cantidad = porHora[hora] || 0;
              const alturaPorcentaje = maxPorHora > 0 ? (cantidad / maxPorHora) * 100 : 0;
              const esPico = horasPico.some(([h]) => Number(h) === hora);

              return (
                <div key={hora} className="flex flex-1 flex-col items-center gap-2">
                  <div className="relative w-full">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(alturaPorcentaje, 5)}%` }}
                      transition={{ delay: 0.4 + hora * 0.02, duration: 0.3 }}
                      className={`w-full rounded-t transition-colors ${
                        esPico
                          ? "bg-gradient-to-t from-emerald-500 to-green-400"
                          : "bg-gradient-to-t from-blue-500 to-cyan-400"
                      }`}
                      style={{ minHeight: cantidad > 0 ? "8px" : "2px" }}
                      title={`${hora}:00 - ${cantidad} vehículos`}
                    />
                  </div>
                  <span className="text-xs text-blue-300/60 print:text-gray-500">
                    {hora}h
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Horas pico */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 to-green-600/10 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/20">
            <AlertCircle className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-medium text-white print:text-gray-900">Horas Pico</h3>
            <p className="text-sm text-blue-200/60 print:text-gray-600">
              Mayor concentración de vehículos
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {horasPico.map(([hora, cantidad]) => (
            <div
              key={hora}
              className="rounded-xl border border-emerald-400/20 bg-emerald-950/20 p-4 text-center print:border-gray-200 print:bg-gray-50"
            >
              <p className="text-2xl font-bold text-emerald-400 print:text-emerald-600">
                {hora}:00
              </p>
              <p className="mt-1 text-sm text-blue-200 print:text-gray-600">
                {cantidad} vehículos
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Distribución por día de la semana */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl border border-blue-500/20 bg-[#1e293b]/60 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow print:break-inside-avoid"
      >
        <h3 className="mb-4 text-lg font-medium text-white print:text-gray-900">
          Actividad por Día de la Semana
        </h3>
        <div className="space-y-4">
          {Object.entries(porDiaSemana)
            .sort(([, a], [, b]) => b.cantidad - a.cantidad)
            .map(([dia, datos], index) => {
              const esDiaActivo = index < 3;
              return (
                <div key={dia}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-white print:text-gray-900">{dia}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-blue-200 print:text-gray-600">
                        {datos.cantidad} vehículos
                      </span>
                      {esDiaActivo && (
                        <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-400 print:bg-emerald-100 print:text-emerald-700">
                          Alta actividad
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-blue-950/40 print:bg-gray-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(datos.cantidad / resumen.totalRegistros) * 100}%`,
                      }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                      className={`h-full rounded-full ${
                        esDiaActivo
                          ? "bg-gradient-to-r from-emerald-500 to-green-600"
                          : "bg-gradient-to-r from-cyan-500 to-blue-600"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </motion.div>
    </div>
  );
}
