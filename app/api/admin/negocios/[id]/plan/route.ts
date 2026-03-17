/**
 * API Route: Cambio de Plan de Negocio (DEMO → PREMIUM)
 * PATCH /api/admin/negocios/[id]/plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin-client';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PATCH: Actualizar plan de negocio (solo DEMO → PREMIUM)
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { plan } = body;

    // Validar que el nuevo plan sea PREMIUM
    if (plan !== 'premium') {
      return NextResponse.json(
        { success: false, error: 'Solo se permite actualizar a plan PREMIUM' },
        { status: 400 }
      );
    }

    // Obtener negocio actual
    const { data: negocio, error: getNegocioError } = await supabaseAdmin
      .from('negocios')
      .select('plan')
      .eq('id', id)
      .single();

    if (getNegocioError || !negocio) {
      return NextResponse.json(
        { success: false, error: 'Negocio no encontrado' },
        { status: 404 }
      );
    }

    // Validar que el plan actual sea DEMO
    if (negocio.plan !== 'demo') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Solo se puede actualizar de DEMO a PREMIUM, no al revés' 
        },
        { status: 400 }
      );
    }

    // Actualizar negocio a PREMIUM
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('negocios')
      .update({
        plan: 'premium',
        fecha_expiracion: null, // Anular fecha de expiración
        limite_usuarios: 99999,
        limite_tarjetas: 99999,
        capacidad_maxima: 99999,
        estado: 'activo',
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updated) {
      console.error('Error actualizando plan:', updateError);
      return NextResponse.json(
        { success: false, error: 'Error al actualizar el plan' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Plan actualizado a PREMIUM exitosamente',
      data: updated,
    });
  } catch (error) {
    console.error('Error en PATCH /api/admin/negocios/[id]/plan:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
