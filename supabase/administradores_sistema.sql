-- ============================================================
-- TABLA PARA ADMINISTRADORES DEL SISTEMA (PANEL ADMIN)
-- ============================================================
-- Esta tabla es independiente de negocios y usuarios.
-- Sirve para gestionar el acceso al panel de administración
-- donde se crean y gestionan los negocios.

-- Crear tabla administradores_sistema
CREATE TABLE IF NOT EXISTS public.administradores_sistema (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  usuario VARCHAR NOT NULL UNIQUE,
  password VARCHAR NOT NULL,
  nombre VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  rol VARCHAR DEFAULT 'administrador' CHECK (
    rol IN ('superadmin', 'administrador', 'soporte')
  ),
  estado VARCHAR(1) DEFAULT '1' CHECK (
    estado IN ('0', '1')
  ),
  permisos JSONB DEFAULT '{}',
  avatar_url TEXT,
  ultimo_acceso TIMESTAMP WITH TIME ZONE,
  ip_ultimo_acceso INET,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT administradores_sistema_pkey PRIMARY KEY (id),
  CONSTRAINT administradores_sistema_email_valid CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  )
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_administradores_usuario ON public.administradores_sistema USING btree (usuario);
CREATE INDEX IF NOT EXISTS idx_administradores_email ON public.administradores_sistema USING btree (email);
CREATE INDEX IF NOT EXISTS idx_administradores_estado ON public.administradores_sistema USING btree (estado);
CREATE INDEX IF NOT EXISTS idx_administradores_rol ON public.administradores_sistema USING btree (rol);

-- Trigger para actualizar fecha_actualizacion
CREATE TRIGGER update_administradores_sistema_fecha_actualizacion
  BEFORE UPDATE ON public.administradores_sistema
  FOR EACH ROW
  EXECUTE FUNCTION update_fecha_actualizacion();

-- ============================================================
-- INSERTAR USUARIO SUPERADMIN (Ejecutar después de crear tabla)
-- ============================================================
-- IMPORTANTE: Cambiar la contraseña después del primer acceso
-- Usuario: superadmin
-- Password: Admin123!
-- Hash generado con bcrypt (10 rounds)

INSERT INTO public.administradores_sistema (
  usuario, 
  password, 
  nombre, 
  email, 
  rol, 
  estado,
  permisos,
  fecha_creacion,
  fecha_actualizacion
) VALUES (
  'superadmin',
  '$2a$10$Jj6SEXOYu.eIR/2G.mJgIOuIobM1NMy17QcT22i94eQcVov/3rzuC',
  'Administrador Principal',
  'admin@mptickets.com',
  'superadmin',
  '1',
  '{"crear_negocios": true, "editar_negocios": true, "eliminar_negocios": true, "gestionar_admins": true, "ver_reportes": true}',
  NOW(),
  NOW()
);

-- Verificar que se creó correctamente
SELECT 
  id, 
  usuario, 
  nombre, 
  email, 
  rol, 
  estado,
  fecha_creacion
FROM public.administradores_sistema
WHERE usuario = 'superadmin';
