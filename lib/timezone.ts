/**
 * Utilidades para manejo de zonas horarias basadas en configuración del negocio
 */

import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Obtiene el timezone configurado para un negocio
 */
export async function obtenerTimezoneNegocio(negocioId: string): Promise<string> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data, error } = await supabase
    .from('negocios')
    .select('configuracion')
    .eq('id', negocioId)
    .single();
  
  if (error || !data) {
    console.warn('⚠️ [TIMEZONE] No se pudo obtener configuración del negocio, usando America/Guayaquil por defecto');
    return 'America/Guayaquil'; // Default GMT-5
  }
  
  const config = data.configuracion as { zona_horaria?: string };
  return config?.zona_horaria || 'America/Guayaquil';
}

/**
 * Obtiene la fecha/hora actual en el timezone del negocio
 * Retorna un string en formato ISO que PostgreSQL interpretará correctamente
 */
export async function obtenerFechaHoraActual(negocioId: string): Promise<string> {
  const timezone = await obtenerTimezoneNegocio(negocioId);
  const ahora = new Date();
  
  // Convertir la fecha UTC actual al timezone del negocio
  const fechaLocal = toZonedTime(ahora, timezone);
  
  // Formatear en ISO manteniendo el timezone
  // PostgreSQL almacenará esto correctamente como timestamp with time zone
  const isoString = formatInTimeZone(fechaLocal, timezone, "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
  
  console.log('🌍 [TIMEZONE]', {
    negocioId,
    timezone,
    fechaUTC: ahora.toISOString(),
    fechaLocal: isoString
  });
  
  return isoString;
}

/**
 * Convierte una fecha UTC de la base de datos al timezone del negocio para display
 */
export async function convertirUTCaLocal(
  fechaUTC: string, 
  negocioId: string
): Promise<Date> {
  const timezone = await obtenerTimezoneNegocio(negocioId);
  const fecha = new Date(fechaUTC);
  return toZonedTime(fecha, timezone);
}

/**
 * Formatea una fecha en el timezone del negocio
 */
export async function formatearFechaLocal(
  fechaUTC: string,
  negocioId: string,
  formato: string = "yyyy-MM-dd HH:mm:ss"
): Promise<string> {
  const timezone = await obtenerTimezoneNegocio(negocioId);
  return formatInTimeZone(fechaUTC, timezone, formato);
}
