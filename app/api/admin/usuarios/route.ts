/**
 * API Route: Gestión de Usuarios Admin (Admin)
 * GET  /api/admin/usuarios - Listar todos los usuarios administradores
 */

import { NextResponse } from 'next/server';
import { getAllUsuariosAdmin } from '@/lib/admin/usuarios';

/**
 * GET: Obtener lista de usuarios administradores (rol='admin', usuario='admin')
 */
export async function GET() {
  try {
    console.log('📥 GET /api/admin/usuarios - Obteniendo usuarios administradores');

    const { usuarios, error } = await getAllUsuariosAdmin();

    if (error) {
      console.error('❌ Error obteniendo usuarios administradores:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Error al obtener usuarios administradores',
          details: error,
        },
        { status: 500 }
      );
    }

    console.log(`✅ ${usuarios.length} usuarios administradores encontrados`);

    return NextResponse.json(
      {
        success: true,
        data: usuarios,
        total: usuarios.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error en GET /api/admin/usuarios:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
