/**
 * API Route: Login de Administradores MPTickets
 * POST /api/admin/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';
import { loginAdmin } from '@/lib/admin/auth';

export async function POST(request: NextRequest) {
  try {
    // 1. Obtener datos del body
    const body = await request.json();
    const { usuario, password } = body;

    // 2. Validar que se envíen los datos requeridos
    if (!usuario || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Usuario y contraseña son requeridos'
        },
        { status: 400 }
      );
    }

    // 3. Validar tipos de datos
    if (typeof usuario !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Formato de datos inválido'
        },
        { status: 400 }
      );
    }

    // 4. Autenticar usuario
    const result = await loginAdmin(usuario.trim(), password);

    console.log('[ADMIN LOGIN] Resultado de loginAdmin:', {
      success: result.success,
      hasUser: !!result.user,
      hasToken: !!result.token,
      tokenLength: result.token?.length || 0
    });

    if (!result.success) {
      console.error('[ADMIN LOGIN] Autenticación fallida para:', usuario);
      return NextResponse.json(
        {
          success: false,
          error: result.error
        },
        { status: 401 }
      );
    }

    if (!result.token) {
      console.error('[ADMIN LOGIN] ❌ TOKEN NO GENERADO');
      return NextResponse.json(
        {
          success: false,
          error: 'Error al generar token de sesión'
        },
        { status: 500 }
      );
    }

    console.log('[ADMIN LOGIN] ✅ Autenticación exitosa para:', usuario);
    console.log('[ADMIN LOGIN] Token recibido:', result.token.substring(0, 30) + '...');

    // 5. Crear respuesta con cookie (IGUAL QUE LOGIN DE NEGOCIOS)
    const response = NextResponse.json(
      {
        success: true,
        user: result.user,
        message: 'Autenticación exitosa'
      },
      { status: 200 }
    );

    // 6. Establecer cookie en el response
    console.log('[ADMIN LOGIN] Estableciendo cookie admin_session...');
    response.cookies.set('admin_session', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 horas
      path: '/',
    });

    console.log('[ADMIN LOGIN] ✅ Cookie admin_session establecida en response');
    console.log('[ADMIN LOGIN] Configuración cookie:', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Error en POST /api/admin/auth/login:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Error del servidor. Intente nuevamente.'
      },
      { status: 500 }
    );
  }
}
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    }
  );
}
