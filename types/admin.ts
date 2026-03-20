/**
 * Types para el Sistema de Administración MPTickets
 * Multi-tenant Admin Dashboard
 */

// ============================================
// ADMIN USERS
// ============================================

export interface AdminUser {
  id: string;
  usuario: string;
  nombre: string;
  email: string;
  password: string;
  rol: 'superadmin' | 'admin_support';
  estado: '0' | '1';
  ultimo_acceso: string | null;
  ip_ultimo_acceso: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface AdminLoginRequest {
  usuario: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  user?: Omit<AdminUser, 'password'>;
  token?: string;
  error?: string;
}

// ============================================
// NEGOCIOS
// ============================================

export type PlanType = 'demo' | 'anual' | 'premium';
export type EstadoNegocio = 'activo' | 'inactivo' | 'suspendido';
export type EstadoLicencia = 'Activa' | 'Expirada' | 'Sin vencimiento';

export interface Negocio {
  id: string;
  nombre: string;
  descripcion: string | null;
  direccion: string | null;
  telefono: string | null;
  email: string;
  ciudad: string;
  logo_url: string | null;
  configuracion: ConfiguracionNegocio;
  plan: PlanType;
  estado: EstadoNegocio;
  fecha_creacion: string;
  fecha_actualizacion: string;
  fecha_expiracion: string | null;
  metadata: Record<string, any>;
  limite_usuarios: number;
  limite_tarjetas: number;
  capacidad_maxima: number;
  codigo: string;
}

export interface ConfiguracionNegocio {
  tema: string;
  idioma: string;
  moneda: string;
  formato_hora: string;
  zona_horaria: string;
  formato_fecha: string;
}

export interface NegocioExtended extends Negocio {
  // Datos calculados
  dias_restantes: number | null;
  licencia_activa: boolean;
  estado_licencia: EstadoLicencia;
  tarjetas_usadas: number;
  usuarios_activos: number;
  vehiculos_activos: number;
  ocupacion_porcentaje: number;
  ingresos_mes_actual: number;
  // Usuario admin
  admin_user?: {
    id: string;
    usuario: string;
    nombre: string;
    email: string;
    ultimo_acceso: string | null;
  };
}

export interface NegocioFormData {
  // Información básica (simplificada)
  codigo: string;
  plan: PlanType;
  fecha_expiracion?: string | null; // Solo para plan demo, editable
}

// ============================================
// WIZARD DATA - DATOS COMPLETOS DEL ASISTENTE
// ============================================

export interface NegocioWizardData {
  codigo: string;
  plan: PlanType;
  fecha_expiracion: string | null;
  nombre: string;
  descripcion: string;
  direccion: string;
  telefono: string;
  email: string;
  ciudad: string;
  limite_usuarios: number;
  limite_tarjetas: number;
  capacidad_maxima: number;
}

export interface UsuarioAdminWizardData {
  usuario: string;
  password: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
}

export interface ConfiguracionWizardItem {
  clave: string;
  valor: string;
  tipo: string;
  descripcion: string;
  categoria: string;
}

export interface ParametroWizardItem {
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
  tarifa_extra: number;
  tarifa_auxiliar: number;
  tarifa_nocturna: number;
  tarifa_fin_semana: number;
  configuracion_avanzada: Record<string, unknown>;
  horarios_especiales: Record<string, unknown>;
  estado: string;
}

export interface TarjetaWizardItem {
  codigo: string;
  estado: string;
}

export interface WizardCompleteData {
  negocio: NegocioWizardData;
  usuario: UsuarioAdminWizardData;
  configuraciones: ConfiguracionWizardItem[];
  parametros: ParametroWizardItem[];
  tarjetas: TarjetaWizardItem[];
}

// Legacy form data (si se necesita en el futuro)
export interface NegocioFormDataExtended {
  // Información básica
  nombre: string;
  codigo: string;
  email: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  descripcion?: string;

  // Configuración de licencia
  plan: PlanType;

  // Usuario administrador inicial
  admin_usuario: string;
  admin_password: string;
  admin_nombre: string;
  admin_email: string;

