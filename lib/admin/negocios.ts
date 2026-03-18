/**
 * Funciones CRUD para gestionar Negocios desde el Panel Admin
 * Incluye creación, actualización, listado y funciones de seed
 */

import { supabaseAdmin } from '@/lib/supabase/admin-client';
import { hashPassword } from './auth';
import type {
  Negocio,
  NegocioExtended,
  CreateNegocioResponse,
  PlanType,
  NegociosFilters,
  WizardCompleteData,
} from '@/types/admin';

// Configuración de planes
const PLAN_CONFIGS = {
  demo: {
    limite_usuarios: 1,
    limite_tarjetas: 10,
    capacidad_maxima: 10,
    dias_vigencia: 30,
  },
  anual: {
    limite_usuarios: 99999,
    limite_tarjetas: 99999,
    capacidad_maxima: 99999,
    dias_vigencia: 365, // 1 año de vigencia
  },
  premium: {
    limite_usuarios: 99999,
    limite_tarjetas: 99999,
    capacidad_maxima: 99999,
    dias_vigencia: null, // Sin vencimiento
  },
};

/**
 * Obtiene todos los negocios con información extendida
 */
export async function getAllNegocios(filters?: NegociosFilters): Promise<{
  success: boolean;
  data?: NegocioExtended[];
  error?: string;
}> {
  try {
    let query = supabaseAdmin.from('negocios').select('*');

    // Aplicar filtros
    if (filters?.estado) {
      query = query.eq('estado', filters.estado);
    }

    if (filters?.plan) {
      query = query.eq('plan', filters.plan);
    }

    if (filters?.search) {
      query = query.or(
        `nombre.ilike.%${filters.search}%,` +
        `codigo.ilike.%${filters.search}%,` +
        `ciudad.ilike.%${filters.search}%`
      );
    }

    // Ordenamiento
    const orderBy = filters?.orderBy || 'fecha_creacion';
    const orderDirection = filters?.order || 'desc';
    query = query.order(orderBy, { ascending: orderDirection === 'asc' });

    const { data: negocios, error } = await query;

    if (error) {
      console.error('Error obteniendo negocios:', error);
      return { success: false, error: 'Error al obtener negocios' };
    }

    // Obtener datos extendidos para cada negocio
    const negociosExtended: NegocioExtended[] = await Promise.all(
      (negocios || []).map(async (negocio) => {
        // Calcular días restantes
        let dias_restantes: number | null = null;
        let estado_licencia: 'Activa' | 'Expirada' | 'Sin vencimiento' = 'Sin vencimiento';
        
        if (negocio.fecha_expiracion) {
          const diasRestantes = Math.ceil(
            (new Date(negocio.fecha_expiracion).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          dias_restantes = diasRestantes;
          estado_licencia = diasRestantes > 0 ? 'Activa' : 'Expirada';
        }

        // Obtener estadísticas del negocio
        const [tarjetasResult, usuariosResult, vehiculosResult] = await Promise.all([
          supabaseAdmin
            .from('tarjetas')
            .select('id', { count: 'exact', head: true })
            .eq('negocio_id', negocio.id),
          supabaseAdmin
            .from('usuarios')
            .select('id', { count: 'exact', head: true })
            .eq('negocio_id', negocio.id)
            .eq('estado', '1'),
          supabaseAdmin
            .from('vehiculos')
            .select('id', { count: 'exact', head: true })
            .eq('negocio_id', negocio.id),
        ]);

        return {
          ...negocio,
          dias_restantes,
          licencia_activa: estado_licencia === 'Activa' || estado_licencia === 'Sin vencimiento',
          estado_licencia,
          tarjetas_usadas: tarjetasResult.count || 0,
          usuarios_activos: usuariosResult.count || 0,
          vehiculos_activos: vehiculosResult.count || 0,
          ocupacion_porcentaje: 0, // TODO: Calcular desde tabla 'codigos'
          ingresos_mes_actual: 0, // TODO: Calcular desde transacciones
        };
      })
    );

    return { success: true, data: negociosExtended };
  } catch (error) {
    console.error('Error en getAllNegocios:', error);
    return { success: false, error: 'Error interno al obtener negocios' };
  }
}

/**
 * Obtiene un negocio por ID con información completa
 */
export async function getNegocioById(id: string): Promise<{
  success: boolean;
  data?: NegocioExtended;
  error?: string;
}> {
  try {
    const { data: negocio, error } = await supabaseAdmin
      .from('negocios')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !negocio) {
      return { success: false, error: 'Negocio no encontrado' };
    }

    // Calcular días restantes
    let dias_restantes: number | null = null;
    let estado_licencia: 'Activa' | 'Expirada' | 'Sin vencimiento' = 'Sin vencimiento';
    
    if (negocio.fecha_expiracion) {
      const diasRestantes = Math.ceil(
        (new Date(negocio.fecha_expiracion).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      dias_restantes = diasRestantes;
      estado_licencia = diasRestantes > 0 ? 'Activa' : 'Expirada';
    }

    // Obtener usuario admin del negocio
    const { data: adminUser } = await supabaseAdmin
      .from('usuarios')
      .select('id, usuario, nombre, email, ultimo_acceso')
      .eq('negocio_id', negocio.id)
      .eq('rol', 'Administrador')
      .single();

    // Obtener estadísticas
    const [tarjetasResult, usuariosResult, vehiculosResult] = await Promise.all([
      supabaseAdmin
        .from('tarjetas')
        .select('id', { count: 'exact', head: true })
        .eq('negocio_id', negocio.id),
      supabaseAdmin
        .from('usuarios')
        .select('id', { count: 'exact', head: true })
        .eq('negocio_id', negocio.id)
        .eq('estado', '1'),
      supabaseAdmin
        .from('vehiculos')
        .select('id', { count: 'exact', head: true })
        .eq('negocio_id', negocio.id),
    ]);

    const negocioExtended: NegocioExtended = {
      ...negocio,
      dias_restantes,
      licencia_activa: estado_licencia === 'Activa' || estado_licencia === 'Sin vencimiento',
      estado_licencia,
      tarjetas_usadas: tarjetasResult.count || 0,
      usuarios_activos: usuariosResult.count || 0,
      vehiculos_activos: vehiculosResult.count || 0,
      ocupacion_porcentaje: 0,
      ingresos_mes_actual: 0,
      admin_user: adminUser || undefined,
    };

    return { success: true, data: negocioExtended };
  } catch (error) {
    console.error('Error en getNegocioById:', error);
    return { success: false, error: 'Error al obtener negocio' };
  }
}

/**
 * Crea un nuevo negocio con configuración completa desde el wizard
 * Recibe todos los datos personalizables del asistente
 */
export async function createNegocio(
  formData: WizardCompleteData
): Promise<CreateNegocioResponse> {
  try {
    const { negocio, usuario, configuraciones, parametros, tarjetas } = formData;

    // 1. Validar datos requeridos
    if (!negocio?.codigo || !negocio?.plan) {
      return {
        success: false,
        error: 'Código y plan son obligatorios',
        details: { field: 'codigo', message: 'El código y el plan son requeridos' },
      };
    }

    // 2. Verificar que el código no exista
    const { data: existingCodigo } = await supabaseAdmin
      .from('negocios')
      .select('id')
      .eq('codigo', negocio.codigo.toUpperCase())
      .single();

    if (existingCodigo) {
      return {
        success: false,
        error: 'El código de negocio ya existe',
        details: { field: 'codigo', message: 'Este código ya está en uso' },
      };
    }

    // 3. Preparar datos del negocio
    const fecha_expiracion = negocio.plan === 'demo' ? (negocio.fecha_expiracion || null) : null;

    // 4. Crear negocio con todos los datos del wizard
    const { data: negocioCreado, error: negocioError } = await supabaseAdmin
      .from('negocios')
      .insert({
        codigo: negocio.codigo.toUpperCase(),
        plan: negocio.plan,
        fecha_expiracion,
        nombre: negocio.nombre,
        descripcion: negocio.descripcion,
        direccion: negocio.direccion,
        telefono: negocio.telefono,
        email: negocio.email,
        ciudad: negocio.ciudad,
        logo_url: null,
        configuracion: {
          tema: 'moderno',
          idioma: 'es',
          moneda: 'USD',
          formato_hora: '24h',
          zona_horaria: 'America/Guayaquil',
          formato_fecha: 'DD/MM/YYYY',
        },
        estado: 'activo',
        metadata: {},
        limite_usuarios: negocio.limite_usuarios,
        limite_tarjetas: negocio.limite_tarjetas,
        capacidad_maxima: negocio.capacidad_maxima,
      })
      .select()
      .single();

    if (negocioError || !negocioCreado) {
      console.error('Error creando negocio:', negocioError);
      return {
        success: false,
        error: 'Error al crear negocio en la base de datos',
      };
    }

    // 5. Crear usuario administrador
    const hashedPassword = await hashPassword(usuario.password);

    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        negocio_id: negocioCreado.id,
        usuario: usuario.usuario,
        password: hashedPassword,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        telefono: usuario.telefono,
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        rol: 'admin',
        estado: '1',
        permisos: {
          pago: true,
          ingreso: true,
          reportes: true,
          consultas: true,
          configuracion: true,
        },
        configuracion_personal: {},
      })
      .select('id, usuario, nombre')
      .single();

    if (adminError || !adminUser) {
      console.error('Error creando usuario admin:', adminError);
      // Rollback: eliminar negocio
      await supabaseAdmin.from('negocios').delete().eq('id', negocioCreado.id);
      return {
        success: false,
        error: 'Error al crear usuario administrador',
      };
    }

    // 6. Crear configuraciones del sistema
    const configuracionInserts = configuraciones.map((config) => ({
      negocio_id: negocioCreado.id,
      clave: config.clave,
      valor: config.valor,
      tipo: config.tipo,
      descripcion: config.descripcion || '',
      categoria: config.categoria,
    }));

    const { error: configError } = await supabaseAdmin
      .from('configuracion_sistema')
      .insert(configuracionInserts);

    if (configError) {
      console.error('Error creando configuración del sistema:', configError);
    }

    // 7. Crear parámetros de tarifas
    const parametrosInserts = parametros.map((param) => ({
      negocio_id: negocioCreado.id,
      tipo_vehiculo: param.tipo_vehiculo,
      nombre: param.nombre,
      descripcion: param.descripcion || '',
      prioridad: param.prioridad || 0,
      tarifa_1_nombre: param.tarifa_1_nombre,
      tarifa_1_valor: param.tarifa_1_valor,
      tarifa_2_nombre: param.tarifa_2_nombre,
      tarifa_2_valor: param.tarifa_2_valor,
      tarifa_3_nombre: param.tarifa_3_nombre || '',
      tarifa_3_valor: param.tarifa_3_valor || 0,
      tarifa_4_nombre: param.tarifa_4_nombre || '',
      tarifa_4_valor: param.tarifa_4_valor || 0,
      tarifa_5_nombre: param.tarifa_5_nombre,
      tarifa_5_valor: param.tarifa_5_valor,
      tarifa_6_nombre: param.tarifa_6_nombre,
      tarifa_6_valor: param.tarifa_6_valor,
      tarifa_7_nombre: param.tarifa_7_nombre,
      tarifa_7_valor: param.tarifa_7_valor,
      tarifa_extra: param.tarifa_extra || 0,
      tarifa_auxiliar: param.tarifa_auxiliar || 0,
      tarifa_nocturna: param.tarifa_nocturna || 0,
      tarifa_fin_semana: param.tarifa_fin_semana || 0,
      configuracion_avanzada: param.configuracion_avanzada || {},
      horarios_especiales: param.horarios_especiales || {},
      estado: 'activo',
    }));

    const { error: parametrosError } = await supabaseAdmin
      .from('parametros')
      .insert(parametrosInserts);

    if (parametrosError) {
      console.error('Error creando parámetros:', parametrosError);
    }

    // 8. Crear tarjetas
    const tarjetasInserts = tarjetas.map((tarjeta) => ({
      negocio_id: negocioCreado.id,
      codigo: tarjeta.codigo,
      codigo_interno: '',
      codigo_barras: '',
      qr_code: '',
      estado: tarjeta.estado,
      perdida: '0',
      propietario_nombre: null,
      propietario_telefono: null,
      propietario_email: null,
      notas: null,
      metadata: {},
      usuario_creacion_id: adminUser.id,
    }));

    const { error: tarjetasError } = await supabaseAdmin
      .from('tarjetas')
      .insert(tarjetasInserts);

    if (tarjetasError) {
      console.error('Error creando tarjetas:', tarjetasError);
    }

    return {
      success: true,
      message: 'Negocio instalado exitosamente con todos los módulos',
      data: {
        negocio: negocioCreado,
        admin_user: {
          id: adminUser.id,
          usuario: adminUser.usuario,
          nombre: adminUser.nombre,
          password_temporal: usuario.password,
        },
        seeds_creados: {
          configuracion_sistema: configuraciones.length,
          parametros: parametros.length,
          tarjetas: tarjetas.length,
        },
      },
    };
  } catch (error) {
    console.error('Error en createNegocio:', error);
    return {
      success: false,
      error: 'Error interno al crear negocio',
    };
  }
}

/**
 * Actualiza un negocio existente
 */
export async function updateNegocio(
  id: string,
  updates: Partial<Negocio>
): Promise<{ success: boolean; data?: Negocio; error?: string }> {
  try {
    // No permitir actualizar ciertos campos críticos
    const restrictedFields = ['id', 'codigo', 'fecha_creacion'];
    const allowedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key]) => !restrictedFields.includes(key))
    );

    const { data: negocio, error } = await supabaseAdmin
      .from('negocios')
      .update({
        ...allowedUpdates,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !negocio) {
      console.error('Error actualizando negocio:', error);
      return { success: false, error: 'Error al actualizar negocio' };
    }

    return { success: true, data: negocio };
  } catch (error) {
    console.error('Error en updateNegocio:', error);
    return { success: false, error: 'Error interno al actualizar negocio' };
  }
}

