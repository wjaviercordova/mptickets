// Tipos para la configuración de impresión
export interface ConfigImpresion {
  habilitada: boolean;
  cola_impresion: string;
  nombre_impresora: string;
  ancho_papel: number;
  tipo_formato: "basico" | "detallado";
  imprimir_logo: boolean;
  imprimir_en_ingreso: boolean;
  imprimir_en_pago: boolean;
  copias_por_ticket: number;
}

// Datos para ticket de entrada
export interface DatosTicketEntrada {
  nombre_negocio: string;
  direccion: string;
  telefono: string;
  fecha_ingreso: string;
  hora_ingreso: string;
  numero_tarjeta: string;
  horario: string;
  tarifa_vehiculo: string;
  tipo_vehiculo: string;
}

// Datos para ticket de pago/salida
export interface DatosTicketPago {
  nombre_negocio: string;
  direccion: string;
  telefono: string;
  fecha_ingreso: string;
  hora_ingreso: string;
  hora_salida: string;
  numero_tarjeta: string;
  tiempo_total: string;
  total: number;
  metodo_pago: string;
  descuento?: number;
}

// Función para obtener la configuración de impresión desde la base de datos
export async function obtenerConfigImpresion(negocioId: string): Promise<ConfigImpresion | null> {
  try {
    const response = await fetch(`/api/configuracion/impresion?negocio_id=${negocioId}`);
    if (!response.ok) return null;
    
    const config = await response.json();
    return config;
  } catch (error) {
    console.error("Error al obtener configuración de impresión:", error);
    return null;
  }
}

// Función para imprimir ticket de entrada
export async function imprimirTicketEntrada(
  datos: DatosTicketEntrada,
  config: ConfigImpresion
): Promise<boolean> {
  if (!config.habilitada || !config.imprimir_en_ingreso) {
    console.log("📍 [IMPRESION] Impresión de entrada deshabilitada");
    return false;
  }

  try {
    console.log("🖨️ [IMPRESION] Imprimiendo ticket de entrada...");
    console.log("🖨️ [IMPRESION] Datos recibidos en imprimirTicketEntrada:", datos);
    
    const ticketData = {
      tipo: "ENTRADA",
      datos: {
        nombre_negocio: datos.nombre_negocio,
        direccion: datos.direccion,
        telefono: datos.telefono,
        fecha: datos.fecha_ingreso,
        hora: datos.hora_ingreso,
        numero: datos.numero_tarjeta,
        horario: datos.horario,
        tarifa: datos.tarifa_vehiculo,
        tipo_vehiculo: datos.tipo_vehiculo,
      },
      config: {
        cola_impresion: config.cola_impresion,
        copias_por_ticket: config.copias_por_ticket,
      },
    };

    console.log("🖨️ [IMPRESION] TicketData preparado para enviar:", JSON.stringify(ticketData, null, 2));

    // ⚠️ IMPORTANTE: Esta petición se hace desde el NAVEGADOR (cliente)
    // Se conecta al servidor local corriendo en localhost:3003 de la máquina del cliente
    const response = await fetch("http://localhost:3003/imprimir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ticketData),
    });

    if (response.ok) {
      console.log("✅ [IMPRESION] Ticket de entrada enviado exitosamente");
      return true;
    } else {
      console.error("❌ [IMPRESION] Error al imprimir:", await response.text());
      return false;
    }
  } catch (error) {
    console.error("❌ [IMPRESION] Error de conexión con servidor de impresión:", error);
    // No lanzar error para no interrumpir el flujo principal
    return false;
  }
}

// Función para imprimir ticket de pago/salida
export async function imprimirTicketPago(
  datos: DatosTicketPago,
  config: ConfigImpresion
): Promise<boolean> {
  if (!config.habilitada || !config.imprimir_en_pago) {
    console.log("📍 [IMPRESION] Impresión de pago deshabilitada");
    return false;
  }

  try {
    console.log("🖨️ [IMPRESION] Imprimiendo ticket de pago...");
    
    const ticketData = {
      tipo: "COBRO",
      datos: {
        nombre_negocio: datos.nombre_negocio,
        direccion: datos.direccion,
        telefono: datos.telefono,
        fecha: datos.fecha_ingreso,
        hora_entrada: datos.hora_ingreso,
        hora_salida: datos.hora_salida,
        numero_tarjeta: datos.numero_tarjeta,
        tiempo_total: datos.tiempo_total,
        total: datos.total.toFixed(2),
        metodo_pago: datos.metodo_pago,
        descuento: datos.descuento ? datos.descuento.toFixed(2) : "0.00",
      },
      config: {
        cola_impresion: config.cola_impresion,
        copias_por_ticket: config.copias_por_ticket,
      },
    };

    // ⚠️ IMPORTANTE: Esta petición se hace desde el NAVEGADOR (cliente)
    // Se conecta al servidor local corriendo en localhost:3003 de la máquina del cliente
    const response = await fetch("http://localhost:3003/imprimir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ticketData),
    });

    if (response.ok) {
      console.log("✅ [IMPRESION] Ticket de pago enviado exitosamente");
      return true;
    } else {
      console.error("❌ [IMPRESION] Error al imprimir:", await response.text());
      return false;
    }
  } catch (error) {
    console.error("❌ [IMPRESION] Error de conexión con servidor de impresión:", error);
    return false;
  }
}

// Función auxiliar para formatear fecha y hora
export function formatearFechaHora(fechaISO: string): { fecha: string; hora: string; dia: string } {
  const fecha = new Date(fechaISO);
  
  // Formatear fecha: DD.MM.AAAA
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  const fechaFormateada = `${dia}.${mes}.${anio}`;
  
  // Formatear hora: HH:MM:SS
  const horas = String(fecha.getHours()).padStart(2, '0');
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  const segundos = String(fecha.getSeconds()).padStart(2, '0');
  const horaFormateada = `${horas}:${minutos}:${segundos}`;
  
  // Obtener día de la semana
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const diaSemana = diasSemana[fecha.getDay()];
  
  return {
    fecha: fechaFormateada,
    hora: horaFormateada,
    dia: diaSemana,
  };
}
