"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock } from "lucide-react";

interface Tarjeta {
  id: string;
  negocio_id: string;
  codigo: string;
  codigo_interno: string;
  codigo_barras: string | null;
  qr_code: string | null;
  estado: string;
  perdida: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

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

interface TarjetasEmitidasTabProps {
  tarjetas: Tarjeta[];
  codigos: Codigo[];
}

export function TarjetasEmitidasTab({
  tarjetas,
  codigos,
}: TarjetasEmitidasTabProps) {
  // Debug: ver qué datos llegan
  console.log('🔍 Total tarjetas recibidas:', tarjetas.length);
  console.log('🔍 Total códigos recibidos:', codigos.length);
  console.log('🔍 Muestra de primeros 3 códigos:', codigos.slice(0, 3).map(c => ({
    id: c.id,
    tarjeta_id: c.tarjeta_id,
    hora_entrada: c.hora_entrada,
    hora_salida: c.hora_salida,
    hora_salida_tipo: typeof c.hora_salida,
    hora_salida_es_null: c.hora_salida === null,
    vehiculos: c.vehiculos,
  })));

  // Crear un mapa para obtener el tipo de vehículo de las tarjetas en uso
  const tipoVehiculoMap = new Map<string, string>();
  
  // Buscar el tipo de vehículo del código activo para cada tarjeta
  // En la tabla codigos: estado = "1" significa código activo/en uso
  codigos.forEach((codigo) => {
    if (codigo.estado === "1") {
      const tipoVeh = codigo.tipo_vehiculo;
      if (tipoVeh) {
        // Si ya existe un registro para esta tarjeta, mantener el más reciente
        if (!tipoVehiculoMap.has(codigo.tarjeta_id)) {
          tipoVehiculoMap.set(codigo.tarjeta_id, tipoVeh);
        }
      }
      
      // Debug: mostrar en consola qué se está encontrando
      console.log('🚗 Código activo encontrado:', {
        tarjeta_id: codigo.tarjeta_id,
        tipo_vehiculo: tipoVeh || 'NO ENCONTRADO',
        estado: codigo.estado,
      });
    }
  });

  console.log('📊 Total códigos activos con vehículo:', tipoVehiculoMap.size);

  // Mapear todas las tarjetas con su información
  const todasLasTarjetas = tarjetas.map((t) => {
    // El estado de la tarjeta indica directamente si está en uso o disponible
    // estado = "0" → En Uso
    // estado = "1" → Disponible
    const enUso = t.estado === "0";
    const tipoVehiculo = enUso ? (tipoVehiculoMap.get(t.id) || "Sin tipo") : "-";
    
    // Debug para tarjetas en uso sin tipo de vehículo
    if (enUso && tipoVehiculo === "Sin tipo") {
      console.warn('⚠️ Tarjeta EN USO sin tipo de vehículo:', {
        tarjeta_id: t.id,
        codigo: t.codigo,
        estado: t.estado,
      });
    }
    
    return {
      ...t,
      tipoVehiculo,
      enUso,
      fechaParaOrdenar: t.fecha_actualizacion,
    };
  });

  // Ordenar: Primero "En Uso" por fecha_actualizacion DESC, luego "Disponible" por fecha_actualizacion DESC
  const tarjetasOrdenadas = todasLasTarjetas.sort((a, b) => {
    // Si ambas tienen el mismo estado, ordenar por fecha_actualizacion
    if (a.enUso === b.enUso) {
      return b.fechaParaOrdenar.localeCompare(a.fechaParaOrdenar);
    }
    // Las que están en uso van primero
    return a.enUso ? -1 : 1;
  });

  const tarjetasEnUso = todasLasTarjetas.filter((t) => t.enUso);
  const tarjetasDisponibles = todasLasTarjetas.filter((t) => !t.enUso);

  const formatDateTime = (dateString: string) => {
    if (dateString === "-") return "-";
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-green-600/10 backdrop-blur-xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Emitidas</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {tarjetas.length}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-500/20 p-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-amber-500/10 to-orange-600/10 backdrop-blur-xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">En Uso</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {tarjetasEnUso.length}
                </p>
              </div>
              <div className="rounded-2xl bg-amber-500/20 p-3">
                <Clock className="h-6 w-6 text-amber-400" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-green-500/10 to-emerald-600/10 backdrop-blur-xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Disponibles</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {tarjetasDisponibles.length}
                </p>
              </div>
              <div className="rounded-2xl bg-green-500/20 p-3">
                <CheckCircle2 className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-cyan-600/10 backdrop-blur-xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Tasa de Uso</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {tarjetas.length > 0
                    ? Math.round((tarjetasEnUso.length / tarjetas.length) * 100)
                    : 0}
                  %
                </p>
              </div>
              <div className="rounded-2xl bg-blue-500/20 p-3">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabla Unificada de Todas las Tarjetas */}
      {tarjetasOrdenadas.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <div className="border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-green-600/10 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">Todas las Tarjetas Emitidas</h3>
            <p className="text-sm text-gray-400">
              {tarjetasEnUso.length} en uso, {tarjetasDisponibles.length} disponibles
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">
                    Código Barras
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">
                    Tipo Vehículo
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">
                    Fecha/Hora Registro
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {tarjetasOrdenadas.map((tarjeta, index) => (
                  <motion.tr
                    key={tarjeta.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/5 transition hover:bg-white/5"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {tarjeta.codigo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {tarjeta.codigo_barras || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {tarjeta.tipoVehiculo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {formatDateTime(tarjeta.fecha_actualizacion)}
                    </td>
                    <td className="px-6 py-4">
                      {tarjeta.enUso ? (
                        <span className="inline-flex items-center gap-1.5 rounded-3xl bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-400">
                          <Clock className="h-3 w-3" />
                          En Uso
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-3xl bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
                          <CheckCircle2 className="h-3 w-3" />
                          Disponible
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl">
          <CheckCircle2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-white">
            No hay tarjetas emitidas
          </h3>
          <p className="mt-2 text-sm text-gray-400">
            Crea tarjetas en la sección de Configuración → Negocio
          </p>
        </div>
      )}
    </div>
  );
}
