/**
 * HOOK PERSONALIZADO PARA GESTIÓN DE LÍMITES DE PLAN
 * ===================================================
 * 
 * Hook React para validar límites y mostrar mensajes en UI
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PlanConfig, ValidacionLimite } from '@/lib/planes-limites';
import { validarLimiteRecurso, obtenerEstadoLimite, PLAN_LIMITS_FALLBACK } from '@/lib/planes-limites';

interface UseLimitesOptions {
  /** ID del negocio actual */
  negocioId?: string;
  
  /** Plan actual del negocio */
  planTipo?: 'demo' | 'basica' | 'premium';
  
  /** Si debe recargar automáticamente */
  autoRefresh?: boolean;
}

interface UseLimitesReturn {
  /** Configuración del plan cargada */
  planConfig: PlanConfig | null;
  
  /** Si está cargando */
  loading: boolean;
  
  /** Error si ocurrió */
  error: string | null;
  
  /** Valida si puede agregar un usuario */
  validarUsuarios: (cantidadActual: number) => ValidacionLimite;
  
  /** Valida si puede agregar una tarjeta */
  validarTarjetas: (cantidadActual: number) => ValidacionLimite;
  
  /** Valida si puede agregar un parámetro/tarifa */
  validarParametros: (cantidadActual: number) => ValidacionLimite;
  
  /** Valida si puede agregar capacidad */
  validarCapacidad: (cantidadActual: number) => ValidacionLimite;
  
  /** Recarga la configuración del plan */
  refetch: () => Promise<void>;
}

/**
 * Hook para gestionar límites de plan en componentes
 * 
 * @param options - Opciones del hook
 * @returns Funciones y estado para gestionar límites
 * 
 * @example
 * ```tsx
 * function UsuariosTab() {
 *   const { validarUsuarios, planConfig } = useLimites({ 
 *     planTipo: 'demo' 
 *   });
 *   
 *   const [usuarios, setUsuarios] = useState([]);
 *   const validacion = validarUsuarios(usuarios.length);
 *   
 *   return (
 *     <button 
 *       disabled={!validacion.permitido}
 *       onClick={handleAgregar}
 *     >
 *       Agregar Usuario
 *     </button>
 *   );
 * }
 * ```
 */
export function useLimites(options: UseLimitesOptions = {}): UseLimitesReturn {
  const { negocioId, planTipo, autoRefresh = false } = options;
  
  const [planConfig, setPlanConfig] = useState<PlanConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar configuración del plan
  const fetchPlanConfig = useCallback(async () => {
    if (!negocioId && !planTipo) {
      setError('Se requiere negocioId o planTipo');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let endpoint = '/api/planes-config';
      
      if (negocioId) {
        endpoint += `?negocioId=${negocioId}`;
      } else if (planTipo) {
        endpoint += `?planTipo=${planTipo}`;
      }

      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error('Error al cargar configuración del plan');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setPlanConfig(data.config);
    } catch (err) {
      console.error('[useLimites] Error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      
      // Usar configuración fallback
      if (planTipo) {
        const fallback = PLAN_LIMITS_FALLBACK[planTipo];
        setPlanConfig({
          ...fallback,
          id: 'fallback',
          fecha_creacion: new Date().toISOString(),
          fecha_actualizacion: new Date().toISOString(),
          orden: 0,
          activo: true,
        } as PlanConfig);
      }
    } finally {
      setLoading(false);
    }
  }, [negocioId, planTipo]);

  // Cargar al montar y cuando cambian las dependencias
  useEffect(() => {
    fetchPlanConfig();
  }, [fetchPlanConfig]);

  // Auto-refresh cada 5 minutos si está habilitado
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchPlanConfig();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [autoRefresh, fetchPlanConfig]);

  // Funciones de validación
  const validarUsuarios = useCallback((cantidadActual: number): ValidacionLimite => {
    if (!planConfig) {
      return {
        permitido: false,
        actual: cantidadActual,
        maximo: 0,
        restante: 0,
        mensaje: 'Configuración del plan no disponible',
        nivel: 'error',
        cerca_limite: false,
      };
    }
    return validarLimiteRecurso('usuarios', cantidadActual, planConfig);
  }, [planConfig]);

  const validarTarjetas = useCallback((cantidadActual: number): ValidacionLimite => {
    if (!planConfig) {
      return {
        permitido: false,
        actual: cantidadActual,
        maximo: 0,
        restante: 0,
        mensaje: 'Configuración del plan no disponible',
        nivel: 'error',
        cerca_limite: false,
      };
    }
    return validarLimiteRecurso('tarjetas', cantidadActual, planConfig);
  }, [planConfig]);

  const validarParametros = useCallback((cantidadActual: number): ValidacionLimite => {
    if (!planConfig) {
      return {
        permitido: false,
        actual: cantidadActual,
        maximo: 0,
        restante: 0,
        mensaje: 'Configuración del plan no disponible',
        nivel: 'error',
        cerca_limite: false,
      };
    }
    return validarLimiteRecurso('parametros', cantidadActual, planConfig);
  }, [planConfig]);

  const validarCapacidad = useCallback((cantidadActual: number): ValidacionLimite => {
    if (!planConfig) {
      return {
        permitido: false,
        actual: cantidadActual,
        maximo: 0,
        restante: 0,
        mensaje: 'Configuración del plan no disponible',
        nivel: 'error',
        cerca_limite: false,
      };
    }
    return validarLimiteRecurso('capacidad', cantidadActual, planConfig);
  }, [planConfig]);

  return {
    planConfig,
    loading,
    error,
    validarUsuarios,
    validarTarjetas,
    validarParametros,
    validarCapacidad,
    refetch: fetchPlanConfig,
  };
}

/**
 * Hook simplificado para validaciones rápidas sin API
 * Usa configuración hardcoded del plan
 */
export function useLimitesLocal(planTipo: 'demo' | 'basica' | 'premium') {
  const planConfig = {
    ...PLAN_LIMITS_FALLBACK[planTipo],
    id: 'local',
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString(),
    orden: 0,
    activo: true,
  } as PlanConfig;

  const validarUsuarios = useCallback((cantidadActual: number) => {
    return validarLimiteRecurso('usuarios', cantidadActual, planConfig);
  }, [planConfig]);

  const validarTarjetas = useCallback((cantidadActual: number) => {
    return validarLimiteRecurso('tarjetas', cantidadActual, planConfig);
  }, [planConfig]);

  const validarParametros = useCallback((cantidadActual: number) => {
    return validarLimiteRecurso('parametros', cantidadActual, planConfig);
  }, [planConfig]);

  const validarCapacidad = useCallback((cantidadActual: number) => {
    return validarLimiteRecurso('capacidad', cantidadActual, planConfig);
  }, [planConfig]);

  return {
    planConfig,
    validarUsuarios,
    validarTarjetas,
    validarParametros,
    validarCapacidad,
  };
}
