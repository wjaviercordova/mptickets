# GUÍA DE IMPLEMENTACIÓN: SISTEMA DE LÍMITES DE PLANES
## MPTickets - Sistema de Validación DEMO y PREMIUM

---

## 📚 TABLA DE CONTENIDOS

1. [Resumen del Sistema](#resumen-del-sistema)
2. [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
3. [Instalación](#instalación)
4. [Uso Básico](#uso-básico)
5. [Ejemplos Prácticos](#ejemplos-prácticos)
6. [API Reference](#api-reference)
7. [Componentes UI](#componentes-ui)
8. [Troubleshooting](#troubleshooting)

---

## 📋 RESUMEN DEL SISTEMA

### Límites Configurados

#### **Plan DEMO** 
- ✅ **Usuarios**: Mínimo 1, Máximo 1, Por defecto 1
- ✅ **Tarjetas**: Mínimo 1, Máximo 10, Por defecto 10
- ✅ **Tarifas**: Mínimo 1, Máximo 2, Por defecto 2 (MOTO y AUTO)
- ✅ **Capacidad**: Mínimo 1, Máximo 50, Por defecto 10

#### **Plan PREMIUM**
- ✅ **Usuarios**: Mínimo 1, Máximo 10, Por defecto 1
- ✅ **Tarjetas**: Mínimo 1, Máximo 100, Por defecto 10
- ✅ **Tarifas**: Mínimo 1, Máximo 10, Por defecto 1
- ✅ **Capacidad**: Mínimo 1, Máximo 9999, Por defecto 50

### Comportamiento del Sistema

1. **Botones Deshabilitados**: Los botones "Agregar" se deshabilitan automáticamente al alcanzar el límite
2. **Alertas Visuales**: Mensajes informativos cuando se alcanza el 80% del límite
3. **Modales de Bloqueo**: Modal explicativo al intentar exceder el límite
4. **Contacto con Soporte**: Botón directo para contactar y actualizar el plan

---

## 🗄️ ESTRUCTURA DE LA BASE DE DATOS

### Tabla: `planes_config`

```sql
CREATE TABLE planes_config (
  id UUID PRIMARY KEY,
  plan_tipo VARCHAR(20) UNIQUE NOT NULL,
  
  -- Límites de Usuarios
  usuarios_minimo INTEGER NOT NULL DEFAULT 1,
  usuarios_maximo INTEGER NOT NULL,
  usuarios_por_defecto INTEGER NOT NULL,
  
  -- Límites de Tarjetas
  tarjetas_minimo INTEGER NOT NULL DEFAULT 1,
  tarjetas_maximo INTEGER NOT NULL,
  tarjetas_por_defecto INTEGER NOT NULL,
  
  -- Límites de Parámetros/Tarifas
  parametros_minimo INTEGER NOT NULL DEFAULT 1,
  parametros_maximo INTEGER NOT NULL,
  parametros_por_defecto INTEGER NOT NULL,
  
  -- Límites de Capacidad
  capacidad_minimo INTEGER NOT NULL DEFAULT 1,
  capacidad_maximo INTEGER NOT NULL,
  capacidad_por_defecto INTEGER NOT NULL,
  
  -- Metadatos
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  orden INTEGER DEFAULT 0,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `negocios` (Actualizada)

```sql
ALTER TABLE negocios 
ADD COLUMN limite_parametros INTEGER DEFAULT 2;
```

---

## 🚀 INSTALACIÓN

### Paso 1: Ejecutar Migración SQL

```bash
# En Supabase SQL Editor
psql postgres://[CONNECTION_STRING] < supabase/migrations/create_planes_config.sql
```

O ejecutar manualmente en el SQL Editor de Supabase:
- Archivo: `/supabase/migrations/create_planes_config.sql`

### Paso 2: Verificar Instalación

```sql
-- Verificar que la tabla exista
SELECT * FROM planes_config;

-- Debe retornar 2 filas (demo y premium)
```

### Paso 3: Archivos del Sistema

✅ **Ya creados:**
- `/lib/planes-limites.ts` - Tipos y funciones de validación
- `/lib/planes-limites-db.ts` - Funciones de base de datos
- `/hooks/useLimites.ts` - Hook de React
- `/components/limites/AlertaLimite.tsx` - Componentes UI
- `/app/api/planes-config/route.ts` - Endpoint API
- `/supabase/migrations/create_planes_config.sql` - Migración SQL

---

## 💡 USO BÁSICO

### 1. En el Asistente de Creación de Negocio

```tsx
// app/admin/negocios/nuevo/page.tsx

import { useLimitesLocal } from '@/hooks/useLimites';

function StepParametros({ data, onChange }) {
  const plan = 'demo'; // Obtener del Step 1
  const { validarParametros, planConfig } = useLimitesLocal(plan);
  
  const validacion = validarParametros(data.length);

  return (
    <div>
      <button
        onClick={handleAgregar}
        disabled={!validacion.permitido}
        className={!validacion.permitido ? 'opacity-50 cursor-not-allowed' : ''}
      >
        Agregar Tarifa
      </button>
      
      {!validacion.permitido && (
        <p className="text-red-400 text-sm mt-2">
          {validacion.mensaje}
        </p>
      )}
    </div>
  );
}
```

### 2. En Módulos del Dashboard

```tsx
// components/dashboard/configuracion/TarifasTab.tsx

import { useLimites } from '@/hooks/useLimites';
import { AlertaLimite } from '@/components/limites/AlertaLimite';

export default function TarifasTab({ negocioId }: { negocioId: string }) {
  const [parametros, setParametros] = useState([]);
  const { validarParametros, planConfig } = useLimites({ negocioId });
  
  const validacion = validarParametros(parametros.length);

  return (
    <div>
      {/* Alerta si está cerca o en el límite */}
      <AlertaLimite 
        validacion={validacion} 
        onActualizarPlan={() => router.push('/contacto')}
      />
      
      <button
        onClick={handleAgregarParametro}
        disabled={!validacion.permitido}
      >
        Agregar Tipo de Tarifa
      </button>
    </div>
  );
}
```

### 3. En Gestión de Usuarios

```tsx
// components/dashboard/configuracion/UsuariosTab.tsx

import { useLimites } from '@/hooks/useLimites';
import { BadgeLimite, ModalLimiteAlcanzado } from '@/components/limites/AlertaLimite';

export default function UsuariosTab({ negocioId }: { negocioId: string }) {
  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { validarUsuarios, planConfig } = useLimites({ negocioId });
  
  const validacion = validarUsuarios(usuarios.length);

  const handleAgregar = () => {
    if (!validacion.permitido) {
      setShowModal(true);
      return;
    }
    // Continuar con agregar usuario...
  };

  return (
    <div>
      {/* Badge con progreso */}
      <div className="mb-4">
        <BadgeLimite 
          actual={usuarios.length} 
          maximo={planConfig?.usuarios_maximo || 0}
          showProgress
        />
      </div>

      <button onClick={handleAgregar}>
        Agregar Usuario
      </button>

      {/* Modal informativo */}
      <ModalLimiteAlcanzado
        open={showModal}
        onClose={() => setShowModal(false)}
        tipoRecurso="usuarios"
        planActual={planConfig?.plan_tipo || 'demo'}
        limiteActual={planConfig?.usuarios_maximo || 0}
        onContactar={() => window.location.href = 'mailto:soporte@mptickets.com'}
      />
    </div>
  );
}
```

---

## 🎯 EJEMPLOS PRÁCTICOS

### Ejemplo 1: Validación en Step 4 del Wizard

```tsx
// app/admin/negocios/nuevo/page.tsx

function StepParametros({ data, onChange }: StepProps) {
  const [showModal, setShowModal] = useState(false);
  const planSeleccionado = formData.plan; // Del Step 1
  
  const { validarParametros, planConfig } = useLimitesLocal(planSeleccionado);
  
  const validacion = validarParametros(data.length);

  const handleAgregarTarifa = () => {
    if (!validacion.permitido) {
      setShowModal(true);
      return;
    }
    
    // Agregar nueva tarifa
    onChange([...data, nuevoParametro]);
  };

  return (
    <motion.div>
      {/* Alerta informativa */}
      {validacion.cerca_limite && (
        <AlertaLimite 
          validacion={validacion}
          onActualizarPlan={() => {
            // Cambiar plan a premium en Step 1
            alert('Regresa al paso 1 para seleccionar plan Premium');
          }}
        />
      )}

      {/* Cards de tarifas existentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((param, index) => (
          <TarifaCard key={index} parametro={param} />
        ))}
      </div>

      {/* Botón agregar (deshabilitado si alcanza límite) */}
      <button
        onClick={handleAgregarTarifa}
        disabled={!validacion.permitido}
        className={`
          px-4 py-2 rounded-lg flex items-center gap-2
          ${validacion.permitido 
            ? 'bg-green-500 hover:bg-green-600' 
            : 'bg-gray-500 cursor-not-allowed opacity-50'}
        `}
      >
        <Plus className="w-4 h-4" />
        Agregar Tipo de Tarifa
      </button>

      {/* Tooltip explicativo si está deshabilitado */}
      {!validacion.permitido && (
        <p className="text-sm text-red-400 mt-2">
          {validacion.mensaje}
        </p>
      )}

      {/* Modal de límite alcanzado */}
      <ModalLimiteAlcanzado
        open={showModal}
        onClose={() => setShowModal(false)}
        tipoRecurso="tarifas"
        planActual={planSeleccionado}
        limiteActual={planConfig?.parametros_maximo || 0}
        onContactar={() => {
          window.open('mailto:soporte@mptickets.com?subject=Actualizar Plan', '_blank');
        }}
      />
    </motion.div>
  );
}
```

### Ejemplo 2: Validación Server-Side en API

```tsx
// app/api/parametros/route.ts

import { validarAgregarParametro } from '@/lib/planes-limites-db';

export async function POST(request: NextRequest) {
  const { negocio_id, ...parametroData } = await request.json();

  // Validar límite antes de insertar
  const validacion = await validarAgregarParametro(negocio_id);

  if (!validacion.permitido) {
    return NextResponse.json(
      { 
        error: 'Límite alcanzado',
        mensaje: validacion.mensaje,
        actual: validacion.actual,
        maximo: validacion.maximo,
      },
      { status: 403 }
    );
  }

  // Continuar con la inserción...
  const { data, error } = await supabase
    .from('parametros')
    .insert({ negocio_id, ...parametroData });

  return NextResponse.json({ data });
}
```

### Ejemplo 3: Validación en Configuración de Tarjetas

```tsx
// components/dashboard/configuracion/TarjetasTab.tsx

import { useLimites } from '@/hooks/useLimites';
import { BadgeLimite, AlertaLimite } from '@/components/limites/AlertaLimite';

export default function TarjetasTab({ negocioId }: { negocioId: string }) {
  const [tarjetas, setTarjetas] = useState([]);
  const { validarTarjetas, planConfig, loading } = useLimites({ negocioId });
  
  const validacion = validarTarjetas(tarjetas.length);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Header con badge */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Gestión de Tarjetas</h2>
        <BadgeLimite 
          actual={tarjetas.length}
          maximo={planConfig?.tarjetas_maximo || 0}
          showProgress
          size="lg"
        />
      </div>

      {/* Alerta si está cerca del límite */}
      {validacion.cerca_limite && (
        <AlertaLimite 
          validacion={validacion}
          sticky
          onActualizarPlan={() => window.location.href = '/contacto'}
        />
      )}

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-3 gap-4">
        {tarjetas.map(tarjeta => (
          <TarjetaCard key={tarjeta.id} tarjeta={tarjeta} />
        ))}
      </div>

      {/* Botón agregar */}
      <button
        onClick={handleAgregarTarjeta}
        disabled={!validacion.permitido}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg
          ${validacion.permitido
            ? 'bg-blue-500 hover:bg-blue-600'
            : 'bg-gray-500 opacity-50 cursor-not-allowed'}
        `}
      >
        <Plus />
        Agregar Tarjeta
      </button>

      {/* Mensaje si alcanzó límite */}
      {!validacion.permitido && (
        <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4">
          <p className="text-sm text-red-200">{validacion.mensaje}</p>
          <button 
            onClick={() => window.location.href = '/contacto'}
            className="mt-2 text-sm text-red-400 underline"
          >
            Contactar para actualizar plan →
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 📖 API REFERENCE

### Funciones de Validación (Client-Side)

#### `validarLimiteRecurso()`
```typescript
function validarLimiteRecurso(
  tipoRecurso: 'usuarios' | 'tarjetas' | 'parametros' | 'capacidad',
  cantidadActual: number,
  planConfig: PlanConfig
): ValidacionLimite;
```

#### `obtenerEstadoLimite()`
```typescript
function obtenerEstadoLimite(
  tipoRecurso: string,
  cantidadActual: number,
  planConfig: PlanConfig
): EstadoLimite;
```

### Funciones de Base de Datos (Server-Side)

#### `obtenerConfigPlan()`
```typescript
async function obtenerConfigPlan(
  planTipo: 'demo' | 'basica' | 'premium'
): Promise<PlanConfig | null>;
```

#### `validarAgregarUsuario()`
```typescript
async function validarAgregarUsuario(
  negocioId: string
): Promise<{ permitido: boolean; mensaje: string; actual: number; maximo: number }>;
```

#### `validarAgregarTarjeta()`
```typescript
async function validarAgregarTarjeta(
  negocioId: string
): Promise<{ permitido: boolean; mensaje: string; actual: number; maximo: number }>;
```

#### `validarAgregarParametro()`
```typescript
async function validarAgregarParametro(
  negocioId: string
): Promise<{ permitido: boolean; mensaje: string; actual: number; maximo: number }>;
```

### Hooks

#### `useLimites()`
```typescript
function useLimites(options: {
  negocioId?: string;
  planTipo?: 'demo' | 'basica' | 'premium';
  autoRefresh?: boolean;
}): {
  planConfig: PlanConfig | null;
  loading: boolean;
  error: string | null;
  validarUsuarios: (cantidad: number) => ValidacionLimite;
  validarTarjetas: (cantidad: number) => ValidacionLimite;
  validarParametros: (cantidad: number) => ValidacionLimite;
  validarCapacidad: (cantidad: number) => ValidacionLimite;
  refetch: () => Promise<void>;
};
```

#### `useLimitesLocal()`
```typescript
function useLimitesLocal(planTipo: 'demo' | 'basica' | 'premium'): {
  planConfig: PlanConfig;
  validarUsuarios: (cantidad: number) => ValidacionLimite;
  validarTarjetas: (cantidad: number) => ValidacionLimite;
  validarParametros: (cantidad: number) => ValidacionLimite;
  validarCapacidad: (cantidad: number) => ValidacionLimite;
};
```

---

## 🎨 COMPONENTES UI

### `<AlertaLimite />`
Alerta informativa que muestra el estado del límite

```tsx
<AlertaLimite 
  validacion={validacion}
  sticky={true}
  onActualizarPlan={() => router.push('/contacto')}
/>
```

**Props:**
- `validacion`: ValidacionLimite - Resultado de la validación
- `sticky?`: boolean - Si debe ser sticky en la parte superior
- `onActualizarPlan?`: () => void - Callback para botón de actualizar

### `<BadgeLimite />`
Badge que muestra uso actual vs límite

```tsx
<BadgeLimite 
  actual={usuarios.length}
  maximo={planConfig.usuarios_maximo}
  showProgress={true}
  size="md"
/>
```

**Props:**
- `actual`: number - Cantidad actual
- `maximo`: number - Límite máximo
- `showProgress?`: boolean - Mostrar barra de progreso
- `size?`: 'sm' | 'md' | 'lg' - Tamaño del badge

### `<ModalLimiteAlcanzado />`
Modal informativo al alcanzar límite

```tsx
<ModalLimiteAlcanzado
  open={showModal}
  onClose={() => setShowModal(false)}
  tipoRecurso="usuarios"
  planActual="demo"
  limiteActual={1}
  onContactar={() => window.location.href = 'mailto:soporte@mptickets.com'}
/>
```

**Props:**
- `open`: boolean - Si el modal está abierto
- `onClose`: () => void - Callback para cerrar
- `tipoRecurso`: 'usuarios' | 'tarjetas' | 'tarifas' | 'capacidad'
- `planActual`: 'demo' | 'basica' | 'premium'
- `limiteActual`: number - Límite máximo alcanzado
- `onContactar?`: () => void - Callback para contactar soporte

---

## 🔧 TROUBLESHOOTING

### Problema: "No se encuentra configuración del plan"

**Solución:**
```sql
-- Verificar que existe la tabla
SELECT * FROM planes_config;

-- Si no existe, ejecutar migración
\i supabase/migrations/create_planes_config.sql
```

### Problema: "Error de permisos en RLS"

**Solución:**
```sql
-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'planes_config';

-- Habilitar acceso temporal para pruebas
ALTER TABLE planes_config DISABLE ROW LEVEL SECURITY;
```

### Problema: Hook retorna null en planConfig

**Solución:**
```tsx
// Usar useLimitesLocal para validaciones sin API
import { useLimitesLocal } from '@/hooks/useLimites';

const { planConfig, validarUsuarios } = useLimitesLocal('demo');
// planConfig siempre tendrá valor
```

### Problema: Límites no se actualizan en tiempo real

**Solución:**
```tsx
// Habilitar auto-refresh
const { validarUsuarios, refetch } = useLimites({ 
  negocioId,
  autoRefresh: true // Refresca cada 5 minutos
});

// O refetch manual después de agregar/eliminar
await refetch();
```

---

## 📞 SOPORTE

Para dudas o problemas con el sistema de límites:

- **Email**: soporte@mptickets.com
- **Documentación**: /docs/limites-planes.md
- **Repositorio**: github.com/mptickets/sistema-limites

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Ejecutar migración SQL en Supabase
- [ ] Verificar que tabla `planes_config` existe
- [ ] Verificar que campo `limite_parametros` existe en `negocios`
- [ ] Implementar validaciones en wizard (Step 4 - Parámetros)
- [ ] Implementar validaciones en Configuración - Usuarios
- [ ] Implementar validaciones en Configuración - Tarjetas
- [ ] Implementar validaciones en Configuración - Tarifas
- [ ] Agregar componente `<AlertaLimite />` en módulos principales
- [ ] Agregar `<BadgeLimite />` en headers de secciones
- [ ] Probar límites con plan DEMO (1 usuario, 10 tarjetas, 2 tarifas)
- [ ] Probar límites con plan PREMIUM (10 usuarios, 100 tarjetas, 10 tarifas)
- [ ] Configurar enlaces de contacto/actualización de plan
- [ ] Documentar para el equipo

---

**Versión:** 1.0.0  
**Fecha:** Marzo 2026  
**Autor:** Sistema MPTickets
