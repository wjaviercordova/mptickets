-- Migration: Actualizar constraint CHECK de la columna plan en tabla negocios
-- Problema: El constraint negocios_plan_check no incluye el valor 'anual'
-- Solución: Eliminar el constraint antiguo y crear uno nuevo que incluya 'anual'
-- Fecha: 2026-03-19

-- Comentario:
-- Este constraint limita los valores permitidos en la columna plan de la tabla negocios
-- Necesitamos incluir 'anual' para permitir el nuevo tipo de plan

-- Paso 1: Eliminar el constraint CHECK existente
ALTER TABLE negocios 
DROP CONSTRAINT IF EXISTS negocios_plan_check;

-- Paso 2: Crear el nuevo constraint CHECK que incluye 'anual'
ALTER TABLE negocios 
ADD CONSTRAINT negocios_plan_check 
CHECK (plan IN ('demo', 'basica', 'anual', 'premium'));

-- Resultado: 
-- ✅ La columna plan ahora acepta: 'demo', 'basica', 'anual', 'premium'
-- ✅ Se pueden actualizar negocios existentes a plan 'anual'
-- ✅ Se pueden crear nuevos negocios con plan 'anual'
