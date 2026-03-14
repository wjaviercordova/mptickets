import { FileBarChart, TrendingUp, Calendar, BarChart3 } from "lucide-react";

export default function ReportesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card border-purple-400/20 p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-purple-400/30 bg-gradient-to-br from-amber-500/20 to-orange-600/10">
            <FileBarChart className="h-7 w-7 text-amber-300" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Reportes</h1>
            <p className="mt-2 font-body text-blue-200/60">
              Reportes e informes del sistema de gestión
            </p>
          </div>
        </div>
      </div>

      {/* Tipos de reportes */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Reporte de Negocios */}
        <div className="glass-card group cursor-pointer border-purple-400/20 p-6 transition-all hover:border-purple-400/40 hover:shadow-lg hover:shadow-purple-500/10">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-purple-400/30 bg-gradient-to-br from-purple-500/20 to-pink-600/10">
            <BarChart3 className="h-6 w-6 text-purple-300" />
          </div>
          <h3 className="font-display text-lg font-semibold text-white">
            Reporte de Negocios
          </h3>
          <p className="mt-2 font-body text-sm text-blue-200/60">
            Estadísticas y métricas de todos los negocios registrados
          </p>
          <button className="glass-button mt-4 w-full border-purple-400/20 bg-purple-500/5 py-2 text-sm">
            Generar Reporte
          </button>
        </div>

        {/* Reporte de Actividad */}
        <div className="glass-card group cursor-pointer border-purple-400/20 p-6 transition-all hover:border-purple-400/40 hover:shadow-lg hover:shadow-purple-500/10">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-purple-400/30 bg-gradient-to-br from-emerald-500/20 to-green-600/10">
            <TrendingUp className="h-6 w-6 text-emerald-300" />
          </div>
          <h3 className="font-display text-lg font-semibold text-white">
            Reporte de Actividad
          </h3>
          <p className="mt-2 font-body text-sm text-blue-200/60">
            Análisis de actividad y uso del sistema por período
          </p>
          <button className="glass-button mt-4 w-full border-purple-400/20 bg-purple-500/5 py-2 text-sm">
            Generar Reporte
          </button>
        </div>

        {/* Reporte Mensual */}
        <div className="glass-card group cursor-pointer border-purple-400/20 p-6 transition-all hover:border-purple-400/40 hover:shadow-lg hover:shadow-purple-500/10">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-purple-400/30 bg-gradient-to-br from-cyan-500/20 to-blue-600/10">
            <Calendar className="h-6 w-6 text-cyan-300" />
          </div>
          <h3 className="font-display text-lg font-semibold text-white">
            Reporte Mensual
          </h3>
          <p className="mt-2 font-body text-sm text-blue-200/60">
            Resumen mensual de operaciones y estadísticas
          </p>
          <button className="glass-button mt-4 w-full border-purple-400/20 bg-purple-500/5 py-2 text-sm">
            Generar Reporte
          </button>
        </div>
      </div>

      {/* Reportes recientes */}
      <div className="glass-card border-purple-400/20 p-6">
        <h2 className="mb-6 font-display text-xl font-semibold text-white">
          Reportes Recientes
        </h2>

        <div className="rounded-xl border border-purple-400/20 bg-purple-500/5 p-12 text-center">
          <FileBarChart className="mx-auto h-12 w-12 text-purple-300/40" />
          <p className="mt-4 font-body text-sm text-blue-200/60">
            No hay reportes generados todavía
          </p>
          <p className="mt-2 font-caption text-xs text-blue-200/40">
            Selecciona un tipo de reporte arriba para comenzar
          </p>
        </div>
      </div>
    </div>
  );
}
