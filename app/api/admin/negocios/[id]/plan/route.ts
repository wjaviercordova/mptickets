/**
 * API Route: Cambio de Plan de Negocio (DEMO → ANUAL/PREMIUM, ANUAL → PREMIUM)
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
 * PATCH: Actualizar plan de negocio con validación de transiciones
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { plan } = body;

    // Validar que el nuevo plan sea válido
    if (plan !== 'premium' && plan !== 'anual') {
      return NextResponse.json(
        { success: false, error: 'Solo se permite actualizar a plan ANUAL o PREMIUM' },
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

    // Validar transiciones permitidas
    const from = negocio.plan;
    const to = plan;

    // PREMIUM no puede cambiar a ningún otro plan
    if (from === 'premium') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se puede cambiar desde plan PREMIUM a otros planes' 
        },
        { status: 400 }
      );
    }

    // ANUAL no puede cambiar a DEMO
    if (from === 'anual' && to === 'demo') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se puede cambiar de ANUAL a DEMO' 
        },
        { status: 400 }
      );
    }

    // Calcular fecha de expiración según el plan
    let fecha_expiracion: string | null = null;
    
    if (to === 'anual') {
      // ANUAL: 1 año desde hoy
      const oneYearLater = new Date();
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      fecha_expiracion = oneYearLater.toISOString();
    } else if (to === 'premium') {
      // PREMIUM: sin fecha de expiración
      fecha_expiracion = null;
    }

    // Actualizar negocio con el nuevo plan
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('negocios')
      .update({
        plan: to,
        fecha_expiracion,
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
