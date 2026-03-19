/**
 * API Route: Gestión de Negocios (Admin)
 * GET  /api/admin/negocios - Listar todos los negocios
 * POST /api/admin/negocios - Crear nuevo negocio
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllNegocios, createNegocio } from '@/lib/admin/negocios';
import type { NegociosFilters, PlanType, EstadoNegocio } from '@/types/admin';

/**
 * GET: Obtener lista de negocios con filtros opcionales
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Construir filtros desde query params
    const filters: NegociosFilters = {
      estado: (searchParams.get('estado') as EstadoNegocio) || undefined,
      plan: (searchParams.get('plan') as PlanType) || undefined,
      search: searchParams.get('search') || undefined,
      orderBy: searchParams.get('orderBy') || 'fecha_creacion',
      order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
    };

    const result = await getAllNegocios(filters);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      count: result.data?.length || 0,
    });
  } catch (error) {
    console.error('Error en GET /api/admin/negocios:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST: Crear nuevo negocio (wizard completo con datos editables)
 * Recibe: negocio, usuario, configuraciones, parametros, tarjetas
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📦 [POST /api/admin/negocios] Body recibido:', JSON.stringify(body, null, 2));

    // Validar que tenga todas las secciones requeridas
    if (!body.negocio || !body.usuario || !body.configuraciones || !body.parametros || !body.tarjetas) {
      console.error('❌ Datos incompletos:', {
        negocio: !!body.negocio,
        usuario: !!body.usuario,
        configuraciones: !!body.configuraciones,
        parametros: !!body.parametros,
        tarjetas: !!body.tarjetas,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Datos incompletos del wizard',
          details: { message: 'Faltan secciones requeridas: negocio, usuario, configuraciones, parametros, tarjetas' },
        },
        { status: 400 }
      );
    }

    // Validaciones de negocio
    if (!body.negocio.codigo || !body.negocio.plan) {
      console.error('❌ Validación fallida - Código o plan faltante:', {
        codigo: body.negocio.codigo,
        plan: body.negocio.plan,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Datos requeridos faltantes',
          details: { field: 'codigo', message: 'Código y plan son requeridos' },
        },
        { status: 400 }
      );
    }

    console.log('✅ Validación pasada - Código y plan presentes');

    // Validar formato de código (solo letras y números, sin espacios)
    if (!/^[A-Z0-9]+$/i.test(body.negocio.codigo)) {
      console.error('❌ Validación fallida - Código con formato inválido:', body.negocio.codigo);
      return NextResponse.json(
        {
          success: false,
          error: 'Código inválido',
          details: {
            field: 'codigo',
            message: 'El código solo puede contener letras y números (sin espacios)',
          },
        },
        { status: 400 }
      );
    }

    console.log('✅ Validación pasada - Formato de código válido');

    // Validar que el código tenga al menos 3 caracteres
    if (body.negocio.codigo.length < 3) {
      console.error('❌ Validación fallida - Código muy corto:', body.negocio.codigo);
      return NextResponse.json(
        {
          success: false,
          error: 'Código muy corto',
          details: {
            field: 'codigo',
            message: 'El código debe tener al menos 3 caracteres',
          },
        },
        { status: 400 }
      );
    }

    console.log('✅ Validación pasada - Longitud de código válida');

    // Validar plan
    if (!['demo', 'anual', 'premium'].includes(body.negocio.plan)) {
      console.error('❌ Validación fallida - Plan inválido:', body.negocio.plan);
      return NextResponse.json(
        {
          success: false,
          error: 'Plan inválido',
          details: {
            field: 'plan',
            message: 'El plan debe ser "demo", "anual" o "premium"',
          },
        },
        { status: 400 }
      );
    }

    // Validar usuario
    if (!body.usuario.usuario || !body.usuario.password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos de usuario incompletos',
          details: { message: 'Usuario y contraseña son requeridos' },
        },
        { status: 400 }
      );
    }

    // Validar que haya configuraciones
    if (!Array.isArray(body.configuraciones) || body.configuraciones.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Configuraciones inválidas',
          details: { message: 'Se requiere al menos una configuración' },
        },
        { status: 400 }
      );
    }

    // Validar que haya parámetros
    if (!Array.isArray(body.parametros) || body.parametros.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parámetros inválidos',
          details: { message: 'Se requiere al menos un parámetro de tarifa' },
        },
        { status: 400 }
      );
    }

    // Validar que haya tarjetas
    if (!Array.isArray(body.tarjetas) || body.tarjetas.length === 0) {
      console.error('❌ Validación fallida - Tarjetas inválidas');
      return NextResponse.json(
        {
          success: false,
          error: 'Tarjetas inválidas',
          details: { message: 'Se requiere al menos una tarjeta' },
        },
        { status: 400 }
      );
    }

    console.log('✅ Todas las validaciones pasadas - Llamando a createNegocio');

    // Crear negocio con todos los datos del wizard
    const result = await createNegocio(body);

    if (!result.success) {
      console.error('❌ Error en createNegocio:', result.error);
      console.error('❌ Detalles:', result.details);
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          details: result.details,
        },
        { status: 400 }
      );
    }

    console.log('✅ Negocio creado exitosamente:', result.data?.negocio?.id);

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        data: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en POST /api/admin/negocios:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
