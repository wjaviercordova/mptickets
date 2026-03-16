-- ============================================================================
-- MIGRACIÓN: Sistema de Límites para Planes DEMO y PREMIUM
-- Fecha: 2026-03-16
-- Descripción: Crea tabla planes_config con límites configurables por tipo de plan
-- ============================================================================

-- 1. Crear tabla de configuración de planes
CREATE TABLE IF NOT EXISTS public.planes_config (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  plan_tipo VARCHAR(20) NOT NULL,
  
  -- Límites de Usuarios
  usuarios_minimo INTEGER NOT NULL DEFAULT 1,
  usuarios_maximo INTEGER NOT NULL DEFAULT 1,
  usuarios_por_defecto INTEGER NOT NULL DEFAULT 1,
  
  -- Límites de Tarjetas
  tarjetas_minimo INTEGER NOT NULL DEFAULT 1,
  tarjetas_maximo INTEGER NOT NULL DEFAULT 10,
  tarjetas_por_defecto INTEGER NOT NULL DEFAULT 10,
  
  -- Límites de Parámetros/Tarifas
  parametros_minimo INTEGER NOT NULL DEFAULT 1,
  parametros_maximo INTEGER NOT NULL DEFAULT 2,
  parametros_por_defecto INTEGER NOT NULL DEFAULT 2,
  
  -- Límite de Capacidad Máxima (espacios de parqueadero)
  capacidad_minimo INTEGER NOT NULL DEFAULT 1,
  capacidad_maximo INTEGER NOT NULL DEFAULT 50,
  capacidad_por_defecto INTEGER NOT NULL DEFAULT 10,
  
  -- Metadatos
  descripcion TEXT,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  orden INTEGER NOT NULL DEFAULT 0,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT planes_config_pkey PRIMARY KEY (id),
  CONSTRAINT planes_config_plan_tipo_key UNIQUE (plan_tipo),
  CONSTRAINT planes_config_plan_tipo_check CHECK (
    plan_tipo IN ('demo', 'basica', 'premium')
  )
);

-- 2. Insertar configuración para plan DEMO
INSERT INTO public.planes_config (
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
  orden
) VALUES (
  'demo',
  1,    -- usuarios_minimo
  1,    -- usuarios_maximo (1 usuario máximo)
  1,    -- usuarios_por_defecto
  1,    -- tarjetas_minimo
  10,   -- tarjetas_maximo
  10,   -- tarjetas_por_defecto
  1,    -- parametros_minimo
  2,    -- parametros_maximo (MOTO y AUTO solamente)
  2,    -- parametros_por_defecto
  1,    -- capacidad_minimo
  50,   -- capacidad_maximo
  10,   -- capacidad_por_defecto
  'Plan Demo - Versión de prueba gratuita por 30 días con funcionalidades limitadas',
  TRUE,
  1
) ON CONFLICT (plan_tipo) DO UPDATE SET
  usuarios_minimo = EXCLUDED.usuarios_minimo,
  usuarios_maximo = EXCLUDED.usuarios_maximo,
  usuarios_por_defecto = EXCLUDED.usuarios_por_defecto,
  tarjetas_minimo = EXCLUDED.tarjetas_minimo,
  tarjetas_maximo = EXCLUDED.tarjetas_maximo,
  tarjetas_por_defecto = EXCLUDED.tarjetas_por_defecto,
  parametros_minimo = EXCLUDED.parametros_minimo,
  parametros_maximo = EXCLUDED.parametros_maximo,
  parametros_por_defecto = EXCLUDED.parametros_por_defecto,
  capacidad_minimo = EXCLUDED.capacidad_minimo,
  capacidad_maximo = EXCLUDED.capacidad_maximo,
  capacidad_por_defecto = EXCLUDED.capacidad_por_defecto,
  descripcion = EXCLUDED.descripcion,
  fecha_actualizacion = NOW();

