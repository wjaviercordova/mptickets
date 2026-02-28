import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

interface DatosTicket {
  nombre_negocio: string;
  direccion: string;
  telefono: string;
  fecha: string;
  hora: string;
  numero: string;
  dia: string;
  horario: string;
  tarifa: string;
}

// Función para generar contenido del ticket
function generarTicketEntrada(datos: DatosTicket) {
  const ancho = 42; // Caracteres para 80mm
  const lineas = [];
  
  const centrar = (texto: string) => {
    if (texto.length >= ancho) return texto.substring(0, ancho);
    const espacios = Math.floor((ancho - texto.length) / 2);
    return ' '.repeat(espacios) + texto;
  };
  
  lineas.push('='.repeat(ancho));
  lineas.push(centrar(datos.nombre_negocio || 'PARQUEADERO'));
  lineas.push(centrar(datos.direccion || ''));
  lineas.push(centrar(`Tel: ${datos.telefono || 'N/A'}`));
  lineas.push('='.repeat(ancho));
  lineas.push('');
  lineas.push(centrar('*** TICKET DE ENTRADA ***'));
  lineas.push('');
  lineas.push(`Fecha: ${datos.fecha || ''}`);
  lineas.push(`Hora:  ${datos.hora || ''}`);
  lineas.push(`Dia:   ${datos.dia || ''}`);
  lineas.push('');
  lineas.push(`Tarjeta: ${datos.numero || 'N/A'}`);
  lineas.push('');
  lineas.push('-'.repeat(ancho));
  lineas.push(`Horario: ${datos.horario || '24 Horas'}`);
  lineas.push(`Tarifa:  ${datos.tarifa || 'Ver tabla'}`);
  lineas.push('-'.repeat(ancho));
  lineas.push('');
  lineas.push(centrar('Conserve este ticket'));
  lineas.push(centrar('Gracias por su preferencia'));
  lineas.push('');
  lineas.push('');
  lineas.push('');
  
  return lineas.join('\n');
}

// Función para imprimir directamente usando CUPS (lp)
async function imprimirDirecto(contenido: string, impresora: string, copias: number = 1) {
  try {
    // Escapar el contenido para evitar problemas con caracteres especiales
    const contenidoEscapado = contenido.replace(/"/g, '\\"');
    
    // Comando lp para imprimir directamente desde stdin
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
    const cookieStore = await cookies();
    const negocioId = cookieStore.get("mp_negocio_id")?.value;

    if (!negocioId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const supabase = createServerClient();

    // Obtener datos del negocio
    const { data: negocio, error: negocioError } = await supabase
      .from("negocios")
      .select("nombre, direccion, telefono")
      .eq("id", negocioId)
      .single();

    if (negocioError || !negocio) {
      console.error("❌ [PRUEBA IMPRESION] Error al obtener negocio:", negocioError);
      return NextResponse.json({ 
        error: "Negocio no encontrado",
        detail: negocioError?.message 
      }, { status: 404 });
    }

    console.log("✅ [PRUEBA IMPRESION] Negocio encontrado:", negocio.nombre);

    // Obtener configuración de horarios desde configuracion_sistema
    const { data: horarioConfig } = await supabase
      .from("configuracion_sistema")
      .select("valor")
      .eq("negocio_id", negocioId)
      .eq("clave", "dias_atencion")
      .single();

    const diasAtencion = horarioConfig?.valor || "Lun-Dom";
    const horarioAtencion = "24 Horas"; // Por ahora fijo, puedes agregar otro registro en config

    // Formatear fecha y hora en formato DD.MM.AAAA y HH:MM:SS
    const ahora = new Date();
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const anio = ahora.getFullYear();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');

    const fechaFormateada = `${dia}.${mes}.${anio}`;
    const horaFormateada = `${horas}:${minutos}:${segundos}`;

    // Preparar datos del ticket de prueba con datos REALES del negocio
    const datosTicket = {
      nombre_negocio: negocio.nombre,
      direccion: negocio.direccion || "N/A",
      telefono: negocio.telefono || "N/A",
      fecha: fechaFormateada,
      hora: horaFormateada,
      numero: "TEST-001",  // FICTICIO
      tipo_vehiculo: "Automóvil",  // FICTICIO
      dia: diasAtencion,
      horario: horarioAtencion,
      tarifa: "$1.50",  // FICTICIO
    };

    console.log("📝 [PRUEBA IMPRESION] Datos del ticket:", datosTicket);

    // Generar contenido del ticket
    const contenido = generarTicketEntrada(datosTicket);
    
    // Obtener configuración de la impresora del body
    const nombreImpresora = body.cola_impresion || body.nombre_impresora || '_3nStar';
    const copias = body.copias_por_ticket || 1;
    
    console.log(`🖨️  [PRUEBA IMPRESION] Imprimiendo en: ${nombreImpresora}`);
    
    // Imprimir directamente en la impresora local
    const resultado = await imprimirDirecto(contenido, nombreImpresora, copias);

    return NextResponse.json({
      success: true,
      message: "Ticket de prueba impreso correctamente",
      job_id: resultado.jobId,
      impresora: nombreImpresora,
      copias: copias
    });
  } catch (error) {
    console.error("❌ [PRUEBA IMPRESION] Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { 
        error: "Error al procesar prueba de impresión",
        detail: errorMessage
      },
      { status: 500 }
    );
  }
}
