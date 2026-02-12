-- Políticas RLS sugeridas para producción
-- Requiere usar SUPABASE_SERVICE_ROLE_KEY en el backend para flujos de login.

-- Negocios
alter table if exists public.negocios enable row level security;

create policy "negocios_select_authenticated"
  on public.negocios
  for select
  to authenticated
  using (true);

-- Usuarios
alter table if exists public.usuarios enable row level security;

create policy "usuarios_select_authenticated"
  on public.usuarios
  for select
  to authenticated
  using (true);

-- Auditoría (solo inserts desde backend con service role)
alter table if exists public.auditoria enable row level security;

create policy "auditoria_insert_authenticated"
  on public.auditoria
  for insert
  to authenticated
  with check (true);

-- Nota:
-- Si necesitas login público con anon key, crea un RPC SECURITY DEFINER
-- o usa service role en el backend. Evita exponer datos sensibles con anon.
