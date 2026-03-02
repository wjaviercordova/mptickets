/**
 * SERVIDOR DE IMPRESIÓN LOCAL PARA MPTICKETS
 * 
 * Este servidor debe ejecutarse en cada máquina que tenga una impresora
 * térmica conectada localmente por USB.
 * 
 * Puerto: 3003 (configurable con PORT env)
 * Uso: node servidor-impresion.js
 * Uso con puerto custom: PORT=3004 node servidor-impresion.js
 */

const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3003;

// Directorio temporal para archivos de impresión
const TEMP_DIR = path.join(os.tmpdir(), 'mptickets-print');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Middleware
app.use(cors({
  origin: '*', // Permitir solicitudes desde cualquier origen (nube)
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '10mb' }));

// ============================================================
// COMANDOS ESC/POS PARA IMPRESORA TÉRMICA 3nStar POS-80
// ============================================================
const ESC = '\x1B';  // Escape
const GS = '\x1D';   // Group Separator

const CMD = {
  // Inicialización
  INIT: ESC + '@',
  
  // Alineación
  ALIGN_LEFT: ESC + 'a' + '0',
  ALIGN_CENTER: ESC + 'a' + '1',
  ALIGN_RIGHT: ESC + 'a' + '2',
  
  // Énfasis (Negrita)
  BOLD_ON: ESC + 'E' + '1',
  BOLD_OFF: ESC + 'E' + '0',
  
  // Tamaños de texto (GS ! n)
  SIZE_NORMAL: GS + '!' + '\x00',      // Normal
  SIZE_TALL: GS + '!' + '\x01',        // Solo alto (doble altura)
  SIZE_WIDE: GS + '!' + '\x10',        // Solo ancho (doble ancho)
  SIZE_DOUBLE: GS + '!' + '\x11',      // Doble alto y ancho
  SIZE_TRIPLE: GS + '!' + '\x21',      // Triple alto, doble ancho
  
  // Corte de papel
  CUT_FULL: GS + 'V' + '\x00',         // Corte completo
  CUT_PARTIAL: GS + 'V' + '\x01',      // Corte parcial
  
  // Saltos de línea
  LF: '\n'
};

// Función para centrar texto
function centrar(texto, ancho) {
  if (texto.length >= ancho) return texto.substring(0, ancho);
  const espacios = Math.floor((ancho - texto.length) / 2);
  return ' '.repeat(espacios) + texto;
}

// Función para generar ticket de entrada con comandos ESC/POS
function generarTicketEntrada(datos) {
  const ancho = 42; // Caracteres para 80mm
  let ticket = '';
  
  // Inicializar impresora
  ticket += CMD.INIT;
  
  // ==================== ENCABEZADO ====================
  ticket += CMD.ALIGN_CENTER;
  
  // NOMBRE DEL NEGOCIO - Texto normal centrado (sin comandos especiales)
  ticket += CMD.SIZE_TALL + CMD.BOLD_ON;
  ticket += (datos.nombre_negocio || 'PARQUEADERO');
  ticket += CMD.LF;
  ticket += CMD.SIZE_NORMAL + CMD.BOLD_OFF;

  
  
  // Dirección - texto normal
  ticket += datos.direccion || '';
  ticket += CMD.LF;
  
  // Teléfono - texto normal
  ticket += 'Tel: ' + (datos.telefono || 'N/A');
  ticket += CMD.LF;
  
  // Línea separadora
  ticket += '='.repeat(ancho) + CMD.LF;
  ticket += CMD.LF;
  
  // ==================== CONTENIDO ====================
  ticket += CMD.ALIGN_LEFT;
  
  // Fecha y Hora en una sola línea
  const fecha = datos.fecha || '';
  const hora = datos.hora || '';
  const espacios = Math.max(1, ancho - 7 - fecha.length - 6 - hora.length);
  ticket += `Fecha: ${fecha}${' '.repeat(espacios)}Hora: ${hora}`;
  ticket += CMD.LF;
  
  // Tipo de vehículo - texto normal
  if (datos.tipo_vehiculo) {
    ticket += `Tipo:    ${datos.tipo_vehiculo}` + CMD.LF;
  }
  
  // TARJETA - Tamaño alto (estrecho pero alto) + negrita
  ticket += CMD.SIZE_TALL + CMD.BOLD_ON;
  ticket += 'Tarjeta: ' + (datos.numero || 'N/A');
  ticket += CMD.LF;  // Salto de línea PRIMERO
  ticket += CMD.SIZE_NORMAL + CMD.BOLD_OFF;  // Luego resetear
  ticket += CMD.LF;
  
  // ==================== INFORMACIÓN ====================
  ticket += '-'.repeat(ancho) + CMD.LF;
  
  ticket += `Horario ${datos.horario || '24 Horas'}` + CMD.LF;
  ticket += `Tarifa:  ${datos.tarifa || 'Ver tabla'}` + CMD.LF;
  ticket += '-'.repeat(ancho) + CMD.LF;
  ticket += CMD.LF;
  
  // ==================== PIE DE PÁGINA ====================
  ticket += CMD.ALIGN_CENTER;
  ticket += 'Conserve este ticket' + CMD.LF;
  ticket += 'Gracias por su preferencia' + CMD.LF;
  
  // Alimentar papel antes del corte
  ticket += CMD.LF + CMD.LF + CMD.LF + CMD.LF;
  
  // Corte de papel
  ticket += CMD.CUT_PARTIAL;
  
  return ticket;
}

