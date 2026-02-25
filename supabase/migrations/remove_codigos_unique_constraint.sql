-- Migration: Remove unique constraint on codigos table
-- Reason: A parking card (tarjeta) is used multiple times for different entries
-- The constraint "codigo + negocio_id UNIQUE" prevents reusing the same card
-- which is incorrect for a parking system

-- Drop the unique constraint
ALTER TABLE public.codigos 
DROP CONSTRAINT IF EXISTS codigos_codigo_negocio_unique;

-- Verify the constraint was removed
-- Run this query to confirm:
-- SELECT constraint_name, constraint_type 
-- FROM information_schema.table_constraints 
-- WHERE table_name = 'codigos' AND table_schema = 'public';
