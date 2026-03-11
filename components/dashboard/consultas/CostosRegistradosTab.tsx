"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Car,
  TrendingUp,
  Calendar,
  CreditCard,
  Filter,
  Eye,
  Edit,
  X,
  Save,
  FileText,
  Loader2,
} from "lucide-react";

interface Codigo {
  id: string;
  negocio_id: string;
  tarjeta_id: string;
  vehiculo_id: string;
  codigo: string;
  codigo_barras: string | null;
  hora_entrada: string;
  hora_salida: string | null;
  costo: number | null;
  descuento: number | null;
  total: number | null;
  metodo_pago: string | null;
  estado: string;
  observaciones: string | null;
  tipo_vehiculo: string;
  placa: string;
  tarjetas?: {
    codigo: string;
    codigo_barras: string | null;
    codigo_interno: string;
  };
}

interface CostosRegistradosTabProps {
  codigos: Codigo[];
}

export function CostosRegistradosTab({
  codigos,
}: CostosRegistradosTabProps) {
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);

  const [fechaInicio, setFechaInicio] = useState(
    oneMonthAgo.toISOString().split("T")[0]
  );
  const [fechaFin, setFechaFin] = useState(today.toISOString().split("T")[0]);
  const [tipoVehiculo, setTipoVehiculo] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [placa, setPlaca] = useState("");

  // Estados para modales
  const [modalDetalle, setModalDetalle] = useState<Codigo | null>(null);
  const [modalEditar, setModalEditar] = useState<Codigo | null>(null);
  const [editForm, setEditForm] = useState({
    hora_entrada: "",
    hora_salida: "",
    costo: 0,
    descuento: 0,
  });
  const [guardando, setGuardando] = useState(false);

  // Filtrar códigos completados con costo
  const codigosFiltrados = useMemo(() => {
    console.log('🔎 Filtrando códigos:', {
      total: codigos.length,
      conCosto: codigos.filter(c => c.costo).length,
      conTotal: codigos.filter(c => c.total).length,
      conSalida: codigos.filter(c => c.hora_salida).length,
      fechaInicio,
      fechaFin,
      muestraCodigo: codigos[0], // Ver estructura completa
    });
    
    return codigos.filter((codigo) => {
      // Solo códigos con salida y total registrado
      if (!codigo.hora_salida || codigo.total === null || codigo.total === undefined) return false;

      // Filtro de fecha - comparar en hora local del navegador
      const fechaSalida = new Date(codigo.hora_salida); // UTC se convierte automáticamente a local
      
      // Crear fechas de inicio y fin en hora local (medianoche del día)
      const [yearIni, monthIni, dayIni] = fechaInicio.split('-').map(Number);
      const inicio = new Date(yearIni, monthIni - 1, dayIni, 0, 0, 0, 0);
      
      const [yearFin, monthFin, dayFin] = fechaFin.split('-').map(Number);
      const fin = new Date(yearFin, monthFin - 1, dayFin, 23, 59, 59, 999);

      if (fechaSalida < inicio || fechaSalida > fin) return false;

      // Filtro de tipo de vehículo
      if (tipoVehiculo && codigo.tipo_vehiculo !== tipoVehiculo) return false;

      // Filtro de método de pago
      if (metodoPago && codigo.metodo_pago !== metodoPago) return false;

      // Filtro de placa
      if (placa && codigo.placa && !codigo.placa.toLowerCase().includes(placa.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [codigos, fechaInicio, fechaFin, tipoVehiculo, metodoPago, placa]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalRecaudado = codigosFiltrados.reduce(
      (sum, codigo) => sum + (codigo.total || 0),
      0
    );
    const totalVehiculos = codigosFiltrados.length;
    const promedioTransaccion = totalVehiculos > 0 ? totalRecaudado / totalVehiculos : 0;

    console.log('📊 Estadísticas calculadas:', {
      codigosFiltrados: codigosFiltrados.length,
      totalRecaudado,
      totalVehiculos,
      promedioTransaccion,
      muestraCodigo: codigosFiltrados[0] || 'Sin datos',
    });

    return {
      totalRecaudado,
      totalVehiculos,
      promedioTransaccion,
    };
  }, [codigosFiltrados]);

  // Obtener tipos de vehículo únicos
  const tiposVehiculo = useMemo(() => {
    const tipos = new Set<string>();
    codigos.forEach((codigo) => {
      if (codigo.tipo_vehiculo) {
        tipos.add(codigo.tipo_vehiculo);
      }
    });
    return Array.from(tipos);
  }, [codigos]);

  // Obtener métodos de pago únicos
  const metodosPago = useMemo(() => {
    const metodos = new Set<string>();
    codigos.forEach((codigo) => {
      if (codigo.metodo_pago) {
        metodos.add(codigo.metodo_pago);
      }
    });
    return Array.from(metodos);
  }, [codigos]);

  // Datos para gráfico de distribución por tipo de vehículo
  const distribucionTipos = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    codigosFiltrados.forEach((codigo) => {
      const tipo = codigo.tipo_vehiculo || "Sin especificar";
      const current = map.get(tipo) || { count: 0, total: 0 };
      map.set(tipo, {
        count: current.count + 1,
        total: current.total + (codigo.total || 0),
      });
    });

    return Array.from(map.entries())
      .map(([tipo, data]) => ({
        tipo,
        count: data.count,
        total: data.total,
        porcentaje: stats.totalVehiculos > 0 
          ? (data.count / stats.totalVehiculos) * 100 
          : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [codigosFiltrados, stats.totalVehiculos]);

  // Datos para gráfico de métodos de pago
  const distribucionPagos = useMemo(() => {
    const map = new Map<string, number>();
    codigosFiltrados.forEach((codigo) => {
      const metodo = codigo.metodo_pago || "No especificado";
      map.set(metodo, (map.get(metodo) || 0) + (codigo.total || 0));
    });

    return Array.from(map.entries())
      .map(([metodo, total]) => ({
        metodo,
        total,
        porcentaje: stats.totalRecaudado > 0 
          ? (total / stats.totalRecaudado) * 100 
          : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [codigosFiltrados, stats.totalRecaudado]);

  // Datos para gráfico de tendencia temporal
  const tendenciaTemporal = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    
    console.log('📈 Generando tendencia temporal:', {
      codigosFiltrados: codigosFiltrados.length,
      primeraFecha: codigosFiltrados[0]?.hora_salida,
      ultimaFecha: codigosFiltrados[codigosFiltrados.length - 1]?.hora_salida,
    });
    
    codigosFiltrados.forEach((codigo) => {
      if (!codigo.hora_salida) return;
      
      const fecha = new Date(codigo.hora_salida);
      const key = fecha.toISOString().split("T")[0];
      const current = map.get(key) || { count: 0, total: 0 };
      
      map.set(key, {
        count: current.count + 1,
        total: current.total + (codigo.total || 0),
      });
    });

    // Ordenar por fecha
    const resultado = Array.from(map.entries())
      .map(([fecha, data]) => ({
        fecha,
        count: data.count,
        total: data.total,
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
    
    console.log('📈 Tendencia generada:', {
      diasConDatos: resultado.length,
      primeraFecha: resultado[0]?.fecha,
      ultimaFecha: resultado[resultado.length - 1]?.fecha,
      muestra: resultado.slice(0, 3),
    });
    
    return resultado;
  }, [codigosFiltrados]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    });
  };

  const maxTendencia = Math.max(...tendenciaTemporal.map((d) => d.total), 1);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
      >
        <div className="border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-cyan-600/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Filtros</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Fecha Inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Fecha Inicio
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full rounded-3xl border border-white/10 bg-white/5 px-10 py-2.5 text-sm text-white placeholder-gray-500 backdrop-blur-sm transition focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Fecha Fin */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Fecha Fin
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full rounded-3xl border border-white/10 bg-white/5 px-10 py-2.5 text-sm text-white placeholder-gray-500 backdrop-blur-sm transition focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Tipo Vehículo */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Tipo Vehículo
              </label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={tipoVehiculo}
                  onChange={(e) => setTipoVehiculo(e.target.value)}
                  className="w-full rounded-3xl border border-white/10 bg-white/5 px-10 py-2.5 text-sm text-white backdrop-blur-sm transition focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Todos</option>
                  {tiposVehiculo.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Método de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Método Pago
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="w-full rounded-3xl border border-white/10 bg-white/5 px-10 py-2.5 text-sm text-white backdrop-blur-sm transition focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Todos</option>
                  {metodosPago.map((metodo) => (
                    <option key={metodo} value={metodo}>
                      {metodo}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Placa */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Placa
              </label>
              <input
                type="text"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                placeholder="Buscar..."
                className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 backdrop-blur-sm transition focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Estadísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-green-600/10 backdrop-blur-xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Recaudado</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {formatCurrency(stats.totalRecaudado)}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-500/20 p-3">
                <DollarSign className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-cyan-600/10 backdrop-blur-xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Vehículos</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {stats.totalVehiculos}
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
          transition={{ delay: 0.3 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-600/10 backdrop-blur-xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Promedio Transacción</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {formatCurrency(stats.promedioTransaccion)}
                </p>
              </div>
              <div className="rounded-2xl bg-purple-500/20 p-3">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tendencia Temporal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <div className="border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-cyan-600/10 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">
              Tendencia de Ingresos
            </h3>
            <p className="text-sm text-gray-400">Ingresos diarios en el período</p>
          </div>
          <div className="p-6">
            {tendenciaTemporal.length > 0 ? (
              <div className="space-y-4">
                {/* Gráfico de líneas */}
                <div className="relative h-48">
                  {/* Líneas de referencia horizontales */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[100, 75, 50, 25, 0].map((percent) => (
                      <div key={percent} className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 w-12 text-right">
                          {formatCurrency((maxTendencia * percent) / 100)}
                        </span>
                        <div className="flex-1 border-t border-dashed border-white/5" />
                      </div>
                    ))}
                  </div>

                  {/* SVG para la línea y puntos */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 192" preserveAspectRatio="none" style={{ paddingLeft: '50px' }}>
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>

                    {/* Área bajo la curva */}
                    <motion.path
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8 }}
                      d={(() => {
                        const padding = 50;
                        const width = 600;
                        const height = 192;
                        const numPuntos = tendenciaTemporal.length;
                        
                        const points = tendenciaTemporal.map((d, i) => {
                          const x = numPuntos === 1 
                            ? width / 2 
                            : padding + (i / (numPuntos - 1)) * (width - padding - 20);
                          const y = height - (d.total / maxTendencia) * (height - 20);
                          return { x, y };
                        });
                        
                        const pathD = points.reduce((acc, point, i) => {
                          if (i === 0) return `M ${point.x} ${height} L ${point.x} ${point.y}`;
                          return `${acc} L ${point.x} ${point.y}`;
                        }, '');
                        
                        return `${pathD} L ${points[points.length - 1].x} ${height} Z`;
                      })()}
                      fill="url(#areaGradient)"
                    />

                    {/* Línea principal */}
                    {tendenciaTemporal.length > 1 && (
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        d={(() => {
                          const padding = 50;
                          const width = 600;
                          const height = 192;
                          const numPuntos = tendenciaTemporal.length;
                          
                          const points = tendenciaTemporal.map((d, i) => {
                            const x = padding + (i / (numPuntos - 1)) * (width - padding - 20);
                            const y = height - (d.total / maxTendencia) * (height - 20);
                            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                          }).join(' ');
                          return points;
                        })()}
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        vectorEffect="non-scaling-stroke"
                      />
                    )}

                    {/* Puntos interactivos */}
                    {tendenciaTemporal.map((data, index) => {
                      const padding = 50;
                      const width = 600;
                      const height = 192;
                      const numPuntos = tendenciaTemporal.length;
                      
                      const x = numPuntos === 1 
                        ? width / 2 
                        : padding + (index / (numPuntos - 1)) * (width - padding - 20);
                      const y = height - (data.total / maxTendencia) * (height - 20);

                      return (
                        <g key={data.fecha} className="group cursor-pointer">
                          {/* Punto */}
                          <motion.circle
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.05 + 0.5, duration: 0.3 }}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#3b82f6"
                            stroke="#fff"
                            strokeWidth="2"
                            className="group-hover:r-6 transition-all"
                          />
                          {/* Círculo hover */}
                          <circle
                            cx={x}
                            cy={y}
                            r="12"
                            fill="transparent"
                            className="cursor-pointer"
                          />
                          {/* Tooltip */}
                          <foreignObject
                            x={x - 60}
                            y={y - 80}
                            width="120"
                            height="70"
                            className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <div className="flex items-center justify-center h-full">
                              <div className="rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-xl border border-white/10">
                                <div className="font-semibold">{formatDate(data.fecha)}</div>
                                <div className="text-emerald-400 font-bold">{formatCurrency(data.total)}</div>
                                <div className="text-gray-400">{data.count} vehículos</div>
                              </div>
                            </div>
                          </foreignObject>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Leyenda inferior */}
                <div className="flex justify-between items-center text-xs text-gray-400 pt-4 border-t border-white/5">
                  <div>
                    <span className="font-medium">{formatDate(tendenciaTemporal[0]?.fecha)}</span>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold text-sm">
                      Total: {formatCurrency(tendenciaTemporal.reduce((sum, d) => sum + d.total, 0))}
                    </div>
                    <div className="text-gray-500">{tendenciaTemporal.reduce((sum, d) => sum + d.count, 0)} vehículos</div>
                  </div>
                  <div>
                    <span className="font-medium">{formatDate(tendenciaTemporal[tendenciaTemporal.length - 1]?.fecha)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-gray-400">
                No hay datos para mostrar
              </div>
            )}
          </div>
        </motion.div>

        {/* Distribución por Tipo de Vehículo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <div className="border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-green-600/10 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">
              Distribución por Tipo
            </h3>
            <p className="text-sm text-gray-400">Ingresos por tipo de vehículo</p>
          </div>
          <div className="p-6">
            {distribucionTipos.length > 0 ? (
              <div className="space-y-4">
                {distribucionTipos.map((data, index) => (
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
                        {formatCurrency(data.total)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${data.porcentaje}%` }}
                        transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {data.count} vehículos ({data.porcentaje.toFixed(1)}%)
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-gray-400">
                No hay datos para mostrar
              </div>
            )}
          </div>
        </motion.div>

        {/* Distribución por Método de Pago */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl lg:col-span-2"
        >
          <div className="border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-600/10 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">
              Distribución por Método de Pago
            </h3>
            <p className="text-sm text-gray-400">Ingresos por método de pago</p>
          </div>
          <div className="p-6">
            {distribucionPagos.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {distribucionPagos.map((data, index) => (
                  <motion.div
                    key={data.metodo}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium text-white">
                        {data.metodo}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">
                      {formatCurrency(data.total)}
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${data.porcentaje}%` }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-400"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      {data.porcentaje.toFixed(1)}% del total
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-gray-400">
                No hay datos para mostrar
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Tabla de Registro de Movimientos */}
      {codigosFiltrados.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <div className="border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-purple-600/10 px-6 py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-400" />
              <h3 className="text-lg font-semibold text-white">Registro de Movimientos</h3>
            </div>
            <p className="text-sm text-gray-400 mt-1">{codigosFiltrados.length} registros encontrados</p>
          </div>
          <div className="overflow-x-auto max-h-[450px] overflow-y-auto scrollbar-custom">
            <style jsx>{`
              .scrollbar-custom::-webkit-scrollbar {
                width: 10px;
              }
              .scrollbar-custom::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                margin: 4px;
              }
              .scrollbar-custom::-webkit-scrollbar-thumb {
                background: linear-gradient(180deg, rgba(99, 102, 241, 0.5) 0%, rgba(168, 85, 247, 0.5) 100%);
                border-radius: 10px;
                border: 2px solid rgba(255, 255, 255, 0.1);
              }
              .scrollbar-custom::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(180deg, rgba(99, 102, 241, 0.7) 0%, rgba(168, 85, 247, 0.7) 100%);
              }
              /* Firefox */
              .scrollbar-custom {
                scrollbar-width: thin;
                scrollbar-color: rgba(99, 102, 241, 0.5) rgba(255, 255, 255, 0.05);
              }
            `}</style>
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Código Barras
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Tipo Vehículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Entrada / Salida
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {codigosFiltrados.map((codigo, index) => (
                  <motion.tr
                    key={codigo.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {codigo.codigo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {codigo.codigo_barras || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {codigo.tipo_vehiculo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">E:</span>
                          <span>{new Date(codigo.hora_entrada).toLocaleString('es-ES', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">S:</span>
                          <span>{codigo.hora_salida ? new Date(codigo.hora_salida).toLocaleString('es-ES', { 
                            day: '2-digit', 
                            month: '2-digit',
                            year: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : '-'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-400">
                      {formatCurrency(codigo.total || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setModalDetalle(codigo)}
                          className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-2 text-blue-400 transition hover:bg-blue-500/20"
                          title="Ver Detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setModalEditar(codigo);
                            setEditForm({
                              hora_entrada: codigo.hora_entrada,
                              hora_salida: codigo.hora_salida || '',
                              costo: codigo.costo || 0,
                              descuento: codigo.descuento || 0,
                            });
                          }}
                          className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-2 text-purple-400 transition hover:bg-purple-500/20"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Mensaje si no hay registros */}
      {codigosFiltrados.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl"
        >
          <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-white">
            No hay registros en este período
          </h3>
          <p className="mt-2 text-sm text-gray-400">
            Ajusta los filtros para ver más resultados
          </p>
        </motion.div>
      )}

      {/* Modal de Detalles */}
      <AnimatePresence>
        {modalDetalle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setModalDetalle(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-[#1e293b]/95 to-[#0f172a]/95 shadow-2xl backdrop-blur-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-blue-500/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-blue-400/40 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 p-2.5">
                    <FileText className="h-5 w-5 text-blue-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Recibo de Pago</h2>
                </div>
                <button
                  onClick={() => setModalDetalle(null)}
                  className="rounded-xl border border-red-500/30 bg-red-950/30 p-2 text-red-400 transition hover:bg-red-950/50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Recibo */}
              <div className="p-6">
                <div
                  className="mx-auto w-full max-w-[320px] rounded-lg border border-gray-600/30 bg-white p-6 font-mono text-sm text-gray-900"
                  style={{ fontFamily: "'Courier New', Courier, monospace" }}
                >
                  {/* Encabezado */}
                  <div className="pb-3 text-center">
                    <p className="text-base font-bold">miparking</p>
                    <p className="text-xs">Primera Imprenta y Maldonado</p>
                    <p className="text-xs">Tel: 0999676346</p>
                  </div>

                  <div className="border-t-2 border-dashed border-gray-400 my-2"></div>

                  {/* Título */}
                  <div className="py-2 text-center">
                    <p className="text-sm font-bold">RECIBO DE PAGO</p>
                  </div>

                  {/* Contenido */}
                  <div className="space-y-1 py-2 text-xs">
                    <div className="flex justify-between">
                      <span>Fecha:</span>
                      <span>{new Date(modalDetalle.hora_salida || modalDetalle.hora_entrada).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Entrada:</span>
                      <span>{new Date(modalDetalle.hora_entrada).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Salida:</span>
                      <span>{modalDetalle.hora_salida ? new Date(modalDetalle.hora_salida).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                    </div>

                    <div className="flex justify-between pt-1">
                      <span>Tarjeta:</span>
                      <span className="font-bold">{modalDetalle.codigo}</span>
                    </div>

                    {modalDetalle.costo !== null && modalDetalle.costo > 0 && (
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Costo:</span>
                        <span>${modalDetalle.costo.toFixed(2)}</span>
                      </div>
                    )}

                    {modalDetalle.descuento !== null && modalDetalle.descuento > 0 && (
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Descuento:</span>
                        <span>-${modalDetalle.descuento.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-baseline pt-2 text-sm font-bold">
                      <span>Total:</span>
                      <span className="text-right">${(modalDetalle.total || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t-2 border-gray-400 my-2"></div>

                  {/* Pie de página */}
                  <div className="pt-2 text-center text-xs space-y-1">
                    <p>Recibo No valido como factura</p>
                    <p>Gracias su preferencia</p>
                  </div>
                </div>

                {/* Botón Cerrar */}
                <div className="mt-6">
                  <button
                    onClick={() => setModalDetalle(null)}
                    className="w-full rounded-xl border border-gray-400/40 bg-gradient-to-r from-gray-500/20 to-gray-600/20 px-4 py-3 font-semibold text-gray-300 backdrop-blur-xl transition hover:from-gray-500/30 hover:to-gray-600/30"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Editar */}
      <AnimatePresence>
        {modalEditar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setModalEditar(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-[#1e293b]/95 to-[#0f172a]/95 shadow-2xl backdrop-blur-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-purple-500/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-purple-400/40 bg-gradient-to-br from-purple-500/20 to-pink-600/20 p-2.5">
                    <Edit className="h-5 w-5 text-purple-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Editar Registro</h2>
                </div>
                <button
                  onClick={() => setModalEditar(null)}
                  className="rounded-xl border border-red-500/30 bg-red-950/30 p-2 text-red-400 transition hover:bg-red-950/50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Formulario */}
              <div className="p-6 space-y-4">
                {/* Hora Entrada */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hora Entrada
                  </label>
                  <input
                    type="datetime-local"
                    value={editForm.hora_entrada ? new Date(editForm.hora_entrada).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditForm({ ...editForm, hora_entrada: new Date(e.target.value).toISOString() })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 backdrop-blur-sm transition focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                {/* Hora Salida */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hora Salida
                  </label>
                  <input
                    type="datetime-local"
                    value={editForm.hora_salida ? new Date(editForm.hora_salida).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditForm({ ...editForm, hora_salida: new Date(e.target.value).toISOString() })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 backdrop-blur-sm transition focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                {/* Costo */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Costo
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.costo}
                    onChange={(e) => setEditForm({ ...editForm, costo: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 backdrop-blur-sm transition focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                {/* Descuento */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descuento
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.descuento}
                    onChange={(e) => setEditForm({ ...editForm, descuento: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 backdrop-blur-sm transition focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                {/* Total calculado */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Total:</span>
                    <span className="text-2xl font-bold text-emerald-400">
                      ${(editForm.costo - editForm.descuento).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setModalEditar(null)}
                    disabled={guardando}
                    className="flex-1 rounded-xl border border-gray-400/40 bg-gradient-to-r from-gray-500/20 to-gray-600/20 px-4 py-3 font-semibold text-gray-300 backdrop-blur-xl transition hover:from-gray-500/30 hover:to-gray-600/30 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      if (!modalEditar) return;
                      
                      setGuardando(true);
                      try {
                        const totalCalculado = editForm.costo - editForm.descuento;
                        
                        const response = await fetch('/api/codigos/actualizar', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            id: modalEditar.id,
                            hora_entrada: editForm.hora_entrada,
                            hora_salida: editForm.hora_salida,
                            costo: editForm.costo,
                            descuento: editForm.descuento,
                            total: totalCalculado,
                          }),
                        });

                        if (response.ok) {
                          // Recargar la página para mostrar los cambios
                          window.location.reload();
                        } else {
                          alert('Error al actualizar el registro');
                        }
                      } catch (error) {
                        console.error('Error:', error);
                        alert('Error al guardar los cambios');
                      } finally {
                        setGuardando(false);
                      }
                    }}
                    disabled={guardando}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-purple-400/40 bg-gradient-to-r from-purple-500/20 to-pink-600/20 px-4 py-3 font-semibold text-purple-300 backdrop-blur-xl transition hover:from-purple-500/30 hover:to-pink-600/30 disabled:opacity-50"
                  >
                    {guardando ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        Guardar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