// Función para generar ticket de pago con comandos ESC/POS
function generarTicketPago(datos) {
  const ancho = 42;
  let ticket = '';
  
  // Inicializar impresora
  ticket += CMD.INIT;
  
  // ==================== ENCABEZADO ====================
  ticket += CMD.ALIGN_CENTER;
  
  // NOMBRE DEL NEGOCIO - Texto normal centrado (sin comandos especiales)
  ticket += (datos.nombre_negocio || 'PARQUEADERO');
  ticket += CMD.LF;
  
  // Dirección - texto normal
  ticket += datos.direccion || '';
  ticket += CMD.LF;
  
  // Teléfono - texto normal
  ticket += 'Tel: ' + (datos.telefono || 'N/A');
  ticket += CMD.LF;
  
  // Línea separadora
  ticket += '='.repeat(ancho) + CMD.LF;
  ticket += CMD.LF;
  
  // Título
  ticket += CMD.BOLD_ON;
  ticket += '*** COMPROBANTE DE PAGO ***';
  ticket += CMD.LF;  // Salto de línea PRIMERO
  ticket += CMD.BOLD_OFF;  // Luego resetear
  ticket += CMD.LF;
  
  // ==================== CONTENIDO ====================
  ticket += CMD.ALIGN_LEFT;
  
  // TARJETA - Tamaño alto + negrita
  ticket += CMD.SIZE_TALL + CMD.BOLD_ON;
  ticket += 'Tarjeta: ' + (datos.numero || 'N/A');
  ticket += CMD.LF;  // Salto de línea PRIMERO
  ticket += CMD.SIZE_NORMAL + CMD.BOLD_OFF;  // Luego resetear
  
  // Información del servicio
  ticket += `Ingreso:      ${datos.fecha_ingreso || ''} ${datos.hora_ingreso || ''}` + CMD.LF;
  ticket += `Salida:       ${datos.hora_salida || ''}` + CMD.LF;
  ticket += `Tiempo:       ${datos.tiempo_total || ''}` + CMD.LF;
  ticket += CMD.LF;
  
  // ==================== TOTALES ====================
  ticket += '-'.repeat(ancho) + CMD.LF;
  
  // TOTAL - Tamaño doble + negrita
  ticket += CMD.SIZE_DOUBLE + CMD.BOLD_ON;
  ticket += 'TOTAL: $' + parseFloat(datos.total || 0).toFixed(2);
  ticket += CMD.LF;  // Salto de línea PRIMERO
  ticket += CMD.SIZE_NORMAL + CMD.BOLD_OFF;  // Luego resetear
  
  if (datos.descuento && parseFloat(datos.descuento) > 0) {
    ticket += `Descuento:    $${parseFloat(datos.descuento).toFixed(2)}` + CMD.LF;
  }
  ticket += `Metodo Pago:  ${datos.metodo_pago || 'EFECTIVO'}` + CMD.LF;
  ticket += '-'.repeat(ancho) + CMD.LF;
  ticket += CMD.LF;
  
  // ==================== PIE DE PÁGINA ====================
  ticket += CMD.ALIGN_CENTER;
  ticket += 'Conserve este ticket' + CMD.LF;
  ticket += 'Gracias por su preferencia' + CMD.LF;
  
  // Alimentar papel antes del corte
  ticket += CMD.LF + CMD.LF + CMD.LF + CMD.LF;
  
  // Corte de papel
  ticket += CMD.CUT_PARTIAL;
  
  return ticket;
}

