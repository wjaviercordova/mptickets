/**
 * TIPOS Y UTILIDADES PARA SISTEMA DE LÍMITES DE PLANES
 * =====================================================
 * 
 * Define tipos TypeScript, funciones de validación y helpers
 * para el sistema de límites DEMO y PREMIUM
 */

// ============================================================================
// TIPOS
// ============================================================================

/**
 * Tipos de planes disponibles en el sistema
 */
export type PlanTipo = 'demo' | 'basica' | 'premium';

/**
 * Configuración de límites para un plan específico
 */
export interface PlanConfig {
  id: string;
  plan_tipo: PlanTipo;
  
  // Límites de Usuarios
  usuarios_minimo: number;
  usuarios_maximo: number;
  usuarios_por_defecto: number;
  
  // Límites de Tarjetas
  tarjetas_minimo: number;
  tarjetas_maximo: number;
  tarjetas_por_defecto: number;
  
  // Límites de Parámetros/Tarifas
  parametros_minimo: number;
  parametros_maximo: number;
  parametros_por_defecto: number;
  
  // Límites de Capacidad
  capacidad_minimo: number;
  capacidad_maximo: number;
  capacidad_por_defecto: number;
  
  // Metadatos
  descripcion: string | null;
  activo: boolean;
  orden: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

/**
 * Resultado de validación de límite
 */
export interface ValidacionLimite {
  /** Si se puede agregar/completar la acción */
  permitido: boolean;
  
  /** Cantidad actual */
  actual: number;
  
  /** Límite máximo del plan */
  maximo: number;
  
  /** Cantidad restante disponible */
  restante: number;
  
  /** Mensaje descriptivo */
  mensaje: string;
  
  /** Tipo de mensaje (info, warning, error) */
  nivel: 'info' | 'warning' | 'error';
  
