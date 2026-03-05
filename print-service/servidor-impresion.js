/**
 * SERVIDOR DE IMPRESIÓN LOCAL PARA MPTICKETS - Versión con mapeo CP437
 * 
 * Este servidor usa mapeo manual de caracteres CP437 para impresoras térmicas
 * que no interpretan correctamente PC850.
 */

const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { convertirTextoCP437 } = require('./mapeo-caracteres');

const app = express();
const PORT = process.env.PORT || 3003;

// Directorio temporal
const TEMP_DIR = path.join(os.tmpdir(), 'mptickets-print');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Middleware
app.use(cors({ origin: '*', methods: ['GET', 'POST'], allowedHeaders: ['Content-Type'] }));
app.use(express.json({ limit: '10mb' }));

// ============================================================
// COMANDOS ESC/POS
// ============================================================

const CMD = {
  INIT: Buffer.from([0x1B, 0x40]),              // ESC @ - Inicializar
  CODE_PAGE_CP437: Buffer.from([0x1B, 0x74, 0x00]), // ESC t 0 - CP437
  ALIGN_LEFT: Buffer.from([0x1B, 0x61, 0x00]),  // ESC a 0
  ALIGN_CENTER: Buffer.from([0x1B, 0x61, 0x01]), // ESC a 1
  ALIGN_RIGHT: Buffer.from([0x1B, 0x61, 0x02]), // ESC a 2
  SIZE_NORMAL: Buffer.from([0x1D, 0x21, 0x00]), // GS ! 0
  SIZE_DOUBLE: Buffer.from([0x1D, 0x21, 0x11]), // GS ! 17 (doble ancho y alto)
  BOLD_ON: Buffer.from([0x1B, 0x45, 0x01]),     // ESC E 1
  BOLD_OFF: Buffer.from([0x1B, 0x45, 0x00]),    // ESC E 0
  CUT: Buffer.from([0x1D, 0x56, 0x00]),         // GS V 0
  NEWLINE: Buffer.from('\n', 'ascii')
};

// ============================================================
// FUNCIONES DE GENERACIÓN DE TICKETS CON MAPEO CP437
// ============================================================

function generarTicketEntrada(datos) {
  return new Promise((resolve, reject) => {
    try {
      console.log('🔍 Generando ticket de ENTRADA con mapeo CP437');
      console.log(`   Horario recibido: "${datos.horario}"`);
      console.log(`   Tarifa recibida: "${datos.tarifa}"`);

      const buffer = Buffer.concat([
        // INICIALIZAR Y CONFIGURAR
        CMD.INIT,
        CMD.CODE_PAGE_CP437,
        
        // ENCABEZADO CENTRADO
        CMD.ALIGN_CENTER,
        convertirTextoCP437(datos.nombre_negocio || 'PARQUEADERO'),
        CMD.NEWLINE,
        convertirTextoCP437(datos.direccion || ''),
        CMD.NEWLINE,
        convertirTextoCP437('Tel: ' + (datos.telefono || 'N/A')),
        CMD.NEWLINE,
        Buffer.from('==========================================\n', 'ascii'),
        CMD.NEWLINE,
        
        // CONTENIDO ALINEADO A LA IZQUIERDA
        CMD.ALIGN_LEFT,
        CMD.SIZE_NORMAL,
        convertirTextoCP437(`Fecha: ${datos.fecha || ''}  Hora: ${datos.hora || ''}`),
        CMD.NEWLINE,
        convertirTextoCP437(`Tipo:    ${datos.tipo_vehiculo || ''}`),
        CMD.NEWLINE,
        
        // NÚMERO DE TARJETA EN GRANDE
        CMD.SIZE_DOUBLE,
        convertirTextoCP437(`Tarjeta: ${datos.numero || 'N/A'}`),
        CMD.NEWLINE,
        CMD.SIZE_NORMAL,
        
        Buffer.from('------------------------------------------\n', 'ascii'),
        convertirTextoCP437(`Horario ${datos.horario || '24 Horas'}`),
        CMD.NEWLINE,
        convertirTextoCP437(`Tarifa:  ${datos.tarifa || 'Ver tabla'}`),
        CMD.NEWLINE,
        Buffer.from('------------------------------------------\n', 'ascii'),
        CMD.NEWLINE,
        
        // PIE DE PÁGINA CENTRADO
        CMD.ALIGN_CENTER,
        convertirTextoCP437('Conserve este ticket'),
        CMD.NEWLINE,
        convertirTextoCP437('Gracias por su preferencia'),
        CMD.NEWLINE,
        CMD.NEWLINE,
        CMD.NEWLINE,
        CMD.NEWLINE,
        CMD.NEWLINE,
        
        // CORTAR PAPEL
        CMD.CUT
      ]);

      console.log('✅ Buffer de ticket de ENTRADA generado');
      resolve(buffer);
    } catch (error) {
      reject(error);
    }
  });
}

