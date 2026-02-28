# ⚡ GUÍA RÁPIDA DE INSTALACIÓN

## Para Clientes - 5 Minutos

### 1️⃣ Instalar Node.js
Descarga e instala desde: https://nodejs.org

### 2️⃣ Copiar Archivos
Descarga la carpeta `print-service` y cópiala a:
- **macOS/Linux**: `/Users/TU_USUARIO/mptickets-print-service`
- **Windows**: `C:\mptickets-print-service`

### 3️⃣ Instalar Dependencias
```bash
cd mptickets-print-service
npm install
```

### 4️⃣ Configurar Inicio Automático

#### macOS:
```bash
chmod +x instalar-servicio-macos.sh
./instalar-servicio-macos.sh
```

#### Windows:
- Click derecho en `instalar-servicio-windows.bat`
- **"Ejecutar como administrador"**

#### Linux:
```bash
sudo cp mptickets-print.service /etc/systemd/system/
sudo systemctl enable mptickets-print.service
sudo systemctl start mptickets-print.service
```

### 5️⃣ Configurar en la App

1. Abre MPTickets en el navegador
2. Ve a **Configuración → Sistema → Impresión**
3. Completa:
   - **Nombre**: `3nStar POS-80` (o tu impresora)
   - **Cola**: `_3nStar` (obtener con `lpstat -p`)
   - **Ancho**: `80 mm`
4. **Guardar** y **"Imprimir Prueba"**

---

## ✅ Verificación

Abre en el navegador: http://localhost:3003/test

Deberías ver:
```json
{
  "success": true,
  "message": "Servidor funcionando"
}
```

---

## 🆘 Problemas Comunes

### No imprime
- Verifica que el servidor esté corriendo: http://localhost:3003/test
- Revisa el nombre de la impresora: `lpstat -p` (macOS/Linux)
- Verifica CORS: abre http://localhost:3003/test en el navegador primero

### Puerto ocupado
```bash
# Matar proceso en puerto 3003
lsof -i :3003
kill -9 PID
```

### Servicio no inicia automáticamente
- **macOS**: `launchctl list | grep mptickets`
- **Windows**: `schtasks /query /tn "MPTickets-PrintService"`

---

**📞 Soporte**: xaviercordova@hotmail.com | 0999676347
