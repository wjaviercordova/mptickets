-- Schema base para MP Tickets
-- Ejecutar en el SQL Editor de Supabase (ordenado por dependencias)

create extension if not exists "pgcrypto";

create table if not exists public.negocios (
  id uuid not null default gen_random_uuid(),
  nombre character varying not null,
  descripcion text,
  direccion text,
  telefono character varying,
  email character varying,
  ciudad character varying default ''::character varying,
  logo_url text,
  configuracion jsonb default '{}'::jsonb,
  plan character varying default 'basic'::character varying check (
    plan::text = any (
      array['basic'::character varying, 'premium'::character varying, 'enterprise'::character varying]
    )
  ),
  estado character varying default 'activo'::character varying check (
    estado::text = any (
      array['activo'::character varying, 'inactivo'::character varying, 'suspendido'::character varying]
    )
  ),
  fecha_creacion timestamp with time zone default now(),
  fecha_actualizacion timestamp with time zone default now(),
  metadata jsonb default '{}'::jsonb,
  limite_usuarios integer default 10,
  limite_tarjetas integer default 1000,
  codigo character varying(20),
  constraint negocios_pkey primary key (id),
  constraint negocios_codigo_key unique (codigo),
  constraint negocios_email_key unique (email),
  constraint negocios_email_valid check (
    email::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text
  )
);

create table if not exists public.usuarios (
  id uuid not null default gen_random_uuid(),
  negocio_id uuid not null,
  usuario character varying not null,
  nombre character varying not null,
  apellido character varying default ''::character varying,
  email character varying,
  telefono character varying,
  avatar_url text,
  password character varying not null,
  estado character varying(1) default '1'::character varying check (
    estado::text = any (array['0'::character varying, '1'::character varying])
  ),
  fecha_creacion timestamp with time zone default now(),
  fecha_actualizacion timestamp with time zone default now(),
  ultimo_acceso timestamp with time zone,
  ip_ultimo_acceso inet,
  rol character varying default 'operador'::character varying check (
    rol::text = any (array['admin'::character varying, 'operador'::character varying, 'visor'::character varying])
  ),
  permisos jsonb default '{}'::jsonb,
  configuracion_personal jsonb default '{}'::jsonb,
  constraint usuarios_pkey primary key (id),
  constraint usuarios_email_negocio_unique unique (email, negocio_id) deferrable,
  constraint usuarios_usuario_negocio_unique unique (usuario, negocio_id),
  constraint usuarios_negocio_id_fkey foreign key (negocio_id) references public.negocios(id) on delete cascade
);

create table if not exists public.parametros (
  id uuid not null default gen_random_uuid(),
  negocio_id uuid not null,
  tipo_vehiculo character varying not null,
  nombre character varying not null,
  descripcion text,
  prioridad integer default 1,
  tarifa_1_nombre character varying default 'Primera Hora'::character varying,
  tarifa_1_valor numeric(10, 2) default 0.00,
  tarifa_2_nombre character varying default 'Segunda Hora'::character varying,
  tarifa_2_valor numeric(10, 2) default 0.00,
  tarifa_3_nombre character varying default 'Tercera Hora'::character varying,
  tarifa_3_valor numeric(10, 2) default 0.00,
  tarifa_4_nombre character varying default 'Cuarta Hora'::character varying,
  tarifa_4_valor numeric(10, 2) default 0.00,
  tarifa_5_nombre character varying default 'Quinta Hora'::character varying,
  tarifa_5_valor numeric(10, 2) default 0.00,
  tarifa_6_nombre character varying default 'Sexta Hora'::character varying,
  tarifa_6_valor numeric(10, 2) default 0.00,
  tarifa_7_nombre character varying default 'Hora Adicional'::character varying,
  tarifa_7_valor numeric(10, 2) default 0.00,
  tarifa_extra numeric(10, 2) default 0.00,
  tarifa_auxiliar numeric(10, 2) default 0.00,
  tarifa_nocturna numeric(10, 2) default 0.00,
  tarifa_fin_semana numeric(10, 2) default 0.00,
  configuracion_avanzada jsonb default '{}'::jsonb,
  horarios_especiales jsonb default '{}'::jsonb,
  fecha_creacion timestamp with time zone default now(),
  fecha_actualizacion timestamp with time zone default now(),
  estado character varying default 'activo'::character varying check (
    estado::text = any (array['activo'::character varying, 'inactivo'::character varying])
  ),
  constraint parametros_pkey primary key (id),
  constraint parametros_vehiculo_negocio_unique unique (tipo_vehiculo, negocio_id),
  constraint parametros_negocio_id_fkey foreign key (negocio_id) references public.negocios(id) on delete cascade
);

