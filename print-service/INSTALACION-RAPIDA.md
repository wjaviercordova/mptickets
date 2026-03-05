# ⚡ GUÍA DE INSTALACIÓN RÁPIDA - MPTICKETS PRINT SERVICE

## 📋 Requisitos Previos

- **Node.js 16+** (Descargar de https://nodejs.org)
- **Impresora térmica ESC/POS 80mm** (3nStar, Epson, Star, etc.)
- **Conexión USB** o **Red** a la impresora

---

## 🪟 WINDOWS

### 1️⃣ Preparar Archivos

1. Descarga la carpeta `print-service`
2. Cópiala a: `C:\mptickets-print-service`
3. Abre **PowerShell** como **Administrador**

```powershell
cd C:\mptickets-print-service
```

### 2️⃣ Instalar Dependencias

```powershell
npm install
```

**Nota:** Si aparece error con `canvas`, instala las herramientas de compilación:
```powershell
npm install --global windows-build-tools
```

### 3️⃣ Configurar Impresora en Windows

1. Abre **Panel de Control → Dispositivos e Impresoras**
2. Asegúrate que tu impresora esté instalada y funcionando
3. Apunta el **nombre exacto** de la impresora (ej: `3nStar POS-80`)

### 4️⃣ Probar Servidor Manualmente

```powershell
node servidor-impresion.js
```

Deberías ver:
```
✅ Servidor ejecutándose en: http://localhost:3003
```

Abre en el navegador: http://localhost:3003/test

Deberías ver:
```json
{
  "success": true,
  "message": "Servidor funcionando correctamente"
}
```

**Presiona Ctrl+C para detener el servidor.**

### 5️⃣ Configurar Inicio Automático (Windows)

**Opción A: Tarea Programada (Recomendado)**

1. Click derecho en `instalar-servicio-windows.bat`
2. **"Ejecutar como administrador"**
3. Abre **Programador de tareas** para verificar

**Opción B: Servicio de Windows (Avanzado)**

```powershell
npm install -g node-windows
node install-windows-service.js
```

### 6️⃣ Comandos Útiles (Windows)

```powershell
# Detener servidor
.\detener-servicio.bat

# Ver impresoras instaladas
wmic printer get name

# Reiniciar manualmente
node servidor-impresion.js
```

---

## 🍎 macOS

### 1️⃣ Preparar Archivos

1. Descarga la carpeta `print-service`
2. Cópiala a: `/Users/TU_USUARIO/mptickets-print-service`
   
```bash
mkdir -p ~/mptickets-print-service
cd ~/mptickets-print-service
```

### 2️⃣ Instalar Dependencias

```bash
npm install
```

**Nota:** Si aparece error con `canvas`, instala Xcode Command Line Tools:
```bash
xcode-select --install
```

### 3️⃣ Configurar Impresora en macOS

1. Abre **Preferencias del Sistema → Impresoras y Escáneres**
2. Agrega tu impresora térmica (USB o Red)
3. Verifica que aparezca en la lista:

```bash
lpstat -p
```

Debe mostrar algo como:
```
impresora _3nStar ocupado. habilitado desde ...
```

Apunta el **nombre de la cola** (ej: `_3nStar`)

### 4️⃣ Probar Servidor Manualmente

```bash
chmod +x iniciar.sh reiniciar.sh detener-servicio.sh
./iniciar.sh
```

Deberías ver:
```
✅ Servidor ejecutándose en: http://localhost:3003
```

Abre en el navegador: http://localhost:3003/test

Deberías ver:
```json
{
  "success": true,
  "message": "Servidor funcionando correctamente"
}
```

**Presiona Ctrl+C en la terminal para detener** o usa:
```bash
./detener-servicio.sh
```

### 5️⃣ Configurar Inicio Automático (macOS)

```bash
chmod +x instalar-servicio-macos.sh
./instalar-servicio-macos.sh
```

Esto creará un `LaunchAgent` que iniciará el servidor automáticamente al arrancar macOS.

**Verificar servicio:**
```bash
launchctl list | grep mptickets
```

**Comandos útiles:**
```bash
# Detener servicio
launchctl unload ~/Library/LaunchAgents/com.mptickets.print.plist

# Iniciar servicio
launchctl load ~/Library/LaunchAgents/com.mptickets.print.plist

# Ver logs
tail -f ~/mptickets-print-service/servidor.log
```

### 6️⃣ Comandos Útiles (macOS)

```bash
# Detener servidor
./detener-servicio.sh

# Reiniciar servidor
./reiniciar.sh

# Ver impresoras instaladas
lpstat -p -d

# Ver estado de impresora específica
lpstat -p _3nStar
```

---

## 🐧 LINUX (Ubuntu/Debian)

### 1️⃣ Preparar Archivos

```bash
sudo mkdir -p /opt/mptickets-print-service
sudo chown $USER:$USER /opt/mptickets-print-service
cd /opt/mptickets-print-service
# Copiar archivos aquí
```

### 2️⃣ Instalar Dependencias

```bash
# Instalar CUPS si no está instalado
sudo apt-get update
sudo apt-get install cups libcups2-dev

# Instalar dependencias de Node
npm install
```

### 3️⃣ Configurar Impresora

```bash
# Ver impresoras instaladas
lpstat -p

# Agregar impresora USB (ejemplo)
sudo lpadmin -p 3nStar -E -v usb://3nStar/POS-80
```

### 4️⃣ Configurar Inicio Automático (systemd)

```bash
sudo nano /etc/systemd/system/mptickets-print.service
```

Contenido:
```ini
[Unit]
Description=MPTickets Print Service
After=network.target

[Service]
Type=simple
User=YOUR_USER
WorkingDirectory=/opt/mptickets-print-service
ExecStart=/usr/bin/node servidor-impresion.js
Restart=always
RestartSec=10
StandardOutput=append:/opt/mptickets-print-service/servidor.log
StandardError=append:/opt/mptickets-print-service/servidor.log

[Install]
WantedBy=multi-user.target
```

**Activar servicio:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable mptickets-print.service
sudo systemctl start mptickets-print.service
sudo systemctl status mptickets-print.service
```

---

## ⚙️ CONFIGURACIÓN EN LA APLICACIÓN WEB

Una vez el servidor esté corriendo, configura en MPTickets:

1. Abre tu instalación de MPTickets en el navegador
2. Ve a **Configuración → Sistema → Impresión**
3. Completa los datos:
   - **Servicio habilitado**: ✅ Sí
   - **Nombre de impresora**: `3nStar POS-80` (o el tuyo)
   - **Cola de impresión**: 
     - Windows: Nombre completo de la impresora
     - macOS/Linux: Nombre de la cola (ej: `_3nStar`)
   - **Ancho del papel**: `80 mm`
   - **Copias por ticket**: `1`
4. Haz clic en **"Imprimir Prueba"**

Si todo está bien, debería salir un ticket de prueba.

---

## ✅ VERIFICACIÓN

### Probar Conexión

Abre en cualquier navegador: http://localhost:3003/test

Respuesta esperada:
```json
{
  "success": true,
  "message": "Servidor funcionando correctamente"
}
```

### Ver Impresoras Disponibles

http://localhost:3003/impresoras

### Ver Estado del Servidor

http://localhost:3003/status

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### ❌ Error: "Cannot find module 'escpos'"

```bash
npm install
```

### ❌ Error: "Port 3003 is already in use"

**Windows:**
```powershell
netstat -ano | findstr :3003
taskkill /PID [numero] /F
```

**macOS/Linux:**
```bash
lsof -ti:3003 | xargs kill -9
```

### ❌ No imprime nada

1. **Verifica que el servidor esté corriendo:**
   ```bash
   curl http://localhost:3003/test
   ```

2. **Verifica el nombre de la impresora:**
   - Windows: `wmic printer get name`
   - macOS: `lpstat -p`
   - Linux: `lpstat -p`

3. **Verifica logs en tiempo real:**
   - Windows: `Get-Content servidor.log -Tail 30 -Wait`
   - macOS/Linux: `tail -f servidor.log`

4. **Prueba de impresión directa:**
   - Windows: `echo Prueba > test.txt && print /D:"NombreImpresora" test.txt`
   - macOS/Linux: `echo "Prueba" | lp -d _3nStar`

### ❌ Error: "canvas" no instala

**Windows:**
```powershell
npm install --global windows-build-tools
npm rebuild canvas
```

**macOS:**
```bash
xcode-select --install
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
npm rebuild canvas
```

**Linux:**
```bash
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
npm rebuild canvas
```

### ❌ Servicio no inicia automáticamente

**Windows:**
- Abre **Programador de tareas**
- Busca "MPTickets-PrintService"
- Verifica que esté **Habilitado**
- Click derecho → Ejecutar

**macOS:**
```bash
launchctl list | grep mptickets
launchctl load ~/Library/LaunchAgents/com.mptickets.print.plist
```

**Linux:**
```bash
sudo systemctl status mptickets-print.service
sudo systemctl enable mptickets-print.service
sudo systemctl start mptickets-print.service
```

---

## 📱 SOPORTE

**Contacto:**
- Email: xaviercordova@hotmail.com
- Teléfono: 0999676347
- Repositorio: https://github.com/TU_REPO/mptickets

**Logs para reportar problemas:**
- Windows: `C:\mptickets-print-service\servidor.log`
- macOS: `~/mptickets-print-service/servidor.log`
- Linux: `/opt/mptickets-print-service/servidor.log`

---

## 📚 ARQUITECTURA

### Flujo de Impresión

```
[Frontend MPTickets]
      ↓
POST http://localhost:3003/imprimir
      ↓
{
  "tipo": "ENTRADA" | "PAGO",
  "datos": { ... },
  "config": {
    "cola_impresion": "_3nStar",
    "copias_por_ticket": 1
  }
}
      ↓
[Servidor Node.js - Puerto 3003]
      ↓
[Librería escpos] → [Buffer ESC/POS]
      ↓
[Comando del S.O.] → [Cola de Impresión]
      ↓
[Impresora Térmica] → 🖨️ TICKET
```

### Tipos de Tickets

1. **ENTRADA** - Ticket de ingreso vehicular
   - Encabezado (negocio, dirección, teléfono)
   - Fecha, hora, tipo vehículo
   - Número de tarjeta (grande)
   - Horario y tarifa
   - Pie de página

2. **PAGO** - Recibo de pago/salida
   - Encabezado (negocio, dirección, teléfono)
   - Título "RECIBO DE PAGO" (negrita)
   - Fecha, entrada, salida, tarjeta
   - Total (grande, derecha)
   - Pie de página

---

## 🔄 ACTUALIZACIÓN

Para actualizar a una nueva versión:

1. **Detener el servicio actual**
2. **Hacer backup:**
   ```bash
   cp servidor-impresion.js servidor-impresion-backup.js
   ```
3. **Copiar nuevos archivos**
4. **Reinstalar dependencias:**
   ```bash
   npm install
   ```
5. **Reiniciar servicio**

---

**Versión:** 2.0  
**Última actualización:** Marzo 2026  
**Compatible con:** Windows 10/11, macOS 10.15+, Ubuntu 20.04+
