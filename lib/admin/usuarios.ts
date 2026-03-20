/**
 * Funciones CRUD para gestionar Usuarios Admin desde el Panel Admin
 * Operaciones para usuarios administradores de negocios (rol='admin')
 */

import { supabaseAdmin } from '@/lib/supabase/admin-client';
import { hashPassword } from './auth';
import type {
  UsuarioAdminConNegocio,
  ActualizarUsuarioAdminRequest,
  ActualizarUsuarioAdminResponse,
  PlanType,
  EstadoNegocio,
} from '@/types/admin';

/**
 * Obtener todos los usuarios administradores (rol='admin') con información del negocio
 */
export async function getAllUsuariosAdmin(): Promise<{
  usuarios: UsuarioAdminConNegocio[];
  error?: string;
}> {
  try {
    console.log('📋 [getAllUsuariosAdmin] Obteniendo usuarios administradores...');

    // Consulta con JOIN para obtener información del negocio
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .select(`
        id,
        negocio_id,
        usuario,
        nombre,
        apellido,
        email,
        telefono,
        avatar_url,
        password,
        estado,
        fecha_creacion,
        fecha_actualizacion,
        ultimo_acceso,
        ip_ultimo_acceso,
        rol,
        permisos,
        configuracion_personal,
        negocios:negocio_id (
          id,
          nombre,
          codigo,
          email,
          ciudad,
          plan,
          estado
        )
      `)
      .eq('rol', 'admin')
      .eq('usuario', 'admin')
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo usuarios admin:', error);
      return {
        usuarios: [],
        error: error.message,
      };
    }

    if (!data) {
      console.log('⚠️ No se encontraron usuarios administradores');
      return {
        usuarios: [],
      };
    }

    console.log(`✅ Se encontraron ${data.length} usuarios administradores`);

    // Transformar datos para incluir información del negocio
    const usuariosTransformados: UsuarioAdminConNegocio[] = data.map((usuario) => {
      const negocio = usuario.negocios as unknown as {
        id: string;
        nombre: string;
        codigo: string;
        email: string;
        ciudad: string;
        plan: PlanType;
        estado: EstadoNegocio;
      };

      return {
        id: usuario.id,
        negocio_id: usuario.negocio_id,
        usuario: usuario.usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        telefono: usuario.telefono,
        avatar_url: usuario.avatar_url,
        password: usuario.password,
        estado: usuario.estado,
        fecha_creacion: usuario.fecha_creacion,
        fecha_actualizacion: usuario.fecha_actualizacion,
        ultimo_acceso: usuario.ultimo_acceso,
        ip_ultimo_acceso: usuario.ip_ultimo_acceso,
        rol: usuario.rol,
        permisos: usuario.permisos,
        configuracion_personal: usuario.configuracion_personal,
        negocio: {
          id: negocio.id,
          nombre: negocio.nombre,
          codigo: negocio.codigo,
          email: negocio.email,
          ciudad: negocio.ciudad,
          plan: negocio.plan,
          estado: negocio.estado,
        },
      };
    });

    return {
      usuarios: usuariosTransformados,
    };
  } catch (error) {
    console.error('❌ Error en getAllUsuariosAdmin:', error);
    return {
      usuarios: [],
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Obtener un usuario administrador por ID con información del negocio
 */
export async function getUsuarioAdminById(
  usuarioId: string
): Promise<{
  usuario: UsuarioAdminConNegocio | null;
  error?: string;
}> {
  try {
    console.log(`📋 [getUsuarioAdminById] Obteniendo usuario admin ID: ${usuarioId}`);

    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .select(`
        id,
        negocio_id,
        usuario,
        nombre,
        apellido,
        email,
        telefono,
        avatar_url,
        password,
        estado,
        fecha_creacion,
        fecha_actualizacion,
        ultimo_acceso,
        ip_ultimo_acceso,
        rol,
        permisos,
        configuracion_personal,
        negocios:negocio_id (
          id,
          nombre,
          codigo,
          email,
          ciudad,
          plan,
          estado
        )
      `)
      .eq('id', usuarioId)
      .single();

    if (error) {
      console.error('❌ Error obteniendo usuario admin:', error);
      console.error('Error completo:', JSON.stringify(error, null, 2));
      return {
        usuario: null,
        error: error.message,
      };
    }

    if (!data) {
      console.log('⚠️ Usuario admin no encontrado');
      return {
        usuario: null,
        error: 'Usuario no encontrado',
      };
    }

    console.log(`✅ Usuario admin encontrado: ${data.nombre} ${data.apellido}`);
    console.log('Data completa:', JSON.stringify(data, null, 2));

    // Validar que exista la relación con negocios
    if (!data.negocios) {
      console.error('❌ No se encontró relación con negocios para el usuario');
      return {
        usuario: null,
        error: 'Usuario sin negocio asignado',
      };
    }

    const negocio = data.negocios as unknown as {
      id: string;
      nombre: string;
      codigo: string;
      email: string;
      ciudad: string;
      plan: PlanType;
      estado: EstadoNegocio;
    };

    const usuarioTransformado: UsuarioAdminConNegocio = {
      id: data.id,
      negocio_id: data.negocio_id,
      usuario: data.usuario,
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      telefono: data.telefono,
      avatar_url: data.avatar_url,
      password: data.password,
      estado: data.estado,
      fecha_creacion: data.fecha_creacion,
      fecha_actualizacion: data.fecha_actualizacion,
      ultimo_acceso: data.ultimo_acceso,
      ip_ultimo_acceso: data.ip_ultimo_acceso,
      rol: data.rol,
      permisos: data.permisos,
      configuracion_personal: data.configuracion_personal,
      negocio: {
        id: negocio.id,
        nombre: negocio.nombre,
        codigo: negocio.codigo,
        email: negocio.email,
        ciudad: negocio.ciudad,
        plan: negocio.plan,
        estado: negocio.estado,
      },
    };

    return {
      usuario: usuarioTransformado,
    };
  } catch (error) {
    console.error('❌ Error en getUsuarioAdminById:', error);
    return {
      usuario: null,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Actualizar datos de usuario administrador (nombre, apellido, password opcional)
 */
export async function updateUsuarioAdmin(
  usuarioId: string,
  datosActualizacion: ActualizarUsuarioAdminRequest
): Promise<ActualizarUsuarioAdminResponse> {
  try {
    console.log(`📝 [updateUsuarioAdmin] Actualizando usuario ID: ${usuarioId}`);
    console.log('Datos a actualizar:', { ...datosActualizacion, password: datosActualizacion.password ? '***' : undefined });

    // Validar que el usuario existe y es admin
    const { usuario, error: getError } = await getUsuarioAdminById(usuarioId);
    if (getError || !usuario) {
      return {
        success: false,
        error: 'Usuario administrador no encontrado',
      };
    }

    // Preparar datos de actualización
    const updateData: {
      nombre: string;
      apellido: string;
      fecha_actualizacion: string;
      password?: string;
    } = {
      nombre: datosActualizacion.nombre.trim(),
      apellido: datosActualizacion.apellido.trim(),
      fecha_actualizacion: new Date().toISOString(),
    };

    // Si se proporciona password, hashear y agregar
    if (datosActualizacion.password && datosActualizacion.password.trim() !== '') {
      const hashedPassword = await hashPassword(datosActualizacion.password);
      updateData.password = hashedPassword;
      console.log('🔐 Password actualizado');
    }

    // Actualizar en base de datos
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .update(updateData)
      .eq('id', usuarioId)
      .select('id, usuario, nombre, apellido, email')
      .single();

    if (error) {
      console.error('❌ Error actualizando usuario:', error);
      return {
        success: false,
        error: 'Error al actualizar el usuario',
      };
    }

    console.log('✅ Usuario actualizado exitosamente');

    return {
      success: true,
      message: 'Usuario actualizado correctamente',
      data: {
        id: data.id,
        usuario: data.usuario,
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
      },
    };
  } catch (error) {
    console.error('❌ Error en updateUsuarioAdmin:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
