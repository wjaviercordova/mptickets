-- Migration: Hacer email OBLIGATORIO pero NO único
-- Permite que varios negocios tengan el mismo email
-- Solo el código (código) debe ser único

-- Comentario:
-- - El email es OBLIGATORIO (NOT NULL) pero puede repetirse entre negocios
-- - Solo el CÓDIGO sigue siendo UNIQUE
-- - El email debe tener formato válido

-- Paso 1: Eliminar constraint UNIQUE del email (si existe)
ALTER TABLE negocios 
DROP CONSTRAINT IF EXISTS negocios_email_key;

-- Paso 2: Eliminar constraint CHECK anterior del email (si existe)
ALTER TABLE negocios 
DROP CONSTRAINT IF EXISTS negocios_email_valid;

-- Paso 3: Agregar constraint CHECK para validar formato de email (sin permitir NULL)
ALTER TABLE negocios 
ADD CONSTRAINT negocios_email_valid 
CHECK (
  email IS NOT NULL 
  AND email != '' 
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Paso 4: Asegurar que la columna sea NOT NULL
ALTER TABLE negocios 
ALTER COLUMN email SET NOT NULL;

-- Paso 5: Eliminar índice del email si existe (optimización, ya no es necesario)
DROP INDEX IF EXISTS idx_negocios_email;

-- Resultado: 
-- ✅ email es OBLIGATORIO (NOT NULL)
-- ✅ email NO es único (puede repetirse)
-- ✅ email debe tener formato válido
-- ✅ código sigue siendo UNIQUE
