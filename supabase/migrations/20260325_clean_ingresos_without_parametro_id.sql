-- Migración: Limpiar ingresos sin parametro_id
-- Fecha: 2026-03-25
-- Descripción: Elimina ingresos antiguos que no tienen parametro_id y libera las tarjetas asociadas

-- PASO 1: Liberar tarjetas que están ocupadas en ingresos sin parametro_id
-- Cambiar estado de tarjetas de "0" (ocupada) a "1" (libre)
UPDATE tarjetas
SET estado = '1', 
    fecha_actualizacion = NOW()
WHERE id IN (
    SELECT tarjeta_id 
    FROM codigos 
    WHERE parametro_id IS NULL
);

-- PASO 2: Eliminar todos los ingresos que no tienen parametro_id
-- Esto incluye tanto pendientes (estado = "1") como pagados (estado = "0")
DELETE FROM codigos
WHERE parametro_id IS NULL;

-- Mensaje informativo
DO $$
BEGIN
    RAISE NOTICE 'Migración completada: Ingresos sin parametro_id eliminados y tarjetas liberadas';
END $$;
