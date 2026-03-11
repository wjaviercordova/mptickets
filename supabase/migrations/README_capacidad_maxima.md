# Sistema Multi-tenant con Licencias

## 📋 Descripción
Este sistema soporta 3 tipos de planes para un modelo multi-tenant:

| Plan | Duración | Límite Tarjetas | Capacidad Vehículos | Precio |
|------|----------|----------------|---------------------|--------|
| **Demo** | 30 días | 10 tarjetas | 10 espacios | Gratis |
| **Básica** | Sin vencimiento | 50 tarjetas | 50 espacios | Licencia comprada |
| **Premium** | Sin vencimiento | 100 tarjetas | 100 espacios | Licencia comprada |

## 🗂️ Campos en la tabla `negocios`

### Campos relacionados con licencias:
- **`plan`**: Tipo de plan ('demo', 'basica', 'premium')
- **`fecha_expiracion`**: Fecha cuando expira la licencia
  - **Demo**: Se asigna automáticamente a 30 días desde la creación
  - **Básica/Premium**: NULL (sin vencimiento)
- **`limite_tarjetas`**: Cantidad máxima de tarjetas físicas que puede gestionar
- **`capacidad_maxima`**: Cantidad máxima de vehículos simultáneos en el estacionamiento
- **`estado`**: Estado del negocio ('activo', 'inactivo', 'suspendido')
  - Se cambia automáticamente a 'suspendido' cuando expira un plan Demo

## 🚀 Cómo aplicar la migración

### Opción 1: SQL Editor de Supabase (Recomendado)
1. Abre tu proyecto en Supabase Dashboard
2. Ve a **SQL Editor**
3. Crea una nueva consulta
4. Copia y pega todo el contenido del archivo `add_capacidad_maxima_to_negocios.sql`
5. Ejecuta la consulta

### Opción 2: CLI de Supabase
```bash
cd supabase
supabase db push
```

## 📊 Funciones Disponibles

### 1. `get_dias_restantes_licencia(negocio_uuid)`
Calcula los días restantes de una licencia.
```sql
-- Obtener días restantes de un negocio
SELECT get_dias_restantes_licencia('uuid-del-negocio');

-- Retorna:
-- NULL = Licencia sin vencimiento (Básica/Premium)
-- Número = Días restantes (Demo)
-- 0 = Licencia expirada
```

### 2. `is_licencia_activa(negocio_uuid)`
Verifica si la licencia está activa.
```sql
-- Verificar si una licencia está activa
SELECT is_licencia_activa('uuid-del-negocio');

-- Retorna:
-- true = Licencia activa
-- false = Licencia expirada o negocio suspendido/inactivo
```

### 3. Vista `vista_licencias`
Vista consolidada con toda la información de licencias.
```sql
-- Ver todas las licencias
SELECT * FROM vista_licencias;

-- Ver solo licencias que expiran pronto (menos de 7 días)
SELECT * FROM vista_licencias 
WHERE dias_restantes IS NOT NULL 
AND dias_restantes < 7;
```

## 💡 Ejemplos de Uso

### Crear un nuevo negocio Demo (30 días)
```sql
INSERT INTO public.negocios (
  nombre, 
  email, 
  plan, 
  limite_tarjetas, 
  capacidad_maxima,
  fecha_expiracion
) VALUES (
  'Estacionamiento Demo',
  'demo@ejemplo.com',
  'demo',
  10,
  10,
  NOW() + INTERVAL '30 days'
);
```

### Crear un negocio con plan Básico (sin vencimiento)
```sql
INSERT INTO public.negocios (
  nombre, 
  email, 
  plan, 
  limite_tarjetas, 
  capacidad_maxima,
  fecha_expiracion
) VALUES (
  'Estacionamiento Básico',
  'basico@ejemplo.com',
  'basica',
  50,
  50,
  NULL  -- Sin vencimiento
);
```

### Crear un negocio con plan Premium
```sql
INSERT INTO public.negocios (
  nombre, 
  email, 
  plan, 
  limite_tarjetas, 
  capacidad_maxima,
  fecha_expiracion
) VALUES (
  'Estacionamiento Premium',
  'premium@ejemplo.com',
  'premium',
  100,
  100,
  NULL  -- Sin vencimiento
);
```

