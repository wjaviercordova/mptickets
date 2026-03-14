/**
 * Plantillas de Configuración para Nuevos Negocios
 * 30 registros base que se crean automáticamente
 */

import type { ConfigTemplate } from '@/types/admin';

// ============================================
// TEMPLATE CONFIGURACIÓN_SISTEMA
// ============================================

export const TEMPLATE_CONFIG_SISTEMA: ConfigTemplate[] = [
  // ==========================================
  // 1. CONFIGURACIÓN GENERAL (9 registros)
  // ==========================================
  {
    clave: 'nombre_negocio',
    valor: '',
    tipo: 'string',
    categoria: 'general',
    descripcion: 'Nombre del negocio que aparece en el sistema'
  },
  {
    clave: 'descripcion_negocio',
    valor: '',
    tipo: 'string',
    categoria: 'general',
    descripcion: 'Descripción breve del negocio'
  },
  {
    clave: 'logo_url',
    valor: '',
    tipo: 'string',
    categoria: 'general',
    descripcion: 'URL del logo del negocio'
  },
  {
    clave: 'tema',
    valor: 'moderno',
    tipo: 'string',
    categoria: 'general',
    descripcion: 'Tema visual de la aplicación'
  },
  {
    clave: 'idioma',
    valor: 'es',
    tipo: 'string',
    categoria: 'general',
    descripcion: 'Idioma del sistema (es, en)'
  },
  {
    clave: 'moneda',
    valor: 'USD',
    tipo: 'string',
    categoria: 'general',
    descripcion: 'Moneda utilizada (USD, EUR, etc.)'
  },
  {
    clave: 'formato_fecha',
    valor: 'DD/MM/YYYY',
    tipo: 'string',
    categoria: 'general',
    descripcion: 'Formato de visualización de fechas'
  },
  {
    clave: 'formato_hora',
    valor: '24h',
    tipo: 'string',
    categoria: 'general',
    descripcion: 'Formato de hora (12h o 24h)'
  },
  {
    clave: 'zona_horaria',
    valor: 'America/Guayaquil',
    tipo: 'string',
    categoria: 'general',
    descripcion: 'Zona horaria del negocio'
  },

  // ==========================================
  // 2. CONFIGURACIÓN DE IMPRESIÓN (5 registros)
  // ==========================================
  {
    clave: 'impresora_habilitada',
    valor: 'true',
    tipo: 'boolean',
    categoria: 'impresion',
    descripcion: 'Habilitar o deshabilitar impresión de tickets'
  },
  {
    clave: 'impresora_nombre',
    valor: '',
    tipo: 'string',
    categoria: 'impresion',
    descripcion: 'Nombre de la impresora configurada'
  },
  {
    clave: 'impresora_ancho_papel',
    valor: '58',
    tipo: 'number',
    categoria: 'impresion',
    descripcion: 'Ancho del papel en mm (58mm o 80mm)'
  },
  {
    clave: 'impresion_auto',
    valor: 'true',
    tipo: 'boolean',
    categoria: 'impresion',
    descripcion: 'Imprimir automáticamente al registrar entrada'
  },
  {
    clave: 'copias_ticket',
    valor: '2',
    tipo: 'number',
    categoria: 'impresion',
    descripcion: 'Número de copias a imprimir por ticket'
  },

  // ==========================================
  // 3. CONFIGURACIÓN DE NOTIFICACIONES (3 registros)
  // ==========================================
  {
    clave: 'notificaciones_email',
    valor: 'true',
    tipo: 'boolean',
    categoria: 'notificaciones',
    descripcion: 'Habilitar notificaciones por email'
  },
  {
    clave: 'notificaciones_sms',
    valor: 'false',
    tipo: 'boolean',
    categoria: 'notificaciones',
    descripcion: 'Habilitar notificaciones por SMS'
  },
  {
    clave: 'email_alertas',
    valor: '',
    tipo: 'string',
    categoria: 'notificaciones',
    descripcion: 'Email para recibir alertas del sistema'
  },

  // ==========================================
  // 4. CONFIGURACIÓN DE OPERACIÓN (5 registros)
  // ==========================================
  {
    clave: 'hora_apertura',
    valor: '08:00',
    tipo: 'string',
    categoria: 'operacion',
    descripcion: 'Hora de apertura del parqueadero'
  },
  {
    clave: 'hora_cierre',
    valor: '18:00',
    tipo: 'string',
    categoria: 'operacion',
    descripcion: 'Hora de cierre del parqueadero'
  },
  {
    clave: 'dias_atencion',
    valor: 'Lun-Vie',
    tipo: 'string',
    categoria: 'operacion',
    descripcion: 'Días de atención (Lun-Vie, Lun-Sab, etc.)'
  },
  {
    clave: 'permitir_reingreso',
    valor: 'false',
    tipo: 'boolean',
    categoria: 'operacion',
    descripcion: 'Permitir reingreso de vehículos el mismo día'
  },
  {
    clave: 'tiempo_gracia_minutos',
    valor: '5',
    tipo: 'number',
    categoria: 'operacion',
    descripcion: 'Minutos de gracia sin cargo al salir'
  },

  // ==========================================
  // 5. CONFIGURACIÓN DE PAGOS (3 registros)
  // ==========================================
  {
    clave: 'metodos_pago',
    valor: '["efectivo","tarjeta","transferencia"]',
    tipo: 'json',
    categoria: 'pagos',
    descripcion: 'Métodos de pago aceptados'
  },
  {
    clave: 'require_pago_previo',
    valor: 'false',
    tipo: 'boolean',
    categoria: 'pagos',
    descripcion: 'Requerir pago antes de marcar salida'
  },
  {
    clave: 'descuentos_habilitados',
    valor: 'true',
    tipo: 'boolean',
    categoria: 'pagos',
    descripcion: 'Permitir aplicar descuentos en los pagos'
  },

  // ==========================================
  // 6. CONFIGURACIÓN DE SEGURIDAD (3 registros)
  // ==========================================
  {
    clave: 'sesiones_multiples',
    valor: 'false',
    tipo: 'boolean',
    categoria: 'seguridad',
    descripcion: 'Permitir múltiples sesiones simultáneas por usuario'
  },
  {
    clave: 'tiempo_sesion_minutos',
    valor: '480',
    tipo: 'number',
    categoria: 'seguridad',
    descripcion: 'Duración de la sesión en minutos (8 horas)'
  },
  {
    clave: 'require_cambio_password',
    valor: 'true',
    tipo: 'boolean',
    categoria: 'seguridad',
    descripcion: 'Requerir cambio de contraseña en primer login'
  },

  // ==========================================
  // 7. CONFIGURACIÓN DE CAPACIDAD (2 registros)
  // ==========================================
  {
    clave: 'alerta_capacidad_porcentaje',
    valor: '90',
    tipo: 'number',
    categoria: 'capacidad',
    descripcion: 'Porcentaje de ocupación para mostrar alerta'
  },
  {
    clave: 'reservas_habilitadas',
    valor: 'false',
    tipo: 'boolean',
    categoria: 'capacidad',
    descripcion: 'Permitir reservas de espacios'
  }
];

