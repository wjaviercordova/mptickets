#!/bin/bash

echo "🔄 Reiniciando servidor de impresión..."

# Matar todos los procesos de node relacionados con servidor-impresion
echo "🛑 Deteniendo procesos existentes..."
pkill -9 -f "servidor-impresion.js"
sleep 2

# Verificar que el puerto esté libre
if lsof -i:3003 > /dev/null 2>&1; then
    echo "⚠️  Puerto 3003 todavía ocupado, forzando cierre..."
    lsof -ti:3003 | xargs kill -9 2>/dev/null
    sleep 2
fi

# Iniciar servidor
echo "🚀 Iniciando servidor..."
cd /Users/javiercordova/Documents/GitHub/print-service
node servidor-impresion.js > servidor.log 2>&1 &

sleep 3

# Verificar que esté corriendo
if curl -s http://localhost:3003/test > /dev/null 2>&1; then
    echo "✅ Servidor iniciado correctamente en puerto 3003"
    echo "📋 PID: $(lsof -ti:3003)"
else
    echo "❌ Error al iniciar el servidor"
    echo "📄 Log:"
    cat servidor.log
fi
