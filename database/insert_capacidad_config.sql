-- Script para insertar configuraciones de capacidad en configuracion_sistema
-- Reemplaza '09753da3-535a-4b7c-9f46-50196b8364c6' con el negocio_id correcto si es necesario

INSERT INTO public.configuracion_sistema (
  negocio_id,
  clave,
  valor,
  tipo,
  descripcion,
  categoria
) VALUES
  (
    '09753da3-535a-4b7c-9f46-50196b8364c6',
    'capacidad_total',
    '100',
    'number',
    'Capacidad total del parqueadero',
    'capacidad'
  ),
  (
    '09753da3-535a-4b7c-9f46-50196b8364c6',
    'capacidad_motos',
    '30',
    'number',
    'Espacios disponibles para motocicletas',
    'capacidad'
  ),
  (
    '09753da3-535a-4b7c-9f46-50196b8364c6',
    'capacidad_autos',
    '50',
    'number',
    'Espacios disponibles para autos',
    'capacidad'
  ),
  (
    '09753da3-535a-4b7c-9f46-50196b8364c6',
    'capacidad_camionetas',
    '15',
    'number',
    'Espacios disponibles para camionetas',
    'capacidad'
  ),
  (
    '09753da3-535a-4b7c-9f46-50196b8364c6',
    'capacidad_pesados',
    '5',
    'number',
    'Espacios disponibles para vehículos pesados',
    'capacidad'
  ),
  (
    '09753da3-535a-4b7c-9f46-50196b8364c6',
    'espacios_reservados',
    '0',
    'number',
    'Número de espacios reservados',
    'capacidad'
  )
ON CONFLICT (clave, negocio_id) DO UPDATE
SET 
  valor = EXCLUDED.valor,
  tipo = EXCLUDED.tipo,
  descripcion = EXCLUDED.descripcion,
  categoria = EXCLUDED.categoria,
  fecha_actualizacion = now();
