"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Car,
  Clock,
  AlertCircle,
  TrendingDown,
  Percent,
} from "lucide-react";
import { BaseReporteProps } from "./types";

type ReporteEjecutivoProps = BaseReporteProps;

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

export function ReporteEjecutivo({ datos, fechaInicio, fechaFin }: ReporteEjecutivoProps) {
  const { resumen, porTipoVehiculo, porMetodoPago, tendenciaTemporal } = datos;

  // Calcular métricas adicionales
  const tipoMasUsado = Object.entries(porTipoVehiculo).sort(
    ([, a], [, b]) => b.cantidad - a.cantidad
  )[0];

  const metodoPagoPreferido = Object.entries(porMetodoPago).sort(
    ([, a], [, b]) => b.ingresos - a.ingresos
  )[0];

  // Calcular crecimiento (comparando primera mitad vs segunda mitad del período)
  const mitad = Math.floor(tendenciaTemporal.length / 2);
  const primeraMetadIngresos = tendenciaTemporal
    .slice(0, mitad)
    .reduce((sum, d) => sum + d.ingresos, 0);
  const segundaMetadIngresos = tendenciaTemporal
    .slice(mitad)
    .reduce((sum, d) => sum + d.ingresos, 0);
  const crecimiento =
    primeraMetadIngresos > 0
      ? ((segundaMetadIngresos - primeraMetadIngresos) / primeraMetadIngresos) * 100
      : 0;

  const kpis = [
    {
      title: "Ingresos Totales",
      value: currencyFormatter.format(resumen.totalIngresos),
      description: `${resumen.totalRegistros} transacciones`,
      icon: DollarSign,
      color: "from-emerald-500/20 to-green-600/10",
      borderColor: "border-emerald-400/30",
      trend: crecimiento,
    },
    {
      title: "Ingreso Promedio",
      value: currencyFormatter.format(resumen.ingresoPromedio),
      description: "Por transacción",
      icon: TrendingUp,
      color: "from-blue-500/20 to-cyan-600/10",
      borderColor: "border-blue-400/30",
    },
    {
      title: "Duración Promedio",
      value: formatDuration(resumen.duracionPromedio),
      description: "Tiempo de estadía",
      icon: Clock,
      color: "from-purple-500/20 to-pink-600/10",
      borderColor: "border-purple-400/30",
    },
    {
      title: "Tasa de Descuento",
      value: `${resumen.tasaDescuento.toFixed(1)}%`,
      description: currencyFormatter.format(resumen.totalDescuentos),
      icon: Percent,
      color: "from-orange-500/20 to-amber-600/10",
      borderColor: "border-orange-400/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado del reporte */}
      <div className="print:border-b print:border-gray-300 print:pb-4 rounded-2xl border border-blue-500/20 bg-[#1e293b]/60 p-6 backdrop-blur-sm print:bg-white print:shadow-none">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white print:text-gray-900">
              Dashboard Ejecutivo
            </h2>
            <p className="mt-1 text-sm text-blue-200 print:text-gray-600">
              {new Date(fechaInicio).toLocaleDateString("es-EC", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              -{" "}
              {new Date(fechaFin).toLocaleDateString("es-EC", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          {crecimiento !== 0 && (
            <div
              className={`flex items-center gap-2 rounded-xl px-4 py-2 ${
                crecimiento > 0
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-red-500/20 text-red-400"
              } print:bg-gray-100`}
            >
              {crecimiento > 0 ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              <span className="font-bold">{crecimiento > 0 ? "+" : ""}{crecimiento.toFixed(1)}%</span>
              <span className="text-sm opacity-80">vs período anterior</span>
            </div>
          )}
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`group relative overflow-hidden rounded-2xl border ${kpi.borderColor} bg-gradient-to-br ${kpi.color} p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border ${kpi.borderColor} ${kpi.color} shadow-lg print:bg-gray-100`}
                >
                  <Icon className="h-6 w-6 text-white print:text-gray-700" />
                </div>
                {kpi.trend !== undefined && kpi.trend !== 0 && (
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      kpi.trend > 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {kpi.trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {kpi.trend > 0 ? "+" : ""}{kpi.trend.toFixed(1)}%
                  </div>
                )}
              </div>
              <h3 className="text-sm font-medium text-blue-200 print:text-gray-600">
                {kpi.title}
              </h3>
              <p className="mt-2 text-2xl font-bold text-white print:text-gray-900">
                {kpi.value}
              </p>
              <p className="mt-1 text-sm text-blue-300/80 print:text-gray-500">
                {kpi.description}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Insights clave */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tipo de vehículo más usado */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-blue-500/20 bg-[#1e293b]/60 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-400/40 bg-gradient-to-br from-orange-500/20 to-amber-600/10 print:bg-orange-100">
              <Car className="h-5 w-5 text-orange-400 print:text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium text-white print:text-gray-900">Tipo de Vehículo más Frecuente</h3>
              <p className="text-sm text-blue-200/60 print:text-gray-600">Mayor volumen de transacciones</p>
            </div>
          </div>
          <div className="rounded-xl border border-orange-400/20 bg-orange-950/20 p-4 print:border-gray-200 print:bg-gray-50">
            <p className="text-3xl font-bold text-orange-400 print:text-orange-600">
              {tipoMasUsado ? tipoMasUsado[0] : "N/A"}
            </p>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-blue-300 print:text-gray-600">
                {tipoMasUsado ? tipoMasUsado[1].cantidad : 0} transacciones
              </span>
              <span className="font-medium text-orange-400 print:text-orange-600">
                {tipoMasUsado
                  ? currencyFormatter.format(tipoMasUsado[1].ingresos)
                  : "$0.00"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Método de pago preferido */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-blue-500/20 bg-[#1e293b]/60 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 to-blue-600/10 print:bg-cyan-100">
              <DollarSign className="h-5 w-5 text-cyan-400 print:text-cyan-600" />
            </div>
            <div>
              <h3 className="font-medium text-white print:text-gray-900">Método de Pago Preferido</h3>
              <p className="text-sm text-blue-200/60 print:text-gray-600">Mayor volumen de ingresos</p>
            </div>
          </div>
          <div className="rounded-xl border border-cyan-400/20 bg-cyan-950/20 p-4 print:border-gray-200 print:bg-gray-50">
            <p className="text-3xl font-bold text-cyan-400 print:text-cyan-600">
              {metodoPagoPreferido ? metodoPagoPreferido[0] : "N/A"}
            </p>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-blue-300 print:text-gray-600">
                {metodoPagoPreferido ? metodoPagoPreferido[1].cantidad : 0} transacciones
              </span>
              <span className="font-medium text-cyan-400 print:text-cyan-600">
                {metodoPagoPreferido
                  ? currencyFormatter.format(metodoPagoPreferido[1].ingresos)
                  : "$0.00"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Gráfico de tendencia */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl border border-blue-500/20 bg-[#1e293b]/60 p-6 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow print:break-inside-avoid"
      >
        <h3 className="mb-4 font-medium text-white print:text-gray-900">
          Tendencia de Ingresos
        </h3>
        <div className="relative h-64">
          {tendenciaTemporal && tendenciaTemporal.length > 0 ? (
            <svg
              className="h-full w-full"
              viewBox="0 0 800 256"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Área bajo la curva */}
              <path
                d={(() => {
                  const padding = 40;
                  const width = 800;
                  const height = 256;
                  const maxIngreso = Math.max(...tendenciaTemporal.map((d) => d.ingresos));

                  const points = tendenciaTemporal.map((d, i) => {
                    const x = tendenciaTemporal.length === 1
                      ? width / 2
                      : padding + (i / (tendenciaTemporal.length - 1)) * (width - padding * 2);
                    const y = height - padding - ((d.ingresos / maxIngreso) * (height - padding * 2));
                    return { x, y };
                  });

                  let pathD = `M ${points[0].x} ${height - padding}`;
                  points.forEach((p) => {
                    pathD += ` L ${p.x} ${p.y}`;
                  });
                  pathD += ` L ${points[points.length - 1].x} ${height - padding} Z`;

                  return pathD;
                })()}
                fill="url(#trendGradient)"
              />

              {/* Línea de tendencia */}
              {tendenciaTemporal.length > 1 && (
                <path
                  d={(() => {
                    const padding = 40;
                    const width = 800;
                    const height = 256;
                    const maxIngreso = Math.max(...tendenciaTemporal.map((d) => d.ingresos));

                    return tendenciaTemporal
                      .map((d, i) => {
                        const x = padding + (i / (tendenciaTemporal.length - 1)) * (width - padding * 2);
                        const y = height - padding - ((d.ingresos / maxIngreso) * (height - padding * 2));
                        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                      })
                      .join(" ");
                  })()}
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                />
              )}

              {/* Puntos */}
              {tendenciaTemporal.map((d, i) => {
                const padding = 40;
                const width = 800;
                const height = 256;
                const maxIngreso = Math.max(...tendenciaTemporal.map((d) => d.ingresos));

                const x = tendenciaTemporal.length === 1
                  ? width / 2
                  : padding + (i / (tendenciaTemporal.length - 1)) * (width - padding * 2);
                const y = height - padding - ((d.ingresos / maxIngreso) * (height - padding * 2));

                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="5"
                    fill="#06b6d4"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </svg>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-blue-200/60">No hay datos para mostrar</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Alertas y recomendaciones */}
      {resumen.tasaDescuento > 15 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/20 to-orange-600/10 p-6 backdrop-blur-sm print:border-amber-300 print:bg-amber-50 print:break-inside-avoid"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-500/20 print:bg-amber-200">
              <AlertCircle className="h-5 w-5 text-amber-400 print:text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-amber-200 print:text-amber-900">
                Alerta: Tasa de descuento alta
              </h3>
              <p className="mt-1 text-sm text-amber-300/80 print:text-amber-700">
                La tasa de descuento actual es de {resumen.tasaDescuento.toFixed(1)}%, lo cual está por
                encima del promedio recomendado (15%). Considera revisar las políticas de descuento
                para optimizar los ingresos.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
