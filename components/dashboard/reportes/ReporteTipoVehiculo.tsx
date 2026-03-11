"use client";

import { motion } from "framer-motion";
import { Car } from "lucide-react";
import { BaseReporteProps } from "./types";

type ReporteTipoVehiculoProps = BaseReporteProps;

const currencyFormatter = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours <= 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
};

export function ReporteTipoVehiculo({ datos, fechaInicio, fechaFin }: ReporteTipoVehiculoProps) {
  const { resumen, porTipoVehiculo } = datos;

  const tiposOrdenados = Object.entries(porTipoVehiculo).sort(
    ([, a], [, b]) => b.cantidad - a.cantidad
  );

  const colores = [
    { gradient: "from-blue-500 to-cyan-600", border: "border-blue-400/30" },
    { gradient: "from-purple-500 to-pink-600", border: "border-purple-400/30" },
    { gradient: "from-emerald-500 to-green-600", border: "border-emerald-400/30" },
    { gradient: "from-orange-500 to-amber-600", border: "border-orange-400/30" },
    { gradient: "from-red-500 to-pink-600", border: "border-red-400/30" },
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="rounded-2xl border border-blue-500/20 bg-[#1e293b]/60 p-6 backdrop-blur-sm print:bg-white">
        <h2 className="text-2xl font-bold text-white print:text-gray-900">
          Análisis por Tipo de Vehículo
        </h2>
        <p className="mt-1 text-sm text-blue-200 print:text-gray-600">
          Período: {new Date(fechaInicio).toLocaleDateString("es-EC")} -{" "}
          {new Date(fechaFin).toLocaleDateString("es-EC")}
        </p>
      </div>

      {/* Distribución visual (gráfico de dona conceptual) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gráfico circular conceptual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-blue-500/20 bg-[#1e293b]/60 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow"
        >
          <h3 className="mb-6 text-lg font-medium text-white print:text-gray-900">
            Distribución de Vehículos
          </h3>
          <div className="flex h-64 items-center justify-center">
            <div className="relative h-48 w-48">
              {tiposOrdenados.map(([tipo, datos], index) => {
                const porcentaje = (datos.cantidad / resumen.totalRegistros) * 100;
                const color = colores[index % colores.length];
                const offset = tiposOrdenados
                  .slice(0, index)
                  .reduce((sum, [, d]) => sum + (d.cantidad / resumen.totalRegistros) * 100, 0);

                return (
                  <svg
                    key={tipo}
                    className="absolute inset-0 h-full w-full -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="20"
                      strokeDasharray={`${porcentaje * 2.51} ${251.2 - porcentaje * 2.51}`}
                      strokeDashoffset={-offset * 2.51}
                      className={`text-transparent bg-gradient-to-r ${color.gradient}`}
                      style={{
                        stroke: index === 0 ? "#3b82f6" : index === 1 ? "#a855f7" : index === 2 ? "#10b981" : index === 3 ? "#f97316" : "#ef4444",
                      }}
                    />
                  </svg>
                );
              })}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white print:text-gray-900">
                    {resumen.totalRegistros}
                  </p>
                  <p className="text-sm text-blue-200 print:text-gray-600">Total</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {tiposOrdenados.slice(0, 4).map(([tipo, datos], index) => {
              const color = colores[index % colores.length];
              const porcentaje = (datos.cantidad / resumen.totalRegistros) * 100;
              return (
                <div key={tipo} className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full bg-gradient-to-r ${color.gradient}`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white print:text-gray-900">{tipo}</p>
                    <p className="text-xs text-blue-200/60 print:text-gray-500">
                      {porcentaje.toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Estadísticas detalladas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-blue-500/20 bg-[#1e293b]/60 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow"
        >
          <h3 className="mb-6 text-lg font-medium text-white print:text-gray-900">
            Métricas por Tipo
          </h3>
          <div className="space-y-4">
            {tiposOrdenados.map(([tipo, datos], index) => {
              const color = colores[index % colores.length];
              const porcentaje = (datos.cantidad / resumen.totalRegistros) * 100;
              return (
                <motion.div
                  key={tipo}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className={`rounded-xl border ${color.border} bg-gradient-to-r ${color.gradient} bg-opacity-10 p-4 backdrop-blur-sm print:border-gray-200 print:bg-white`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Car className="h-5 w-5 text-white print:text-gray-700" />
                      <span className="font-medium text-white print:text-gray-900">{tipo}</span>
                    </div>
                    <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white print:bg-gray-100 print:text-gray-700">
                      {porcentaje.toFixed(1)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-blue-200/60 print:text-gray-500">Cantidad</p>
                      <p className="font-medium text-white print:text-gray-900">{datos.cantidad}</p>
                    </div>
                    <div>
                      <p className="text-blue-200/60 print:text-gray-500">Ingresos</p>
                      <p className="font-medium text-white print:text-gray-900">
                        {currencyFormatter.format(datos.ingresos)}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-200/60 print:text-gray-500">Duración</p>
                      <p className="font-medium text-white print:text-gray-900">
                        {formatDuration(datos.duracionPromedio || 0)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Tabla comparativa detallada */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl border border-blue-500/20 bg-[#1e293b]/60 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow print:break-inside-avoid"
      >
        <h3 className="mb-4 text-lg font-medium text-white print:text-gray-900">
          Comparativa Detallada
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-blue-500/20 print:border-gray-300">
                <th className="pb-3 text-left text-sm font-medium text-blue-200 print:text-gray-700">
                  Tipo de Vehículo
                </th>
                <th className="pb-3 text-right text-sm font-medium text-blue-200 print:text-gray-700">
                  Cantidad
                </th>
                <th className="pb-3 text-right text-sm font-medium text-blue-200 print:text-gray-700">
                  % Total
                </th>
                <th className="pb-3 text-right text-sm font-medium text-blue-200 print:text-gray-700">
                  Ingresos
                </th>
                <th className="pb-3 text-right text-sm font-medium text-blue-200 print:text-gray-700">
                  Promedio
                </th>
                <th className="pb-3 text-right text-sm font-medium text-blue-200 print:text-gray-700">
                  Duración
                </th>
                <th className="pb-3 text-right text-sm font-medium text-blue-200 print:text-gray-700">
                  Descuentos
                </th>
              </tr>
            </thead>
            <tbody>
              {tiposOrdenados.map(([tipo, datos]) => {
                const porcentaje = (datos.cantidad / resumen.totalRegistros) * 100;
                return (
                  <tr
                    key={tipo}
                    className="border-b border-blue-500/10 print:border-gray-200"
                  >
                    <td className="py-3 text-sm font-medium text-white print:text-gray-900">
                      {tipo}
                    </td>
                    <td className="py-3 text-right text-sm text-blue-200 print:text-gray-600">
                      {datos.cantidad}
                    </td>
                    <td className="py-3 text-right text-sm text-cyan-400 print:text-cyan-600">
                      {porcentaje.toFixed(1)}%
                    </td>
                    <td className="py-3 text-right font-medium text-white print:text-gray-900">
                      {currencyFormatter.format(datos.ingresos)}
                    </td>
                    <td className="py-3 text-right text-sm text-blue-200 print:text-gray-600">
                      {currencyFormatter.format(datos.ingresos / datos.cantidad)}
                    </td>
                    <td className="py-3 text-right text-sm text-purple-400 print:text-purple-600">
                      {formatDuration(datos.duracionPromedio || 0)}
                    </td>
                    <td className="py-3 text-right text-sm text-orange-400 print:text-orange-600">
                      {currencyFormatter.format(datos.descuentos)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-cyan-400/40 print:border-gray-400">
                <td className="pt-3 text-sm font-bold text-white print:text-gray-900">Total</td>
                <td className="pt-3 text-right text-sm font-bold text-white print:text-gray-900">
                  {resumen.totalRegistros}
                </td>
                <td className="pt-3 text-right text-sm font-bold text-cyan-400 print:text-cyan-600">
                  100%
                </td>
                <td className="pt-3 text-right text-xl font-bold text-cyan-400 print:text-cyan-600">
                  {currencyFormatter.format(resumen.totalIngresos)}
                </td>
                <td className="pt-3 text-right text-sm font-medium text-blue-200 print:text-gray-600">
                  {currencyFormatter.format(resumen.ingresoPromedio)}
                </td>
                <td className="pt-3 text-right text-sm font-medium text-purple-400 print:text-purple-600">
                  {formatDuration(resumen.duracionPromedio)}
                </td>
                <td className="pt-3 text-right text-sm font-medium text-orange-400 print:text-orange-600">
                  {currencyFormatter.format(resumen.totalDescuentos)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
