/**
 * API Route: Verificar sesión de administrador
 * GET /api/admin/auth/verify - Verificar si el token de sesión es válido
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromToken } from '@/lib/admin/auth';

export async function GET(request: NextRequest) {
  try {
    // Obtener cookie de sesión
    const adminSession = request.cookies.get('admin_session');

    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: 'No hay sesión activa' },
        { status: 401 }
      );
    }

    // Verificar que el token sea válido
    const adminUser = await getAdminFromToken(adminSession.value);

    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Sesión inválida o expirada' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        usuario: adminUser.usuario,
        nombre: adminUser.nombre,
        email: adminUser.email,
        rol: adminUser.rol,
      },
    });
  } catch (error) {
    console.error('Error en GET /api/admin/auth/verify:', error);
    return NextResponse.json(
      { success: false, error: 'Error al verificar sesión' },
      { status: 500 }
    );
  }
}