  // Opciones adicionales
  seed_data?: boolean;
  enviar_email?: boolean;
}

export interface CreateNegocioResponse {
  success: boolean;
  message?: string;
  data?: {
    negocio: Negocio;
    admin_user: {
      id: string;
      usuario: string;
      nombre: string;
      password_temporal: string; // Siempre "admin123"
    };
    seeds_creados: {
      configuracion_sistema: number;
      parametros: number;
      tarjetas: number;
    };
  };
  error?: string;
  details?: {
    field: string;
    message: string;
  };
}

// ============================================
// LICENCIAS
// ============================================

export interface LicenciaInfo {
  negocio_id: string;
  negocio_nombre: string;
  negocio_codigo: string;
  plan: PlanType;
  estado: EstadoNegocio;
  fecha_creacion: string;
  fecha_expiracion: string | null;
  dias_restantes: number | null;
  estado_licencia: EstadoLicencia;
  licencia_activa: boolean;
  limite_usuarios: number;
  limite_tarjetas: number;
  capacidad_maxima: number;
  tarjetas_usadas: number;
  porcentaje_tarjetas_usadas: number;
  alerta?: 'vence_pronto' | 'expirada';
}

export interface ActualizarLicenciaRequest {
  accion: 'cambiar_plan' | 'renovar' | 'extender';
  nuevo_plan?: PlanType;
  dias_extension?: number;
}

export interface ActualizarLicenciaResponse {
  success: boolean;
  message: string;
  data?: {
    plan_anterior: PlanType;
    plan_nuevo: PlanType;
    fecha_expiracion_anterior: string | null;
    fecha_expiracion_nueva: string | null;
    limite_usuarios_anterior: number;
    limite_usuarios_nuevo: number;
    limite_tarjetas_anterior: number;
    limite_tarjetas_nuevo: number;
    capacidad_maxima_anterior: number;
    capacidad_maxima_nuevo: number;
  };
}

// ============================================
// CONFIGURACIÓN DEL SISTEMA
// ============================================

export interface ConfiguracionSistema {
  id: string;
  negocio_id: string;
  clave: string;
  valor: string;
  tipo: 'string' | 'number' | 'boolean' | 'json';
  descripcion: string;
  categoria: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ConfigTemplate {
  clave: string;
  valor: string;
  tipo: 'string' | 'number' | 'boolean' | 'json';
  categoria: string;
  descripcion: string;
}

// ============================================
// ESTADÍSTICAS ADMIN
// ============================================

export interface AdminDashboardStats {
  // Negocios
  total_negocios: number;
  negocios_activos: number;
  negocios_demo: number;
  negocios_premium: number;
  negocios_suspendidos: number;
  negocios_expirados: number;

  // Usuarios
  total_usuarios: number;
  usuarios_activos_hoy: number;
  usuarios_activos_semana: number;

  // Capacidad
  capacidad_total_plataforma: number;
  vehiculos_activos_ahora: number;
  ocupacion_promedio: number;

  // Licencias
  licencias_vencen_7_dias: number;
  licencias_vencen_30_dias: number;
  licencias_expiradas: number;

  // Actividad
  ingresos_registrados: number;
  tickets_procesados_mes: number;
  tickets_procesados_hoy: number;

  // Tendencias
  crecimiento_negocios_mes: number;
  conversion_demo_premium: number;

