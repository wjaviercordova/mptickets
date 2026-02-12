-- Schema base para MP Tickets
-- Ejecutar en el SQL Editor de Supabase (ordenado por dependencias)

create extension if not exists "pgcrypto";

create table if not exists public.negocios (
  id uuid not null default gen_random_uuid(),
  nombre character varying not null,
  descripcion text,
  direccion text,
  telefono character varying,
  email character varying unique check (
    email::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text
  ),
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
  codigo character varying unique,
  constraint negocios_pkey primary key (id)
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
  estado character varying default '1'::character varying check (
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
  tarifa_1_valor numeric default 0.00,
  tarifa_2_nombre character varying default 'Segunda Hora'::character varying,
  tarifa_2_valor numeric default 0.00,
  tarifa_3_nombre character varying default 'Tercera Hora'::character varying,
  tarifa_3_valor numeric default 0.00,
  tarifa_4_nombre character varying default 'Cuarta Hora'::character varying,
  tarifa_4_valor numeric default 0.00,
  tarifa_5_nombre character varying default 'Quinta Hora'::character varying,
  tarifa_5_valor numeric default 0.00,
  tarifa_6_nombre character varying default 'Sexta Hora'::character varying,
  tarifa_6_valor numeric default 0.00,
  tarifa_7_nombre character varying default 'Hora Adicional'::character varying,
  tarifa_7_valor numeric default 0.00,
  tarifa_extra numeric default 0.00,
  tarifa_auxiliar numeric default 0.00,
  tarifa_nocturna numeric default 0.00,
  tarifa_fin_semana numeric default 0.00,
  configuracion_avanzada jsonb default '{}'::jsonb,
  horarios_especiales jsonb default '{}'::jsonb,
  fecha_creacion timestamp with time zone default now(),
  fecha_actualizacion timestamp with time zone default now(),
  estado character varying default 'activo'::character varying check (
    estado::text = any (array['activo'::character varying, 'inactivo'::character varying])
  ),
  constraint parametros_pkey primary key (id),
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
  estado character varying default '1'::character varying check (
    estado::text = any (array['0'::character varying, '1'::character varying])
  ),
  perdida character varying default '0'::character varying check (
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
  costo numeric default 0.00,
  descuento numeric default 0.00,
  total numeric default 0.00,
  metodo_pago character varying default ''::character varying,
  estado character varying default '1'::character varying check (
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
