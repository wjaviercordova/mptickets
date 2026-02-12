-- Datos base para pruebas
-- Reemplaza el hash por el bcrypt real de la contraseña (admin123)

insert into public.negocios (nombre, descripcion, codigo, estado, plan, ciudad)
values ('Parking Central', 'Negocio principal', 'MP-001', 'activo', 'basic', 'Quito')
returning id;

-- Usa el id del negocio generado arriba
-- Ejemplo: reemplaza <NEGOCIO_ID> y <BCRYPT_HASH>
insert into public.usuarios (
  negocio_id,
  usuario,
  nombre,
  apellido,
  email,
  password,
  estado,
  rol
) values (
  '<NEGOCIO_ID>',
  'admin',
  'Administrador',
  'Principal',
  'admin@mptickets.com',
  '<BCRYPT_HASH>',
  '1',
  'admin'
);
