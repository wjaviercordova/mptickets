/**
 * FUNCIONES DE SERVIDOR PARA GESTIÓN DE PLANES Y LÍMITES
 * =======================================================
 * 
 * Operaciones CRUD y validaciones server-side para planes_config
 */

import { supabaseAdmin } from '@/lib/supabase/admin-client';
import type { PlanConfig, PlanTipo } from '@/lib/planes-limites';

// ============================================================================
// FUNCIONES DE LECTURA
// ============================================================================

/**
 * Obtiene la configuración de un plan específico desde la base de datos
 * 
 * @param planTipo - Tipo de plan (demo, basica, premium)
 * @returns Configuración del plan o null si no existe
 * 
 * @example
 * ```ts
 * const config = await obtenerConfigPlan('demo');
 * if (config) {
 *   console.log(`Límite de usuarios: ${config.usuarios_maximo}`);
 * }
 * ```
 */
export async function obtenerConfigPlan(
  planTipo: PlanTipo
): Promise<PlanConfig | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('planes_config')
      .select('*')
      .eq('plan_tipo', planTipo)
      .eq('activo', true)
      .single();

    if (error) {
      console.error(`[obtenerConfigPlan] Error obteniendo config para ${planTipo}:`, error);
      return null;
    }

    return data as PlanConfig;
  } catch (error) {
    console.error('[obtenerConfigPlan] Error inesperado:', error);
    return null;
  }
}

/**
 * Obtiene todas las configuraciones de planes activos
 * 
 * @returns Array de configuraciones de planes ordenadas por orden
 */
export async function obtenerTodosLosPlanes(): Promise<PlanConfig[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('planes_config')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (error) {
      console.error('[obtenerTodosLosPlanes] Error:', error);
      return [];
    }

    return data as PlanConfig[];
  } catch (error) {
    console.error('[obtenerTodosLosPlanes] Error inesperado:', error);
    return [];
  }
}

/**
 * Obtiene la configuración del plan asociado a un negocio específico
 * 
 * @param negocioId - UUID del negocio
 * @returns Configuración del plan del negocio o null
 */
export async function obtenerConfigPlanDeNegocio(
  negocioId: string
): Promise<PlanConfig | null> {
  try {
    // 1. Obtener el plan del negocio
    const { data: negocio, error: errorNegocio } = await supabaseAdmin
      .from('negocios')
      .select('plan')
      .eq('id', negocioId)
      .single();

    if (errorNegocio || !negocio) {
      console.error('[obtenerConfigPlanDeNegocio] Error obteniendo negocio:', errorNegocio);
      return null;
    }

    // 2. Obtener configuración del plan
    return await obtenerConfigPlan(negocio.plan as PlanTipo);
  } catch (error) {
    console.error('[obtenerConfigPlanDeNegocio] Error inesperado:', error);
    return null;
  }
}

// ============================================================================
// FUNCIONES DE VALIDACIÓN
// ============================================================================

/**
 * Valida si un negocio puede agregar un nuevo usuario
 * 
 * @param negocioId - UUID del negocio
 * @returns { permitido: boolean, mensaje: string, limiteActual: number, limiteMaximo: number }
 */
export async function validarAgregarUsuario(negocioId: string): Promise<{
  permitido: boolean;
  mensaje: string;
  actual: number;
  maximo: number;
}> {
  try {
    // 1. Obtener configuración del plan
    const planConfig = await obtenerConfigPlanDeNegocio(negocioId);
    if (!planConfig) {
      return {
        permitido: false,
        mensaje: 'No se pudo verificar el límite de usuarios del plan',
        actual: 0,
        maximo: 0,
      };
    }

    // 2. Contar usuarios actuales del negocio
    const { count, error } = await supabaseAdmin
      .from('usuarios')
      .select('*', { count: 'exact', head: true })
      .eq('negocio_id', negocioId)
      .eq('estado', '1'); // Solo usuarios activos

    if (error) {
      console.error('[validarAgregarUsuario] Error contando usuarios:', error);
      return {
        permitido: false,
        mensaje: 'Error al verificar límite de usuarios',
        actual: 0,
        maximo: planConfig.usuarios_maximo,
      };
    }

    const usuariosActuales = count || 0;
    const permitido = usuariosActuales < planConfig.usuarios_maximo;

    let mensaje: string;
    if (!permitido) {
      mensaje = `Has alcanzado el límite máximo de ${planConfig.usuarios_maximo} usuario(s) para tu plan ${planConfig.plan_tipo.toUpperCase()}. Para agregar más usuarios, contacta con soporte para actualizar tu plan.`;
    } else {
      const restantes = planConfig.usuarios_maximo - usuariosActuales;
      mensaje = `Puedes agregar ${restantes} usuario(s) más (${usuariosActuales}/${planConfig.usuarios_maximo} en uso)`;
    }

    return {
      permitido,
      mensaje,
      actual: usuariosActuales,
      maximo: planConfig.usuarios_maximo,
    };
  } catch (error) {
    console.error('[validarAgregarUsuario] Error inesperado:', error);
    return {
      permitido: false,
      mensaje: 'Error al validar límite de usuarios',
      actual: 0,
      maximo: 0,
    };
  }
}

