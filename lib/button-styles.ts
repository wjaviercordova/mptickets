/**
 * ESTILOS ESTANDARIZADOS DE BOTONES
 * Sistema Glassmorphism Adaptativo Profesional / Modern Glass Dashboard
 * 
 * Todos los botones de acción deben usar estos estilos para mantener
 * consistencia visual en toda la aplicación.
 */

export const buttonStyles = {
  /**
   * GUARDAR / REGISTRAR / CONFIRMAR
   * Acción primaria positiva
   * Color: Cyan/Blue gradient
   */
  save: "glass-button flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 px-6 py-3 font-semibold text-white backdrop-blur-xl transition hover:from-cyan-500/50 hover:to-blue-600/50 hover:shadow-xl hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed",

  /**
   * EDITAR / MODIFICAR
   * Acción de modificación
   * Color: Purple/Pink gradient
   */
  edit: "rounded-2xl border border-purple-400/40 bg-gradient-to-r from-purple-500/30 to-pink-600/30 px-6 py-3 font-semibold text-white backdrop-blur-xl transition hover:from-purple-500/50 hover:to-pink-600/50 hover:shadow-xl hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed",

  /**
   * RESTAURAR / REVERTIR
   * Acción de restauración
   * Color: Blue slate neutral
   */
  restore: "rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-6 py-3 font-semibold text-blue-200 backdrop-blur-xl transition hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed",

  /**
   * VISTA PREVIA / VER
   * Acción de visualización temporal
   * Color: Purple gradient (lighter)
   */
  preview: "rounded-2xl border border-purple-400/40 bg-gradient-to-r from-purple-500/30 to-pink-600/30 px-6 py-3 font-semibold text-white backdrop-blur-xl transition hover:from-purple-500/50 hover:to-pink-600/50 hover:shadow-xl hover:shadow-purple-500/30",

  /**
   * CANCELAR / CERRAR
   * Acción de cancelación
   * Color: Gray neutral
   */
  cancel: "rounded-2xl border border-gray-500/30 bg-gray-800/40 px-6 py-3 font-semibold text-gray-200 backdrop-blur-xl transition hover:bg-gray-700/50 hover:border-gray-400/40",

  /**
   * ELIMINAR / BORRAR
   * Acción destructiva
   * Color: Red/Orange gradient
   */
  delete: "rounded-2xl border border-red-400/40 bg-gradient-to-r from-red-500/30 to-orange-600/30 px-6 py-3 font-semibold text-white backdrop-blur-xl transition hover:from-red-500/50 hover:to-orange-600/50 hover:shadow-xl hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed",

  /**
   * SELECCIONAR / ELEGIR
   * Acción de selección
   * Color: Cyan/Blue gradient (similar a save pero más suave)
   */
  select: "rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 px-5 py-3 font-semibold text-cyan-300 backdrop-blur-xl transition hover:from-cyan-500/30 hover:to-blue-600/30",

  /**
   * ÉXITO / SUCCESS
   * Acción completada con éxito (botón de registro principal)
   * Color: Emerald/Green gradient
   */
  success: "rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/30 to-green-600/30 px-6 py-4 font-semibold text-white backdrop-blur-xl transition hover:from-emerald-500/50 hover:to-green-600/50 hover:shadow-xl hover:shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed",
};

/**
 * Variantes para tamaños de botones
 */
export const buttonSizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
  xl: "px-10 py-5 text-xl",
};

/**
 * Wrapper para botones con animación Framer Motion
 * Usa con motion.button y whileHover/whileTap
 */
export const motionButtonProps = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
};
