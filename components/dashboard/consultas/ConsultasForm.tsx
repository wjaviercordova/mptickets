"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Ticket,
  DollarSign,
  Car,
  Activity,
} from "lucide-react";
import { TarjetasEmitidasTab } from "./TarjetasEmitidasTab";
import { CostosRegistradosTab } from "./CostosRegistradosTab";
import { VehiculosTab } from "./VehiculosTab";
import { ActividadTab } from "./ActividadTab";
import { usePageHeader } from "@/contexts/PageHeaderContext";

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
  costo: number | null;
  descuento: number | null;
  total: number | null;
  metodo_pago: string | null;
  estado: string;
  observaciones: string | null;
  tipo_vehiculo: string;
  tarjetas?: {
    codigo: string;
    codigo_barras: string | null;
    codigo_interno: string;
  };
}

interface Negocio {
  nombre: string;
  plan: string;
  capacidad_maxima: number;
}

interface ConsultasFormProps {
  tarjetasEmitidas: Tarjeta[];
  codigos: Codigo[];
  negocio: Negocio | null;
  negocioId: string;
}

type TabType = "tarjetas" | "costos" | "vehiculos" | "actividad";

export function ConsultasForm({
  tarjetasEmitidas,
  codigos,
  negocio,
}: ConsultasFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>("tarjetas");
  const { setHeaderInfo } = usePageHeader();

  // Setear información del header al montar el componente
  useEffect(() => {
    setHeaderInfo({
      icon: Search,
      title: "Consultas",
      subtitle: "Análisis y Reportes",
    });
    
    // Limpiar al desmontar
    return () => setHeaderInfo(null);
  }, [setHeaderInfo]);

  const tabs = [
    { id: "tarjetas" as TabType, label: "Tarjetas Emitidas", icon: Ticket },
    { id: "costos" as TabType, label: "Costos Registrados", icon: DollarSign },
    { id: "vehiculos" as TabType, label: "Vehículos", icon: Car },
    { id: "actividad" as TabType, label: "Actividad", icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-3xl border px-6 py-3 font-medium backdrop-blur-sm transition ${
                isActive
                  ? "border-emerald-500/50 bg-gradient-to-r from-emerald-500/20 to-green-600/20 text-emerald-400 shadow-lg shadow-emerald-500/20"
                  : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "tarjetas" && (
            <TarjetasEmitidasTab
              tarjetas={tarjetasEmitidas}
              codigos={codigos}
            />
          )}
          {activeTab === "costos" && (
            <CostosRegistradosTab
              codigos={codigos}
            />
          )}
          {activeTab === "vehiculos" && (
            <VehiculosTab
              codigos={codigos}
            />
          )}
          {activeTab === "actividad" && (
            <ActividadTab
              codigos={codigos}
              negocio={negocio}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
