-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN DE PERFORMANCE
-- MP Tickets - Parking System
-- =====================================================
-- 
-- Este script crea índices COMPUESTOS adicionales
-- para mejorar queries específicos con múltiples columnas
-- 
-- NOTA: Tu base de datos YA TIENE índices simples básicos.
-- Este script agrega índices COMPUESTOS que no existían.
-- 
-- IMPORTANTE: Ejecutar en orden y revisar resultados
-- =====================================================

-- =====================================================
-- ÍNDICES EXISTENTES EN TU BASE DE DATOS
-- =====================================================
-- Ya tienes estos índices simples (NO se duplican):
-- - auditoria: idx_auditoria_negocio, idx_auditoria_usuario, idx_auditoria_tabla, idx_auditoria_fecha
-- - codigos: idx_codigos_negocio, idx_codigos_tarjeta, idx_codigos_parametro, etc.
-- - configuracion_sistema: idx_config_negocio, idx_config_categoria
-- - negocios: idx_negocios_estado, idx_negocios_email, idx_negocios_codigo
-- - parametros: idx_parametros_negocio, idx_parametros_tipo_vehiculo, idx_parametros_estado
-- - tarjetas: idx_tarjetas_negocio, idx_tarjetas_estado, idx_tarjetas_codigo, etc.
-- - usuarios: idx_usuarios_negocio, idx_usuarios_estado, idx_usuarios_usuario_negocio, etc.

-- =====================================================
-- 1. ÍNDICES COMPUESTOS PARA: configuracion_sistema
-- =====================================================
-- Query común: SELECT * FROM configuracion_sistema WHERE negocio_id = ? AND clave = ?
CREATE INDEX IF NOT EXISTS idx_config_negocio_clave 
ON public.configuracion_sistema(negocio_id, clave);

-- Query común: SELECT * FROM configuracion_sistema WHERE negocio_id = ? AND categoria = ?
CREATE INDEX IF NOT EXISTS idx_config_negocio_categoria 
ON public.configuracion_sistema(negocio_id, categoria);

-- =====================================================
-- 2. ÍNDICES COMPUESTOS PARA: parametros
-- =====================================================
-- Query común: SELECT * FROM parametros WHERE negocio_id = ? ORDER BY prioridad
CREATE INDEX IF NOT EXISTS idx_parametros_negocio_prioridad 
ON public.parametros(negocio_id, prioridad);

-- Partial index solo para tarifas activas (mucho más eficiente)
CREATE INDEX IF NOT EXISTS idx_parametros_activos 
ON public.parametros(negocio_id, tipo_vehiculo) 
WHERE estado = 'activo';

-- =====================================================
-- 3. ÍNDICES COMPUESTOS PARA: auditoria
-- =====================================================
-- Query común: SELECT * FROM auditoria WHERE negocio_id = ? ORDER BY fecha_creacion DESC
CREATE INDEX IF NOT EXISTS idx_auditoria_negocio_fecha_desc 
ON public.auditoria(negocio_id, fecha_creacion DESC);

-- Query para búsquedas por usuario con fecha
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_fecha 
ON public.auditoria(usuario_id, fecha_creacion DESC) 
WHERE usuario_id IS NOT NULL;

-- Query para búsquedas por tabla afectada con fecha
CREATE INDEX IF NOT EXISTS idx_auditoria_tabla_fecha 
ON public.auditoria(tabla_afectada, fecha_creacion DESC);

-- =====================================================
-- 4. ÍNDICES COMPUESTOS PARA: codigos (tickets/registros)
-- =====================================================
-- Query principal: Listar vehículos activos por negocio
CREATE INDEX IF NOT EXISTS idx_codigos_negocio_estado_entrada 
ON public.codigos(negocio_id, estado, hora_entrada DESC);

-- Búsqueda por placa en un negocio (solo placas válidas)
CREATE INDEX IF NOT EXISTS idx_codigos_negocio_placa 
ON public.codigos(negocio_id, placa) 
WHERE placa IS NOT NULL AND placa != '';

