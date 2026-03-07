"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users,
  CreditCard,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { GeneralTab } from "../configuracion/negocio/GeneralTab";
import { UsuariosTab } from "../configuracion/negocio/UsuariosTab";
import { TarjetasTab } from "../configuracion/negocio/TarjetasTab";
import { usePageHeader } from "@/contexts/PageHeaderContext";

interface Negocio {
  id: string;
  nombre: string;
  descripcion: string | null;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  ciudad: string | null;
  logo_url: string | null;
  plan: string;
  estado: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  codigo: string;
}

interface Usuario {
  id: string;
  negocio_id: string;
  usuario: string;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  avatar_url: string | null;
  password: string;
  estado: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  rol: string;
  permisos: Record<string, boolean>;
}

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

interface NegocioFormProps {
  negocio: Negocio | null;
  usuarios: Usuario[];
  tarjetas: Tarjeta[];
  negocioId: string;
}

type TabType = "general" | "usuarios" | "tarjetas";

export function NegocioForm({
  negocio,
  usuarios,
  tarjetas,
  negocioId,
}: NegocioFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const { setHeaderInfo } = usePageHeader();

  // Setear información del header al montar el componente
  useEffect(() => {
    setHeaderInfo({
      icon: Building2,
      title: "Configuración",
      subtitle: "Gestión del Negocio",
    });
    
    // Limpiar al desmontar
    return () => setHeaderInfo(null);
  }, [setHeaderInfo]);

  const tabs = [
    { id: "general" as TabType, label: "General", icon: Building2 },
    { id: "usuarios" as TabType, label: "Usuarios", icon: Users },
    { id: "tarjetas" as TabType, label: "Tarjetas", icon: CreditCard },
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
              className={`flex items-center gap-2 rounded-2xl border px-6 py-3 font-medium backdrop-blur-sm transition ${
                isActive
                  ? "border-cyan-400/50 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-cyan-100 shadow-lg shadow-cyan-500/20"
                  : "border-blue-400/20 bg-blue-950/30 text-blue-200 hover:border-blue-400/40 hover:bg-blue-900/40"
              }`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </motion.button>
          );
        })}
      </div>

      {/* Mensaje de retroalimentación */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-3 rounded-2xl border p-4 backdrop-blur-sm ${
              message.type === "success"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                : "border-red-400/30 bg-red-500/10 text-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-400" />
            )}
            <span className="font-medium">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenido de los tabs */}
      {activeTab === "general" && negocio && (
        <GeneralTab
          negocio={negocio}
          onSuccess={(msg) => {
            setMessage({ type: "success", text: msg });
            setTimeout(() => setMessage(null), 5000);
          }}
          onError={(msg) => {
            setMessage({ type: "error", text: msg });
            setTimeout(() => setMessage(null), 5000);
          }}
        />
      )}

      {activeTab === "usuarios" && (
        <UsuariosTab
          negocioId={negocioId}
          usuarios={usuarios}
          onSuccess={(msg: string) => {
            setMessage({ type: "success", text: msg });
            setTimeout(() => setMessage(null), 5000);
          }}
          onError={(msg: string) => {
            setMessage({ type: "error", text: msg });
            setTimeout(() => setMessage(null), 5000);
          }}
        />
      )}

      {activeTab === "tarjetas" && (
        <TarjetasTab
          negocioId={negocioId}
          tarjetas={tarjetas}
          onSuccess={(msg: string) => {
            setMessage({ type: "success", text: msg });
            setTimeout(() => setMessage(null), 5000);
          }}
          onError={(msg: string) => {
            setMessage({ type: "error", text: msg });
            setTimeout(() => setMessage(null), 5000);
          }}
        />
      )}
    </div>
  );
}

