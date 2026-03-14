"use client";

import { motion } from "framer-motion";
import { Building2, CheckCircle2, ShieldCheck, FileText, TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

function StatCard({ title, value, description, icon: Icon, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card group relative overflow-hidden border-purple-400/20 bg-gradient-to-br from-[#0f172a]/90 to-[#1e1b4b]/50 p-6 shadow-xl shadow-purple-500/5 transition-all hover:border-purple-400/40 hover:shadow-purple-500/10"
    >
      {/* Efecto de brillo en hover */}
      <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl transition-opacity group-hover:opacity-100 opacity-0" />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="font-body text-sm font-medium text-blue-200/70">{title}</p>
          <h3 className="mt-2 font-display text-3xl font-bold text-white">{value}</h3>
          {description && (
            <p className="mt-1 font-caption text-xs text-blue-200/50">{description}</p>
          )}

          {trend && (
            <div
              className={`mt-3 flex items-center gap-1 font-caption text-xs ${
                trend.isPositive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              <TrendingUp
                className={`h-3 w-3 ${trend.isPositive ? "" : "rotate-180"}`}
              />
              <span>
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
              <span className="text-blue-200/50">vs mes anterior</span>
            </div>
          )}
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-400/30 bg-gradient-to-br from-purple-500/20 to-pink-600/10 shadow-lg shadow-purple-500/10">
          <Icon className="h-6 w-6 text-purple-300" />
        </div>
      </div>

      {/* Barra de progreso decorativa */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.6 }}
        className="absolute bottom-0 left-0 h-1 w-full origin-left bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-transparent"
      />
    </motion.div>
  );
}

interface DashboardStatsProps {
  stats?: {
    totalNegocios: number;
    negociosActivos: number;
    totalAdmins: number;
    totalUsuarios: number;
  };
  loading?: boolean;
}

export default function DashboardStats({ stats, loading = false }: DashboardStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="glass-card h-36 animate-pulse border-purple-400/20 bg-[#0f172a]/50"
          />
        ))}
      </div>
    );
  }

  const defaultStats = {
    totalNegocios: 0,
    negociosActivos: 0,
    totalAdmins: 0,
    totalUsuarios: 0,
  };

  const displayStats = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total Negocios"
        value={displayStats.totalNegocios}
        description="Negocios registrados"
        icon={Building2}
        trend={{ value: 12, isPositive: true }}
        delay={0}
      />

      <StatCard
        title="Negocios Activos"
        value={displayStats.negociosActivos}
        description="Con acceso habilitado"
        icon={CheckCircle2}
        trend={{ value: 8, isPositive: true }}
        delay={0.1}
      />

      <StatCard
        title="Usuarios Admin"
        value={displayStats.totalAdmins}
        description="Administradores del sistema"
        icon={ShieldCheck}
        delay={0.2}
      />

      <StatCard
        title="Usuarios del Sistema"
        value={displayStats.totalUsuarios}
        description="Usuarios de negocios"
        icon={FileText}
        delay={0.3}
      />
    </div>
  );
}