function generarTicketPago(datos) {
  return new Promise((resolve, reject) => {
    try {
      console.log('🔍 Generando ticket de PAGO con mapeo CP437');
      console.log(`   nombre_negocio: "${datos.nombre_negocio}"`);
      console.log(`   direccion: "${datos.direccion}"`);
      console.log(`   telefono: "${datos.telefono}"`);

      const buffer = Buffer.concat([
        // INICIALIZAR Y CONFIGURAR
        CMD.INIT,
        CMD.CODE_PAGE_CP437,
        
        // ENCABEZADO CENTRADO
        CMD.ALIGN_CENTER,
        convertirTextoCP437(datos.nombre_negocio || 'PARQUEADERO'),
        CMD.NEWLINE,
        convertirTextoCP437(datos.direccion || ''),
        CMD.NEWLINE,
        convertirTextoCP437('Tel: ' + (datos.telefono || 'N/A')),
        CMD.NEWLINE,
        Buffer.from('==========================================\n', 'ascii'),
        CMD.NEWLINE,
        
        // TÍTULO EN NEGRITA
        CMD.BOLD_ON,
        convertirTextoCP437('RECIBO DE PAGO'),
        CMD.NEWLINE,
        CMD.BOLD_OFF,
        CMD.NEWLINE,
        
        // CONTENIDO ALINEADO A LA IZQUIERDA
        CMD.ALIGN_LEFT,
        convertirTextoCP437(`Fecha: ${datos.fecha || ''}`),
        CMD.NEWLINE,
        convertirTextoCP437(`Entrada: ${datos.hora_entrada || ''}   Salida: ${datos.hora_salida || ''}`),
        CMD.NEWLINE,
        convertirTextoCP437(`Tarjeta: ${datos.numero_tarjeta || 'N/A'}`),
        CMD.NEWLINE,
        CMD.NEWLINE,
        
        // TOTAL ALINEADO A LA IZQUIERDA CON ESPACIOS (para evitar que se corte)
        CMD.ALIGN_LEFT,
        Buffer.from('------------------------------------------\n', 'ascii'),
        CMD.SIZE_DOUBLE,
        convertirTextoCP437(`Total: $${parseFloat(datos.total || 0).toFixed(2)}`),
        CMD.NEWLINE,
        CMD.SIZE_NORMAL,
        Buffer.from('------------------------------------------\n', 'ascii'),
        CMD.NEWLINE,
        
        // PIE DE PÁGINA CENTRADO
        CMD.ALIGN_CENTER,
        convertirTextoCP437('Recibo No valido como factura'),
        CMD.NEWLINE,
        convertirTextoCP437('Gracias por su preferencia'),
        CMD.NEWLINE,
        CMD.NEWLINE,
        CMD.NEWLINE,
        CMD.NEWLINE,
        CMD.NEWLINE,
        
        // CORTAR PAPEL
        CMD.CUT
      ]);

      console.log('✅ Buffer de ticket de PAGO generado');
      resolve(buffer);
    } catch (error) {
      reject(error);
    }
  });
}

// ============================================================
// FUNCIÓN DE IMPRESIÓN POR CUPS
// ============================================================

function imprimirConCUPS(buffer, impresora, copias = 1) {
  return new Promise((resolve, reject) => {
    const tempFile = path.join(TEMP_DIR, `ticket_${Date.now()}.bin`);
    
    fs.writeFile(tempFile, buffer, (err) => {
      if (err) {
        reject(new Error(`Error al crear archivo temporal: ${err.message}`));
        return;
      }
      
      const comando = `lp -d "${impresora}" -n ${copias} -o raw "${tempFile}"`;
      console.log(`🖨️  Ejecutando: ${comando}`);
      
      exec(comando, (error, stdout, stderr) => {
        setTimeout(() => {
          fs.unlink(tempFile, (unlinkErr) => {
            if (unlinkErr) console.warn('⚠️  No se pudo eliminar archivo temporal');
          });
        }, 5000);
        
        if (error) {
          reject(new Error(`Error al imprimir: ${stderr || error.message}`));
          return;
        }
        
        console.log(`✅ Impresión exitosa: ${stdout.trim()}`);
        resolve(stdout.trim());
      });
    });
  });
}

// ============================================================
// ENDPOINTS
// ============================================================

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
    
    let buffer;
    
    switch (tipo.toUpperCase()) {
      case 'ENTRADA':
        buffer = await generarTicketEntrada(datos);
        break;
      
      case 'COBRO':
      case 'PAGO':
        buffer = await generarTicketPago(datos);
        break;
      
      default:
        return res.status(400).json({
          success: false,
          error: `Tipo de ticket no válido: ${tipo}`
        });
    }
    
    const impresora = config?.cola_impresion || '_3nStar';
    const copias = config?.copias_por_ticket || 1;
    
    await imprimirConCUPS(buffer, impresora, copias);
    
    res.json({
      success: true,
      message: 'Ticket enviado correctamente'
    });
    console.log('✅ Ticket enviado correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/test', (req, res) => {
  res.json({ success: true, message: 'Servidor funcionando' });
});

app.get('/status', (req, res) => {
  exec('lpstat -p', (error, stdout) => {
    res.json({ success: true, status: stdout });
  });
});

app.get('/impresoras', (req, res) => {
  exec('lpstat -p -d', (error, stdout) => {
    const impresoras = stdout.split('\n').filter(l => l.startsWith('impresora'));
    res.json({ success: true, impresoras });
  });
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================

app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                                                        ║');
  console.log('║     🖨️   SERVIDOR DE IMPRESIÓN MPTICKETS  🖨️         ║');
  console.log('║           (Versión con mapeo CP437)                    ║');
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
