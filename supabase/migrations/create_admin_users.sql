-- ============================================
-- MPTICKETS ADMIN - TABLA ADMIN_USERS
-- Sistema de Administración Multi-tenant
-- ============================================

-- Crear tabla de usuarios administradores (superadmins)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  usuario VARCHAR NOT NULL UNIQUE,
  nombre VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  password VARCHAR NOT NULL,
  rol VARCHAR DEFAULT 'superadmin' CHECK (
    rol IN ('superadmin', 'admin_support')
  ),
  estado VARCHAR(1) DEFAULT '1' CHECK (estado IN ('0', '1')),
  ultimo_acceso TIMESTAMP WITH TIME ZONE,
  ip_ultimo_acceso INET,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT admin_users_pkey PRIMARY KEY (id),
  CONSTRAINT admin_users_email_valid CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  )
);

-- Comentarios de la tabla
COMMENT ON TABLE public.admin_users IS 'Usuarios administradores del panel MPTickets Admin (superadmins)';
COMMENT ON COLUMN public.admin_users.rol IS 'superadmin: Acceso completo | admin_support: Soporte técnico con acceso limitado';
COMMENT ON COLUMN public.admin_users.estado IS '1: Activo | 0: Inactivo';

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX idx_admin_users_usuario ON public.admin_users(usuario);
CREATE INDEX idx_admin_users_email ON public.admin_users(email);
CREATE INDEX idx_admin_users_estado ON public.admin_users(estado);
CREATE INDEX idx_admin_users_rol ON public.admin_users(rol);

-- ============================================
-- TRIGGER PARA FECHA_ACTUALIZACION
-- ============================================

CREATE OR REPLACE FUNCTION update_admin_users_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_admin_users_timestamp
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_users_timestamp();

-- ============================================
-- FUNCIÓN RPC: OBTENER ESTADÍSTICAS DE DASHBOARD ADMIN
-- ============================================

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    -- Negocios
    'total_negocios', (SELECT COUNT(*) FROM public.negocios),
    'negocios_activos', (SELECT COUNT(*) FROM public.negocios WHERE estado = 'activo'),
    'negocios_demo', (SELECT COUNT(*) FROM public.negocios WHERE plan = 'DEMO'),
    'negocios_premium', (SELECT COUNT(*) FROM public.negocios WHERE plan = 'PREMIUM'),
    'negocios_suspendidos', (SELECT COUNT(*) FROM public.negocios WHERE estado = 'suspendido'),
    'negocios_expirados', (
      SELECT COUNT(*) 
      FROM public.negocios 
      WHERE fecha_expiracion IS NOT NULL 
      AND fecha_expiracion < NOW()
    ),
    
    -- Usuarios
    'total_usuarios', (SELECT COUNT(*) FROM public.usuarios),
    'usuarios_activos_hoy', (
      SELECT COUNT(*) 
      FROM public.usuarios 
      WHERE DATE(ultimo_acceso) = CURRENT_DATE
    ),
    
    -- Capacidad
    'capacidad_total_plataforma', (
      SELECT COALESCE(SUM(capacidad_maxima), 0) 
      FROM public.negocios 
      WHERE estado = 'activo'
    ),
    'vehiculos_activos_ahora', (
      SELECT COUNT(*) 
      FROM public.codigos 
      WHERE estado = '1' 
      AND hora_salida IS NULL
    ),
    
    -- Licencias
    'licencias_vencen_7_dias', (
      SELECT COUNT(*) 
      FROM public.negocios 
      WHERE fecha_expiracion IS NOT NULL 
      AND fecha_expiracion BETWEEN NOW() AND NOW() + INTERVAL '7 days'
    ),
    'licencias_vencen_30_dias', (
      SELECT COUNT(*) 
      FROM public.negocios 
      WHERE fecha_expiracion IS NOT NULL 
      AND fecha_expiracion BETWEEN NOW() AND NOW() + INTERVAL '30 days'
    ),
    
    -- Actividad
    'tickets_procesados_mes', (
      SELECT COUNT(*) 
      FROM public.codigos 
      WHERE DATE_TRUNC('month', fecha_creacion) = DATE_TRUNC('month', CURRENT_DATE)
    ),
    'tickets_procesados_hoy', (
      SELECT COUNT(*) 
      FROM public.codigos 
      WHERE DATE(fecha_creacion) = CURRENT_DATE
    ),
    
    'fecha_calculo', NOW()
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_admin_dashboard_stats() IS 'Obtiene estadísticas consolidadas para el dashboard del administrador';

-- ============================================
-- FUNCIÓN RPC: CERRAR SESIONES DE UN NEGOCIO
-- ============================================

CREATE OR REPLACE FUNCTION public.cerrar_sesiones_negocio(negocio_uuid UUID)
RETURNS JSON AS $$
DECLARE
  sesiones_cerradas INTEGER;
BEGIN
  -- Aquí se implementaría la lógica para invalidar tokens/sesiones
  -- Por ahora solo actualiza ultimo_acceso a NULL
  UPDATE public.usuarios
  SET ultimo_acceso = NULL
  WHERE negocio_id = negocio_uuid;
  
  GET DIAGNOSTICS sesiones_cerradas = ROW_COUNT;
  
  RETURN json_build_object(
    'success', true,
    'sesiones_cerradas', sesiones_cerradas
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.cerrar_sesiones_negocio(UUID) IS 'Cierra todas las sesiones activas de los usuarios de un negocio';

-- ============================================
-- INSERTAR USUARIO SUPERADMIN INICIAL
-- ============================================

-- IMPORTANTE: Primero generar el hash con bcrypt
-- En Node.js: await bcrypt.hash('Admin@2024', 10)
-- El hash debe reemplazarse en el INSERT

-- Usuario temporal para testing (password: Admin@2024)
-- REEMPLAZAR con hash real antes de producción
INSERT INTO public.admin_users (
  usuario, 
  nombre, 
  email, 
  password, 
  rol
)
VALUES (
  'superadmin',
  'Administrador MPTickets',
  'admin@mptickets.com',
  '$2a$10$YourActualHashedPasswordHere', -- ⚠️ CAMBIAR POR HASH REAL
  'superadmin'
)
ON CONFLICT (usuario) DO NOTHING;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que la tabla se creó correctamente
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'admin_users'
ORDER BY ordinal_position;

-- Verificar índices
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'admin_users';

-- Verificar usuario inicial
SELECT 
  id, 
  usuario, 
  nombre, 
  email, 
  rol, 
  estado,
  fecha_creacion
FROM public.admin_users;

-- ============================================
-- ROW LEVEL SECURITY (Opcional)
-- ============================================

-- Si se desea implementar RLS para mayor seguridad:
-- ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Admin users: Select solo para superadmins"
--   ON public.admin_users
--   FOR SELECT
--   USING (
--     auth.uid() IN (
--       SELECT id FROM public.admin_users WHERE rol = 'superadmin'
--     )
--   );

-- ============================================
-- CLEANUP (Solo para desarrollo/testing)
-- ============================================

-- Para eliminar todo y empezar de nuevo:
-- DROP TABLE IF EXISTS public.admin_users CASCADE;
-- DROP FUNCTION IF EXISTS public.get_admin_dashboard_stats();
-- DROP FUNCTION IF EXISTS public.cerrar_sesiones_negocio(UUID);
