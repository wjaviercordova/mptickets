/**
 * API Route: Gestión de Usuario Admin Individual
 * GET /api/admin/usuarios/[id] - Obtener detalles de un usuario admin
 * PUT /api/admin/usuarios/[id] - Actualizar usuario admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUsuarioAdminById, updateUsuarioAdmin } from '@/lib/admin/usuarios';
import type { ActualizarUsuarioAdminRequest } from '@/types/admin';

/**
 * GET: Obtener detalles de un usuario administrador
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: usuarioId } = await params;
    console.log(`📥 GET /api/admin/usuarios/${usuarioId} - Obteniendo detalles`);

    const { usuario, error } = await getUsuarioAdminById(usuarioId);

    if (error) {
      console.error('❌ Error obteniendo usuario admin:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Usuario administrador no encontrado',
        },
        { status: 404 }
      );
    }

    if (!usuario) {
      return NextResponse.json(
        {
          success: false,
          error: 'Usuario no encontrado',
        },
        { status: 404 }
      );
    }

    console.log(`✅ Usuario encontrado: ${usuario.nombre} ${usuario.apellido}`);

    return NextResponse.json(
      {
        success: true,
        data: usuario,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error en GET /api/admin/usuarios/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT: Actualizar usuario administrador (nombre, apellido, password opcional)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: usuarioId } = await params;
    console.log(`📝 PUT /api/admin/usuarios/${usuarioId} - Actualizando datos`);

    const body = await request.json();

    // Validar datos requeridos
    if (!body.nombre || !body.apellido) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nombre y apellido son requeridos',
        },
        { status: 400 }
      );
    }

    // Si hay password, validar confirmación
    if (body.password) {
      if (!body.confirmarPassword) {
        return NextResponse.json(
          {
            success: false,
            error: 'Debe confirmar la contraseña',
          },
          { status: 400 }
        );
      }

      if (body.password !== body.confirmarPassword) {
        return NextResponse.json(
          {
            success: false,
            error: 'Las contraseñas no coinciden',
          },
          { status: 400 }
        );
      }

      // Validar longitud mínima
      if (body.password.length < 6) {
        return NextResponse.json(
          {
            success: false,
            error: 'La contraseña debe tener al menos 6 caracteres',
          },
          { status: 400 }
        );
      }
    }

    // Preparar datos de actualización
    const datosActualizacion: ActualizarUsuarioAdminRequest = {
      nombre: body.nombre.trim(),
      apellido: body.apellido.trim(),
      ...(body.password && body.password.trim() !== '' && { password: body.password }),
    };

    console.log('Datos a actualizar:', { ...datosActualizacion, password: datosActualizacion.password ? '***' : undefined });

    // Actualizar usuario
    const result = await updateUsuarioAdmin(usuarioId, datosActualizacion);

    if (!result.success) {
      console.error('❌ Error actualizando usuario:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Error al actualizar usuario',
        },
        { status: 500 }
      );
    }

    console.log('✅ Usuario actualizado exitosamente');

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error en PUT /api/admin/usuarios/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
