#!/bin/bash

# =====================================================
# Script para crear índices en Supabase
# MP Tickets - Optimización de Performance
# =====================================================

set -e  # Salir si hay error

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   MP Tickets - Creación de Índices DB        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar que exista el archivo SQL
if [ ! -f "database/create_indexes_simple.sql" ]; then
    echo -e "${RED}❌ Error: No se encuentra database/create_indexes_simple.sql${NC}"
    exit 1
fi

# Solicitar connection string
echo -e "${YELLOW}📝 Necesitas tu Supabase Connection String${NC}"
echo -e "${YELLOW}   Encuéntrala en: Settings → Database → Connection string (URI)${NC}"
echo ""
echo -e "Formato: ${GREEN}postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres${NC}"
echo ""
read -p "Connection String: " DB_URL

if [ -z "$DB_URL" ]; then
    echo -e "${RED}❌ Connection string vacío. Abortando.${NC}"
    exit 1
fi

# Confirmar ejecución
echo ""
echo -e "${YELLOW}⚠️  Se crearán los siguientes índices:${NC}"
echo "   - idx_configuracion_sistema_negocio_clave"
echo "   - idx_configuracion_sistema_categoria"
echo "   - idx_parametros_negocio_prioridad"
echo "   - idx_parametros_tipo_vehiculo"
echo "   - idx_parametros_estado"
echo "   - idx_auditoria_negocio_fecha"
echo ""
read -p "¿Continuar? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Operación cancelada${NC}"
    exit 1
fi

# Verificar si psql está instalado
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ Error: psql no está instalado${NC}"
    echo -e "${YELLOW}Instálalo con: brew install postgresql (macOS)${NC}"
    exit 1
fi

# Ejecutar script
echo ""
echo -e "${GREEN}🚀 Ejecutando script de índices...${NC}"
echo ""

if psql "$DB_URL" -f database/create_indexes_simple.sql; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   ✅ ÍNDICES CREADOS EXITOSAMENTE            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}📊 Impacto esperado:${NC}"
    echo "   • configuracion_sistema: 70-90% más rápido"
    echo "   • parametros: 80-90% más rápido"
    echo "   • auditoria: 85-95% más rápido"
    echo ""
    echo -e "${GREEN}🎯 Próximos pasos:${NC}"
    echo "   1. Ejecuta: npm run build && npm start"
    echo "   2. Prueba la navegación en tu app"
    echo "   3. Mide la diferencia con Chrome DevTools"
    echo ""
else
    echo ""
    echo -e "${RED}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║   ❌ ERROR AL CREAR ÍNDICES                   ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}💡 Soluciones:${NC}"
    echo "   1. Verifica tu connection string"
    echo "   2. Asegúrate de tener permisos de admin"
    echo "   3. Prueba ejecutar manualmente desde Supabase Dashboard"
    echo ""
    exit 1
fi
