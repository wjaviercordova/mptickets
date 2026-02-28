# 🖨️ SERVIDOR DE IMPRESIÓN LOCAL - MPTICKETS

## 📋 Descripción

Este servicio permite imprimir tickets térmicos desde la aplicación web MPTickets (que puede estar en la nube) hacia una impresora térmica conectada localmente por USB a la computadora del cliente.

### ¿Por qué se necesita este servicio?

Cuando la aplicación MPTickets está en la nube (AWS, Vercel, etc.), **no tiene acceso directo a la impresora USB** conectada a tu computadora local. Este pequeño servidor soluciona ese problema:

1. Se ejecuta **en tu computadora local** (donde está la impresora)
2. Escucha en el puerto **3003**
3. La aplicación web (desde la nube) envía los datos del ticket
4. Este servidor recibe los datos e imprime en la impresora local

---

## 🎯 Requisitos Previos

### 1. Node.js Instalado

Verifica que Node.js esté instalado:
```bash
node --version
```

Si no está instalado:
- **macOS**: Descarga desde [nodejs.org](https://nodejs.org) o usa Homebrew: `brew install node`
- **Windows**: Descarga el instalador desde [nodejs.org](https://nodejs.org)
- **Linux**: `sudo apt install nodejs npm` o `sudo yum install nodejs`

### 2. Impresora Térmica Configurada

#### En macOS:
```bash
# Listar impresoras instaladas
lpstat -p -d

# Ver detalles de una impresora específica
lpstat -v

# Ejemplo de salida:
# dispositivo para _3nStar: usb://Printer/POS-80?serial=18D6D0E35C21
```

#### En Windows:
- Ve a **Configuración → Dispositivos → Impresoras y escáneres**
- Verifica que tu impresora térmica esté instalada
- Anota el nombre exacto (ejemplo: "POS-80", "EPSON TM-T20", etc.)

#### En Linux:
```bash
lpstat -p -d
```

---

## 📦 INSTALACIÓN

### Paso 1: Obtener los Archivos

Tienes dos opciones:

#### Opción A: Copiar desde el repositorio principal
Si tienes acceso al repositorio de MPTickets:
```bash
# Copiar la carpeta print-service a tu computadora
cp -r /ruta/mptickets/print-service ~/mptickets-print-service
cd ~/mptickets-print-service
```

#### Opción B: Crear manualmente
Descarga o copia estos archivos a una carpeta local:
- `package.json`
- `servidor-impresion.js`
- `iniciar.sh` (macOS/Linux)
- `instalar-servicio-macos.sh` (solo macOS)
- `instalar-servicio-windows.bat` (solo Windows)

### Paso 2: Instalar Dependencias

```bash
cd ~/mptickets-print-service
npm install
```

Esto instalará:
- `express`: Servidor web
- `cors`: Permitir conexiones desde cualquier dominio

### Paso 3: Probar el Servidor Manualmente

#### En macOS/Linux:
```bash
# Dar permisos de ejecución
chmod +x iniciar.sh

# Iniciar el servidor
./iniciar.sh
```

#### En Windows:
```cmd
node servidor-impresion.js
```

#### En cualquier SO:
```bash
npm start
```

Deberías ver:
```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║     🖨️   SERVIDOR DE IMPRESIÓN MPTICKETS  🖨️         ║
║                                                        ║
╚════════════════════════════════════════════════════════╝

✅ Servidor ejecutándose en: http://localhost:3003
🖥️  Sistema operativo: darwin
💻 Hostname: COMPUTADORMAC-2

📡 Endpoints disponibles:
   POST http://localhost:3003/imprimir     - Imprimir ticket
   GET  http://localhost:3003/test         - Probar conexión
   GET  http://localhost:3003/status       - Estado de impresora
   GET  http://localhost:3003/impresoras   - Listar impresoras

⏳ Esperando solicitudes de impresión...
```

---

## 🔧 CONFIGURAR INICIO AUTOMÁTICO

### Para macOS:

```bash
# Dar permisos de ejecución al script
chmod +x instalar-servicio-macos.sh

# Ejecutar instalador
./instalar-servicio-macos.sh
```

**Lo que hace este script:**
- Crea un LaunchAgent en `~/Library/LaunchAgents/`
- Configura el servicio para iniciar automáticamente al iniciar sesión
- Mantiene el servicio corriendo todo el tiempo

**Comandos útiles después de instalar:**
```bash
# Ver si está corriendo
launchctl list | grep mptickets

# Ver logs en tiempo real
tail -f ~/Library/Logs/mptickets-print-service.log

# Detener el servicio
launchctl unload ~/Library/LaunchAgents/com.mptickets.print-service.plist

# Reiniciar el servicio
launchctl unload ~/Library/LaunchAgents/com.mptickets.print-service.plist
launchctl load ~/Library/LaunchAgents/com.mptickets.print-service.plist
```

### Para Windows:

1. **Ejecutar como Administrador**: Click derecho en `instalar-servicio-windows.bat` → "Ejecutar como administrador"

2. El script creará una tarea programada que:
   - Inicia automáticamente al iniciar sesión
   - Se mantiene corriendo en segundo plano
   - Se reinicia automáticamente si falla

**Comandos útiles después de instalar:**
```cmd
# Ver si está corriendo
tasklist | findstr node

# Iniciar manualmente
schtasks /run /tn "MPTickets-PrintService"

# Ver información de la tarea
schtasks /query /tn "MPTickets-PrintService" /v /fo list

# Detener el servicio
taskkill /F /IM node.exe /FI "WINDOWTITLE eq servidor-impresion*"

# Eliminar el servicio
schtasks /delete /tn "MPTickets-PrintService" /f
```

### Para Linux (systemd):

Crea el archivo `/etc/systemd/system/mptickets-print.service`:

```ini
[Unit]
Description=MPTickets Print Service
After=network.target

[Service]
Type=simple
User=TU_USUARIO
WorkingDirectory=/home/TU_USUARIO/mptickets-print-service
ExecStart=/usr/bin/node /home/TU_USUARIO/mptickets-print-service/servidor-impresion.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Luego:
```bash
# Recargar systemd
sudo systemctl daemon-reload

# Habilitar inicio automático
sudo systemctl enable mptickets-print.service

# Iniciar el servicio
sudo systemctl start mptickets-print.service

# Ver estado
sudo systemctl status mptickets-print.service

# Ver logs
sudo journalctl -u mptickets-print.service -f
```

---

## 🖨️ CONFIGURAR EN LA APLICACIÓN WEB

### Paso 1: Acceder a Configuración

1. Abre la aplicación MPTickets en tu navegador
2. Ve a **Configuración → Sistema**
3. Selecciona el tab **"Impresión"**

### Paso 2: Configurar la Impresora

Completa los siguientes campos:

| Campo | Valor | Ejemplo |
|-------|-------|---------|
| **Habilitar Impresión** | ✅ Activado | ON |
| **Nombre de Impresora** | Nombre descriptivo | `3nStar POS-80` |
| **Cola de Impresión** | Nombre técnico de la cola CUPS/Windows | `_3nStar` |
| **Ancho de Papel** | 58mm o 80mm | `80 mm` |
| **Tipo de Formato** | Básico o Detallado | `Básico` |
| **Imprimir Logo** | ✅ o ❌ | ✅ |
| **Imprimir en Ingreso** | ✅ o ❌ | ✅ |
| **Imprimir en Pago** | ✅ o ❌ | ✅ |
| **Copias por Ticket** | 1-5 | `1` |

### Paso 3: Probar la Impresión

1. Click en el botón **"Imprimir Prueba"**
2. Si todo está configurado correctamente, deberías ver:
   - Mensaje de éxito en la aplicación
   - Un ticket impreso en tu impresora

---

## 🧪 PRUEBAS Y DIAGNÓSTICO

### Probar la Conexión

#### Desde el navegador:
Abre la consola de desarrollo (F12) y ejecuta:
```javascript
fetch('http://localhost:3003/test')
  .then(r => r.json())
  .then(console.log)
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "Servidor de impresión funcionando correctamente",
  "version": "1.0.0",
  "platform": "darwin",
  "hostname": "COMPUTADORMAC-2"
}
```

#### Desde la terminal:
```bash
curl http://localhost:3003/test
```

### Ver Estado de la Impresora

```bash
curl "http://localhost:3003/status?impresora=_3nStar"
```

### Listar Todas las Impresoras

```bash
curl http://localhost:3003/impresoras
```

### Prueba de Impresión Manual

```bash
curl -X POST http://localhost:3003/imprimir \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "ENTRADA",
    "datos": {
      "nombre_negocio": "Miparking",
      "direccion": "Primera Imprenta y Maldonado",
      "telefono": "0999676347",
      "fecha": "25/02/2026",
      "hora": "14:30",
      "numero": "TEST-001",
      "dia": "Martes",
      "horario": "24 Horas",
      "tarifa": "$1.00"
    },
    "config": {
      "cola_impresion": "_3nStar",
      "copias_por_ticket": 1
    }
  }'