  /** Si está al 80% o más del límite (mostrar advertencia) */
  cerca_limite: boolean;
}

/**
 * Estado del recurso respecto a sus límites
 */
export interface EstadoLimite {
  tipo_recurso: 'usuarios' | 'tarjetas' | 'parametros' | 'capacidad';
  cantidad_actual: number;
  limite_minimo: number;
  limite_maximo: number;
  porcentaje_uso: number;
  puede_agregar: boolean;
  puede_eliminar: boolean;
  mensaje_limite?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

/**
 * Configuración hardcoded como fallback (si falla la DB)
 */
export const PLAN_LIMITS_FALLBACK: Record<PlanTipo, Omit<PlanConfig, 'id' | 'fecha_creacion' | 'fecha_actualizacion' | 'orden' | 'activo'>> = {
  demo: {
    plan_tipo: 'demo',
    usuarios_minimo: 1,
    usuarios_maximo: 1,
    usuarios_por_defecto: 1,
    tarjetas_minimo: 1,
    tarjetas_maximo: 10,
    tarjetas_por_defecto: 10,
    parametros_minimo: 1,
    parametros_maximo: 2,
    parametros_por_defecto: 2,
    capacidad_minimo: 1,
    capacidad_maximo: 50,
    capacidad_por_defecto: 10,
    descripcion: 'Plan Demo - Versión de prueba gratuita por 30 días',
  },
  basica: {
    plan_tipo: 'basica',
    usuarios_minimo: 1,
    usuarios_maximo: 5,
    usuarios_por_defecto: 1,
    tarjetas_minimo: 1,
    tarjetas_maximo: 50,
    tarjetas_por_defecto: 20,
    parametros_minimo: 1,
    parametros_maximo: 5,
    parametros_por_defecto: 2,
    capacidad_minimo: 1,
    capacidad_maximo: 200,
    capacidad_por_defecto: 50,
    descripcion: 'Plan Básico - Funcionalidades estándar',
  },
  premium: {
    plan_tipo: 'premium',
    usuarios_minimo: 1,
    usuarios_maximo: 10,
    usuarios_por_defecto: 1,
    tarjetas_minimo: 1,
    tarjetas_maximo: 100,
    tarjetas_por_defecto: 10,
    parametros_minimo: 1,
    parametros_maximo: 10,
    parametros_por_defecto: 1,
    capacidad_minimo: 1,
    capacidad_maximo: 9999,
    capacidad_por_defecto: 50,
    descripcion: 'Plan Premium - Todas las funcionalidades',
  },
};

/**
 * Porcentaje para considerar "cerca del límite"
 */
export const UMBRAL_ADVERTENCIA = 0.8; // 80%

// ============================================================================
// FUNCIONES DE VALIDACIÓN
// ============================================================================

/**
 * Valida si se puede agregar un nuevo elemento del recurso especificado
 * 
 * @param tipoRecurso - Tipo de recurso a validar
 * @param cantidadActual - Cantidad actual del recurso
 * @param planConfig - Configuración del plan actual
 * @returns Resultado de la validación con detalles
 * 
 * @example
 * ```ts
 * const validacion = validarLimiteRecurso('usuarios', 1, planConfig);
 * if (!validacion.permitido) {
 *   alert(validacion.mensaje);
 * }
 * ```
 */
export function validarLimiteRecurso(
  tipoRecurso: 'usuarios' | 'tarjetas' | 'parametros' | 'capacidad',
  cantidadActual: number,
  planConfig: PlanConfig | Omit<PlanConfig, 'id' | 'fecha_creacion' | 'fecha_actualizacion' | 'orden' | 'activo'>
): ValidacionLimite {
  const campo = `${tipoRecurso}_maximo` as keyof typeof planConfig;
  const limiteMaximo = planConfig[campo] as number;
  const restante = limiteMaximo - cantidadActual;
  const porcentajeUso = cantidadActual / limiteMaximo;
  const cercaLimite = porcentajeUso >= UMBRAL_ADVERTENCIA;
  const permitido = cantidadActual < limiteMaximo;

  // Determinar mensaje según estado
  let mensaje: string;
  let nivel: 'info' | 'warning' | 'error';

  if (!permitido) {
    nivel = 'error';
    const recursoNombre = {
      usuarios: 'usuarios',
      tarjetas: 'tarjetas',
      parametros: 'tipos de tarifas',
      capacidad: 'espacios de capacidad',
    }[tipoRecurso];

    mensaje = `Has alcanzado el límite máximo de ${limiteMaximo} ${recursoNombre} para tu plan ${planConfig.plan_tipo.toUpperCase()}. Para agregar más, por favor contacta con soporte para actualizar tu plan.`;
  } else if (cercaLimite) {
    nivel = 'warning';
    mensaje = `Estás cerca del límite (${cantidadActual}/${limiteMaximo}). Considera actualizar tu plan para evitar interrupciones.`;
  } else {
    nivel = 'info';
    mensaje = `Puedes agregar hasta ${restante} más (${cantidadActual}/${limiteMaximo} en uso).`;
  }

  return {
    permitido,
    actual: cantidadActual,
    maximo: limiteMaximo,
    restante,
    mensaje,
    nivel,
    cerca_limite: cercaLimite,
  };
}

/**
 * Obtiene el estado completo de un recurso respecto a sus límites
 * 
 * @param tipoRecurso - Tipo de recurso
 * @param cantidadActual - Cantidad actual
 * @param planConfig - Configuración del plan
 * @returns Estado detallado del recurso
 */
export function obtenerEstadoLimite(
  tipoRecurso: 'usuarios' | 'tarjetas' | 'parametros' | 'capacidad',
  cantidadActual: number,
  planConfig: PlanConfig | Omit<PlanConfig, 'id' | 'fecha_creacion' | 'fecha_actualizacion' | 'orden' | 'activo'>
): EstadoLimite {
  const campoMinimo = `${tipoRecurso}_minimo` as keyof typeof planConfig;
  const campoMaximo = `${tipoRecurso}_maximo` as keyof typeof planConfig;
  
  const limiteMinimo = planConfig[campoMinimo] as number;
  const limiteMaximo = planConfig[campoMaximo] as number;
  
  const porcentajeUso = (cantidadActual / limiteMaximo) * 100;
  const puedeAgregar = cantidadActual < limiteMaximo;
  const puedeEliminar = cantidadActual > limiteMinimo;

  let mensajeLimite: string | undefined;
  
  if (cantidadActual >= limiteMaximo) {
    mensajeLimite = `Límite máximo alcanzado (${limiteMaximo})`;
  } else if (cantidadActual <= limiteMinimo) {
    mensajeLimite = `Límite mínimo requerido (${limiteMinimo})`;
  }

  return {
    tipo_recurso: tipoRecurso,
    cantidad_actual: cantidadActual,
    limite_minimo: limiteMinimo,
    limite_maximo: limiteMaximo,
    porcentaje_uso: Math.round(porcentajeUso),
    puede_agregar: puedeAgregar,
    puede_eliminar: puedeEliminar,
    mensaje_limite: mensajeLimite,
  };
}

/**
 * Verifica si un valor está dentro del rango permitido
 * 
 * @param valor - Valor a verificar
 * @param minimo - Valor mínimo permitido
 * @param maximo - Valor máximo permitido
 * @returns true si está en rango, false en caso contrario
 */
export function estaEnRango(valor: number, minimo: number, maximo: number): boolean {
  return valor >= minimo && valor <= maximo;
}

/**
 * Ajusta un valor para que esté dentro del rango permitido
 * 
 * @param valor - Valor a ajustar
 * @param minimo - Valor mínimo permitido
 * @param maximo - Valor máximo permitido
 * @returns Valor ajustado dentro del rango
 */
export function ajustarARango(valor: number, minimo: number, maximo: number): number {
  return Math.max(minimo, Math.min(maximo, valor));
}

/**
 * Calcula el porcentaje de uso de un recurso
 * 
 * @param actual - Cantidad actual
 * @param maximo - Límite máximo
 * @returns Porcentaje de uso (0-100)
 */
export function calcularPorcentajeUso(actual: number, maximo: number): number {
  if (maximo === 0) return 0;
  return Math.round((actual / maximo) * 100);
}

/**
 * Obtiene el color del badge según el porcentaje de uso
 * 
 * @param porcentaje - Porcentaje de uso (0-100)
 * @returns Clase de color para Tailwind CSS
 */
export function obtenerColorPorcentaje(porcentaje: number): string {
  if (porcentaje >= 100) return 'text-red-400 bg-red-500/20 border-red-500/30';
  if (porcentaje >= 80) return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
  if (porcentaje >= 60) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
  return 'text-green-400 bg-green-500/20 border-green-500/30';
}
