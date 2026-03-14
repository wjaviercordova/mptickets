/**
 * Configuración de Planes de Licencia
 * DEMO y PREMIUM
 */

import type { PlanConfig, ConfiguracionNegocio } from '@/types/admin';

// ============================================
// CONFIGURACIÓN BASE
// ============================================

const CONFIGURACION_BASE_NEGOCIO: ConfiguracionNegocio = {
  tema: 'moderno',
  idioma: 'es',
  moneda: 'USD',
  formato_hora: '24h',
  zona_horaria: 'America/Guayaquil',
  formato_fecha: 'DD/MM/YYYY'
};

// ============================================
// PLAN DEMO
// ============================================

export const PLAN_DEMO: PlanConfig = {
  plan: 'demo',
  duracion_dias: 30,
  configuracion: CONFIGURACION_BASE_NEGOCIO,
  limites: {
    usuarios: 1,
    tarjetas: 10,
    capacidad_maxima: 10
  },
  estado: 'activo',
  fecha_expiracion: () => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 30);
    return fecha;
  }
};

// ============================================
// PLAN PREMIUM
// ============================================

export const PLAN_PREMIUM: PlanConfig = {
  plan: 'premium',
  duracion_dias: null, // Sin vencimiento
  configuracion: CONFIGURACION_BASE_NEGOCIO,
  limites: {
    usuarios: 10,
    tarjetas: 100,
    capacidad_maxima: 100
  },
  estado: 'activo',
  fecha_expiracion: null // Sin vencimiento
};

// ============================================
// MAPA DE PLANES
// ============================================

export const PLANES_MAP: Record<string, PlanConfig> = {
  demo: PLAN_DEMO,
  premium: PLAN_PREMIUM
};

// ============================================
// FUNCIONES HELPER
// ============================================

/**
 * Obtiene la configuración de un plan específico
 */
export function getPlanConfig(plan: string): PlanConfig {
  const config = PLANES_MAP[plan];
  if (!config) {
    throw new Error(`Plan '${plan}' no encontrado`);
  }
  return config;
}

/**
 * Calcula la fecha de expiración para un plan
 */
export function calcularFechaExpiracion(plan: string): Date | null {
  const config = getPlanConfig(plan);
  if (config.fecha_expiracion === null) {
    return null;
  }
  return config.fecha_expiracion();
}

/**
 * Obtiene los límites de un plan
 */
export function getLimitesPlan(plan: string) {
  const config = getPlanConfig(plan);
  return config.limites;
}

/**
 * Verifica si un plan tiene vencimiento
 */
export function planTieneVencimiento(plan: string): boolean {
  const config = getPlanConfig(plan);
  return config.duracion_dias !== null;
}

/**
 * Calcula días restantes de una licencia
 */
export function calcularDiasRestantes(fechaExpiracion: string | null): number | null {
  if (!fechaExpiracion) return null;

  const ahora = new Date();
  const expiracion = new Date(fechaExpiracion);
  const diff = expiracion.getTime() - ahora.getTime();
  const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));

  return dias;
}

/**
 * Verifica si una licencia está activa
 */
export function licenciaEstaActiva(
  fechaExpiracion: string | null,
  estado: string
): boolean {
  // Si el estado es suspendido o inactivo, no está activa
  if (estado !== 'activo') return false;

  // Si no tiene fecha de expiración (PREMIUM), está activa
  if (!fechaExpiracion) return true;

  // Verificar si no ha expirado
  const ahora = new Date();
  const expiracion = new Date(fechaExpiracion);
  return expiracion > ahora;
}

/**
 * Obtiene el estado de la licencia
 */
export function getEstadoLicencia(
  fechaExpiracion: string | null
): 'Activa' | 'Expirada' | 'Sin vencimiento' {
  if (!fechaExpiracion) return 'Sin vencimiento';

  const ahora = new Date();
  const expiracion = new Date(fechaExpiracion);

  return expiracion > ahora ? 'Activa' : 'Expirada';
}

/**
 * Determina si debe mostrar alerta de vencimiento
 */
export function necesitaAlertaVencimiento(
  diasRestantes: number | null
): 'vence_pronto' | 'expirada' | null {
  if (diasRestantes === null) return null;
  if (diasRestantes < 0) return 'expirada';
  if (diasRestantes <= 7) return 'vence_pronto';
  return null;
}

// ============================================
// VALIDACIONES
// ============================================

/**
 * Valida si se puede crear un usuario adicional
 */
export function puedeCrearUsuario(
  plan: string,
  usuariosActuales: number
): boolean {
  const limites = getLimitesPlan(plan);
  return usuariosActuales < limites.usuarios;
}

