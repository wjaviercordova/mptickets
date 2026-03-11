"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Clock,
  Car,
  CreditCard,
  TrendingUp,
  AlertCircle,
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

interface Negocio {
  nombre: string;
  plan: string;
  capacidad_maxima: number;
}

interface ActividadTabProps {
  codigos: Codigo[];
  negocio: Negocio | null;
}

export function ActividadTab({
  codigos,
  negocio,
}: ActividadTabProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar el tiempo actual cada 30 segundos para los temporizadores
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  // Filtrar códigos activos (sin hora de salida)
  const actividadActiva = useMemo(() => {
    return codigos
      .filter((codigo) => codigo.estado === "1" && !codigo.hora_salida)
      .map((codigo) => {
        const entrada = new Date(codigo.hora_entrada);
        const duracion = currentTime.getTime() - entrada.getTime();
        const horas = Math.floor(duracion / (1000 * 60 * 60));
        const minutos = Math.floor((duracion % (1000 * 60 * 60)) / (1000 * 60));

        return {
          ...codigo,
          duracionHoras: horas,
          duracionMinutos: minutos,
          duracionTotal: duracion,
        };
      })
      .sort((a, b) => b.duracionTotal - a.duracionTotal);
  }, [codigos, currentTime]);

  // Estadísticas de ocupación
  const estadisticas = useMemo(() => {
    const capacidadMaxima = negocio?.capacidad_maxima || 50;
    const espaciosOcupados = actividadActiva.length;
    const espaciosDisponibles = Math.max(0, capacidadMaxima - espaciosOcupados);
    const tasaOcupacion = capacidadMaxima > 0 
      ? (espaciosOcupados / capacidadMaxima) * 100 
      : 0;

    // Calcular duración promedio de las sesiones activas
    const duracionPromedio = actividadActiva.length > 0
      ? actividadActiva.reduce((sum, a) => sum + a.duracionTotal, 0) / 
        actividadActiva.length / (1000 * 60) // en minutos
      : 0;

    // Distribución por tipo de vehículo
    const tiposMap = new Map<string, number>();
    actividadActiva.forEach((actividad) => {
      const tipo = actividad.vehiculos?.tipo || "Sin especificar";
      tiposMap.set(tipo, (tiposMap.get(tipo) || 0) + 1);
    });

    return {
      capacidadMaxima,
      espaciosOcupados,
      espaciosDisponibles,
      tasaOcupacion,
      duracionPromedio,
      distribucionTipos: Array.from(tiposMap.entries()).map(([tipo, count]) => ({
        tipo,
        count,
      })),
    };
  }, [actividadActiva, negocio]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (horas: number, minutos: number) => {
    if (horas > 0) {
      return `${horas}h ${minutos}m`;
    }
    return `${minutos}m`;
  };

  // Determinar color de alerta según duración
  const getDuracionColor = (horas: number) => {
    if (horas >= 12) return "text-red-400 bg-red-500/20";
    if (horas >= 6) return "text-amber-400 bg-amber-500/20";
    return "text-green-400 bg-green-500/20";
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas de Ocupación */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-cyan-600/10 backdrop-blur-xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Espacios Ocupados</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {estadisticas.espaciosOcupados}
                  <span className="text-lg text-gray-400">
                    /{estadisticas.capacidadMaxima}
                  </span>
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
          className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-green-500/10 to-emerald-600/10 backdrop-blur-xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Espacios Disponibles</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {estadisticas.espaciosDisponibles}
                </p>
              </div>
              <div className="rounded-2xl bg-green-500/20 p-3">
                <CreditCard className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-600/10 backdrop-blur-xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Tasa Ocupación</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {Math.round(estadisticas.tasaOcupacion)}%
                </p>
              </div>
              <div className="rounded-2xl bg-purple-500/20 p-3">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-amber-500/10 to-orange-600/10 backdrop-blur-xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Tiempo Promedio</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {Math.round(estadisticas.duracionPromedio)}m
                </p>
              </div>
              <div className="rounded-2xl bg-amber-500/20 p-3">
                <Clock className="h-6 w-6 text-amber-400" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Distribución por Tipo */}
      {estadisticas.distribucionTipos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <div className="border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-cyan-600/10 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">
              Vehículos Activos por Tipo
            </h3>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-3">
              {estadisticas.distribucionTipos.map((tipo, index) => (
                <motion.div
                  key={tipo.tipo}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-3xl border border-white/10 bg-white/5 px-4 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-blue-400" />
                    <span className="font-medium text-white">{tipo.tipo}</span>
                    <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
                      {tipo.count}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Sesiones Activas */}
      {actividadActiva.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <div className="border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-green-600/10 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Actividad en Tiempo Real
                </h3>
                <p className="text-sm text-gray-400">
                  Se actualiza cada 30 segundos
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-green-500/20 px-3 py-1">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                <span className="text-sm font-medium text-green-400">En Vivo</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              {actividadActiva.map((actividad, index) => (
                <motion.div
                  key={actividad.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
                >
                  <div className="border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-cyan-600/10 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-blue-400" />
                        <span className="font-bold text-white">
                          {actividad.vehiculos?.placa || "Sin placa"}
                        </span>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getDuracionColor(
                          actividad.duracionHoras
                        )}`}
                      >
                        {formatDuration(
                          actividad.duracionHoras,
                          actividad.duracionMinutos
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Tipo:</span>
                      <span className="text-white">
                        {actividad.vehiculos?.tipo || "No especificado"}
                      </span>
                    </div>
                    {actividad.vehiculos?.marca && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Marca:</span>
                        <span className="text-white">{actividad.vehiculos.marca}</span>
                      </div>
                    )}
                    {actividad.vehiculos?.color && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Color:</span>
                        <span className="text-white">{actividad.vehiculos.color}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Tarjeta:</span>
                      <span className="font-mono text-white">
                        {actividad.tarjetas?.codigo || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Entrada:</span>
                      <span className="text-white">
                        {formatDateTime(actividad.hora_entrada)}
                      </span>
                    </div>
                    {actividad.duracionHoras >= 6 && (
                      <div className="mt-3 flex items-center gap-2 rounded-2xl bg-amber-500/10 p-2 text-xs">
                        <AlertCircle className="h-4 w-4 text-amber-400" />
                        <span className="text-amber-400">
                          Vehículo con estadía prolongada
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl"
        >
          <Activity className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-white">
            No hay actividad en este momento
          </h3>
          <p className="mt-2 text-sm text-gray-400">
            Todos los espacios están disponibles
          </p>
        </motion.div>
      )}
    </div>
  );
}
