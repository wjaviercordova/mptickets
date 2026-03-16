/**
 * COMPONENTES DE UI PARA SISTEMA DE LÍMITES
 * ==========================================
 * 
 * Componentes reutilizables para mostrar alertas, badges y estados de límites
 */

'use client';

import { AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ValidacionLimite } from '@/lib/planes-limites';
import { calcularPorcentajeUso, obtenerColorPorcentaje } from '@/lib/planes-limites';

// ============================================================================
// ALERTA DE LÍMITE
// ============================================================================

interface AlertaLimiteProps {
  validacion: ValidacionLimite;
  /** Si debe mostrarse como banner fijo superior */
  sticky?: boolean;
  /** Callback al hacer click en "Actualizar Plan" */
  onActualizarPlan?: () => void;
}

/**
 * Alerta que muestra el estado del límite con mensaje y acción
 * 
 * @example
 * ```tsx
 * <AlertaLimite 
 *   validacion={validacion} 
 *   onActualizarPlan={() => router.push('/contacto')}
 * />
 * ```
 */
export function AlertaLimite({ validacion, sticky = false, onActualizarPlan }: AlertaLimiteProps) {
  if (validacion.nivel === 'info' && validacion.restante > 5) {
    return null; // No mostrar si hay suficiente espacio
  }

  const iconMap = {
    info: Info,
    warning: AlertTriangle,
    error: AlertCircle,
  };

  const colorMap = {
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-400/30',
      text: 'text-blue-200',
      icon: 'text-blue-400',
      button: 'bg-blue-500 hover:bg-blue-600',
    },
    warning: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-400/30',
      text: 'text-orange-200',
      icon: 'text-orange-400',
      button: 'bg-orange-500 hover:bg-orange-600',
    },
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-400/30',
      text: 'text-red-200',
      icon: 'text-red-400',
      button: 'bg-red-500 hover:bg-red-600',
    },
  };

  const Icon = iconMap[validacion.nivel];
  const colors = colorMap[validacion.nivel];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`
          ${colors.bg} ${colors.border} ${colors.text} 
          border rounded-xl p-4 mb-4
          ${sticky ? 'sticky top-0 z-50 backdrop-blur-xl' : ''}
        `}
      >
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colors.icon}`} />
          
          <div className="flex-1">
            <p className="text-sm font-medium">{validacion.mensaje}</p>
            
            <div className="mt-2 flex items-center gap-2 text-xs opacity-80">
              <span>
                {validacion.actual} / {validacion.maximo} en uso
              </span>
              {validacion.restante > 0 && (
                <span>• {validacion.restante} disponible(s)</span>
              )}
            </div>
          </div>

          {validacion.nivel === 'error' && onActualizarPlan && (
            <button
              onClick={onActualizarPlan}
              className={`
                ${colors.button} 
                text-white px-4 py-2 rounded-lg text-sm font-medium
                transition-colors whitespace-nowrap
              `}
            >
              Actualizar Plan
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================================
// BADGE DE LÍMITE
// ============================================================================

interface BadgeLimiteProps {
  actual: number;
  maximo: number;
  /** Mostrar como barra de progreso */
  showProgress?: boolean;
  /** Tamaño del badge */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Badge que muestra el uso actual vs límite máximo
 * 
 * @example
 * ```tsx
 * <BadgeLimite actual={8} maximo={10} showProgress />
 * ```
 */
export function BadgeLimite({ actual, maximo, showProgress = false, size = 'md' }: BadgeLimiteProps) {
  const porcentaje = calcularPorcentajeUso(actual, maximo);
  const colorClasses = obtenerColorPorcentaje(porcentaje);

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div className="space-y-2">
      <div
        className={`
          inline-flex items-center gap-2 rounded-lg border
          ${colorClasses} ${sizeClasses[size]}
          font-medium
        `}
      >
        <span>
          {actual} / {maximo}
        </span>
        <span className="opacity-60">({porcentaje}%)</span>
      </div>

      {showProgress && (
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${porcentaje}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full ${
              porcentaje >= 100
                ? 'bg-red-500'
                : porcentaje >= 80
                ? 'bg-orange-500'
                : porcentaje >= 60
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MODAL DE LÍMITE ALCANZADO
// ============================================================================

interface ModalLimiteAlcanzadoProps {
  open: boolean;
  onClose: () => void;
  tipoRecurso: 'usuarios' | 'tarjetas' | 'tarifas' | 'capacidad';
  planActual: 'demo' | 'basica' | 'premium';
  limiteActual: number;
  onContactar?: () => void;
}

/**
 * Modal informativo cuando se alcanza un límite
 */
export function ModalLimiteAlcanzado({
  open,
  onClose,
  tipoRecurso,
  planActual,
  limiteActual,
  onContactar,
}: ModalLimiteAlcanzadoProps) {
  if (!open) return null;

  const recursoNombres = {
    usuarios: 'usuarios',
    tarjetas: 'tarjetas',
    tarifas: 'tipos de tarifas',
    capacidad: 'espacios de capacidad',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="
            relative w-full max-w-md
            bg-[#0a0e27] border border-white/10 rounded-2xl
            p-6 space-y-4
          "
        >
          {/* Icono */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-400/30 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>

          {/* Título */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              Límite Alcanzado
            </h3>
            <p className="text-blue-200/60 text-sm">
              Has alcanzado el límite máximo de <strong>{limiteActual}</strong>{' '}
              {recursoNombres[tipoRecurso]} permitidos en tu plan{' '}
              <strong className="uppercase">{planActual}</strong>.
            </p>
          </div>

          {/* Beneficios de actualizar */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
            <p className="text-sm font-medium text-white">
              ✨ Actualiza tu plan y obtén:
            </p>
            <ul className="text-sm text-blue-200/80 space-y-1 ml-4">
              <li>• Más {recursoNombres[tipoRecurso]}</li>
              <li>• Funcionalidades premium</li>
              <li>• Soporte prioritario</li>
              <li>• Sin límites de uso</li>
            </ul>
          </div>

          {/* Acciones */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="
                flex-1 px-4 py-2 rounded-lg
                bg-white/5 hover:bg-white/10
                border border-white/10
                text-white text-sm font-medium
                transition-colors
              "
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                onContactar?.();
                onClose();
              }}
              className="
                flex-1 px-4 py-2 rounded-lg
                bg-gradient-to-r from-blue-500 to-cyan-500
                hover:from-blue-600 hover:to-cyan-600
                text-white text-sm font-medium
                transition-all
              "
            >
              Contactar Soporte
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