/**
 * Valida si se puede crear una tarjeta adicional
 */
export function puedeCrearTarjeta(
  plan: string,
  tarjetasActuales: number
): boolean {
  const limites = getLimitesPlan(plan);
  return tarjetasActuales < limites.tarjetas;
}

/**
 * Valida si hay capacidad disponible
 */
export function hayCapacidadDisponible(
  plan: string,
  vehiculosActivos: number
): boolean {
  const limites = getLimitesPlan(plan);
  return vehiculosActivos < limites.capacidad_maxima;
}

/**
 * Calcula el porcentaje de uso de tarjetas
 */
export function calcularPorcentajeTarjetas(
  plan: string,
  tarjetasUsadas: number
): number {
  const limites = getLimitesPlan(plan);
  if (limites.tarjetas === 0) return 0;
  return Math.round((tarjetasUsadas / limites.tarjetas) * 100);
}

/**
 * Calcula el porcentaje de ocupación
 */
export function calcularPorcentajeOcupacion(
  plan: string,
  vehiculosActivos: number
): number {
  const limites = getLimitesPlan(plan);
  if (limites.capacidad_maxima === 0) return 0;
  return Math.round((vehiculosActivos / limites.capacidad_maxima) * 100);
}

// ============================================
// INFORMACIÓN PARA UI
// ============================================

export interface PlanInfo {
  nombre: string;
  descripcion: string;
  duracion: string;
  precio: string;
  caracteristicas: string[];
  color: string;
  recomendado: boolean;
}

export const PLANES_INFO: Record<string, PlanInfo> = {
  DEMO: {
    nombre: 'Demo',
    descripcion: 'Plan de prueba por 30 días',
    duracion: '30 días',
    precio: 'Gratis',
    caracteristicas: [
      '1 usuario',
      '10 tarjetas',
      'Capacidad: 10 vehículos',
      'Soporte básico',
      'Funcionalidades limitadas'
    ],
    color: 'amber',
    recomendado: false
  },
  PREMIUM: {
    nombre: 'Premium',
    descripcion: 'Plan completo sin límites de tiempo',
    duracion: 'Sin vencimiento',
    precio: '$99/mes',
    caracteristicas: [
      '10 usuarios',
      '100 tarjetas',
      'Capacidad: 100 vehículos',
      'Soporte prioritario 24/7',
      'Todas las funcionalidades',
      'Reportes avanzados',
      'API access'
    ],
    color: 'emerald',
    recomendado: true
  },
  basica: {
    nombre: 'Básica',
    descripcion: 'Plan anual para negocios pequeños',
    duracion: '1 año',
    precio: '$49/mes',
    caracteristicas: [
      '3 usuarios',
      '30 tarjetas',
      'Capacidad: 30 vehículos',
      'Soporte estándar',
      'Funcionalidades principales'
    ],
    color: 'blue',
    recomendado: false
  }
};

/**
 * Obtiene información de un plan para mostrar en UI
 */
export function getPlanInfo(plan: string): PlanInfo {
  const info = PLANES_INFO[plan];
  if (!info) {
    throw new Error(`Información del plan '${plan}' no encontrada`);
  }
  return info;
}

// ============================================
// COMPARACIÓN DE PLANES
// ============================================

export interface ComparacionPlanes {
  caracteristica: string;
  demo: string | number | boolean;
  basica: string | number | boolean;
  premium: string | number | boolean;
}

export const COMPARACION_PLANES: ComparacionPlanes[] = [
  {
    caracteristica: 'Duración',
    demo: '30 días',
    basica: '1 año',
    premium: 'Sin vencimiento'
  },
  {
    caracteristica: 'Usuarios',
    demo: 1,
    basica: 3,
    premium: 10
  },
  {
    caracteristica: 'Tarjetas',
    demo: 10,
    basica: 30,
    premium: 100
  },
  {
    caracteristica: 'Capacidad de vehículos',
    demo: 10,
    basica: 30,
    premium: 100
  },
  {
    caracteristica: 'Soporte',
    demo: 'Email',
    basica: 'Email + Chat',
    premium: '24/7 Prioritario'
  },
  {
    caracteristica: 'Reportes avanzados',
    demo: false,
    basica: false,
    premium: true
  },
  {
    caracteristica: 'API Access',
    demo: false,
    basica: false,
    premium: true
  },
  {
    caracteristica: 'Personalización',
    demo: 'Básica',
    basica: 'Media',
    premium: 'Completa'
  }
];
