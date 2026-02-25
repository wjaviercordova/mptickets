import type { Parametro } from "@/types/ingreso";
import type { CalculoTarifa, DesgloseTarifa } from "@/types/pago";

/**
 * Parsea un rango de tiempo como "1-9" o "10-59" y retorna [min, max]
 */
function parsearRangoTiempo(rango: string): [number, number] {
  const partes = rango.split("-").map(p => parseInt(p.trim()));
  if (partes.length !== 2 || partes.some(isNaN)) {
    throw new Error(`Rango de tiempo inválido: ${rango}`);
  }
  return [  partes[0], partes[1]];
}

/**
 * Verifica si un valor de minutos cae dentro de un rango
 */
function estaEnRango(minutos: number, rango: string): boolean {
  const [min, max] = parsearRangoTiempo(rango);
  return minutos >= min && minutos <= max;
}

/**
 * Calcula el tiempo transcurrido entre dos fechas
 */
export function calcularTiempoTranscurrido(
  horaEntrada: string,
  horaSalida: string
): {
  horas: number;
  minutos: number;
  segundos: number;
  totalMinutos: number;
  totalMinutosCobro: number; // Minutos para cálculo de tarifa (redondeado hacia arriba)
  totalSegundos: number;
} {
  const entrada = new Date(horaEntrada);
  const salida = new Date(horaSalida);
  
  const diferenciaMs = salida.getTime() - entrada.getTime();
  const totalSegundos = Math.floor(diferenciaMs / 1000);
  const totalMinutos = Math.floor(totalSegundos / 60);
  
  // Para el cálculo de tarifas: si hay al menos 1 segundo, se cuenta como minuto 1
  // Ejemplo: 15 segundos → totalMinutosCobro = 1
  // Ejemplo: 1 minuto 30 seg → totalMinutosCobro = 2
  const totalMinutosCobro = totalSegundos > 0 ? Math.max(1, Math.ceil(totalSegundos / 60)) : 0;
  
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;
  const segundos = totalSegundos % 60;
  
  return {
    horas,
    minutos,
    segundos,
    totalMinutos,
    totalMinutosCobro,
    totalSegundos,
  };
}

/**
 * Calcula el total a pagar según las tarifas del parámetro
 * 
 * Lógica:
 * 1. Si el tiempo es < 60 minutos (primera hora):
 *    - Usar tarifa_1 o tarifa_2 según el rango
 *    - "1-9" significa: desde el segundo 1 hasta el minuto 9:59
 *    - "10-59" significa: desde el minuto 10:00 hasta el minuto 59:59
 * 
 * 2. Si el tiempo es >= 60 minutos (más de una hora):
 *    - Usar tarifa_3 y tarifa_4 para calcular por horas
 *    - Cada hora completa (60 min) se cobra según tarifa_3 o tarifa_4
 *    - Los minutos sobrantes también se cobran según tarifa_3 o tarifa_4
 */