  fecha_calculo: string;
}

export interface ActividadReciente {
  id: string;
  tipo:
    | 'negocio_creado'
    | 'negocio_actualizado'
    | 'negocio_suspendido'
    | 'licencia_actualizada'
    | 'admin_created'
    | 'password_changed';
  descripcion: string;
  usuario_admin: string;
  fecha: string;
  metadata: Record<string, any>;
}

// ============================================
// PAGINACIÓN Y BÚSQUEDA
// ============================================

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export interface SearchParams {
  q: string;
  tipo?: 'negocios' | 'usuarios' | 'all';
}

// ============================================
// PLANES Y CONFIGURACIONES
// ============================================

export interface PlanConfig {
  plan: PlanType;
  duracion_dias: number | null;
  configuracion: ConfiguracionNegocio;
  limites: {
    usuarios: number;
    tarjetas: number;
    capacidad_maxima: number;
  };
  estado: EstadoNegocio;
  fecha_expiracion: (() => Date) | null;
}

export interface SeedOptions {
  tipos: ('configuracion_sistema' | 'parametros' | 'tarjetas')[];
  sobrescribir: boolean;
  cantidad_tarjetas?: number;
}

export interface SeedResponse {
  success: boolean;
  message: string;
  resultados: {
    configuracion_sistema?: {
      creados: number;
      actualizados: number;
    };
    parametros?: {
      creados: number;
      actualizados: number;
    };
    tarjetas?: {
      creados: number;
      actualizados: number;
    };
  };
}

// ============================================
// CAMBIO DE CONTRASEÑA
// ============================================

export interface CambiarPasswordRequest {
  nueva_password: string;
  enviar_email?: boolean;
  require_cambio_login?: boolean;
}

export interface CambiarPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    usuario_admin: string;
    email_enviado: boolean;
    require_cambio_login: boolean;
    fecha_cambio: string;
  };
}

// ============================================
// API RESPONSES GENÉRICAS
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: {
    field?: string;
    message?: string;
  };
}

// ============================================
// FILTROS Y ORDEN
// ============================================

export interface NegociosFilters {
  plan?: PlanType;
  estado?: EstadoNegocio;
  search?: string;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface LicenciasFilters {
  vencen_en_dias?: number;
  estado?: EstadoLicencia;
}

export type SortOrder = 'asc' | 'desc';

export interface SortParams {
  field: string;
  order: SortOrder;
}

// ============================================
// USUARIOS DEL NEGOCIO
// ============================================

export interface UsuarioNegocio {
  id: string;
  negocio_id: string;
  usuario: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  avatar_url: string | null;
  password: string;
  estado: '0' | '1';
  fecha_creacion: string;
  fecha_actualizacion: string;
  ultimo_acceso: string | null;
  ip_ultimo_acceso: string | null;
  rol: 'admin' | 'operador' | 'visor';
  permisos: Record<string, any>;
  configuracion_personal: Record<string, any>;
}

// ============================================
// AUDITORÍA
// ============================================

export interface AuditoriaLog {
  id: string;
  negocio_id: string;
  usuario_id: string | null;
  tabla_afectada: string;
  registro_id: string | null;
  accion: 'INSERT' | 'UPDATE' | 'DELETE';
  datos_anteriores: Record<string, any> | null;
  datos_nuevos: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  fecha_creacion: string;
}

// ============================================
// WIZARD MULTI-STEP
// ============================================

export interface WizardStep {
  id: number;
  titulo: string;
  descripcion: string;
  completado: boolean;
  valido: boolean;
}

export interface NegocioWizardData {
  // Paso 1: Información básica
  paso1: {
    nombre: string;
    codigo: string;
    email: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    descripcion: string;
  };

  // Paso 2: Configuración de licencia
  paso2: {
    plan: PlanType;
    fecha_expiracion?: Date | null;
  };

  // Paso 3: Usuario administrador
  paso3: {
    admin_usuario: string;
    admin_password: string;
    admin_nombre: string;
    admin_email: string;
  };

  // Paso 4: Confirmación
  paso4: {
    seed_data: boolean;
    enviar_email: boolean;
  };
}

// ============================================
// MÓDULO USUARIOS ADMIN
// ============================================

export interface UsuarioAdminConNegocio extends UsuarioNegocio {
  // Información del negocio asociado
  negocio: {
    id: string;
    nombre: string;
    codigo: string;
    email: string;
    ciudad: string;
    plan: PlanType;
    estado: EstadoNegocio;
  };
}

export interface ActualizarUsuarioAdminRequest {
  nombre: string;
  apellido: string;
  password?: string; // Opcional - solo si desea cambiar
}

export interface ActualizarUsuarioAdminResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    usuario: string;
    nombre: string;
    apellido: string;
    email: string;
  };
  error?: string;
}
