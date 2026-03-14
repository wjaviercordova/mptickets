/**
 * Cliente Supabase para operaciones de administrador
 * Usa Service Role Key para bypasear RLS
 * ⚠️ SOLO usar en server-side (API routes)
 */

import { createClient } from '@supabase/supabase-js';

// Validar que las variables de entorno estén configuradas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY');
}

/**
 * Cliente Supabase con Service Role Key
 * - Bypasea Row Level Security (RLS)
 * - Solo debe usarse en server-side
 * - NUNCA exponer en componentes client
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Cliente Supabase con Anon Key (para uso en componentes)
 * - Respeta Row Level Security (RLS)
 * - Puede usarse en client-side
 */
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
);