create table if not exists public.tarjetas (
  id uuid not null default gen_random_uuid(),
  negocio_id uuid not null,
  usuario_creacion_id uuid,
  codigo character varying not null,
  codigo_interno character varying default ''::character varying,
  codigo_barras character varying,
  qr_code text,
  estado character varying(1) default '1'::character varying check (
    estado::text = any (array['0'::character varying, '1'::character varying])
  ),
  perdida character varying(1) default '0'::character varying check (
    perdida::text = any (array['0'::character varying, '1'::character varying])
  ),
  propietario_nombre character varying,
  propietario_telefono character varying,
  propietario_email character varying,
  notas text,
  fecha_creacion timestamp with time zone default now(),
  fecha_actualizacion timestamp with time zone default now(),
  ultima_actualizacion timestamp with time zone default now(),
  metadata jsonb default '{}'::jsonb,
  constraint tarjetas_pkey primary key (id),
  constraint tarjetas_codigo_negocio_unique unique (codigo, negocio_id),
  constraint tarjetas_negocio_id_fkey foreign key (negocio_id) references public.negocios(id) on delete cascade,
  constraint tarjetas_usuario_creacion_id_fkey foreign key (usuario_creacion_id) references public.usuarios(id) on delete set null
);

create table if not exists public.codigos (
  id uuid not null default gen_random_uuid(),
  negocio_id uuid not null,
  tarjeta_id uuid not null,
  parametro_id uuid,
  usuario_entrada_id uuid,
  usuario_salida_id uuid,
  codigo character varying not null,
  codigo_barras character varying,
  qr_code text,
  tipo_vehiculo character varying default ''::character varying,
  placa character varying default ''::character varying,
  color character varying default ''::character varying,
  marca character varying default ''::character varying,
  modelo character varying default ''::character varying,
  hora_entrada timestamp with time zone default now(),
  hora_salida timestamp with time zone,
  costo numeric(10, 2) default 0.00,
  descuento numeric(10, 2) default 0.00,
  total numeric(10, 2) default 0.00,
  metodo_pago character varying default ''::character varying,
  estado character varying(1) default '1'::character varying check (
    estado::text = any (array['0'::character varying, '1'::character varying])
  ),
  observaciones text,
  datos_adicionales jsonb default '{}'::jsonb,
  fecha_creacion timestamp with time zone default now(),
  fecha_actualizacion timestamp with time zone default now(),
  constraint codigos_pkey primary key (id),
  constraint codigos_negocio_id_fkey foreign key (negocio_id) references public.negocios(id) on delete cascade,
  constraint codigos_tarjeta_id_fkey foreign key (tarjeta_id) references public.tarjetas(id) on delete cascade,
  constraint codigos_parametro_id_fkey foreign key (parametro_id) references public.parametros(id) on delete set null,
  constraint codigos_usuario_entrada_id_fkey foreign key (usuario_entrada_id) references public.usuarios(id) on delete set null,
  constraint codigos_usuario_salida_id_fkey foreign key (usuario_salida_id) references public.usuarios(id) on delete set null
);

create table if not exists public.configuracion_sistema (
  id uuid not null default gen_random_uuid(),
  negocio_id uuid not null,
  clave character varying not null,
  valor text,
  tipo character varying default 'string'::character varying check (
    tipo::text = any (array['string'::character varying, 'number'::character varying, 'boolean'::character varying, 'json'::character varying])
  ),
  descripcion text,
  categoria character varying default 'general'::character varying,
  fecha_creacion timestamp with time zone default now(),
  fecha_actualizacion timestamp with time zone default now(),
  constraint configuracion_sistema_pkey primary key (id),
  constraint config_clave_negocio_unique unique (clave, negocio_id),
  constraint configuracion_sistema_negocio_id_fkey foreign key (negocio_id) references public.negocios(id) on delete cascade
);

create table if not exists public.auditoria (
  id uuid not null default gen_random_uuid(),
  negocio_id uuid not null,
  usuario_id uuid,
  tabla_afectada character varying not null,
  registro_id uuid,
  accion character varying not null check (
    accion::text = any (array['INSERT'::character varying, 'UPDATE'::character varying, 'DELETE'::character varying])
  ),
  datos_anteriores jsonb,
  datos_nuevos jsonb,
  ip_address inet,
  user_agent text,
  fecha_creacion timestamp with time zone default now(),
  constraint auditoria_pkey primary key (id),
  constraint auditoria_negocio_id_fkey foreign key (negocio_id) references public.negocios(id) on delete cascade,
  constraint auditoria_usuario_id_fkey foreign key (usuario_id) references public.usuarios(id) on delete set null
);