/**
 * Elimina un negocio completamente (hard delete)
 * VALIDACIÓN: Solo permite eliminar negocios DEMO con licencia INACTIVA (vencida)
 * Elimina en cascada todos los registros relacionados
 */
export async function deleteNegocio(id: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    // 1. Obtener información del negocio
    const { data: negocio, error: getNegocioError } = await supabaseAdmin
      .from('negocios')
      .select('plan, fecha_expiracion, estado, nombre')
      .eq('id', id)
      .single();

    if (getNegocioError || !negocio) {
      return { success: false, error: 'Negocio no encontrado' };
    }

    // 2. Validar que sea plan DEMO
    if (negocio.plan !== 'demo') {
      return {
        success: false,
        error: 'Solo se pueden eliminar negocios con plan DEMO',
      };
    }

    // 3. Validar que la licencia esté vencida (INACTIVO)
    if (negocio.fecha_expiracion) {
      const diasRestantes = Math.ceil(
        (new Date(negocio.fecha_expiracion).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (diasRestantes > 0) {
        return {
          success: false,
          error: 'Solo se pueden eliminar negocios DEMO con licencia vencida (INACTIVO)',
        };
      }
    } else {
      // Si no tiene fecha de expiración pero es DEMO, verificar el estado
      if (negocio.estado === 'activo') {
        return {
          success: false,
          error: 'Solo se pueden eliminar negocios DEMO con estado INACTIVO',
        };
      }
    }

    // 4. Eliminación en cascada (la BD lo manejará con ON DELETE CASCADE, pero por seguridad verificamos)
    // Las tablas relacionadas que se eliminarán automáticamente:
    // - usuarios (usuarios del negocio)
    // - parametros (tarifas y configuraciones)
    // - tarjetas (tarjetas del negocio)
    // - codigos (registros de ingresos)
    // - configuracion_sistema (configuración del negocio)
    // - auditoria (registros de auditoría)

    // 5. Eliminar negocio (eliminará todo en cascada)
    const { error: deleteError } = await supabaseAdmin
      .from('negocios')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error eliminando negocio:', deleteError);
      return { 
        success: false, 
        error: 'Error al eliminar negocio de la base de datos' 
      };
    }

    return {
      success: true,
      message: `Negocio "${negocio.nombre}" y todos sus datos relacionados han sido eliminados exitosamente`,
    };
  } catch (error) {
    console.error('Error en deleteNegocio:', error);
    return { 
      success: false, 
      error: 'Error interno al eliminar negocio' 
    };
  }
}

