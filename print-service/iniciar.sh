#!/bin/bash

# Script para iniciar manualmente el servidor de impresión
# Uso: ./iniciar.sh

echo "🖨️  Iniciando servidor de impresión MPTickets..."
echo ""

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "   Descarga e instala Node.js desde: https://nodejs.org"
    exit 1
fi

# Verificar que las dependencias estén instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
    echo ""
fi

# Iniciar el servidor
node servidor-impresion.js
