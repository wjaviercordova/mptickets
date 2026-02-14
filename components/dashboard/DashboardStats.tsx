"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Car,
  CreditCard,
  DollarSign,
  Timer,
  Search,
  BarChart3,
  ChevronRight,
  Zap,
  Database,
  Shield,
  Wallet,
  CheckCircle2,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";

const iconMap: Record<string, LucideIcon> = {
  car: Car,
  dollar: DollarSign,
  ticket: CreditCard,
  timer: Timer,
  activity: Activity,
};

interface StatItem {
  title: string;
  value: string;
  description: string;
  icon: keyof typeof iconMap;
  gradient: string;
}

interface MovementItem {
  id: string;
  codigo: string | null;
  placa: string | null;
  hora_entrada: string | null;
  hora_salida: string | null;
  total: number | null;
  relative: string;
}

interface DashboardStatsProps {
  stats: StatItem[];
  movements: MovementItem[];
}

export function DashboardStats({ stats, movements }: DashboardStatsProps) {
  return (
    <>
      {/* Acciones Rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/80 p-8 backdrop-blur-xl shadow-xl shadow-blue-500/5"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-400/30 bg-gradient-to-br from-yellow-500/20 to-amber-500/10 shadow-lg shadow-yellow-500/10">
            <Zap className="h-6 w-6 text-yellow-400" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-white">Acciones Rápidas</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { 
              icon: Car, 
              title: 'Ingreso de Vehículo', 
              subtitle: 'Registrar entrada rápida', 
              gradient: 'from-emerald-500/20 to-green-600/10', 
              border: 'border-emerald-400/30', 
              iconColor: 'text-emerald-400', 
              shadow: 'shadow-emerald-500/10' 
            },
            { 
              icon: CreditCard, 
              title: 'Procesar Pago', 
              subtitle: 'Cobro y salida de vehículo', 
              gradient: 'from-amber-500/20 to-yellow-600/10', 
              border: 'border-amber-400/30', 
              iconColor: 'text-amber-400', 
              shadow: 'shadow-amber-500/10' 
            },
            { 
              icon: Search, 
              title: 'Consultas Rápidas', 
              subtitle: 'Buscar vehículo por placa', 
              gradient: 'from-purple-500/20 to-pink-600/10', 
              border: 'border-purple-400/30', 
              iconColor: 'text-purple-400', 
              shadow: 'shadow-purple-500/10' 
            },
            { 
              icon: BarChart3, 
              title: 'Generar Reporte', 
              subtitle: 'Reportes e informes', 
              gradient: 'from-cyan-500/20 to-blue-600/10', 
              border: 'border-cyan-400/30', 
              iconColor: 'text-cyan-400', 
              shadow: 'shadow-cyan-500/10' 
            },
          ].map((action, index) => (
            <motion.button
              key={action.title}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + (0.1 * index) }}
              className={`group flex flex-col items-start gap-3 rounded-2xl border ${action.border} bg-gradient-to-br ${action.gradient} p-6 text-left backdrop-blur-sm ${action.shadow} shadow-lg transition hover:shadow-xl`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${action.border} bg-[#0f172a]/60 ${action.shadow} shadow-md backdrop-blur-sm transition group-hover:scale-110`}>
                <action.icon className={`h-6 w-6 ${action.iconColor}`} />
              </div>
              <div>
                <h3 className="font-semibold text-white">{action.title}</h3>
                <p className="text-xs text-blue-200/60">{action.subtitle}</p>
              </div>
              <ChevronRight className="ml-auto h-5 w-5 text-blue-300/60 transition group-hover:translate-x-1 group-hover:text-white" />
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          // Definir colores personalizados según el índice
          const colors = [
            {
              borderColor: 'border-emerald-400/30',
              iconColor: 'text-emerald-400',
              shadowColor: 'shadow-emerald-500/10',
              gradient: 'from-emerald-500/20 to-green-600/10'
            },
            {
              borderColor: 'border-amber-400/30',
              iconColor: 'text-amber-400',
              shadowColor: 'shadow-amber-500/10',
              gradient: 'from-amber-500/20 to-yellow-600/10'
            },
            {
              borderColor: 'border-cyan-400/30',
              iconColor: 'text-cyan-400',
              shadowColor: 'shadow-cyan-500/10',
              gradient: 'from-cyan-500/20 to-blue-600/10'
            },
            {
              borderColor: 'border-purple-400/30',
              iconColor: 'text-purple-400',
              shadowColor: 'shadow-purple-500/10',
              gradient: 'from-purple-500/20 to-pink-600/10'
            },
          ];
          
          return (
            <motion.div
              key={stat.title}
              whileHover={{ scale: 1.02, y: -4 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (index * 0.1) }}
            >
              <StatCard
                title={stat.title}
                value={stat.value}
                description={stat.description}
                icon={iconMap[stat.icon]}
                gradient={colors[index]?.gradient || stat.gradient}
                borderColor={colors[index]?.borderColor}
                iconColor={colors[index]?.iconColor}
                shadowColor={colors[index]?.shadowColor}
              />
            </motion.div>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card border border-blue-500/20 bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/80 p-6 shadow-xl shadow-blue-500/5 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300/70">
                Actividad reciente
              </p>
              <h3 className="font-heading text-xl text-white">
                Últimos movimientos
              </h3>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {movements.length > 0 ? (
              movements.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="flex items-center justify-between rounded-2xl border border-blue-500/20 bg-gradient-to-r from-[#1e293b]/50 to-[#0f172a]/70 px-4 py-3 text-sm text-blue-100/90 backdrop-blur-sm transition hover:border-cyan-400/50 hover:from-blue-500/20 hover:to-cyan-600/10 hover:shadow-lg hover:shadow-cyan-500/10"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {item.hora_salida
                        ? `Salida ${item.codigo ?? ""}`
                        : `Entrada ${item.codigo ?? ""}`}
                    </span>
                    <span className="text-xs text-blue-200/60">
                      {item.placa ? `Placa ${item.placa}` : "Sin placa"}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-cyan-300/80">
                    {item.relative}
                  </span>
                </motion.div>
              ))
            ) : (
              <div className="rounded-2xl border border-blue-500/20 bg-[#0f172a]/40 px-4 py-3 text-sm text-blue-200/60 backdrop-blur-sm">
                Sin movimientos recientes.
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card border border-blue-500/20 bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/80 p-6 shadow-xl shadow-blue-500/5 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300/70">
                Monitoreo en tiempo real
              </p>
              <h3 className="font-heading text-xl text-white">
                Estado del Sistema
              </h3>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.8)]"
            />
          </div>
          <div className="mt-6 space-y-3">
            {/* Base de Datos */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/25 to-green-600/15 px-4 py-3 backdrop-blur-sm shadow-lg shadow-emerald-500/15"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-500/20">
                  <Database className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-emerald-200">Base de Datos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-300">Conectada</span>
              </div>
            </motion.div>

            {/* Sistema de Pago */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-500/20 to-cyan-600/10 px-4 py-3 backdrop-blur-sm transition hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-400/30 bg-blue-500/20">
                  <Wallet className="h-4 w-4 text-cyan-400" />
                </div>
                <span className="text-sm font-medium text-blue-200">Sistema de Pago</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-medium text-cyan-300">Operativo</span>
              </div>
            </motion.div>

            {/* Seguridad */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between rounded-2xl border border-purple-400/30 bg-gradient-to-r from-purple-500/20 to-pink-600/10 px-4 py-3 backdrop-blur-sm transition hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-400/30 bg-purple-500/20">
                  <Shield className="h-4 w-4 text-purple-400" />
                </div>
                <span className="text-sm font-medium text-purple-200">Seguridad</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-400" />
                <span className="text-xs font-medium text-purple-300">Activa</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