```

---

## ❗ SOLUCIÓN DE PROBLEMAS

### Error: "Puerto 3003 ya está en uso"

```bash
# macOS/Linux: Encontrar el proceso
lsof -i :3003

# Matar el proceso
kill -9 PID_DEL_PROCESO

# Windows: Encontrar el proceso
netstat -ano | findstr :3003

# Matar el proceso
taskkill /PID PID_DEL_PROCESO /F
```

### Error: "No se puede conectar al servidor"

**Verifica que el servidor esté corriendo:**
```bash
# macOS/Linux
ps aux | grep servidor-impresion

# Windows
tasklist | findstr node
```

**Si no está corriendo, inícialo:**
```bash
npm start
```

### Error: "Impresora no encontrada"

**Verifica el nombre de la impresora:**
```bash
# macOS/Linux
lpstat -p -d

# Windows: Configuración → Impresoras
```

**Asegúrate de usar el nombre técnico correcto** en la configuración de la aplicación (campo "Cola de Impresión").

### Error: "CORS" o "Conexión bloqueada"

Si la aplicación web está en HTTPS y el servidor local en HTTP, el navegador puede bloquear la conexión por seguridad.

**Solución:**
- Accede a `http://localhost:3003/test` directamente en el navegador
- Acepta la excepción de seguridad
- Recarga la aplicación web