// Total: 30 registros

// ============================================
// TEMPLATE PARÁMETROS (TARIFAS)
// ============================================

export interface ParametroTemplate {
  tipo_vehiculo: string;
  nombre: string;
  descripcion: string;
  prioridad: number;
  tarifa_1_nombre: string;
  tarifa_1_valor: number;
  tarifa_2_nombre: string;
  tarifa_2_valor: number;
  tarifa_3_nombre: string;
  tarifa_3_valor: number;
  tarifa_4_nombre: string;
  tarifa_4_valor: number;
  tarifa_5_nombre: string;
  tarifa_5_valor: number;
  tarifa_6_nombre: string;
  tarifa_6_valor: number;
  tarifa_7_nombre: string;
  tarifa_7_valor: number;
  estado: string;
}

export const TEMPLATE_PARAMETROS: ParametroTemplate[] = [
  // Auto
  {
    tipo_vehiculo: 'auto',
    nombre: 'Automóvil',
    descripcion: 'Tarifa para vehículos tipo automóvil, sedan, hatchback',
    prioridad: 1,
    tarifa_1_nombre: 'Primera Hora',
    tarifa_1_valor: 1.0,
    tarifa_2_nombre: 'Segunda Hora',
    tarifa_2_valor: 0.75,
    tarifa_3_nombre: 'Tercera Hora',
    tarifa_3_valor: 0.75,
    tarifa_4_nombre: 'Cuarta Hora',
    tarifa_4_valor: 0.5,
    tarifa_5_nombre: 'Quinta Hora',
    tarifa_5_valor: 0.5,
    tarifa_6_nombre: 'Sexta Hora',
    tarifa_6_valor: 0.5,
    tarifa_7_nombre: 'Hora Adicional',
    tarifa_7_valor: 0.5,
    estado: 'activo'
  },
  // Moto
  {
    tipo_vehiculo: 'moto',
    nombre: 'Motocicleta',
    descripcion: 'Tarifa para motos, scooters y bicimotos',
    prioridad: 2,
    tarifa_1_nombre: 'Primera Hora',
    tarifa_1_valor: 0.5,
    tarifa_2_nombre: 'Segunda Hora',
    tarifa_2_valor: 0.5,
    tarifa_3_nombre: 'Tercera Hora',
    tarifa_3_valor: 0.5,
    tarifa_4_nombre: 'Cuarta Hora',
    tarifa_4_valor: 0.5,
    tarifa_5_nombre: 'Quinta Hora',
    tarifa_5_valor: 0.5,
    tarifa_6_nombre: 'Sexta Hora',
    tarifa_6_valor: 0.5,
    tarifa_7_nombre: 'Hora Adicional',
    tarifa_7_valor: 0.5,
    estado: 'activo'
  },
  // Camioneta
  {
    tipo_vehiculo: 'camioneta',
    nombre: 'Camioneta/SUV',
    descripcion: 'Tarifa para camionetas, SUVs, vans',
    prioridad: 3,
    tarifa_1_nombre: 'Primera Hora',
    tarifa_1_valor: 1.5,
    tarifa_2_nombre: 'Segunda Hora',
    tarifa_2_valor: 1.0,
    tarifa_3_nombre: 'Tercera Hora',
    tarifa_3_valor: 1.0,
    tarifa_4_nombre: 'Cuarta Hora',
    tarifa_4_valor: 0.75,
    tarifa_5_nombre: 'Quinta Hora',
    tarifa_5_valor: 0.75,
    tarifa_6_nombre: 'Sexta Hora',
    tarifa_6_valor: 0.75,
    tarifa_7_nombre: 'Hora Adicional',
    tarifa_7_valor: 0.75,
    estado: 'activo'
  }
];