-- 3. Insertar configuración para plan PREMIUM
INSERT INTO public.planes_config (
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
  orden
) VALUES (
  'premium',
  1,     -- usuarios_minimo
  10,    -- usuarios_maximo
  1,     -- usuarios_por_defecto (se crea con 1 usuario admin)
  1,     -- tarjetas_minimo
  100,   -- tarjetas_maximo
  10,    -- tarjetas_por_defecto
  1,     -- parametros_minimo
  10,    -- parametros_maximo (MOTO, AUTO, CAMIONETA, PESADO, etc.)
  1,     -- parametros_por_defecto
  1,     -- capacidad_minimo
  9999,  -- capacidad_maximo (sin límite práctico)
  50,    -- capacidad_por_defecto
  'Plan Premium - Versión completa con todas las funcionalidades y soporte prioritario',
  TRUE,
  2
) ON CONFLICT (plan_tipo) DO UPDATE SET
  usuarios_minimo = EXCLUDED.usuarios_minimo,
  usuarios_maximo = EXCLUDED.usuarios_maximo,
  usuarios_por_defecto = EXCLUDED.usuarios_por_defecto,
  tarjetas_minimo = EXCLUDED.tarjetas_minimo,
  tarjetas_maximo = EXCLUDED.tarjetas_maximo,
  tarjetas_por_defecto = EXCLUDED.tarjetas_por_defecto,
  parametros_minimo = EXCLUDED.parametros_minimo,
  parametros_maximo = EXCLUDED.parametros_maximo,
  parametros_por_defecto = EXCLUDED.parametros_por_defecto,
  capacidad_minimo = EXCLUDED.capacidad_minimo,
  capacidad_maximo = EXCLUDED.capacidad_maximo,
  capacidad_por_defecto = EXCLUDED.capacidad_por_defecto,
  descripcion = EXCLUDED.descripcion,
  fecha_actualizacion = NOW();

-- 4. Agregar campo limite_parametros a tabla negocios
ALTER TABLE public.negocios 
ADD COLUMN IF NOT EXISTS limite_parametros INTEGER DEFAULT 2;

-- 5. Comentarios para documentación
COMMENT ON TABLE public.planes_config IS 'Configuración de límites y restricciones por tipo de plan (demo, basica, premium)';
COMMENT ON COLUMN public.planes_config.plan_tipo IS 'Tipo de plan: demo, basica o premium';
COMMENT ON COLUMN public.planes_config.usuarios_maximo IS 'Número máximo de usuarios permitidos en este plan';
COMMENT ON COLUMN public.planes_config.tarjetas_maximo IS 'Número máximo de tarjetas permitidas en este plan';
COMMENT ON COLUMN public.planes_config.parametros_maximo IS 'Número máximo de parámetros/tarifas permitidos en este plan (tipos de vehículos)';
COMMENT ON COLUMN public.planes_config.capacidad_maximo IS 'Capacidad máxima de espacios de parqueadero permitidos';

-- 6. Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_planes_config_plan_tipo ON public.planes_config(plan_tipo);
CREATE INDEX IF NOT EXISTS idx_planes_config_activo ON public.planes_config(activo);

-- 7. Actualizar negocios existentes con límite de parámetros según su plan
UPDATE public.negocios 
SET limite_parametros = CASE 
  WHEN plan = 'demo' THEN 2
  WHEN plan = 'premium' THEN 10
  ELSE 2
END
WHERE limite_parametros IS NULL;

-- 8. Habilitar RLS (Row Level Security)
ALTER TABLE public.planes_config ENABLE ROW LEVEL SECURITY;

-- 9. Política RLS: Solo lectura para usuarios autenticados
CREATE POLICY "Planes config son visibles para todos los usuarios autenticados"
  ON public.planes_config
  FOR SELECT
  TO authenticated
  USING (true);

-- 10. Política RLS: Solo administradores de sistema pueden modificar
-- (Asumiendo que existe una tabla administradores_sistema)
CREATE POLICY "Solo administradores de sistema pueden modificar planes_config"
  ON public.planes_config
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.administradores_sistema
      WHERE usuario = auth.jwt()->>'email'
      AND estado = '1'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.administradores_sistema
      WHERE usuario = auth.jwt()->>'email'
      AND estado = '1'
    )
  );

-- ============================================================================
-- FIN DE MIGRACIÓN
-- ============================================================================