### El servicio se detiene después de cerrar la terminal

Necesitas configurar el inicio automático (ver sección anterior) o usar herramientas como:

**macOS/Linux:**
```bash
# Con screen
screen -dmS mptickets npm start

# Con nohup
nohup npm start &

# Con PM2 (recomendado)
npm install -g pm2
pm2 start servidor-impresion.js --name mptickets-print
pm2 save
pm2 startup
```

**Windows:**
Usa el script `instalar-servicio-windows.bat` para crear una tarea programada.

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
mptickets-print-service/
├── package.json                      # Dependencias del proyecto
├── servidor-impresion.js             # Servidor principal
├── iniciar.sh                        # Script de inicio manual (macOS/Linux)
├── instalar-servicio-macos.sh        # Instalador de servicio (macOS)
├── instalar-servicio-windows.bat     # Instalador de servicio (Windows)
├── README.md                         # Este archivo
└── node_modules/                     # Dependencias (generado por npm)
```

---

## 🔒 SEGURIDAD

### ⚠️ Consideraciones Importantes

1. **Puerto abierto solo localmente**: El servidor escucha en `localhost:3003`, no es accesible desde Internet

2. **CORS habilitado**: Permite conexiones desde cualquier dominio para que funcione con tu app en la nube

3. **Sin autenticación**: No hay autenticación porque solo responde a conexiones locales (localhost)

4. **Archivos temporales**: Los tickets se guardan temporalmente y se eliminan después de 5 segundos

### 🛡️ Recomendaciones

- **Firewall**: No abras el puerto 3003 en tu router/firewall
- **Actualizaciones**: Mantén Node.js actualizado
- **Logs**: Revisa los logs periódicamente para detectar problemas

---

## 📞 SOPORTE

### Información de Contacto

- **Proyecto**: MPTickets
- **Email**: xaviercordova@hotmail.com
- **Teléfono**: 0999676347

### Logs de Depuración

**macOS:**
```bash
tail -f ~/Library/Logs/mptickets-print-service.log
```

**Windows:**
```cmd
# Los logs aparecen en la ventana de la terminal
# O usa el Visor de eventos de Windows
```

**Linux:**
```bash
sudo journalctl -u mptickets-print.service -f
```

---

## 📝 NOTAS DE VERSIÓN

### v1.0.0 - 25 de Febrero 2026
- ✅ Impresión de tickets de entrada
- ✅ Impresión de tickets de pago
- ✅ Soporte para macOS, Windows y Linux
- ✅ Configuración de múltiples copias
- ✅ Auto-inicio en el arranque del sistema
- ✅ API REST con CORS
- ✅ Manejo de errores robusto

---

## 📄 LICENCIA

Este software es parte del sistema MPTickets y está destinado exclusivamente para uso con la aplicación MPTickets.

---

**🎉 ¡Instalación completada! Tu sistema de impresión térmica está listo.**