export function calcularTarifa(
  horaEntrada: string,
  horaSalida: string,
  parametro: Parametro
): CalculoTarifa {
  const tiempo = calcularTiempoTranscurrido(horaEntrada, horaSalida);
  const desglose: DesgloseTarifa[] = [];
  let totalAPagar = 0;

  // Si el tiempo total es menor a 60 minutos (primera hora)
  // Usamos totalMinutosCobro que redondea hacia arriba desde 1 segundo
  if (tiempo.totalMinutosCobro < 60) {
    // Usar tarifa_1 o tarifa_2
    let tarifaAplicada = 0;
    let rangoAplicado = "";
    
    // Verificar en qué rango cae (usando totalMinutosCobro)
    if (estaEnRango(tiempo.totalMinutosCobro, parametro.tarifa_1_nombre)) {
      tarifaAplicada = parametro.tarifa_1_valor;
      rangoAplicado = parametro.tarifa_1_nombre;
    } else if (estaEnRango(tiempo.totalMinutosCobro, parametro.tarifa_2_nombre)) {
      tarifaAplicada = parametro.tarifa_2_valor;
      rangoAplicado = parametro.tarifa_2_nombre;
    }
    
    totalAPagar = tarifaAplicada;
    
    desglose.push({
      descripcion: `Primera hora (${rangoAplicado} minutos)`,
      minutos: tiempo.totalMinutos,
      tarifa: tarifaAplicada,
      subtotal: tarifaAplicada,
    });
  } 
  // Si el tiempo es >= 60 minutos (más de una hora)
  else {
    // Calcular horas completas y minutos sobrantes
    const horasCompletas = Math.floor(tiempo.totalMinutos / 60);
    const minutosRestantes = tiempo.totalMinutos % 60;
    
    // Cobrar por cada hora completa
    for (let i = 0; i < horasCompletas; i++) {
      let tarifaPorHora = 0;
      
      // Para cada hora, consideramos 60 minutos
      // Verificamos en qué rango de tarifa_3/tarifa_4 cae
      // Como 60 minutos típicamente excede el rango máximo (ej: "10-59"),
      // usamos la tarifa del rango más alto que contenga minutos válidos
      
      // Intentamos con tarifa_4 primero (rango superior)
      try {
        const [min4] = parsearRangoTiempo(parametro.tarifa_4_nombre);
        // Si 60 está en el rango o es mayor que el mínimo del rango superior
        if (60 >= min4) {
          tarifaPorHora = parametro.tarifa_4_valor;
        }
      } catch {
        // Si no hay tarifa_4, intentar con tarifa_3
      }
      
      // Si no se asignó tarifa_4, intentar con tarifa_3
      if (tarifaPorHora === 0) {
        try {
          const [min3, max3] = parsearRangoTiempo(parametro.tarifa_3_nombre);
          if (60 >= min3 && 60 <= max3) {
            tarifaPorHora = parametro.tarifa_3_valor;
          } else {
            // Si 60 excede el rango, usar la tarifa más alta disponible
            tarifaPorHora = parametro.tarifa_4_valor || parametro.tarifa_3_valor;
          }
        } catch {
          tarifaPorHora = parametro.tarifa_3_valor;
        }
      }
      
      totalAPagar += tarifaPorHora;
      
      desglose.push({
        descripcion: `Hora ${i + 1} (60 minutos)`,
        minutos: 60,
        tarifa: tarifaPorHora,
        subtotal: tarifaPorHora,
      });
    }
    
    // Cobrar minutos restantes si los hay
    if (minutosRestantes > 0) {
      let tarifaRestante = 0;
      
      // Verificar en qué rango de tarifa_3/tarifa_4 caen los minutos restantes
      if (estaEnRango(minutosRestantes, parametro.tarifa_3_nombre)) {
        tarifaRestante = parametro.tarifa_3_valor;
      } else if (estaEnRango(minutosRestantes, parametro.tarifa_4_nombre)) {
        tarifaRestante = parametro.tarifa_4_valor;
      }
      
      totalAPagar += tarifaRestante;
      
      desglose.push({
        descripcion: `Minutos adicionales`,
        minutos: minutosRestantes,
        tarifa: tarifaRestante,
        subtotal: tarifaRestante,
      });
    }
  }

  return {
    tiempoTotal: tiempo,
    desglose,
    totalAPagar,
  };
}

/**
 * Formatea el tiempo transcurrido para mostrar en UI
 */
export function formatearTiempoTranscurrido(tiempo: {
  horas: number;
  minutos: number;
  segundos: number;
}): string {
  const partes: string[] = [];
  
  if (tiempo.horas > 0) {
    partes.push(`${tiempo.horas}h`);
  }
  if (tiempo.minutos > 0) {
    partes.push(`${tiempo.minutos}m`);
  }
  if (tiempo.segundos > 0 || partes.length === 0) {
    partes.push(`${tiempo.segundos}s`);
  }
  
  return partes.join(" ");
}
