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
 * 1. Primera hora (0-59 minutos):
 *    - Usar tarifa_1_valor si minutos están en rango tarifa_1_nombre (ej: "0-9" o "1-9")
 *    - Usar tarifa_2_valor si minutos están en rango tarifa_2_nombre (ej: "10-59")
 * 
 * 2. Segunda hora en adelante (60+ minutos):
 *    - Usar tarifa_3_valor si minutos de cada hora están en rango tarifa_3_nombre
 *    - Usar tarifa_4_valor si minutos de cada hora están en rango tarifa_4_nombre
 * 
 * 3. Siempre agregar:
 *    - tarifa_extra
 *    - tarifa_auxiliar
 */
export function calcularTarifa(
  horaEntrada: string,
  horaSalida: string,
  parametro: Parametro
): CalculoTarifa {
  const tiempo = calcularTiempoTranscurrido(horaEntrada, horaSalida);
  const desglose: DesgloseTarifa[] = [];
  let totalAPagar = 0;

  // Calcular minutos totales para el cobro
  const totalMinutos = tiempo.totalMinutosCobro;

  if (totalMinutos === 0) {
    // Sin tiempo = sin cargo (excepto extras)
    totalAPagar = (parametro.tarifa_extra || 0) + (parametro.tarifa_auxiliar || 0);
    return {
      tiempoTotal: tiempo,
      desglose,
      totalAPagar,
    };
  }

  // PRIMERA HORA (minutos 0-59)
  if (totalMinutos <= 60) {
    // Toda la estancia está dentro de la primera hora
    const minutosEnPrimeraHora = totalMinutos;
    let tarifaAplicada = 0;
    let rangoAplicado = "";
    
    // Verificar en qué rango cae usando tarifa_1 o tarifa_2
    if (estaEnRango(minutosEnPrimeraHora, parametro.tarifa_1_nombre)) {
      tarifaAplicada = parametro.tarifa_1_valor;
      rangoAplicado = parametro.tarifa_1_nombre;
    } else if (estaEnRango(minutosEnPrimeraHora, parametro.tarifa_2_nombre)) {
      tarifaAplicada = parametro.tarifa_2_valor;
      rangoAplicado = parametro.tarifa_2_nombre;
    }
    
    totalAPagar += tarifaAplicada;
    
    desglose.push({
      descripcion: `Primera hora (${rangoAplicado} minutos)`,
      minutos: minutosEnPrimeraHora,
      tarifa: tarifaAplicada,
      subtotal: tarifaAplicada,
    });
  } else {
    // La estancia excede la primera hora (60+ minutos)
    
    // 1. Cobrar la primera hora completa (60 minutos) con tarifa_1/tarifa_2
    let tarifaPrimeraHora = 0;
    let rangoPrimeraHora = "";
    
    // Para una hora completa (60 minutos), verificar cuál tarifa aplica
    // Generalmente 60 minutos cae en el rango superior (tarifa_2_nombre: "10-59")
    if (estaEnRango(60, parametro.tarifa_2_nombre)) {
      tarifaPrimeraHora = parametro.tarifa_2_valor;
      rangoPrimeraHora = parametro.tarifa_2_nombre;
    } else if (estaEnRango(60, parametro.tarifa_1_nombre)) {
      tarifaPrimeraHora = parametro.tarifa_1_valor;
      rangoPrimeraHora = parametro.tarifa_1_nombre;
    } else {
      // Si 60 no cae en ningún rango definido, usar la tarifa más alta
      tarifaPrimeraHora = parametro.tarifa_2_valor;
      rangoPrimeraHora = parametro.tarifa_2_nombre;
    }
    
    totalAPagar += tarifaPrimeraHora;
    
    desglose.push({
      descripcion: `Primera hora (${rangoPrimeraHora})`,
      minutos: 60,
      tarifa: tarifaPrimeraHora,
      subtotal: tarifaPrimeraHora,
    });
    
    // 2. Procesar minutos restantes (después del minuto 60) usando tarifa_3/tarifa_4
    const minutosRestantes = totalMinutos - 60;
    
    // Dividir los minutos restantes en horas completas y minutos adicionales
    const horasAdicionales = Math.floor(minutosRestantes / 60);
    const minutosFinales = minutosRestantes % 60;
    
    // Cobrar cada hora adicional completa con tarifa_3/tarifa_4
    for (let i = 0; i < horasAdicionales; i++) {
      let tarifaPorHora = 0;
      let rangoHora = "";
      
      // Para una hora completa (60 minutos), usar tarifa_3 o tarifa_4
      if (estaEnRango(60, parametro.tarifa_4_nombre)) {
        tarifaPorHora = parametro.tarifa_4_valor;
        rangoHora = parametro.tarifa_4_nombre;
      } else if (estaEnRango(60, parametro.tarifa_3_nombre)) {
        tarifaPorHora = parametro.tarifa_3_valor;
        rangoHora = parametro.tarifa_3_nombre;
      } else {
        // Si 60 no cae en ningún rango, usar la tarifa más alta
        tarifaPorHora = parametro.tarifa_4_valor;
        rangoHora = parametro.tarifa_4_nombre;
      }
      
      totalAPagar += tarifaPorHora;
      
      desglose.push({
        descripcion: `Hora ${i + 2} (${rangoHora})`,
        minutos: 60,
        tarifa: tarifaPorHora,
        subtotal: tarifaPorHora,
      });
    }
    
    // Cobrar minutos finales si los hay (con tarifa_3/tarifa_4)
    if (minutosFinales > 0) {
      let tarifaFinal = 0;
      let rangoFinal = "";
      
      // Verificar en qué rango de tarifa_3/tarifa_4 caen los minutos finales
      if (estaEnRango(minutosFinales, parametro.tarifa_3_nombre)) {
        tarifaFinal = parametro.tarifa_3_valor;
        rangoFinal = parametro.tarifa_3_nombre;
      } else if (estaEnRango(minutosFinales, parametro.tarifa_4_nombre)) {
        tarifaFinal = parametro.tarifa_4_valor;
        rangoFinal = parametro.tarifa_4_nombre;
      }
      
      totalAPagar += tarifaFinal;
      
      desglose.push({
        descripcion: `Minutos adicionales (${rangoFinal})`,
        minutos: minutosFinales,
        tarifa: tarifaFinal,
        subtotal: tarifaFinal,
      });
    }
  }

  // AGREGAR TARIFA EXTRA Y AUXILIAR (siempre se suman al total)
  const tarifaExtra = parametro.tarifa_extra || 0;
  const tarifaAuxiliar = parametro.tarifa_auxiliar || 0;
  
  totalAPagar += tarifaExtra + tarifaAuxiliar;
  
  // Agregar al desglose solo si tienen valor
  if (tarifaExtra > 0) {
    desglose.push({
      descripcion: "Tarifa extra",
      minutos: 0,
      tarifa: tarifaExtra,
      subtotal: tarifaExtra,
    });
  }
  
  if (tarifaAuxiliar > 0) {
    desglose.push({
      descripcion: "Tarifa auxiliar",
      minutos: 0,
      tarifa: tarifaAuxiliar,
      subtotal: tarifaAuxiliar,
    });
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
