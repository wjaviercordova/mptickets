/**
 * API ENDPOINT: /api/planes-config
 * =================================
 * 
 * Obtiene la configuración de límites de un plan específico
 * 
 * Query params:
 * - planTipo: 'demo' | 'basica' | 'premium'
 * - negocioId: UUID del negocio
 */

import { NextRequest, NextResponse } from 'next/server';
import { obtenerConfigPlan, obtenerConfigPlanDeNegocio } from '@/lib/planes-limites-db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const planTipo = searchParams.get('planTipo');
    const negocioId = searchParams.get('negocioId');

    // Validar que al menos uno esté presente
    if (!planTipo && !negocioId) {
      return NextResponse.json(
        { error: 'Se requiere planTipo o negocioId' },
        { status: 400 }
      );
    }

    let config;

    if (negocioId) {
      // Obtener por negocio ID
      config = await obtenerConfigPlanDeNegocio(negocioId);
    } else if (planTipo) {
      // Validar que sea un plan válido
      if (!['demo', 'basica', 'premium'].includes(planTipo)) {
        return NextResponse.json(
          { error: 'planTipo inválido. Debe ser: demo, basica o premium' },
          { status: 400 }
        );
      }
      
      // Obtener por tipo de plan
      config = await obtenerConfigPlan(planTipo as 'demo' | 'basica' | 'premium');
    }

    if (!config) {
      return NextResponse.json(
        { error: 'No se encontró configuración del plan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ config });
  } catch (error) {
    console.error('[GET /api/planes-config] Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener configuración del plan' },
      { status: 500 }
    );
  }
}
