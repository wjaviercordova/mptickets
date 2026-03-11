"use client";

import { motion } from "framer-motion";
import { Users, TrendingUp, Award, DollarSign } from "lucide-react";
import { BaseReporteProps } from "./types";

type ReporteProductividadProps = BaseReporteProps;

const currencyFormatter = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export function ReporteProductividad({ datos, fechaInicio, fechaFin }: ReporteProductividadProps) {
  const { resumen, porUsuario } = datos;

  const usuariosOrdenados = Object.entries(porUsuario)
    .filter(([id]) => id !== "Sin asignar")
    .sort(([, a], [, b]) => b.transacciones - a.transacciones);

  const topPerformers = usuariosOrdenados.slice(0, 3);

  const colores = [
    { gradient: "from-emerald-500 to-green-600", border: "border-emerald-400/30", text: "text-emerald-400", bg: "bg-emerald-500/20" },
    { gradient: "from-blue-500 to-cyan-600", border: "border-blue-400/30", text: "text-blue-400", bg: "bg-blue-500/20" },
    { gradient: "from-purple-500 to-pink-600", border: "border-purple-400/30", text: "text-purple-400", bg: "bg-purple-500/20" },
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="rounded-2xl border border-blue-500/20 bg-[#1e293b]/60 p-6 backdrop-blur-sm print:bg-white">
        <h2 className="text-2xl font-bold text-white print:text-gray-900">
          Reporte de Productividad de Usuarios
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
          className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 to-blue-600/10 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-500/20">
            <Users className="h-6 w-6 text-cyan-400" />
          </div>
          <h3 className="text-sm font-medium text-blue-200 print:text-gray-600">
            Usuarios Activos
          </h3>
          <p className="mt-2 text-3xl font-bold text-white print:text-gray-900">
            {usuariosOrdenados.length}
          </p>
          <p className="mt-1 text-sm text-blue-300/80 print:text-gray-500">
            Operadores del sistema
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 to-green-600/10 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/20">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
          </div>
          <h3 className="text-sm font-medium text-blue-200 print:text-gray-600">
            Promedio por Usuario
          </h3>
          <p className="mt-2 text-3xl font-bold text-white print:text-gray-900">
            {Math.round(resumen.totalRegistros / usuariosOrdenados.length)}
          </p>
          <p className="mt-1 text-sm text-blue-300/80 print:text-gray-500">
            Transacciones
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-500/20 to-pink-600/10 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-purple-400/40 bg-purple-500/20">
            <DollarSign className="h-6 w-6 text-purple-400" />
          </div>
          <h3 className="text-sm font-medium text-blue-200 print:text-gray-600">
            Ingresos Promedio
          </h3>
          <p className="mt-2 text-3xl font-bold text-white print:text-gray-900">
            {currencyFormatter.format(resumen.totalIngresos / usuariosOrdenados.length)}
          </p>
          <p className="mt-1 text-sm text-blue-300/80 print:text-gray-500">
            Por usuario
          </p>
        </motion.div>
      </div>

      {/* Top 3 performers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-blue-500/20 bg-[#1e293b]/60 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-500/20 to-yellow-600/10">
            <Award className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white print:text-gray-900">
              Top 3 Mejores Performers
            </h3>
            <p className="text-sm text-blue-200/60 print:text-gray-600">
              Usuarios con mayor volumen de transacciones
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {topPerformers.map(([usuarioId, datos], index) => {
            const color = colores[index];
            const porcentaje = (datos.transacciones / resumen.totalRegistros) * 100;

            return (
              <motion.div
                key={usuarioId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={`relative overflow-hidden rounded-2xl border ${color.border} bg-gradient-to-br ${color.gradient} bg-opacity-10 p-6 backdrop-blur-sm print:border-gray-200 print:bg-white`}
              >
                {/* Medalla de posición */}
                <div className="absolute right-4 top-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border ${color.border} ${color.bg}`}
                  >
                    <span className={`text-lg font-bold ${color.text}`}>#{index + 1}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-blue-200/60 print:text-gray-500">Usuario ID</p>
                  <p className="text-lg font-medium text-white print:text-gray-900">
                    {usuarioId.substring(0, 8)}...
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-blue-200/60 print:text-gray-500">Transacciones</p>
                    <p className={`text-2xl font-bold ${color.text}`}>
                      {datos.transacciones}
                    </p>
                    <p className="text-xs text-blue-300/60 print:text-gray-500">
                      {porcentaje.toFixed(1)}% del total
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-blue-200/60 print:text-gray-500">Ingresos Generados</p>
                    <p className="text-lg font-medium text-white print:text-gray-900">
                      {currencyFormatter.format(datos.ingresos)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-blue-200/60 print:text-gray-500">Descuentos Otorgados</p>
                    <p className="text-sm text-orange-400 print:text-orange-600">
                      {currencyFormatter.format(datos.descuentos)}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Tabla completa de usuarios */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="rounded-2xl border border-blue-500/20 bg-[#1e293b]/60 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow print:break-inside-avoid"
      >
        <h3 className="mb-4 text-lg font-medium text-white print:text-gray-900">
          Detalle por Usuario
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-blue-500/20 print:border-gray-300">
                <th className="pb-3 text-left text-sm font-medium text-blue-200 print:text-gray-700">
                  Usuario
                </th>
                <th className="pb-3 text-right text-sm font-medium text-blue-200 print:text-gray-700">
                  Transacciones
                </th>
                <th className="pb-3 text-right text-sm font-medium text-blue-200 print:text-gray-700">
                  % Participación
                </th>
                <th className="pb-3 text-right text-sm font-medium text-blue-200 print:text-gray-700">
                  Ingresos Generados
                </th>
                <th className="pb-3 text-right text-sm font-medium text-blue-200 print:text-gray-700">
                  Ticket Promedio
                </th>
                <th className="pb-3 text-right text-sm font-medium text-blue-200 print:text-gray-700">
                  Descuentos
                </th>
                <th className="pb-3 text-right text-sm font-medium text-blue-200 print:text-gray-700">
                  % Descuento
                </th>
              </tr>
            </thead>
            <tbody>
              {usuariosOrdenados.map(([usuarioId, datos], index) => {
                const porcentaje = (datos.transacciones / resumen.totalRegistros) * 100;
                const ticketPromedio = datos.ingresos / datos.transacciones;
                const tasaDescuento =
                  datos.ingresos > 0 ? (datos.descuentos / (datos.ingresos + datos.descuentos)) * 100 : 0;
                const isTop3 = index < 3;

                return (
                  <tr
                    key={usuarioId}
                    className={`border-b border-blue-500/10 print:border-gray-200 ${
                      isTop3 ? "bg-cyan-500/5 print:bg-cyan-50" : ""
                    }`}
                  >
                    <td className="py-3 text-sm font-medium text-white print:text-gray-900">
                      <div className="flex items-center gap-2">
                        {isTop3 && (
                          <Award className="h-4 w-4 text-amber-400" />
                        )}
                        {usuarioId.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="py-3 text-right text-sm text-blue-200 print:text-gray-600">
                      {datos.transacciones}
                    </td>
                    <td className="py-3 text-right text-sm text-cyan-400 print:text-cyan-600">
                      {porcentaje.toFixed(1)}%
                    </td>
                    <td className="py-3 text-right font-medium text-white print:text-gray-900">
                      {currencyFormatter.format(datos.ingresos)}
                    </td>
                    <td className="py-3 text-right text-sm text-emerald-400 print:text-emerald-600">
                      {currencyFormatter.format(ticketPromedio)}
                    </td>
                    <td className="py-3 text-right text-sm text-orange-400 print:text-orange-600">
                      {currencyFormatter.format(datos.descuentos)}
                    </td>
                    <td className="py-3 text-right text-sm text-red-400 print:text-red-600">
                      {tasaDescuento.toFixed(1)}%
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
                <td className="pt-3 text-right text-sm font-medium text-emerald-400 print:text-emerald-600">
                  {currencyFormatter.format(resumen.ingresoPromedio)}
                </td>
                <td className="pt-3 text-right text-sm font-medium text-orange-400 print:text-orange-600">
                  {currencyFormatter.format(resumen.totalDescuentos)}
                </td>
                <td className="pt-3 text-right text-sm font-medium text-red-400 print:text-red-600">
                  {resumen.tasaDescuento.toFixed(1)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
