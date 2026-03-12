# 🖨️ ARQUITECTURA DE IMPRESIÓN - MPTICKETS

## 📐 Arquitectura Cliente-Servidor

```
┌─────────────────────────────────────────────┐
│         APLICACIÓN WEB (NUBE)               │
│      https://tuapp.com o localhost:3000     │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │   Navegador del Cliente             │   │
│  │   (React/Next.js en el browser)     │   │
│  └──────────────┬──────────────────────┘   │
└─────────────────┼──────────────────────────┘
                  │
                  │ fetch('http://localhost:3002/imprimir')
                  │ (Petición local desde el navegador)
                  │
                  ▼
┌─────────────────────────────────────────────┐
│      COMPUTADORA DEL CLIENTE (LOCAL)        │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Servidor de Impresión Local        │   │
│  │  Puerto: 3002                       │   │
│  │  (Node.js + Express)                │   │
│  └──────────────┬──────────────────────┘   │
│                 │                           │
│                 │ exec('lp -d _3nStar ...')│
│                 ▼                           │
│  ┌─────────────────────────────────────┐   │
│  │  Impresora Térmica USB              │   │
│  │  3nStar POS-80                      │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Impresión

### 1. Usuario registra un vehículo en la app web

### 2. Aplicación Next.js ejecuta (en el navegador del cliente):
```typescript
// lib/impresion.ts - Se ejecuta en el NAVEGADOR
await fetch('http://localhost:3002/imprimir', {
  method: 'POST',
  body: JSON.stringify({
    tipo: 'ENTRADA',
    datos: { ... },
    config: { cola_impresion: '_3nStar', copias: 1 }
  })
})
```

### 3. Servidor local recibe la petición:
```javascript
// print-service/servidor-impresion.js
app.post('/imprimir', async (req, res) => {
  const contenido = generarTicketEntrada(req.body.datos);
  await imprimirConCUPS(contenido, '_3nStar', 1);
})
```

### 4. Servidor ejecuta comando del sistema operativo:
```bash
# macOS/Linux
lp -d _3nStar -n 1 /tmp/ticket.txt

# Windows
type C:\temp\ticket.txt | PRINT /D:"3nStar"
```

### 5. ¡Ticket impreso! 🎉

---

## 📂 Estructura del Proyecto

```
mptickets/
├── lib/
│   └── impresion.ts                 # ← Funciones client-side (navegador)
│
├── components/
│   └── dashboard/
│       ├── ingreso/
│       │   └── IngresoVehiculo.tsx  # ← Llama a imprimirTicketEntrada()
│       └── configuracion/
│           └── ImpresionTab.tsx     # ← Configuración de impresora
│
├── app/
│   └── api/
│       ├── impresion/
│       │   ├── route.ts             # ⚠️ NO SE USA (server-side)
│       │   └── prueba/
│       │       └── route.ts         # ← Botón "Imprimir Prueba"
│       └── configuracion/
│           └── impresion/
│               └── route.ts         # ← Guardar/Obtener config
│
└── print-service/                   # ← SERVICIO LOCAL (separado)
    ├── servidor-impresion.js        # ← Servidor Node.js local
    ├── package.json
    ├── README.md                    # ← Documentación completa
    ├── INSTALACION-RAPIDA.md        # ← Guía de 5 minutos
    ├── iniciar.sh                   # ← Iniciar manualmente
    ├── instalar-servicio-macos.sh   # ← Auto-inicio macOS
    └── instalar-servicio-windows.bat# ← Auto-inicio Windows
```

---

## 🚀 Despliegue en Producción

### Aplicación Web (Next.js)
- **Subir a**: Vercel, AWS, DigitalOcean, etc.
- **URL**: `https://tuapp.com` o `https://mptickets.example.com`
- **Configuración**: Normal, sin cambios especiales

### Servicio de Impresión
- **En cada cliente**: La computadora que tiene la impresora
- **Instalación**: Seguir `print-service/README.md` o `INSTALACION-RAPIDA.md`
- **Requisitos**:
  - Node.js instalado
  - Impresora USB configurada
  - Puerto 3002 disponible

---

## ⚙️ Configuración por Cliente

Cada cliente (punto de venta) debe:

1. **Instalar Node.js**
2. **Copiar carpeta `print-service`** a su computadora
3. **Ejecutar**: `npm install`
4. **Configurar auto-inicio** según su SO
5. **Configurar en la app web**: Nombre y cola de su impresora

---

## 🔒 Seguridad

### ✅ Seguro porque:
- El servidor local solo escucha en `localhost` (no en red externa)
- CORS permite conexiones desde cualquier origen (necesario para la nube)
- No hay datos sensibles en las peticiones de impresión
- Los archivos temporales se eliminan automáticamente

### ⚠️ Consideraciones:
- **HTTPS vs HTTP**: Los navegadores modernos pueden bloquear peticiones HTTP desde páginas HTTPS. Solución: el usuario acepta la excepción una vez abriendo `http://localhost:3002/test`
- **Firewall**: No abrir el puerto 3002 en el router (solo debe ser accesible localmente)

---

## 📞 Soporte al Cliente

Para configurar la impresión en un nuevo cliente:

1. **Enviar carpeta**: `print-service.zip`
2. **Compartir guía**: `print-service/INSTALACION-RAPIDA.md`
3. **Asistencia remota** si es necesario
4. **Configurar en la app**: Ayudar a obtener el nombre correcto de la impresora con `lpstat -p` (macOS/Linux)

---

## 🎯 Ventajas de esta Arquitectura

✅ **App en la nube**: Puede estar alojada en cualquier servidor
✅ **Impresoras locales**: Cada cliente usa su propia impresora USB
✅ **Sin VPN**: No necesitas conectar impresoras remotas
✅ **Múltiples ubicaciones**: Cada sucursal tiene su propio servicio local
✅ **Fácil mantenimiento**: Actualizar la app no afecta el servicio de impresión
✅ **Offline parcial**: El servicio local sigue funcionando incluso si Internet falla (solo para impresión local)

---

**Última actualización**: 25 de febrero 2026
