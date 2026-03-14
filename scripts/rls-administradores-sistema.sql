-- ==================================================
-- RLS PARA TABLA administradores_sistema
-- ==================================================
-- OPCIONAL: Solo si quieres máxima seguridad
-- Si dejas la tabla UNRESTRICTED también funciona correctamente

-- Habilitar RLS
ALTER TABLE administradores_sistema ENABLE ROW LEVEL SECURITY;

-- Política 1: service_role puede hacer TODO
-- (tu backend usa service_role, así bypassa RLS)
CREATE POLICY "service_role_full_access"
ON administradores_sistema
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Política 2: Usuarios autenticados NO pueden acceder
-- (los admins no usan Supabase Auth normal)
CREATE POLICY "no_public_access"
ON administradores_sistema
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Política 3: Usuarios anónimos NO pueden acceder
CREATE POLICY "no_anon_access"
ON administradores_sistema
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- ==================================================
-- RESULTADO:
-- - Solo service_role (backend) puede acceder
-- - Usuarios normales no pueden leer/escribir
-- - Máxima seguridad para credenciales de superadmins
-- ==================================================
