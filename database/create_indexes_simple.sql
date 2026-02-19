-- =====================================================
-- ÍNDICES COMPUESTOS ADICIONALES - OPTIMIZACIÓN
-- Solo índices que NO existen y mejoran queries específicos
-- =====================================================
-- 
-- NOTA: Tu DB ya tiene índices simples básicos.
-- Estos son índices COMPUESTOS adicionales que optimizan
-- queries con múltiples columnas en WHERE/ORDER BY
-- =====================================================

-- 1. Tabla: configuracion_sistema
-- Índice compuesto para búsquedas por negocio + clave (query más común)
CREATE INDEX IF NOT EXISTS idx_config_negocio_clave 
ON public.configuracion_sistema(negocio_id, clave);

-- Índice compuesto para búsquedas por negocio + categoría
CREATE INDEX IF NOT EXISTS idx_config_negocio_categoria 
ON public.configuracion_sistema(negocio_id, categoria);

-- 2. Tabla: parametros
-- Índice compuesto para listar tarifas ordenadas por prioridad
CREATE INDEX IF NOT EXISTS idx_parametros_negocio_prioridad 
ON public.parametros(negocio_id, prioridad);

-- Partial index solo para tarifas activas (más eficiente que índice completo)
CREATE INDEX IF NOT EXISTS idx_parametros_activos 
ON public.parametros(negocio_id, tipo_vehiculo) 
WHERE estado = 'activo';

-- 3. Tabla: auditoria
-- Índice compuesto para búsquedas por negocio con orden por fecha DESC
CREATE INDEX IF NOT EXISTS idx_auditoria_negocio_fecha_desc 
ON public.auditoria(negocio_id, fecha_creacion DESC);

-- Índice compuesto para búsquedas por tabla + fecha
CREATE INDEX IF NOT EXISTS idx_auditoria_tabla_fecha 
ON public.auditoria(tabla_afectada, fecha_creacion DESC);

-- 4. Tabla: codigos (tickets/registros de vehículos)
-- Índice compuesto para búsquedas de vehículos activos
CREATE INDEX IF NOT EXISTS idx_codigos_negocio_estado_entrada 
ON public.codigos(negocio_id, estado, hora_entrada DESC);

-- Índice para búsquedas por placa en un negocio específico
CREATE INDEX IF NOT EXISTS idx_codigos_negocio_placa 
ON public.codigos(negocio_id, placa) 
WHERE placa IS NOT NULL AND placa != '';

-- Índice para reportes por rango de fechas
CREATE INDEX IF NOT EXISTS idx_codigos_negocio_entrada_salida 
ON public.codigos(negocio_id, hora_entrada DESC, hora_salida DESC);

-- 5. Tabla: tarjetas
-- Índice compuesto para listar tarjetas activas por negocio
CREATE INDEX IF NOT EXISTS idx_tarjetas_negocio_estado_fecha 
ON public.tarjetas(negocio_id, estado, fecha_creacion DESC);

-- =====================================================
-- ACTUALIZAR ESTADÍSTICAS
-- =====================================================
-- PostgreSQL usa estadísticas para optimizar queries
ANALYZE public.configuracion_sistema;
ANALYZE public.parametros;
ANALYZE public.auditoria;
ANALYZE public.codigos;
ANALYZE public.tarjetas;

-- =====================================================
-- VERIFICAR CREACIÓN
-- =====================================================
-- Ver TODOS los índices (incluyendo los que ya existían)
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- =====================================================
-- RESULTADOS ESPERADOS
-- =====================================================
-- Deberías ver aproximadamente 40+ índices en total
-- Los nuevos empiezan con:
--   - idx_config_negocio_clave
--   - idx_config_negocio_categoria
--   - idx_parametros_negocio_prioridad
--   - idx_parametros_activos
--   - idx_auditoria_negocio_fecha_desc
--   - idx_auditoria_tabla_fecha
--   - idx_codigos_negocio_estado_entrada
--   - idx_codigos_negocio_placa
--   - idx_codigos_negocio_entrada_salida
--   - idx_tarjetas_negocio_estado_fecha
-- =====================================================