/**
 * Valida si un negocio puede agregar una nueva tarjeta
 */
export async function validarAgregarTarjeta(negocioId: string): Promise<{
  permitido: boolean;
  mensaje: string;
  actual: number;
  maximo: number;
}> {
  try {
    const planConfig = await obtenerConfigPlanDeNegocio(negocioId);
    if (!planConfig) {
      return {
        permitido: false,
        mensaje: 'No se pudo verificar el límite de tarjetas del plan',
        actual: 0,
        maximo: 0,
      };
    }

    const { count, error } = await supabaseAdmin
      .from('tarjetas')
      .select('*', { count: 'exact', head: true })
      .eq('negocio_id', negocioId)
      .eq('estado', '1');

    if (error) {
      console.error('[validarAgregarTarjeta] Error contando tarjetas:', error);
      return {
        permitido: false,
        mensaje: 'Error al verificar límite de tarjetas',
        actual: 0,
        maximo: planConfig.tarjetas_maximo,
      };
    }

    const tarjetasActuales = count || 0;
    const permitido = tarjetasActuales < planConfig.tarjetas_maximo;

    let mensaje: string;
    if (!permitido) {
      mensaje = `Has alcanzado el límite máximo de ${planConfig.tarjetas_maximo} tarjeta(s) para tu plan ${planConfig.plan_tipo.toUpperCase()}. Para agregar más tarjetas, contacta con soporte para actualizar tu plan.`;
    } else {
      const restantes = planConfig.tarjetas_maximo - tarjetasActuales;
      mensaje = `Puedes agregar ${restantes} tarjeta(s) más (${tarjetasActuales}/${planConfig.tarjetas_maximo} en uso)`;
    }

    return {
      permitido,
      mensaje,
      actual: tarjetasActuales,
      maximo: planConfig.tarjetas_maximo,
    };
  } catch (error) {
    console.error('[validarAgregarTarjeta] Error inesperado:', error);
    return {
      permitido: false,
      mensaje: 'Error al validar límite de tarjetas',
      actual: 0,
      maximo: 0,
    };
  }
}

/**
 * Valida si un negocio puede agregar un nuevo parámetro/tarifa
 */
export async function validarAgregarParametro(negocioId: string): Promise<{
  permitido: boolean;
  mensaje: string;
  actual: number;
  maximo: number;
}> {
  try {
    const planConfig = await obtenerConfigPlanDeNegocio(negocioId);
    if (!planConfig) {
      return {
        permitido: false,
        mensaje: 'No se pudo verificar el límite de tarifas del plan',
        actual: 0,
        maximo: 0,
      };
    }

    const { count, error } = await supabaseAdmin
      .from('parametros')
      .select('*', { count: 'exact', head: true })
      .eq('negocio_id', negocioId)
      .eq('estado', 'activo');

    if (error) {
      console.error('[validarAgregarParametro] Error contando parámetros:', error);
      return {
        permitido: false,
        mensaje: 'Error al verificar límite de tarifas',
        actual: 0,
        maximo: planConfig.parametros_maximo,
      };
    }

    const parametrosActuales = count || 0;
    const permitido = parametrosActuales < planConfig.parametros_maximo;

    let mensaje: string;
    if (!permitido) {
      mensaje = `Has alcanzado el límite máximo de ${planConfig.parametros_maximo} tipo(s) de tarifa para tu plan ${planConfig.plan_tipo.toUpperCase()}. Para agregar más tipos de tarifas, contacta con soporte para actualizar tu plan.`;
    } else {
      const restantes = planConfig.parametros_maximo - parametrosActuales;
      mensaje = `Puedes agregar ${restantes} tipo(s) de tarifa más (${parametrosActuales}/${planConfig.parametros_maximo} en uso)`;
    }

    return {
      permitido,
      mensaje,
      actual: parametrosActuales,
      maximo: planConfig.parametros_maximo,
    };
  } catch (error) {
    console.error('[validarAgregarParametro] Error inesperado:', error);
    return {
      permitido: false,
      mensaje: 'Error al validar límite de tarifas',
      actual: 0,
      maximo: 0,
    };
  }
}

// ============================================================================
// FUNCIONES DE ACTUALIZACIÓN
// ============================================================================

/**
 * Actualiza la configuración de un plan (solo admin sistema)
 * 
 * @param planTipo - Tipo de plan a actualizar
 * @param actualizaciones - Campos a actualizar
 * @returns true si se actualizó correctamente
 */
export async function actualizarConfigPlan(
  planTipo: PlanTipo,
  actualizaciones: Partial<Omit<PlanConfig, 'id' | 'plan_tipo' | 'fecha_creacion'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('planes_config')
      .update({
        ...actualizaciones,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq('plan_tipo', planTipo);

    if (error) {
      console.error('[actualizarConfigPlan] Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('[actualizarConfigPlan] Error inesperado:', error);
    return { success: false, error: 'Error inesperado al actualizar' };
  }
}
