-- Eliminar constraint que impide múltiples tarifas del mismo tipo de vehículo
-- Esto permite crear varias tarifas para el mismo tipo_vehiculo con diferentes nombres
-- Ejemplo: múltiples SERVICIOS (Lavado Auto Pequeño, Lavado Auto Grande, etc.)

ALTER TABLE public.parametros 
DROP CONSTRAINT IF EXISTS parametros_vehiculo_negocio_unique;

-- Comentario: Ahora se permite crear múltiples tarifas para el mismo tipo_vehiculo 
-- siempre que tengan nombres diferentes. La validación de duplicados debe hacerse
-- a nivel de aplicación si es necesaria (tipo_vehiculo + nombre únicos)