-- ============================================================
-- ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS
-- ============================================================

-- Índices para tabla negocios
create index if not exists idx_negocios_estado on public.negocios using btree (estado);
create index if not exists idx_negocios_email on public.negocios using btree (email);
create index if not exists idx_negocios_codigo on public.negocios using btree (codigo);

-- Índices para tabla usuarios
create index if not exists idx_usuarios_negocio on public.usuarios using btree (negocio_id);
create index if not exists idx_usuarios_estado on public.usuarios using btree (estado);
create index if not exists idx_usuarios_usuario_negocio on public.usuarios using btree (usuario, negocio_id);
create index if not exists idx_usuarios_email on public.usuarios using btree (email);
create index if not exists idx_usuarios_ultimo_acceso on public.usuarios using btree (ultimo_acceso);

-- Índices para tabla parametros
create index if not exists idx_parametros_negocio on public.parametros using btree (negocio_id);
create index if not exists idx_parametros_tipo_vehiculo on public.parametros using btree (tipo_vehiculo);
create index if not exists idx_parametros_estado on public.parametros using btree (estado);

-- Índices para tabla tarjetas
create index if not exists idx_tarjetas_negocio on public.tarjetas using btree (negocio_id);
create index if not exists idx_tarjetas_estado on public.tarjetas using btree (estado);
create index if not exists idx_tarjetas_codigo on public.tarjetas using btree (codigo);
create index if not exists idx_tarjetas_usuario_creacion on public.tarjetas using btree (usuario_creacion_id);
create index if not exists idx_tarjetas_fecha_creacion on public.tarjetas using btree (fecha_creacion);

-- Índices para tabla codigos
create index if not exists idx_codigos_negocio on public.codigos using btree (negocio_id);
create index if not exists idx_codigos_tarjeta on public.codigos using btree (tarjeta_id);
create index if not exists idx_codigos_parametro on public.codigos using btree (parametro_id);
create index if not exists idx_codigos_usuario_entrada on public.codigos using btree (usuario_entrada_id);
create index if not exists idx_codigos_usuario_salida on public.codigos using btree (usuario_salida_id);
create index if not exists idx_codigos_hora_entrada on public.codigos using btree (hora_entrada);
create index if not exists idx_codigos_hora_salida on public.codigos using btree (hora_salida);
create index if not exists idx_codigos_estado on public.codigos using btree (estado);
create index if not exists idx_codigos_placa on public.codigos using btree (placa);
create index if not exists idx_codigos_tipo_vehiculo on public.codigos using btree (tipo_vehiculo);

-- Índices para tabla configuracion_sistema
create index if not exists idx_config_negocio on public.configuracion_sistema using btree (negocio_id);
create index if not exists idx_config_categoria on public.configuracion_sistema using btree (categoria);

-- Índices para tabla auditoria
create index if not exists idx_auditoria_negocio on public.auditoria using btree (negocio_id);
create index if not exists idx_auditoria_usuario on public.auditoria using btree (usuario_id);
create index if not exists idx_auditoria_tabla on public.auditoria using btree (tabla_afectada);
create index if not exists idx_auditoria_fecha on public.auditoria using btree (fecha_creacion);

-- ============================================================
-- FUNCTION PARA AUTO-ACTUALIZAR fecha_actualizacion
-- ============================================================

create or replace function update_fecha_actualizacion()
returns trigger as $$
begin
  new.fecha_actualizacion = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- TRIGGERS PARA AUTO-ACTUALIZACIÓN
-- ============================================================

create trigger tr_negocios_updated_at
  before update on negocios
  for each row
  execute function update_fecha_actualizacion();

create trigger tr_usuarios_updated_at
  before update on usuarios
  for each row
  execute function update_fecha_actualizacion();

create trigger tr_parametros_updated_at
  before update on parametros
  for each row
  execute function update_fecha_actualizacion();

create trigger tr_tarjetas_updated_at
  before update on tarjetas
  for each row
  execute function update_fecha_actualizacion();

create trigger tr_codigos_updated_at
  before update on codigos
  for each row
  execute function update_fecha_actualizacion();

create trigger tr_config_updated_at
  before update on configuracion_sistema
  for each row
  execute function update_fecha_actualizacion();