### Actualizar un negocio de Demo a Básica
```sql
UPDATE public.negocios 
SET 
  plan = 'basica',
  limite_tarjetas = 50,
  capacidad_maxima = 50,
  fecha_expiracion = NULL,  -- Quitar vencimiento
  estado = 'activo'
WHERE id = 'uuid-del-negocio';
```

### Extender licencia Demo por 15 días más
```sql
UPDATE public.negocios 
SET fecha_expiracion = fecha_expiracion + INTERVAL '15 days'
WHERE id = 'uuid-del-negocio' 
AND plan = 'demo';
```

### Consultar negocios que expiran pronto
```sql
-- Negocios que expiran en los próximos 7 días
SELECT 
  nombre,
  email,
  plan,
  dias_restantes,
  fecha_expiracion
FROM vista_licencias
WHERE dias_restantes IS NOT NULL 
AND dias_restantes <= 7
AND dias_restantes > 0
ORDER BY dias_restantes ASC;
```

### Consultar uso de tarjetas por negocio
```sql
SELECT 
  nombre,
  plan,
  tarjetas_usadas,
  limite_tarjetas,
  porcentaje_tarjetas_usadas,
  CASE 
    WHEN tarjetas_usadas >= limite_tarjetas THEN 'Límite alcanzado'
    WHEN porcentaje_tarjetas_usadas > 80 THEN 'Casi lleno'
    ELSE 'Disponible'
  END AS estado_uso
FROM vista_licencias
ORDER BY porcentaje_tarjetas_usadas DESC;
```

## 🔒 Validaciones Automáticas

### Trigger de expiración
Cuando un negocio con plan Demo llega a su fecha de expiración:
- El campo `estado` se actualiza automáticamente a **'suspendido'**
- El trigger `trigger_check_licencia_expiracion` se ejecuta en cada INSERT/UPDATE

### Verificación en la aplicación
En tu código NextJS, puedes verificar la licencia:

```typescript
// Verificar si la licencia está activa
const { data: licencia } = await supabase
  .rpc('is_licencia_activa', { negocio_uuid: negocioId });

if (!licencia) {
  // Mostrar mensaje de licencia expirada
  // Redirigir a página de renovación
}

// Obtener días restantes
const { data: diasRestantes } = await supabase
  .rpc('get_dias_restantes_licencia', { negocio_uuid: negocioId });

if (diasRestantes !== null && diasRestantes < 7) {
  // Mostrar advertencia de que la licencia expira pronto
}
```

## 🔍 Verificar la migración

```sql
-- Ver estructura de la tabla negocios
\d public.negocios

-- Ver todas las funciones relacionadas con licencias
\df public.*licencia*

-- Ver información de todos los negocios
SELECT * FROM vista_licencias;

-- Verificar que los planes están correctos
SELECT plan, COUNT(*) as cantidad
FROM public.negocios
GROUP BY plan;
```

## 📈 Monitoreo de Licencias

### Script para monitorear licencias que expiran pronto
```sql
-- Ejecutar este query periódicamente (ej: diariamente via cron job)
SELECT 
  n.id,
  n.nombre,
  n.email,
  n.plan,
  n.fecha_expiracion,
  get_dias_restantes_licencia(n.id) as dias_restantes
FROM public.negocios n
WHERE n.plan = 'demo'
AND n.fecha_expiracion IS NOT NULL
AND n.fecha_expiracion <= NOW() + INTERVAL '7 days'
AND n.estado = 'activo'
ORDER BY n.fecha_expiracion ASC;
```

Este query te permite:
- Enviar emails de recordatorio a negocios que expiran pronto
- Generar reportes de renovaciones pendientes
- Automatizar notificaciones de expiración

## 🎯 Próximos Pasos

1. **Aplicar la migración** en Supabase
2. **Actualizar la interfaz** del módulo Configuración → Negocio para mostrar:
   - Días restantes (para plan Demo)
   - Estado de la licencia
   - Límites de tarjetas y uso actual
3. **Implementar validación** en el login para bloquear acceso a negocios con licencia expirada
4. **Agregar notificaciones** en el dashboard cuando falten pocos días
5. **Crear página de renovación** para upgrade de Demo a Básica/Premium
