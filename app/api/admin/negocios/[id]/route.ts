/**
 * API Route: Gestión de Negocio Individual (Admin)
 * GET    /api/admin/negocios/[id] - Obtener negocio por ID
 * PATCH  /api/admin/negocios/[id] - Actualizar negocio
 * DELETE /api/admin/negocios/[id] - Eliminar negocio (soft delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getNegocioById,
  updateNegocio,
  deleteNegocio,
  toggleNegocioEstado,
} from '@/lib/admin/negocios';
import type { Negocio } from '@/types/admin';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET: Obtener negocio por ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const result = await getNegocioById(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('Error en GET /api/admin/negocios/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Actualizar negocio
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body: Partial<Negocio> & { action?: string } = await request.json();

    // Si es una acción especial (cambiar estado)
    if (body.action === 'toggle_estado' && body.estado) {
      const result = await toggleNegocioEstado(
        id,
        body.estado as 'activo' | 'inactivo' | 'suspendido'
      );

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: result.message,
      });
    }

    // Actualización normal
    const result = await updateNegocio(id, body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Negocio actualizado exitosamente',
      data: result.data,
    });
  } catch (error) {
    console.error('Error en PATCH /api/admin/negocios/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Eliminar negocio completamente (hard delete)
 * Solo permite eliminar negocios DEMO con estado INACTIVO (licencia vencida)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const result = await deleteNegocio(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Error en DELETE /api/admin/negocios/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
