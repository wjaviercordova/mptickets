"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Car,
  Clock,
  TrendingUp,
  Award,
  BarChart3,
  Timer,
} from "lucide-react";

interface Codigo {
  id: string;
  negocio_id: string;
  tarjeta_id: string;
  vehiculo_id: string;
  hora_entrada: string;
  hora_salida: string | null;
  costo_total: number | null;
  metodo_pago: string | null;
  estado: string;
  observaciones: string | null;
  tarjetas?: {
    codigo: string;
    codigo_barras: string | null;
    codigo_interno: string;
  };
  vehiculos?: {
    placa: string;
    tipo: string;
    marca: string | null;
    color: string | null;
  };
}

interface VehiculosTabProps {
  codigos: Codigo[];
}

export function VehiculosTab({ codigos }: VehiculosTabProps) {
  // Análisis de vehículos recurrentes
  const vehiculosRecurrentes = useMemo(() => {
    const map = new Map<string, {
      placa: string;
      tipo: string;
      marca: string | null;
      color: string | null;
      visitas: number;
      totalPagado: number;
      duracionPromedio: number;
      ultimaVisita: string;
    }>();

    codigos.forEach((codigo) => {
      if (!codigo.vehiculos || !codigo.hora_salida) return;

      const { placa, tipo, marca, color } = codigo.vehiculos;
      const current = map.get(placa) || {
        placa,
        tipo,
        marca,
        color,
        visitas: 0,
        totalPagado: 0,
        duracionPromedio: 0,
        ultimaVisita: codigo.hora_salida,
      };

      // Calcular duración en minutos
      const entrada = new Date(codigo.hora_entrada);
      const salida = new Date(codigo.hora_salida);
      const duracion = (salida.getTime() - entrada.getTime()) / (1000 * 60);

      const nuevasVisitas = current.visitas + 1;
      const nuevaDuracionPromedio = 
        (current.duracionPromedio * current.visitas + duracion) / nuevasVisitas;

      map.set(placa, {
        ...current,
        visitas: nuevasVisitas,
        totalPagado: current.totalPagado + (codigo.costo_total || 0),
        duracionPromedio: nuevaDuracionPromedio,
        ultimaVisita: codigo.hora_salida > current.ultimaVisita 
          ? codigo.hora_salida 
          : current.ultimaVisita,
      });
    });

    return Array.from(map.values())
      .filter((v) => v.visitas > 1) // Solo vehículos con más de 1 visita
      .sort((a, b) => b.visitas - a.visitas);
  }, [codigos]);

  // Análisis de horas pico por tipo de vehículo
  const horasPicoPorTipo = useMemo(() => {
    const map = new Map<string, Map<number, number>>();

    codigos.forEach((codigo) => {
      if (!codigo.vehiculos) return;
      
      const tipo = codigo.vehiculos.tipo;
      const hora = new Date(codigo.hora_entrada).getHours();

      if (!map.has(tipo)) {
        map.set(tipo, new Map<number, number>());
      }

      const horasMap = map.get(tipo)!;
      horasMap.set(hora, (horasMap.get(hora) || 0) + 1);
    });

    return Array.from(map.entries()).map(([tipo, horasMap]) => {
      const horas = Array.from(horasMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      
      return {
        tipo,
        horasPico: horas.map(([hora, count]) => ({
          hora,
          count,
        })),
      };
    });
  }, [codigos]);

  // Duración promedio por tipo de vehículo
  const duracionPorTipo = useMemo(() => {
    const map = new Map<string, { count: number; totalMinutos: number }>();

    codigos.forEach((codigo) => {
      if (!codigo.vehiculos || !codigo.hora_salida) return;

      const tipo = codigo.vehiculos.tipo;
      const entrada = new Date(codigo.hora_entrada);
      const salida = new Date(codigo.hora_salida);
      const minutos = (salida.getTime() - entrada.getTime()) / (1000 * 60);

      const current = map.get(tipo) || { count: 0, totalMinutos: 0 };
      map.set(tipo, {
        count: current.count + 1,
        totalMinutos: current.totalMinutos + minutos,
      });
    });

    return Array.from(map.entries())
      .map(([tipo, data]) => ({
        tipo,
        promedioMinutos: data.totalMinutos / data.count,
        count: data.count,
      }))
      .sort((a, b) => b.promedioMinutos - a.promedioMinutos);
  }, [codigos]);

  // Top vehículos por ingresos
  const topVehiculosIngresos = useMemo(() => {
    const map = new Map<string, {
      placa: string;
      tipo: string;
      marca: string | null;
      color: string | null;
      totalPagado: number;
      visitas: number;
    }>();

    codigos.forEach((codigo) => {
      if (!codigo.vehiculos || !codigo.costo_total) return;

      const { placa, tipo, marca, color } = codigo.vehiculos;
      const current = map.get(placa) || {
        placa,
        tipo,
        marca,
        color,
        totalPagado: 0,
        visitas: 0,
      };

      map.set(placa, {
        ...current,
        totalPagado: current.totalPagado + codigo.costo_total,
        visitas: current.visitas + 1,
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.totalPagado - a.totalPagado)
      .slice(0, 10);
  }, [codigos]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatHora = (hora: number) => {
    return `${hora.toString().padStart(2, "0")}:00`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas Generales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-cyan-600/10 backdrop-blur-xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Vehículos</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {topVehiculosIngresos.length}
                </p>
              </div>
              <div className="rounded-2xl bg-blue-500/20 p-3">
                <Car className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-600/10 backdrop-blur-xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Visitas Totales</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {codigos.length}
                </p>
              </div>
              <div className="rounded-2xl bg-purple-500/20 p-3">
                <BarChart3 className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-amber-500/10 to-orange-600/10 backdrop-blur-xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Recurrentes</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {vehiculosRecurrentes.length}
                </p>
              </div>
              <div className="rounded-2xl bg-amber-500/20 p-3">
                <Award className="h-6 w-6 text-amber-400" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-green-500/10 to-emerald-600/10 backdrop-blur-xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Duración Promedio</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {duracionPorTipo.length > 0
                    ? formatDuration(
                        duracionPorTipo.reduce((sum, d) => sum + d.promedioMinutos, 0) /
                          duracionPorTipo.length
                      )
                    : "0m"}
                </p>
              </div>
              <div className="rounded-2xl bg-green-500/20 p-3">
                <Timer className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Grid de Análisis */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Vehículos Recurrentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <div className="border-b border-white/10 bg-gradient-to-r from-amber-500/10 to-orange-600/10 px-6 py-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">
                Vehículos Recurrentes
              </h3>
            </div>
            <p className="text-sm text-gray-400">Visitantes frecuentes del parqueadero</p>
          </div>
          <div className="p-6">
            {vehiculosRecurrentes.length > 0 ? (
              <div className="space-y-4">
                {vehiculosRecurrentes.slice(0, 5).map((vehiculo, index) => (
                  <motion.div
                    key={vehiculo.placa}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white">
                            {vehiculo.placa}
                          </span>
                          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                            {vehiculo.visitas} visitas
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-400">
                          {vehiculo.tipo}
                          {vehiculo.marca && ` • ${vehiculo.marca}`}
                          {vehiculo.color && ` • ${vehiculo.color}`}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {formatCurrency(vehiculo.totalPagado)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(vehiculo.duracionPromedio)} promedio
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Última visita: {formatDate(vehiculo.ultimaVisita)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-gray-400">
                No hay vehículos recurrentes aún
              </div>
            )}
          </div>
        </motion.div>

        {/* Duración Promedio por Tipo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <div className="border-b border-white/10 bg-gradient-to-r from-green-500/10 to-emerald-600/10 px-6 py-4">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">
                Duración por Tipo
              </h3>
            </div>
            <p className="text-sm text-gray-400">Tiempo promedio de estadía</p>
          </div>
          <div className="p-6">
            {duracionPorTipo.length > 0 ? (
              <div className="space-y-4">
                {duracionPorTipo.map((data, index) => (
                  <motion.div
                    key={data.tipo}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white">{data.tipo}</span>
                      <span className="text-gray-400">
                        {formatDuration(data.promedioMinutos)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${Math.min(
                            (data.promedioMinutos / Math.max(...duracionPorTipo.map((d) => d.promedioMinutos))) * 100,
                            100
                          )}%` 
                        }}
                        transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                      />
                    </div>
                    <p className="text-xs text-gray-500">{data.count} vehículos</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-gray-400">
                No hay datos disponibles
              </div>
            )}
          </div>
        </motion.div>

        {/* Horas Pico por Tipo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <div className="border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-cyan-600/10 px-6 py-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Horas Pico</h3>
            </div>
            <p className="text-sm text-gray-400">Horarios de mayor afluencia por tipo</p>
          </div>
          <div className="p-6">
            {horasPicoPorTipo.length > 0 ? (
              <div className="space-y-4">
                {horasPicoPorTipo.map((data, index) => (
                  <motion.div
                    key={data.tipo}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <h4 className="mb-3 font-medium text-white">{data.tipo}</h4>
                    <div className="flex gap-2">
                      {data.horasPico.map((hp) => (
                        <div
                          key={hp.hora}
                          className="flex-1 rounded-xl bg-blue-500/20 p-3 text-center"
                        >
                          <p className="text-lg font-bold text-blue-400">
                            {formatHora(hp.hora)}
                          </p>
                          <p className="text-xs text-gray-400">{hp.count} vehículos</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-gray-400">
                No hay datos disponibles
              </div>
            )}
          </div>
        </motion.div>

        {/* Top 10 por Ingresos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <div className="border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-600/10 px-6 py-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">
                Top 10 por Ingresos
              </h3>
            </div>
            <p className="text-sm text-gray-400">Vehículos que más han generado</p>
          </div>
          <div className="p-6">
            {topVehiculosIngresos.length > 0 ? (
              <div className="space-y-3">
                {topVehiculosIngresos.map((vehiculo, index) => (
                  <motion.div
                    key={vehiculo.placa}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 text-sm font-bold text-purple-400">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {vehiculo.placa}
                        </p>
                        <p className="text-xs text-gray-400">
                          {vehiculo.tipo} • {vehiculo.visitas} visitas
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-purple-400">
                      {formatCurrency(vehiculo.totalPagado)}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-gray-400">
                No hay datos disponibles
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
