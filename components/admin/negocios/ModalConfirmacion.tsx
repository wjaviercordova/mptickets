"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, CheckCircle2 } from "lucide-react";

interface ModalConfirmacionProps {
  isOpen: boolean;
  tipo: "error" | "confirmacion" | "exito";
  titulo: string;
  mensaje: string | string[];
  textoConfirmar?: string;
  textoCancelar?: string;
  onConfirmar?: () => void;
  onCancelar: () => void;
}

export function ModalConfirmacion({
  isOpen,
  tipo,
  titulo,
  mensaje,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  onConfirmar,
  onCancelar,
}: ModalConfirmacionProps) {
  const esError = tipo === "error";
  const esConfirmacion = tipo === "confirmacion";
  const esExito = tipo === "exito";

  const getIcono = () => {
    if (esError || esConfirmacion) {
      return <AlertTriangle className="h-12 w-12" />;
    }
    if (esExito) {
      return <CheckCircle2 className="h-12 w-12" />;
    }
    return <Trash2 className="h-12 w-12" />;
  };

  const getColorClasses = () => {
    if (esError) {
      return {
        icon: "text-red-400",
        iconBg: "bg-red-500/20 border-red-400/30",
        titulo: "text-red-300",
        botonPrincipal: "border-red-400/40 bg-gradient-to-r from-red-500/25 to-red-600/15 text-red-200 hover:from-red-500/35 hover:to-red-600/25",
      };
    }
    if (esExito) {
      return {
        icon: "text-emerald-400",
        iconBg: "bg-emerald-500/20 border-emerald-400/30",
        titulo: "text-emerald-300",
        botonPrincipal: "border-emerald-400/40 bg-gradient-to-r from-emerald-500/25 to-green-600/15 text-emerald-200 hover:from-emerald-500/35 hover:to-green-600/25",
      };
    }
    // Confirmación (amarillo)
    return {
      icon: "text-yellow-400",
      iconBg: "bg-yellow-500/20 border-yellow-400/30",
      titulo: "text-yellow-300",
      botonPrincipal: "border-red-400/40 bg-gradient-to-r from-red-500/25 to-red-600/15 text-red-200 hover:from-red-500/35 hover:to-red-600/25",
    };
  };

  const colores = getColorClasses();

  const mensajeArray = Array.isArray(mensaje) ? mensaje : [mensaje];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={esError || esExito ? onCancelar : undefined}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#1e293b]/98 to-[#0f172a]/98 p-8 backdrop-blur-xl shadow-2xl"
          >
            {/* Icono */}
            <div className="mb-6 flex justify-center">
              <div className={`flex h-20 w-20 items-center justify-center rounded-2xl border ${colores.iconBg}`}>
                <div className={colores.icon}>
                  {getIcono()}
                </div>
              </div>
            </div>

            {/* Título */}
            <h2 className={`mb-4 text-center font-heading text-2xl font-bold ${colores.titulo}`}>
              {titulo}
            </h2>

            {/* Mensaje */}
            <div className="mb-6 space-y-2 text-center">
              {mensajeArray.map((linea, index) => (
                <p key={index} className="text-blue-200/80">
                  {linea}
                </p>
              ))}
            </div>

            {/* Botones */}
            <div className={`flex gap-3 ${esError || esExito ? 'justify-center' : ''}`}>
              {(esError || esExito) ? (
                <button
                  onClick={onCancelar}
                  className={`flex-1 rounded-xl px-6 py-3 font-medium transition ${colores.botonPrincipal}`}
                >
                  {textoCancelar}
                </button>
              ) : (
                <>
                  <button
                    onClick={onCancelar}
                    className="flex-1 rounded-xl border border-blue-400/40 bg-gradient-to-r from-blue-500/25 to-cyan-600/15 px-4 py-3 font-medium text-blue-200 transition hover:from-blue-500/35 hover:to-cyan-600/25"
                  >
                    {textoCancelar}
                  </button>
                  {onConfirmar && (
                    <button
                      onClick={onConfirmar}
                      className={`flex-1 rounded-xl px-4 py-3 font-medium transition ${colores.botonPrincipal}`}
                    >
                      {textoConfirmar}
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
