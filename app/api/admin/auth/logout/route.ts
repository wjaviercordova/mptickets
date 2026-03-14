/**
 * API Route: Logout de Administradores MPTickets
 * POST /api/admin/auth/logout
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Eliminar cookie de sesión
    const cookieStore = cookies();
    cookieStore.delete('admin_session');

    return NextResponse.json(
      {
        success: true,
        message: 'Sesión cerrada exitosamente'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en POST /api/admin/auth/logout:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Error al cerrar sesión'
      },
      { status: 500 }
    );
  }
}