// Función para imprimir usando CUPS (macOS/Linux) o lpr (Windows)
function imprimirConCUPS(contenido, impresora, copias = 1) {
  return new Promise((resolve, reject) => {
    // Crear archivo temporal
    const tempFile = path.join(TEMP_DIR, `ticket_${Date.now()}.txt`);
    
    // Escribir con encoding latin1 para comandos ESC/POS
    fs.writeFile(tempFile, contenido, 'latin1', (err) => {
      if (err) {
        reject(new Error(`Error al crear archivo temporal: ${err.message}`));
        return;
      }
      
      // Detectar sistema operativo y ajustar comando
      const isWindows = os.platform() === 'win32';
      let comando;
      
      if (isWindows) {
        // Windows: usar type + PRINT command
        comando = `type "${tempFile}" | PRINT /D:"${impresora}"`;
      } else {
        // macOS/Linux: usar lp con opción raw para ESC/POS
        comando = `lp -d "${impresora}" -n ${copias} -o raw "${tempFile}"`;
      }
      
      console.log(`🖨️  Ejecutando: ${comando}`);
      
      exec(comando, (error, stdout, stderr) => {
        // Eliminar archivo temporal después de 5 segundos
        setTimeout(() => {
          fs.unlink(tempFile, (unlinkErr) => {
            if (unlinkErr) console.warn('⚠️  No se pudo eliminar archivo temporal:', unlinkErr.message);
          });
        }, 5000);
        
        if (error) {
          const errorMsg = stderr || error.message;
          console.error('❌ Error al imprimir:', errorMsg);
          reject(new Error(`Error al imprimir: ${errorMsg}`));
          return;
        }
        
        console.log(`✅ Impresión exitosa: ${stdout.trim()}`);
        resolve(stdout.trim());
      });
    });
  });
}

// ============================================================
// ENDPOINTS DE LA API
// ============================================================

/**
 * POST /imprimir
 * Endpoint principal para imprimir tickets
 * 
 * Body:
 * {
 *   "tipo": "ENTRADA" | "PAGO" | "COBRO",
 *   "datos": { ... datos del ticket ... },
 *   "config": {
 *     "cola_impresion": "nombre_impresora",
 *     "copias_por_ticket": 1
 *   }
 * }
 */
app.post('/imprimir', async (req, res) => {
  try {
    const { tipo, datos, config } = req.body;
    
    console.log('');
    console.log('📝 Nueva solicitud de impresión');
    console.log(`   Tipo: ${tipo}`);
    console.log(`   Impresora: ${config?.cola_impresion || 'No especificada'}`);
    
    if (!tipo || !datos) {
      return res.status(400).json({
        success: false,
        error: 'Faltan parámetros requeridos (tipo, datos)'
      });
    }
    
    let contenido = '';
    
    // Generar contenido según el tipo de ticket
    switch (tipo.toUpperCase()) {
      case 'ENTRADA':
        contenido = generarTicketEntrada(datos);
        break;
      
      case 'COBRO':
      case 'PAGO':
        contenido = generarTicketPago(datos);
        break;
      
      default:
        return res.status(400).json({
          success: false,
          error: `Tipo de ticket no válido: ${tipo}. Use: ENTRADA, PAGO, COBRO`
        });
    }
    
    // Configuración de impresión
    const impresora = config?.cola_impresion || '_3nStar'; // Valor por defecto
    const copias = config?.copias_por_ticket || 1;
    
    // Imprimir
    const resultado = await imprimirConCUPS(contenido, impresora, copias);
    
    console.log('✅ Ticket enviado correctamente\n');
    
    res.json({
      success: true,
      message: 'Ticket enviado a la impresora correctamente',
      job_id: resultado,
      impresora: impresora
    });
    
  } catch (error) {
    console.error('❌ Error en /imprimir:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al procesar la impresión'
    });
  }
});

