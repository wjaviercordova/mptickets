# 📋 Guía de Logs del Servidor de Impresión

## 📍 Ubicación de los logs

Los logs del servicio se encuentran en:

```bash
# Log principal (salida normal)
/Users/javiercordova/Library/Logs/mptickets-print-service.log

# Log de errores
/Users/javiercordova/Library/Logs/mptickets-print-service-error.log
```

## 🔍 Comandos para ver los logs

### Ver las últimas 50 líneas del log principal:
```bash
tail -50 ~/Library/Logs/mptickets-print-service.log
```

### Ver el log en tiempo real (modo seguimiento):
```bash
tail -f ~/Library/Logs/mptickets-print-service.log
```

### Ver solo errores:
```bash
tail -50 ~/Library/Logs/mptickets-print-service-error.log
```

### Ver errores en tiempo real:
```bash
tail -f ~/Library/Logs/mptickets-print-service-error.log
```

### Buscar un texto específico en los logs:
```bash
# Buscar tickets de entrada
grep "ENTRADA" ~/Library/Logs/mptickets-print-service.log

# Buscar una fecha específica
grep "04/03/2026" ~/Library/Logs/mptickets-print-service.log

# Buscar errores
grep "Error" ~/Library/Logs/mptickets-print-service-error.log
```

### Limpiar logs antiguos:
```bash
# Vaciar el log principal (cuidado, borra todo)
echo "" > ~/Library/Logs/mptickets-print-service.log

# Vaciar el log de errores
echo "" > ~/Library/Logs/mptickets-print-service-error.log
```

## 📊 Qué información contienen

### Log principal muestra:
- ✅ Inicio del servidor
- 📝 Cada solicitud de impresión recibida
- 🔍 Datos recibidos (horario, tarifa, etc.)
- 🖨️ Comandos de impresión ejecutados
- ✅ Confirmaciones de impresión exitosa

### Log de errores muestra:
- ❌ Problemas al conectar con la impresora
- ❌ Errores de puerto ocupado
- ❌ Errores de dependencias (node_modules)
- ❌ Problemas con archivos temporales

## 🧪 Ver logs durante pruebas

Cuando ejecutes un test de impresión:

```bash
# Terminal 1: Ver logs en tiempo real
tail -f ~/Library/Logs/mptickets-print-service.log

# Terminal 2: Ejecutar prueba
node test-miercoles.js
```

Así verás inmediatamente qué datos recibe el servidor.

## 💡 Atajos útiles

```bash
# Ver primeras 20 líneas
head -20 ~/Library/Logs/mptickets-print-service.log

# Contar líneas totales del log
wc -l ~/Library/Logs/mptickets-print-service.log

# Ver logs de las últimas 2 horas
tail -1000 ~/Library/Logs/mptickets-print-service.log | grep "$(date +%H):"

# Abrir log en un editor de texto
open -a TextEdit ~/Library/Logs/mptickets-print-service.log
```

## 🔄 Rotar logs (manual)

Si los logs crecen mucho (>10MB):

```bash
# Hacer backup y limpiar
mv ~/Library/Logs/mptickets-print-service.log ~/Library/Logs/mptickets-print-service-backup-$(date +%Y%m%d).log
touch ~/Library/Logs/mptickets-print-service.log

# Reiniciar servicio para usar nuevo archivo
launchctl unload ~/Library/LaunchAgents/com.mptickets.print-service.plist
launchctl load ~/Library/LaunchAgents/com.mptickets.print-service.plist
```
