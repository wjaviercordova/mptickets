#!/bin/bash

# ============================================================
# SCRIPT PARA DETENER EL SERVICIO DE IMPRESIÓN MPTICKETS
# ============================================================
# 
# Uso: ./detener-servicio.sh
# 
# Este script detiene el servidor de impresión que está
# corriendo en segundo plano.
# ============================================================

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║     🛑  DETENER SERVICIO DE IMPRESIÓN MPTICKETS       ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Buscar procesos del servidor de impresión
echo "🔍 Buscando procesos del servidor de impresión..."
PIDS=$(pgrep -f "servidor-impresion.js")

if [ -z "$PIDS" ]; then
  echo ""
  echo "ℹ️  No se encontraron procesos del servidor de impresión ejecutándose."
  echo ""
  echo "✅ El servicio ya está detenido."
  echo ""
  exit 0
fi

echo ""
echo "📋 Procesos encontrados:"
ps aux | grep "servidor-impresion.js" | grep -v grep
echo ""

# Contar cuántos procesos hay
COUNT=$(echo "$PIDS" | wc -l | tr -d ' ')
echo "   Total: $COUNT proceso(s)"
echo ""

# Preguntar confirmación
read -p "¿Desea detener estos procesos? (s/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
  echo ""
  echo "❌ Operación cancelada."
  echo ""
  exit 0
fi

echo ""
echo "🛑 Deteniendo procesos..."

# Intentar detener con SIGTERM (señal limpia)
for PID in $PIDS; do
  echo "   Deteniendo proceso $PID..."
  kill $PID 2>/dev/null
done

# Esperar 3 segundos para que los procesos se detengan limpiamente
sleep 3

# Verificar si aún hay procesos corriendo
REMAINING=$(pgrep -f "servidor-impresion.js")

if [ -n "$REMAINING" ]; then
  echo ""
  echo "⚠️  Algunos procesos no se detuvieron. Forzando cierre..."
  
  for PID in $REMAINING; do
    echo "   Forzando cierre del proceso $PID..."
    kill -9 $PID 2>/dev/null
  done
  
  sleep 1
fi

# Verificación final
FINAL_CHECK=$(pgrep -f "servidor-impresion.js")

if [ -z "$FINAL_CHECK" ]; then
  echo ""
  echo "✅ Todos los procesos del servidor de impresión han sido detenidos correctamente."
  echo ""
  echo "💡 Para reiniciar el servicio:"
  echo "   • Manualmente: ./iniciar.sh"
  echo "   • LaunchAgent: launchctl load ~/Library/LaunchAgents/com.mptickets.print-service.plist"
  echo ""
else
  echo ""
  echo "❌ Error: No se pudieron detener todos los procesos."
  echo "   Procesos restantes:"
  ps aux | grep "servidor-impresion.js" | grep -v grep
  echo ""
  echo "   Intenta detenerlos manualmente con: sudo kill -9 PID"
  echo ""
  exit 1
fi

exit 0
