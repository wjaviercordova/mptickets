-- Migration: Eliminar constraint UNIQUE del email en negocios
-- Descripción: Permitir emails duplicados entre negocios, solo el código debe ser único
-- Fecha: 2026-03-19

-- 1. Eliminar el constraint UNIQUE del email
ALTER TABLE negocios 
DROP CONSTRAINT IF EXISTS negocios_email_key;

-- 2. Modificar el check constraint para permitir email NULL o vacío
ALTER TABLE negocios 
DROP CONSTRAINT IF EXISTS negocios_email_valid;

-- 3. Agregar nuevo check constraint que solo valida formato si el email no es NULL/vacío
ALTER TABLE negocios 
ADD CONSTRAINT negocios_email_valid 
CHECK (
  email IS NULL 
  OR email = '' 
  OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- 4. Eliminar el índice en email (ya no es necesario si no es UNIQUE)
DROP INDEX IF EXISTS idx_negocios_email;

-- Comentario: 
-- - El email ahora es OPCIONAL y puede repetirse entre negocios
-- - Solo el CÓDIGO sigue siendo UNIQUE
-- - Si se proporciona un email, debe tener formato válido
