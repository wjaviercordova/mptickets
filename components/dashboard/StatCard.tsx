"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  borderColor?: string;
  iconColor?: string;
  shadowColor?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  gradient,
  borderColor = "border-blue-500/30",
  iconColor = "text-blue-400",
  shadowColor = "shadow-blue-500/10",
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`group glass-card border ${borderColor} bg-gradient-to-br ${gradient} p-6 shadow-xl ${shadowColor} backdrop-blur-xl transition hover:shadow-2xl`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-blue-200/70">{title}</p>
          <h3 className="font-display mt-2 text-3xl text-white">{value}</h3>
        </div>
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${borderColor} bg-[#0f172a]/50 shadow-lg ${shadowColor} backdrop-blur-sm`}
        >
          <Icon className={`h-7 w-7 ${iconColor} transition group-hover:scale-110`} />
        </motion.div>
      </div>
      <p className="mt-4 text-xs font-medium text-blue-200/60">{description}</p>
    </motion.div>
  );
}