// ============================================
// TEMPLATE TARJETAS INICIALES
// ============================================

export interface TarjetaTemplate {
  codigo: string;
  codigo_interno: string;
  estado: string;
  perdida: string;
}

/**
 * Genera códigos de tarjetas iniciales
 * @param cantidad Número de tarjetas a generar (10 para DEMO, 50 para PREMIUM)
 * @param prefijo Prefijo del código de negocio (ej: "mp01")
 */
export function generarTarjetasIniciales(
  cantidad: number,
  prefijo: string
): TarjetaTemplate[] {
  const tarjetas: TarjetaTemplate[] = [];

  for (let i = 1; i <= cantidad; i++) {
    const numeroTarjeta = i.toString().padStart(4, '0');
    tarjetas.push({
      codigo: `${prefijo.toUpperCase()}-${numeroTarjeta}`,
      codigo_interno: numeroTarjeta,
      estado: '1', // Activa
      perdida: '0' // No perdida
    });
  }

  return tarjetas;
}

// Ejemplo:
// generarTarjetasIniciales(10, 'mp01')
// Genera: MP01-0001, MP01-0002, ..., MP01-0010

// ============================================
// FUNCIONES HELPER PARA SEEDS
// ============================================

/**
 * Obtiene el template de configuración del sistema
 */
export function getConfigSistemaTemplate(): ConfigTemplate[] {
  return TEMPLATE_CONFIG_SISTEMA;
}

/**
 * Obtiene el template de parámetros (tarifas)
 */
export function getParametrosTemplate(): ParametroTemplate[] {
  return TEMPLATE_PARAMETROS;
}

/**
 * Determina cuántas tarjetas crear según el plan
 */
export function getCantidadTarjetasPorPlan(plan: string): number {
  switch (plan.toUpperCase()) {
    case 'DEMO':
      return 10;
    case 'BASICA':
      return 30;
    case 'PREMIUM':
      return 50;
    default:
      return 10;
  }
}

// ============================================
// VALIDACIÓN DE TEMPLATES
// ============================================

/**
 * Valida que el template de configuración tenga 30 registros
 */
export function validarConfigTemplate(): boolean {
  return TEMPLATE_CONFIG_SISTEMA.length === 30;
}

/**
 * Valida que el template de parámetros tenga 3 tipos de vehículo
 */
export function validarParametrosTemplate(): boolean {
  return TEMPLATE_PARAMETROS.length === 3;
}

/**
 * Obtiene resumen de templates
 */
export function getResumenTemplates() {
  return {
    configuracion_sistema: {
      total: TEMPLATE_CONFIG_SISTEMA.length,
      categorias: {
        general: TEMPLATE_CONFIG_SISTEMA.filter((c) => c.categoria === 'general')
          .length,
        impresion: TEMPLATE_CONFIG_SISTEMA.filter(
          (c) => c.categoria === 'impresion'
        ).length,
        notificaciones: TEMPLATE_CONFIG_SISTEMA.filter(
          (c) => c.categoria === 'notificaciones'
        ).length,
        operacion: TEMPLATE_CONFIG_SISTEMA.filter(
          (c) => c.categoria === 'operacion'
        ).length,
        pagos: TEMPLATE_CONFIG_SISTEMA.filter((c) => c.categoria === 'pagos')
          .length,
        seguridad: TEMPLATE_CONFIG_SISTEMA.filter(
          (c) => c.categoria === 'seguridad'
        ).length,
        capacidad: TEMPLATE_CONFIG_SISTEMA.filter(
          (c) => c.categoria === 'capacidad'
        ).length
      }
    },
    parametros: {
      total: TEMPLATE_PARAMETROS.length,
      tipos: TEMPLATE_PARAMETROS.map((p) => p.tipo_vehiculo)
    }
  };
}

// ============================================
// PERSONALIZACIÓN POR NEGOCIO
// ============================================

/**
 * Personaliza el template de configuración con datos del negocio
 */
export function personalizarConfigTemplate(
  nombre_negocio: string,
  email_alertas: string
): ConfigTemplate[] {
  return TEMPLATE_CONFIG_SISTEMA.map((config) => {
    if (config.clave === 'nombre_negocio') {
      return { ...config, valor: nombre_negocio };
    }
    if (config.clave === 'email_alertas') {
      return { ...config, valor: email_alertas };
    }
    return config;
  });
}
