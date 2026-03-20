/**
 * API Route: Logout de Administradores MPTickets
 * POST /api/admin/auth/logout
 */

import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🔐 [LOGOUT API] Iniciando proceso de cierre de sesión...');
    
    // Crear respuesta exitosa
    const response = NextResponse.json(
      {
        success: true,
        message: 'Sesión cerrada exitosamente'
      },
      { status: 200 }
    );

    // Eliminar cookie usando el mismo método que el login
    console.log('🔐 [LOGOUT API] Eliminando cookie admin_session...');
    response.cookies.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expirar inmediatamente
      path: '/',
    });

    console.log('✅ [LOGOUT API] Cookie admin_session eliminada exitosamente');

    return response;
  } catch (error) {
    console.error('❌ [LOGOUT API] Error en POST /api/admin/auth/logout:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Error al cerrar sesión'
      },
      { status: 500 }
    );
  }
}
