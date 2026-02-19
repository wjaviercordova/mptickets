-- =====================================================
-- VERIFICACIÓN DE ÍNDICES
-- Ejecuta este script para ver todos tus índices
-- =====================================================

-- 1. TODOS LOS ÍNDICES EN TU BASE DE DATOS
SELECT 
    tablename as tabla,
    indexname as indice,
    pg_size_pretty(pg_relation_size(indexrelid::regclass)) as tamaño
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 2. ÍNDICES COMPUESTOS NUEVOS (creados con este script)
SELECT 
    tablename as tabla,
    indexname as indice
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname IN (
    'idx_config_negocio_clave',
    'idx_config_negocio_categoria',
    'idx_parametros_negocio_prioridad',
    'idx_parametros_activos',
    'idx_auditoria_negocio_fecha_desc',
    'idx_auditoria_tabla_fecha',
    'idx_auditoria_usuario_fecha',
    'idx_codigos_negocio_estado_entrada',
    'idx_codigos_negocio_placa',
    'idx_codigos_negocio_entrada_salida',
    'idx_codigos_tipo_entrada',
    'idx_tarjetas_negocio_estado_fecha',
    'idx_tarjetas_negocio_perdida',
    'idx_usuarios_negocio_estado_activos',
    'idx_usuarios_negocio_rol',
    'idx_negocios_estado_activos'
)
ORDER BY tablename;

-- 3. ESTADÍSTICAS DE USO DE ÍNDICES
-- Ver cuántas veces se ha usado cada índice
SELECT
    schemaname as esquema,
    tablename as tabla,
    indexname as indice,
    idx_scan as veces_usado,
    idx_tup_read as filas_leidas,
    idx_tup_fetch as filas_obtenidas
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY idx_scan DESC
LIMIT 20;

-- 4. ÍNDICES NO UTILIZADOS (pueden eliminarse)
SELECT
    schemaname as esquema,
    tablename as tabla,
    indexname as indice,
    pg_size_pretty(pg_relation_size(indexrelid::regclass)) as tamaño_desperdiciado
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND idx_scan = 0
AND indexname LIKE 'idx_%'
ORDER BY pg_relation_size(indexrelid::regclass) DESC;

-- 5. TAMAÑO TOTAL DE ÍNDICES POR TABLA
SELECT
    tablename as tabla,
    COUNT(*) as num_indices,
    pg_size_pretty(SUM(pg_relation_size(indexrelid::regclass))) as tamaño_total
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY SUM(pg_relation_size(indexrelid::regclass)) DESC;

-- 6. ÍNDICES DUPLICADOS O REDUNDANTES (advertencia)
-- Si un índice (a,b) existe, entonces (a) es redundante
SELECT
    i1.tablename as tabla,
    i1.indexname as indice_simple,
    i2.indexname as indice_compuesto,
    'El índice simple podría ser redundante' as nota
FROM pg_indexes i1
JOIN pg_indexes i2 ON i1.tablename = i2.tablename
WHERE i1.schemaname = 'public'
AND i2.schemaname = 'public'
AND i1.indexname != i2.indexname
AND i2.indexdef LIKE '%' || 
    SUBSTRING(i1.indexdef FROM 'USING [^ ]+ \(([^)]+)\)') || ',%'
LIMIT 10;
