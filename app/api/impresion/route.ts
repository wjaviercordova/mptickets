import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

interface DatosTicketEntrada {
  nombre_negocio: string;
  direccion: string;
  telefono: string;
  fecha: string;
  hora: string;
  numero: string;
  dia: string;
  horario: string;
  tarifa: string;
  tipo_vehiculo?: string;
}

interface DatosTicketPago {
  nombre_negocio: string;
  direccion: string;
  telefono: string;
  fecha_ingreso: string;
  hora_ingreso: string;
  hora_salida: string;
  numero: string;
  tiempo_total: string;
  total: string;
  metodo_pago: string;
  descuento?: string;
}

// Función para generar ticket de entrada
function generarTicketEntrada(datos: DatosTicketEntrada) {
  const ancho = 42;
  const lineas = [];
  
  const centrar = (texto: string) => {
    if (texto.length >= ancho) return texto.substring(0, ancho);
    const espacios = Math.floor((ancho - texto.length) / 2);
    return ' '.repeat(espacios) + texto;
  };
  
  lineas.push('='.repeat(ancho));
  lineas.push(centrar(datos.nombre_negocio));
  lineas.push(centrar(datos.direccion));
  lineas.push(centrar(`Tel: ${datos.telefono}`));
  lineas.push('='.repeat(ancho));
  lineas.push('');
  lineas.push(centrar('*** TICKET DE ENTRADA ***'));
  lineas.push('');
  lineas.push(`Fecha: ${datos.fecha}`);
  lineas.push(`Hora:  ${datos.hora}`);
  lineas.push(`Dia:   ${datos.dia}`);
  lineas.push('');
  lineas.push(`Tarjeta: ${datos.numero}`);
  if (datos.tipo_vehiculo) {
    lineas.push(`Tipo:    ${datos.tipo_vehiculo}`);
  }
  lineas.push('');
  lineas.push('-'.repeat(ancho));
  lineas.push(`Horario: ${datos.horario}`);
  lineas.push(`Tarifa:  ${datos.tarifa}`);
  lineas.push('-'.repeat(ancho));
  lineas.push('');
  lineas.push(centrar('Conserve este ticket'));
  lineas.push(centrar('Gracias por su preferencia'));
  lineas.push('');
  lineas.push('');
  lineas.push('');
  
  return lineas.join('\n');
}

// Función para generar ticket de pago
function generarTicketPago(datos: DatosTicketPago) {
  const ancho = 42;
  const lineas = [];
  
  const centrar = (texto: string) => {
    if (texto.length >= ancho) return texto.substring(0, ancho);
    const espacios = Math.floor((ancho - texto.length) / 2);
    return ' '.repeat(espacios) + texto;
  };
  
  lineas.push('='.repeat(ancho));
  lineas.push(centrar(datos.nombre_negocio));
  lineas.push(centrar(datos.direccion));
  lineas.push(centrar(`Tel: ${datos.telefono}`));
  lineas.push('='.repeat(ancho));
  lineas.push('');
  lineas.push(centrar('*** COMPROBANTE DE PAGO ***'));
  lineas.push('');
  lineas.push(`Tarjeta:      ${datos.numero}`);
  lineas.push(`Ingreso:      ${datos.fecha_ingreso} ${datos.hora_ingreso}`);
  lineas.push(`Salida:       ${datos.hora_salida}`);
  lineas.push(`Tiempo:       ${datos.tiempo_total}`);
  lineas.push('');
  lineas.push('-'.repeat(ancho));
  lineas.push(`Total:        $${datos.total}`);
  if (datos.descuento && parseFloat(datos.descuento) > 0) {
    lineas.push(`Descuento:    $${datos.descuento}`);
  }
  lineas.push(`Metodo Pago:  ${datos.metodo_pago}`);
  lineas.push('-'.repeat(ancho));
  lineas.push('');
  lineas.push(centrar('Gracias por su visita'));
  lineas.push('');
  lineas.push('');
  lineas.push('');
  
  return lineas.join('\n');
}

// Función para imprimir directamente usando CUPS
async function imprimirDirecto(contenido: string, impresora: string, copias: number = 1) {
  try {
    const contenidoEscapado = contenido.replace(/"/g, '\\"').replace(/\$/g, '\\$');
    const comando = `echo "${contenidoEscapado}" | lp -d ${impresora} -n ${copias}`;
    
    console.log(`🖨️  Imprimiendo en: ${impresora} (${copias} copia(s))`);
    
    const { stdout, stderr } = await execPromise(comando);
    
    if (stderr && !stdout) {
      throw new Error(stderr);
    }
    
    console.log(`✅ Impresión enviada: ${stdout.trim()}`);
    return { success: true, jobId: stdout.trim() };
    
  } catch (error) {
    console.error('❌ Error al imprimir:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    throw new Error(`Error de impresión: ${errorMessage}`);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tipo, datos, config } = body;

    if (!tipo || !datos || !config) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos (tipo, datos, config)" },
        { status: 400 }
      );
    }

    console.log(`📝 [IMPRESION] Solicitud tipo: ${tipo}`);

    let contenido = '';

    // Generar contenido según el tipo
    switch (tipo.toUpperCase()) {
      case 'ENTRADA':
        contenido = generarTicketEntrada(datos);
        break;
      
      case 'PAGO':
      case 'COBRO':
        contenido = generarTicketPago(datos);
        break;
      
      default:
        return NextResponse.json(
          { error: `Tipo de ticket no válido: ${tipo}` },
          { status: 400 }
        );
    }

    // Obtener configuración de impresora
    const impresora = config.cola_impresion || '_3nStar';
    const copias = config.copias_por_ticket || 1;

    // Imprimir
    const resultado = await imprimirDirecto(contenido, impresora, copias);

    return NextResponse.json({
      success: true,
      message: 'Ticket impreso correctamente',
      job_id: resultado.jobId,
      impresora: impresora
    });

  } catch (error) {
    console.error('❌ [IMPRESION] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { 
        error: 'Error al procesar la impresión',
        detail: errorMessage 
      },
      { status: 500 }
    );
  }
}
