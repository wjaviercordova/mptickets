#!/bin/bash

# Script de inicio para macOS (LaunchAgent)
# Este script crea un servicio que inicia automáticamente el servidor de impresión

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SERVICE_NAME="com.mptickets.print-service"
PLIST_FILE="$HOME/Library/LaunchAgents/$SERVICE_NAME.plist"

echo "🍎 Configurando servicio de impresión para macOS..."
echo ""

# Crear directorio si no existe
mkdir -p "$HOME/Library/LaunchAgents"

# Crear archivo plist
cat > "$PLIST_FILE" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$SERVICE_NAME</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>$SCRIPT_DIR/servidor-impresion.js</string>
    </array>
    
    <key>WorkingDirectory</key>
    <string>$SCRIPT_DIR</string>
    
    <key>RunAtLoad</key>
    <true/>
    
    <key>KeepAlive</key>
    <true/>
    
    <key>StandardOutPath</key>
    <string>$HOME/Library/Logs/mptickets-print-service.log</string>
    
    <key>StandardErrorPath</key>
    <string>$HOME/Library/Logs/mptickets-print-service-error.log</string>
    
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
        <key>PORT</key>
        <string>3003</string>
    </dict>
</dict>
</plist>
EOF

echo "✅ Archivo de configuración creado: $PLIST_FILE"
echo ""

# Cargar el servicio
launchctl unload "$PLIST_FILE" 2>/dev/null
launchctl load "$PLIST_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Servicio cargado exitosamente"
    echo ""
    echo "📋 Comandos útiles:"
    echo "   Ver estado:    launchctl list | grep mptickets"
    echo "   Detener:       launchctl unload $PLIST_FILE"
    echo "   Reiniciar:     launchctl unload $PLIST_FILE && launchctl load $PLIST_FILE"
    echo "   Ver logs:      tail -f ~/Library/Logs/mptickets-print-service.log"
    echo ""
    echo "🖨️  El servidor de impresión se iniciará automáticamente al reiniciar."
else
    echo "❌ Error al cargar el servicio"
    exit 1
fi
