-- Migration: Añadir plan ANUAL a planes_config
-- Descripción: Plan anual con las mismas características que PREMIUM pero con validez de 1 año
-- Fecha: 2026-03-18

-- 1. Eliminar el constraint CHECK existente
ALTER TABLE planes_config 
DROP CONSTRAINT IF EXISTS planes_config_plan_tipo_check;

-- 2. Agregar el nuevo constraint CHECK que incluye 'anual'
ALTER TABLE planes_config 
ADD CONSTRAINT planes_config_plan_tipo_check 
CHECK (plan_tipo IN ('demo', 'basica', 'anual', 'premium'));

-- 3. Actualizar el orden del plan PREMIUM para hacer espacio
UPDATE planes_config 
SET orden = 3, fecha_actualizacion = now()
WHERE plan_tipo = 'premium';

-- Insertar el nuevo plan ANUAL
INSERT INTO planes_config (
  id,
  plan_tipo,
  usuarios_minimo,
  usuarios_maximo,
  usuarios_por_defecto,
  tarjetas_minimo,
  tarjetas_maximo,
  tarjetas_por_defecto,
  parametros_minimo,
  parametros_maximo,
  parametros_por_defecto,
  capacidad_minimo,
  capacidad_maximo,
  capacidad_por_defecto,
  descripcion,
  activo,
  orden,
  fecha_creacion,
  fecha_actualizacion
) VALUES (
  gen_random_uuid(),
  'anual',
  1,              -- usuarios_minimo (igual que premium)
  10,             -- usuarios_maximo (igual que premium)
  1,              -- usuarios_por_defecto (igual que premium)
  1,              -- tarjetas_minimo (igual que premium)
  100,            -- tarjetas_maximo (igual que premium)
  10,             -- tarjetas_por_defecto (igual que premium)
  1,              -- parametros_minimo (igual que premium)
  10,             -- parametros_maximo (igual que premium)
  1,              -- parametros_por_defecto (igual que premium)
  1,              -- capacidad_minimo (igual que premium)
  9999,           -- capacidad_maximo (igual que premium)
  50,             -- capacidad_por_defecto (igual que premium)
  'Plan Anual - Versión completa con todas las funcionalidades por 1 año',
  true,           -- activo
  2,              -- orden (entre DEMO=1 y PREMIUM=3)
  now(),
  now()
);

-- Comentario: Este plan tiene los mismos límites que PREMIUM pero con dias_vigencia = 365
-- La lógica de validez se manejará en la aplicación al calcular fecha_expiracion
-- El constraint CHECK fue actualizado para permitir el valor 'anual' en plan_tipo