-- Reportes por rango de fechas
CREATE INDEX IF NOT EXISTS idx_codigos_negocio_entrada_salida 
ON public.codigos(negocio_id, hora_entrada DESC, hora_salida DESC);

-- Búsqueda por tipo de vehículo y fecha
CREATE INDEX IF NOT EXISTS idx_codigos_tipo_entrada 
ON public.codigos(negocio_id, tipo_vehiculo, hora_entrada DESC) 
WHERE tipo_vehiculo IS NOT NULL AND tipo_vehiculo != '';

-- =====================================================
-- 5. ÍNDICES COMPUESTOS PARA: tarjetas
-- =====================================================
-- Listar tarjetas activas por negocio con orden por fecha
CREATE INDEX IF NOT EXISTS idx_tarjetas_negocio_estado_fecha 
ON public.tarjetas(negocio_id, estado, fecha_creacion DESC);

-- Búsqueda de tarjetas perdidas
CREATE INDEX IF NOT EXISTS idx_tarjetas_negocio_perdida 
ON public.tarjetas(negocio_id, perdida) 
WHERE perdida = '1';

-- =====================================================
-- 6. ÍNDICES COMPUESTOS PARA: usuarios
-- =====================================================
-- Listar usuarios activos por negocio
CREATE INDEX IF NOT EXISTS idx_usuarios_negocio_estado_activos 
ON public.usuarios(negocio_id, estado) 
WHERE estado = '1';

-- Búsqueda por rol en un negocio
CREATE INDEX IF NOT EXISTS idx_usuarios_negocio_rol 
ON public.usuarios(negocio_id, rol);

-- =====================================================
-- 7. ÍNDICES COMPUESTOS PARA: negocios
-- =====================================================
-- Búsqueda de negocios activos
CREATE INDEX IF NOT EXISTS idx_negocios_estado_activos 
ON public.negocios(estado, fecha_creacion DESC) 
WHERE estado = 'activo';

-- =====================================================
-- ACTUALIZAR ESTADÍSTICAS
-- =====================================================
-- PostgreSQL usa estas estadísticas para optimizar el query planner
ANALYZE public.configuracion_sistema;
ANALYZE public.parametros;
ANALYZE public.auditoria;
ANALYZE public.codigos;
ANALYZE public.tarjetas;
ANALYZE public.usuarios;
ANALYZE public.negocios;

-- =====================================================
-- ANÁLISIS DE ÍNDICES
-- =====================================================
-- Después de crear los índices, ejecuta esto para verificar:

-- Ver todos los índices creados
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Ver tamaño de índices
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid::regclass)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid::regclass) DESC;

-- =====================================================
-- MANTENIMIENTO DE ÍNDICES
-- =====================================================
-- Ejecutar periódicamente para mantener rendimiento óptimo

-- Reindexar todas las tablas (ejecutar en horario de bajo tráfico)
-- REINDEX DATABASE CONCURRENTLY mp_tickets;

-- Actualizar estadísticas para el optimizador de queries
ANALYZE public.configuracion_sistema;
ANALYZE public.parametros;
ANALYZE public.negocios;
ANALYZE public.auditoria;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
--
-- 1. Los índices mejoran la LECTURA pero pueden hacer más lentas las ESCRITURAS
--    - Esto es aceptable porque leemos mucho más de lo que escribimos
--
-- 2. Índices compuestos (multi-columna):
--    - El orden importa: (negocio_id, clave) es diferente a (clave, negocio_id)
--    - Usar el más restrictivo primero (negocio_id casi siempre es primero)
--
-- 3. Partial Indexes:
--    - idx_parametros_estado solo indexa registros activos
--    - Más pequeño y rápido que indexar todos los estados
--
-- 4. Monitoreo:
--    - Supabase Dashboard > Database > Query Performance
--    - Revisar "slow queries" periódicamente
--
-- 5. Si una tabla no existe aún:
--    - Los CREATE INDEX con WHERE EXISTS no harán nada
--    - Ejecutar de nuevo cuando la tabla se cree
--
-- =====================================================
