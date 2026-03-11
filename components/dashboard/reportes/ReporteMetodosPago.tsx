"use client";

import { motion } from "framer-motion";
import { CreditCard, DollarSign, TrendingUp, Percent } from "lucide-react";
import { BaseReporteProps } from "./types";

type ReporteMetodosPagoProps = BaseReporteProps;

const currencyFormatter = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export function ReporteMetodosPago({ datos, fechaInicio, fechaFin }: ReporteMetodosPagoProps) {
  const { resumen, porMetodoPago } = datos;

  const metodosOrdenados = Object.entries(porMetodoPago).sort(
    ([, a], [, b]) => b.ingresos - a.ingresos
  );

  const colores = [
    { gradient: "from-emerald-500 to-green-600", border: "border-emerald-400/30", text: "text-emerald-400" },
    { gradient: "from-blue-500 to-cyan-600", border: "border-blue-400/30", text: "text-blue-400" },
    { gradient: "from-purple-500 to-pink-600", border: "border-purple-400/30", text: "text-purple-400" },
    { gradient: "from-orange-500 to-amber-600", border: "border-orange-400/30", text: "text-orange-400" },
    { gradient: "from-red-500 to-pink-600", border: "border-red-400/30", text: "text-red-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="rounded-2xl border border-blue-500/20 bg-[#1e293b]/60 p-6 backdrop-blur-sm print:bg-white">
        <h2 className="text-2xl font-bold text-white print:text-gray-900">
          Reporte de Métodos de Pago
        </h2>
        <p className="mt-1 text-sm text-blue-200 print:text-gray-600">
          Período: {new Date(fechaInicio).toLocaleDateString("es-EC")} -{" "}
          {new Date(fechaFin).toLocaleDateString("es-EC")}
        </p>
      </div>

      {/* Resumen general */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 to-green-600/10 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/20">
            <DollarSign className="h-6 w-6 text-emerald-400" />
          </div>
          <h3 className="text-sm font-medium text-blue-200 print:text-gray-600">
            Ingresos Totales
          </h3>
          <p className="mt-2 text-3xl font-bold text-white print:text-gray-900">
            {currencyFormatter.format(resumen.totalIngresos)}
          </p>
          <p className="mt-1 text-sm text-blue-300/80 print:text-gray-500">
            Todos los métodos
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 to-blue-600/10 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-500/20">
            <CreditCard className="h-6 w-6 text-cyan-400" />
          </div>
          <h3 className="text-sm font-medium text-blue-200 print:text-gray-600">
            Métodos Disponibles
          </h3>
          <p className="mt-2 text-3xl font-bold text-white print:text-gray-900">
            {metodosOrdenados.length}
          </p>
          <p className="mt-1 text-sm text-blue-300/80 print:text-gray-500">
            Opciones de pago
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-500/20 to-pink-600/10 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-purple-400/40 bg-purple-500/20">
            <TrendingUp className="h-6 w-6 text-purple-400" />
          </div>
          <h3 className="text-sm font-medium text-blue-200 print:text-gray-600">
            Método Preferido
          </h3>
          <p className="mt-2 text-2xl font-bold text-white print:text-gray-900">
            {metodosOrdenados[0] ? metodosOrdenados[0][0] : "N/A"}
          </p>
          <p className="mt-1 text-sm text-blue-300/80 print:text-gray-500">
            {metodosOrdenados[0]
              ? (metodosOrdenados[0][1].ingresos / resumen.totalIngresos * 100).toFixed(1)
              : 0}% de ingresos
          </p>
        </motion.div>
      </div>

      {/* Distribución visual */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-blue-500/20 bg-[#1e293b]/60 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow"
      >
        <h3 className="mb-6 text-lg font-medium text-white print:text-gray-900">
          Distribución de Ingresos por Método
        </h3>
        <div className="space-y-6">
          {metodosOrdenados.map(([metodo, datos], index) => {
            const color = colores[index % colores.length];
            const porcentajeIngresos = (datos.ingresos / resumen.totalIngresos) * 100;
            const porcentajeCantidad = (datos.cantidad / resumen.totalRegistros) * 100;

            return (
              <motion.div
                key={metodo}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border ${color.border} bg-gradient-to-br ${color.gradient} bg-opacity-20`}
                    >
                      <CreditCard className={`h-5 w-5 ${color.text}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-white print:text-gray-900">{metodo}</h4>
                      <p className="text-sm text-blue-200/60 print:text-gray-600">
                        {datos.cantidad} transacciones
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white print:text-gray-900">
                      {currencyFormatter.format(datos.ingresos)}
                    </p>
                    <p className={`text-sm font-medium ${color.text}`}>
                      {porcentajeIngresos.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Barra de ingresos */}
                <div className="mb-2">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-blue-200/60 print:text-gray-500">Ingresos</span>
                    <span className={`font-medium ${color.text}`}>
                      {porcentajeIngresos.toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative h-3 overflow-hidden rounded-full bg-blue-950/40 print:bg-gray-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${porcentajeIngresos}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                      className={`h-full rounded-full bg-gradient-to-r ${color.gradient}`}
                    />
                  </div>
                </div>

                {/* Barra de transacciones */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-blue-200/60 print:text-gray-500">Transacciones</span>
                    <span className={`font-medium ${color.text}`}>
                      {porcentajeCantidad.toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-blue-950/40 print:bg-gray-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${porcentajeCantidad}%` }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                      className={`h-full rounded-full bg-gradient-to-r ${color.gradient} opacity-60`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Tabla comparativa */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="rounded-2xl border border-blue-500/20 bg-[#1e293b]/60 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow print:break-inside-avoid"
      >
        <h3 className="mb-4 text-lg font-medium text-white print:text-gray-900">
          Análisis Comparativo
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-blue-500/20 print:border-gray-300">
                <th className="pb-3 text-left text-sm font-medium text-blue-200 print:text-gray-700">
                  Método de Pago
                </th>
                <th className="pb-3 text-right text-sm font-medium text-blue-200 print:text-gray-700">
                  Transacciones
                </th>
                <th className="pb-3 text-right text-sm font-medium text-blue-200 print:text-gray-700">
                  % Trans.
                </th>
                <th className="pb-3 text-right text-sm font-medium text-blue-200 print:text-gray-700">
                  Ingresos
                </th>
                <th className="pb-3 text-right text-sm font-medium text-blue-200 print:text-gray-700">
                  % Ingresos
                </th>
                <th className="pb-3 text-right text-sm font-medium text-blue-200 print:text-gray-700">
                  Ticket Promedio
                </th>
              </tr>
            </thead>
            <tbody>
              {metodosOrdenados.map(([metodo, datos]) => {
                const porcentajeCantidad = (datos.cantidad / resumen.totalRegistros) * 100;
                const porcentajeIngresos = (datos.ingresos / resumen.totalIngresos) * 100;
                const ticketPromedio = datos.ingresos / datos.cantidad;

                return (
                  <tr
                    key={metodo}
                    className="border-b border-blue-500/10 print:border-gray-200"
                  >
                    <td className="py-3 text-sm font-medium text-white print:text-gray-900">
                      {metodo}
                    </td>
                    <td className="py-3 text-right text-sm text-blue-200 print:text-gray-600">
                      {datos.cantidad}
                    </td>
                    <td className="py-3 text-right text-sm text-cyan-400 print:text-cyan-600">
                      {porcentajeCantidad.toFixed(1)}%
                    </td>
                    <td className="py-3 text-right font-medium text-white print:text-gray-900">
                      {currencyFormatter.format(datos.ingresos)}
                    </td>
                    <td className="py-3 text-right text-sm text-emerald-400 print:text-emerald-600">
                      {porcentajeIngresos.toFixed(1)}%
                    </td>
                    <td className="py-3 text-right text-sm text-purple-400 print:text-purple-600">
                      {currencyFormatter.format(ticketPromedio)}
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
                <td className="pt-3 text-right text-sm font-bold text-emerald-400 print:text-emerald-600">
                  100%
                </td>
                <td className="pt-3 text-right text-sm font-medium text-purple-400 print:text-purple-600">
                  {currencyFormatter.format(resumen.ingresoPromedio)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500/20 to-blue-600/10 p-6 backdrop-blur-sm print:border-gray-300 print:bg-cyan-50 print:shadow"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-500/20">
            <Percent className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-cyan-200 print:text-cyan-900">
              Análisis de Preferencias
            </h3>
            <p className="mt-2 text-sm text-cyan-300/80 print:text-cyan-700">
              El método de pago más utilizado es <strong>{metodosOrdenados[0] ? metodosOrdenados[0][0] : "N/A"}</strong>,
              representando el{" "}
              <strong>
                {metodosOrdenados[0]
                  ? (metodosOrdenados[0][1].ingresos / resumen.totalIngresos * 100).toFixed(1)
                  : 0}%
              </strong>{" "}
              de los ingresos totales.
              {metodosOrdenados.length > 1 && (
                <>
                  {" "}Le sigue <strong>{metodosOrdenados[1][0]}</strong> con{" "}
                  <strong>
                    {(metodosOrdenados[1][1].ingresos / resumen.totalIngresos * 100).toFixed(1)}%
                  </strong>.
                </>
              )}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