/**
 * GET /test
 * Endpoint para probar la conexión con el servidor
 */
app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor de impresión funcionando correctamente',
    version: '1.0.0',
    platform: os.platform(),
    hostname: os.hostname()
  });
});

/**
 * GET /status
 * Endpoint para verificar el estado de una impresora
 * Query params: ?impresora=_3nStar
 */
app.get('/status', (req, res) => {
  const impresora = req.query.impresora || '_3nStar';
  const isWindows = os.platform() === 'win32';
  
  const comando = isWindows 
    ? `wmic printer where name="${impresora}" get status`
    : `lpstat -p "${impresora}"`;
  
  exec(comando, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({
        success: false,
        error: 'No se pudo obtener el estado de la impresora',
        details: stderr || error.message,
        impresora: impresora
      });
    }
    
    res.json({
      success: true,
      status: stdout.trim(),
      impresora: impresora
    });
  });
});

/**
 * GET /impresoras
 * Lista todas las impresoras disponibles en el sistema
 */
app.get('/impresoras', (req, res) => {
  const isWindows = os.platform() === 'win32';
  const comando = isWindows 
    ? 'wmic printer get name'
    : 'lpstat -p -d';
  
  exec(comando, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({
        success: false,
        error: 'No se pudo listar las impresoras',
        details: stderr || error.message
      });
    }
    
    res.json({
      success: true,
      output: stdout.trim()
    });
  });
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================

const server = app.listen(PORT, () => {
  console.clear();
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                                                        ║');
  console.log('║     🖨️   SERVIDOR DE IMPRESIÓN MPTICKETS  🖨️         ║');
  console.log('║                                                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`✅ Servidor ejecutándose en: http://localhost:${PORT}`);
  console.log(`🖥️  Sistema operativo: ${os.platform()}`);
  console.log(`💻 Hostname: ${os.hostname()}`);
  console.log('');
  console.log('📡 Endpoints disponibles:');
  console.log(`   POST http://localhost:${PORT}/imprimir     - Imprimir ticket`);
  console.log(`   GET  http://localhost:${PORT}/test         - Probar conexión`);
  console.log(`   GET  http://localhost:${PORT}/status       - Estado de impresora`);
  console.log(`   GET  http://localhost:${PORT}/impresoras   - Listar impresoras`);
  console.log('');
  console.log('⏳ Esperando solicitudes de impresión...');
  console.log('');
  console.log('💡 Presiona Ctrl+C para detener el servidor');
  console.log('════════════════════════════════════════════════════════');
  console.log('');
});

// Manejo de errores del servidor
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ ERROR: El puerto ${PORT} ya está en uso.`);
    console.error('   Soluciones:');
    console.error('   1. Cierra el proceso que está usando el puerto');
    console.error(`   2. Usa un puerto diferente: PORT=3003 node servidor-impresion.js`);
    process.exit(1);
  } else {
    console.error('❌ Error del servidor:', err);
    process.exit(1);
  }
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
  console.log('\n\n🛑 Deteniendo servidor de impresión...');
  server.close(() => {
    console.log('✅ Servidor detenido correctamente');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Deteniendo servidor de impresión...');
  server.close(() => {
    console.log('✅ Servidor detenido correctamente');
    process.exit(0);
  });
});
