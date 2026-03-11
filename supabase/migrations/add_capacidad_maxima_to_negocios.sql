-- =====================================================
-- Migración: Sistema Multi-tenant con Licencias
-- =====================================================
-- Esta migración configura el sistema para soportar 3 tipos de planes:
-- 1. Demo: 30 días de prueba, hasta 10 tarjetas
-- 2. Básica: Licencia sin vencimiento, hasta 50 tarjetas  
-- 3. Premium: Licencia sin vencimiento, hasta 100 tarjetas

-- 1. Actualizar el constraint del plan para incluir 'demo'
ALTER TABLE public.negocios 
DROP CONSTRAINT IF EXISTS negocios_plan_check;

ALTER TABLE public.negocios 
ADD CONSTRAINT negocios_plan_check CHECK (
  plan::text = ANY (
    ARRAY['demo'::character varying, 'basica'::character varying, 'premium'::character varying]::text[]
  )
);

-- 2. Agregar campo capacidad_maxima (espacios de vehículos simultáneos)
ALTER TABLE public.negocios 
ADD COLUMN IF NOT EXISTS capacidad_maxima integer DEFAULT 100;

COMMENT ON COLUMN public.negocios.capacidad_maxima IS 'Capacidad máxima de vehículos simultáneos en el estacionamiento';

-- 3. Agregar campo fecha_expiracion (para controlar licencias Demo)
ALTER TABLE public.negocios 
ADD COLUMN IF NOT EXISTS fecha_expiracion timestamp with time zone DEFAULT NULL;

COMMENT ON COLUMN public.negocios.fecha_expiracion IS 'Fecha de expiración de la licencia (NULL = sin vencimiento para Básica y Premium)';

-- 4. Actualizar el campo limite_tarjetas para reflejar los límites correctos
COMMENT ON COLUMN public.negocios.limite_tarjetas IS 'Límite de tarjetas físicas que puede gestionar el negocio según su plan';

-- 5. Actualizar valores por defecto según el plan
UPDATE public.negocios 
SET 
  limite_tarjetas = CASE 
    WHEN plan = 'demo' THEN 10
    WHEN plan = 'basica' THEN 50
    WHEN plan = 'premium' THEN 100
    WHEN plan = 'basic' THEN 50  -- Migrar 'basic' antiguo a 'basica'
    WHEN plan = 'enterprise' THEN 100  -- Migrar 'enterprise' antiguo a 'premium'
    ELSE 10
  END,
  capacidad_maxima = CASE 
    WHEN plan = 'demo' THEN 10
    WHEN plan = 'basica' THEN 50
    WHEN plan = 'premium' THEN 100
    WHEN plan = 'basic' THEN 50
    WHEN plan = 'enterprise' THEN 100
    ELSE 10
  END,
  -- Si es demo y no tiene fecha_expiracion, asignar 30 días desde hoy
  fecha_expiracion = CASE
    WHEN plan = 'demo' AND fecha_expiracion IS NULL THEN NOW() + INTERVAL '30 days'
    ELSE NULL  -- Básica y Premium no tienen vencimiento
  END
WHERE limite_tarjetas IS NULL OR capacidad_maxima IS NULL;

-- 6. Migrar planes antiguos a los nuevos nombres
UPDATE public.negocios 
SET plan = CASE 
  WHEN plan = 'basic' THEN 'basica'
  WHEN plan = 'enterprise' THEN 'premium'
  ELSE plan
END
WHERE plan IN ('basic', 'enterprise');

-- 7. Crear función para calcular días restantes de licencia
CREATE OR REPLACE FUNCTION public.get_dias_restantes_licencia(negocio_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  fecha_exp timestamp with time zone;
  dias_restantes integer;
BEGIN
  SELECT fecha_expiracion INTO fecha_exp
  FROM public.negocios
  WHERE id = negocio_uuid;
  
  -- Si no hay fecha de expiración, retornar NULL (licencia sin vencimiento)
  IF fecha_exp IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Calcular días restantes
  dias_restantes := EXTRACT(DAY FROM (fecha_exp - NOW()));
  
  -- Si ya expiró, retornar 0 (no valores negativos)
  IF dias_restantes < 0 THEN
    RETURN 0;
  END IF;
  
  RETURN dias_restantes;
END;
$$;

COMMENT ON FUNCTION public.get_dias_restantes_licencia IS 'Calcula los días restantes de una licencia Demo. Retorna NULL para licencias sin vencimiento';

-- 8. Crear función para verificar si una licencia está activa
CREATE OR REPLACE FUNCTION public.is_licencia_activa(negocio_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  fecha_exp timestamp with time zone;
  estado_actual character varying;
BEGIN
  SELECT fecha_expiracion, estado INTO fecha_exp, estado_actual
  FROM public.negocios
  WHERE id = negocio_uuid;
  
  -- Si el negocio está inactivo o suspendido, retornar false
  IF estado_actual != 'activo' THEN
    RETURN false;
  END IF;
  
  -- Si no hay fecha de expiración, la licencia es perpetua (Básica/Premium)
  IF fecha_exp IS NULL THEN
    RETURN true;
  END IF;
  
  -- Si hay fecha de expiración, verificar que no haya pasado
  RETURN fecha_exp > NOW();
END;
$$;

COMMENT ON FUNCTION public.is_licencia_activa IS 'Verifica si la licencia de un negocio está activa y no ha expirado';

-- 9. Crear trigger para actualizar automáticamente el estado cuando expire una licencia Demo
CREATE OR REPLACE FUNCTION public.check_licencia_expiracion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Si tiene fecha de expiración y ya expiró, cambiar estado a 'suspendido'
  IF NEW.fecha_expiracion IS NOT NULL AND NEW.fecha_expiracion <= NOW() THEN
    NEW.estado := 'suspendido';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_check_licencia_expiracion ON public.negocios;

CREATE TRIGGER trigger_check_licencia_expiracion
  BEFORE INSERT OR UPDATE ON public.negocios
  FOR EACH ROW
  EXECUTE FUNCTION public.check_licencia_expiracion();

COMMENT ON TRIGGER trigger_check_licencia_expiracion ON public.negocios IS 'Actualiza automáticamente el estado a suspendido cuando expira una licencia Demo';

-- 10. Crear vista para consultar fácilmente el estado de las licencias
CREATE OR REPLACE VIEW public.vista_licencias AS
SELECT 
  n.id,
  n.nombre,
  n.plan,
  n.estado,
  n.limite_tarjetas,
  n.capacidad_maxima,
  n.fecha_creacion,
  n.fecha_expiracion,
  CASE 
    WHEN n.fecha_expiracion IS NULL THEN 'Sin vencimiento'
    WHEN n.fecha_expiracion > NOW() THEN 'Activa'
    ELSE 'Expirada'
  END AS estado_licencia,
  public.get_dias_restantes_licencia(n.id) AS dias_restantes,
  public.is_licencia_activa(n.id) AS licencia_activa,
  -- Contar tarjetas usadas
  (SELECT COUNT(*) FROM public.tarjetas WHERE negocio_id = n.id AND estado = '1') AS tarjetas_usadas,
  -- Calcular porcentaje de uso de tarjetas
  CASE 
    WHEN n.limite_tarjetas > 0 THEN 
      ROUND((SELECT COUNT(*) FROM public.tarjetas WHERE negocio_id = n.id AND estado = '1')::numeric / n.limite_tarjetas::numeric * 100, 2)
    ELSE 0
  END AS porcentaje_tarjetas_usadas
FROM public.negocios n;

COMMENT ON VIEW public.vista_licencias IS 'Vista consolidada del estado de licencias de todos los negocios con información de uso';