/**
 * Cambia el estado de un negocio
 */
export async function toggleNegocioEstado(
  id: string,
  nuevoEstado: 'activo' | 'inactivo' | 'suspendido'
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('negocios')
      .update({ estado: nuevoEstado })
      .eq('id', id);

    if (error) {
      console.error('Error cambiando estado:', error);
      return { success: false, error: 'Error al cambiar estado' };
    }

    return { success: true, message: `Estado actualizado a ${nuevoEstado}` };
  } catch (error) {
    console.error('Error en toggleNegocioEstado:', error);
    return { success: false, error: 'Error interno al cambiar estado' };
  }
}

/**
 * Crea datos iniciales (seeds) para un negocio nuevo
 */
export async function seedNegocioData(negocio_id: string): Promise<{
  configuracion_sistema: number;
  parametros: number;
  tarjetas: number;
}> {
  try {
    // 1. Configuración del sistema
    const { error: configError } = await supabaseAdmin.from('configuracion_sistema').insert({
      negocio_id,
      tema: 'light',
      idioma: 'es',
      zona_horaria: 'America/Bogota',
      moneda: 'USD',
      formato_fecha: 'DD/MM/YYYY',
      formato_hora: '24h',
    });

    // 2. Parámetros del sistema
    const parametros = [
      { clave: 'max_capacidad', valor: '100', tipo: 'numero' },
      { clave: 'alerta_ocupacion', valor: '80', tipo: 'numero' },
      { clave: 'horas_pico_inicio', valor: '07:00', tipo: 'hora' },
      { clave: 'horas_pico_fin', valor: '09:00', tipo: 'hora' },
    ];

    const { error: paramsError } = await supabaseAdmin
      .from('parametros_sistema')
      .insert(parametros.map((p) => ({ negocio_id, ...p })));

    // 3. Plantilla de tarjeta por defecto
    const { error: tarjetaError } = await supabaseAdmin.from('tarjetas').insert({
      negocio_id,
      nombre: 'Plantilla por defecto',
      estilo_json: JSON.stringify({
        fondo: '#ffffff',
        texto: '#000000',
        acento: '#3b82f6',
      }),
      activa: true,
      es_default: true,
    });

    return {
      configuracion_sistema: configError ? 0 : 1,
      parametros: paramsError ? 0 : parametros.length,
      tarjetas: tarjetaError ? 0 : 1,
    };
  } catch (error) {
    console.error('Error en seedNegocioData:', error);
    return {
      configuracion_sistema: 0,
      parametros: 0,
      tarjetas: 0,
    };
  }
}

/**
 * Renueva la licencia de un negocio
 */
export async function renovarLicencia(
  id: string,
  plan: PlanType
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const planConfig = PLAN_CONFIGS[plan] || PLAN_CONFIGS.demo;

    let fecha_expiracion: string | null = null;
    if (planConfig.dias_vigencia) {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + planConfig.dias_vigencia);
      fecha_expiracion = expDate.toISOString();
    }

    const { error } = await supabaseAdmin
      .from('negocios')
      .update({
        plan,
        fecha_expiracion,
        limite_usuarios: planConfig.limite_usuarios,
        limite_tarjetas: planConfig.limite_tarjetas,
        capacidad_maxima: planConfig.capacidad_maxima,
        estado: 'activo',
      })
      .eq('id', id);

    if (error) {
      console.error('Error renovando licencia:', error);
      return { success: false, error: 'Error al renovar licencia' };
    }

    return { success: true, message: 'Licencia renovada exitosamente' };
  } catch (error) {
    console.error('Error en renovarLicencia:', error);
    return { success: false, error: 'Error interno al renovar licencia' };
  }
}
