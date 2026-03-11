"use client";

import { motion } from "framer-motion";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { BaseReporteProps } from "./types";

type ReporteConsolidadoProps = BaseReporteProps;

const currencyFormatter = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export function ReporteConsolidado({ datos, fechaInicio, fechaFin }: ReporteConsolidadoProps) {
  const { resumen, porMetodoPago, tendenciaTemporal } = datos;

  // Calcular tendencia
  const mitad = Math.floor(tendenciaTemporal.length / 2);
  const primeraMetadIngresos = tendenciaTemporal
    .slice(0, mitad)
    .reduce((sum, d) => sum + d.ingresos, 0);
  const segundaMetadIngresos = tendenciaTemporal
    .slice(mitad)
    .reduce((sum, d) => sum + d.ingresos, 0);
  const cambio =
    primeraMetadIngresos > 0
      ? ((segundaMetadIngresos - primeraMetadIngresos) / primeraMetadIngresos) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="rounded-2xl border border-blue-500/20 bg-[#1e293b]/60 p-6 backdrop-blur-sm print:bg-white print:shadow-none">
        <h2 className="text-2xl font-bold text-white print:text-gray-900">
          Reporte de Ingresos Consolidado
        </h2>
        <p className="mt-1 text-sm text-blue-200 print:text-gray-600">
          Período: {new Date(fechaInicio).toLocaleDateString("es-EC")} -{" "}
          {new Date(fechaFin).toLocaleDateString("es-EC")}
        </p>
      </div>

      {/* Resumen ejecutivo */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 to-green-600/10 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/20 print:bg-emerald-100">
            <DollarSign className="h-6 w-6 text-emerald-400 print:text-emerald-600" />
          </div>
          <h3 className="text-sm font-medium text-blue-200 print:text-gray-600">
            Ingresos Brutos
          </h3>
          <p className="mt-2 text-3xl font-bold text-white print:text-gray-900">
            {currencyFormatter.format(resumen.totalCostos)}
          </p>
          <p className="mt-1 text-sm text-blue-300/80 print:text-gray-500">
            Antes de descuentos
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-red-400/30 bg-gradient-to-br from-red-500/20 to-pink-600/10 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-red-400/40 bg-red-500/20 print:bg-red-100">
            <TrendingDown className="h-6 w-6 text-red-400 print:text-red-600" />
          </div>
          <h3 className="text-sm font-medium text-blue-200 print:text-gray-600">
            Descuentos Otorgados
          </h3>
          <p className="mt-2 text-3xl font-bold text-white print:text-gray-900">
            {currencyFormatter.format(resumen.totalDescuentos)}
          </p>
          <p className="mt-1 text-sm text-blue-300/80 print:text-gray-500">
            {resumen.tasaDescuento.toFixed(1)}% del total
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 to-blue-600/10 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-500/20 print:bg-cyan-100">
            <TrendingUp className="h-6 w-6 text-cyan-400 print:text-cyan-600" />
          </div>
          <h3 className="text-sm font-medium text-blue-200 print:text-gray-600">
            Ingresos Netos
          </h3>
          <p className="mt-2 text-3xl font-bold text-white print:text-gray-900">
            {currencyFormatter.format(resumen.totalIngresos)}
          </p>
          <p className="mt-1 text-sm text-blue-300/80 print:text-gray-500">
            {resumen.totalRegistros} transacciones
          </p>
        </motion.div>
      </div>

      {/* Tendencia de cambio */}
      {cambio !== 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl border p-6 backdrop-blur-sm print:shadow ${
            cambio > 0
              ? "border-emerald-400/30 bg-gradient-to-r from-emerald-500/20 to-green-600/10"
              : "border-red-400/30 bg-gradient-to-r from-red-500/20 to-pink-600/10"
          }`}
        >
          <div className="flex items-center gap-4">
            {cambio > 0 ? (
              <TrendingUp className="h-8 w-8 text-emerald-400" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-400" />
            )}
            <div>
              <h3 className="text-lg font-medium text-white print:text-gray-900">
                {cambio > 0 ? "Crecimiento" : "Decrecimiento"} del {Math.abs(cambio).toFixed(1)}%
              </h3>
              <p className="text-sm text-blue-200/80 print:text-gray-600">
                Comparación entre la primera y segunda mitad del período
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Distribución por método de pago */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-blue-500/20 bg-[#1e293b]/60 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow"
      >
        <h3 className="mb-4 text-lg font-medium text-white print:text-gray-900">
          Distribución por Método de Pago
        </h3>
        <div className="space-y-4">
          {Object.entries(porMetodoPago)
            .sort(([, a], [, b]) => b.ingresos - a.ingresos)
            .map(([metodo, datos], index) => {
              const porcentaje = (datos.ingresos / resumen.totalIngresos) * 100;
              return (
                <div key={metodo}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-white print:text-gray-900">{metodo}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-blue-200 print:text-gray-600">
                        {datos.cantidad} transacciones
                      </span>
                      <span className="font-medium text-cyan-400 print:text-cyan-600">
                        {currencyFormatter.format(datos.ingresos)}
                      </span>
                    </div>
                  </div>
                  <div className="relative h-3 overflow-hidden rounded-full bg-blue-950/40 print:bg-gray-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${porcentaje}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 print:from-cyan-500 print:to-cyan-600"
                    />
                  </div>
                  <p className="mt-1 text-right text-xs text-blue-300/60 print:text-gray-500">
                    {porcentaje.toFixed(1)}%
                  </p>
                </div>
              );
            })}
        </div>
      </motion.div>

      {/* Tabla de ingresos diarios */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl border border-blue-500/20 bg-[#1e293b]/60 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow print:break-inside-avoid"
      >
        <h3 className="mb-4 text-lg font-medium text-white print:text-gray-900">
          Detalle de Ingresos Diarios
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-blue-500/20 print:border-gray-300">
                <th className="pb-3 text-left text-sm font-medium text-blue-200 print:text-gray-700">
                  Fecha
                </th>
                <th className="pb-3 text-right text-sm font-medium text-blue-200 print:text-gray-700">
                  Transacciones
                </th>
                <th className="pb-3 text-right text-sm font-medium text-blue-200 print:text-gray-700">
                  Ingresos
                </th>
                <th className="pb-3 text-right text-sm font-medium text-blue-200 print:text-gray-700">
                  Promedio
                </th>
              </tr>
            </thead>
            <tbody>
              {tendenciaTemporal
                .slice()
                .reverse()
                .map((dia) => (
                  <tr
                    key={dia.fecha}
                    className="border-b border-blue-500/10 print:border-gray-200"
                  >
                    <td className="py-3 text-sm text-white print:text-gray-900">
                      {new Date(dia.fecha).toLocaleDateString("es-EC", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-3 text-right text-sm text-blue-200 print:text-gray-600">
                      {dia.cantidad}
                    </td>
                    <td className="py-3 text-right font-medium text-white print:text-gray-900">
                      {currencyFormatter.format(dia.ingresos)}
                    </td>
                    <td className="py-3 text-right text-sm text-cyan-400 print:text-cyan-600">
                      {currencyFormatter.format(dia.ingresos / dia.cantidad)}
                    </td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-cyan-400/40 print:border-gray-400">
                <td className="pt-3 text-sm font-bold text-white print:text-gray-900">Total</td>
                <td className="pt-3 text-right text-sm font-bold text-white print:text-gray-900">
                  {resumen.totalRegistros}
                </td>
                <td className="pt-3 text-right text-xl font-bold text-cyan-400 print:text-cyan-600">
                  {currencyFormatter.format(resumen.totalIngresos)}
                </td>
                <td className="pt-3 text-right text-sm font-medium text-cyan-400 print:text-cyan-600">
                  {currencyFormatter.format(resumen.ingresoPromedio)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
