# RESUMEN EJECUTIVO: SISTEMA DE LÍMITES DE PLANES
## Alternativas y Recomendaciones

---

## 🎯 TU PREGUNTA

> "Estos límites en las licencias necesito estén en alguna tabla de la base para que el sistema pueda validar o ¿cuál es la alternativa que me das para manejar estos umbrales?"

---

## ✅ SOLUCIÓN IMPLEMENTADA (RECOMENDADA)

### **Opción A: Tabla `planes_config` en Base de Datos** 

#### ✅ Ventajas
1. **Flexibilidad Total**: Cambias límites sin modificar código
2. **Centralizado**: Una sola fuente de verdad para todos los límites
3. **Auditable**: Historial de cambios con `fecha_actualizacion`
4. **Escalable**: Fácil agregar nuevos planes (básico, empresarial, etc.)
5. **Multi-tenant**: Cada negocio puede tener configuración personalizada
6. **Admin Panel**: Puedes crear interfaz para modificar límites en vivo

#### ⚠️ Desventajas
1. Requiere query a DB cada vez (mitigado con caché)
2. Dependencia externa (si DB cae, usar fallback)

#### 📁 Archivos Creados
```
✅ /supabase/migrations/create_planes_config.sql
✅ /lib/planes-limites.ts
✅ /lib/planes-limites-db.ts
✅ /hooks/useLimites.ts
✅ /components/limites/AlertaLimite.tsx
✅ /app/api/planes-config/route.ts
✅ /docs/SISTEMA-LIMITES-PLANES.md
```

---

## 🔀 ALTERNATIVAS EVALUADAS

### **Opción B: Archivo de Configuración JSON** (NO RECOMENDADA)

```typescript
// config/planes-limites.json
{
  "demo": {
    "usuarios_maximo": 1,
    "tarjetas_maximo": 10,
    "parametros_maximo": 2
  },
  "premium": {
    "usuarios_maximo": 10,
    "tarjetas_maximo": 100,
    "parametros_maximo": 10
  }
}
```

#### ✅ Ventajas
- Sin queries a DB
- Más rápido (archivo en memoria)
- Funciona offline

#### ❌ Desventajas
- Cambiar límites requiere redeploy
- No auditable
- No personalizable por negocio
- No escalable

---

### **Opción C: Variables de Entorno** (NO RECOMENDADA)

```env
DEMO_USUARIOS_MAX=1
DEMO_TARJETAS_MAX=10
DEMO_PARAMETROS_MAX=2

PREMIUM_USUARIOS_MAX=10
PREMIUM_TARJETAS_MAX=100
PREMIUM_PARAMETROS_MAX=10
```

#### ✅ Ventajas
- Configuración por ambiente (dev/prod)
- Sin queries DB

#### ❌ Desventajas
- Muy inflexible
- Requiere reiniciar servidor para cambiar
- No permite configuración por negocio
- Difícil de mantener con muchas variables

---

### **Opción D: Hardcoded en Código** (❌ NUNCA USAR)

```typescript
const LIMITS = {
  demo: { usuarios: 1, tarjetas: 10, parametros: 2 },
  premium: { usuarios: 10, tarjetas: 100, parametros: 10 }
};
```

#### ❌ Desventajas
- Cero flexibilidad
- Cambios requieren recompilar
- No escalable
- Mala práctica

---

## 🏆 RECOMENDACIÓN FINAL

### **USAR OPCIÓN A: Tabla `planes_config`** ✅

**Razones:**

1. **Flexibilidad Máxima**: 
   - Administrador de sistema puede cambiar límites en vivo
   - Sin necesidad de redeploy ni reiniciar servidor
   - Cambios inmediatos en producción

2. **Mejor Experiencia de Usuario**:
   - Plan DEMO con usuario alcanza límite → Admin ajusta límite temporalmente
   - Cliente VIP puede tener límites personalizados
   - A/B testing de límites para conversión

3. **Auditoría y Cumplimiento**:
   - Registro de quién cambió qué y cuándo
   - Histórico de configuraciones
   - Trazabilidad completa

4. **Escalabilidad**:
   - Agregar nuevo plan "Empresarial" → 1 INSERT SQL
   - Límites por región geográfica
   - Límites dinámicos según temporada

5. **Sistema de Fallback Robusto**:
   ```typescript
   // Si DB falla, usa configuración hardcoded
   const PLAN_LIMITS_FALLBACK = { demo: {...}, premium: {...} };
   ```

---

## 📋 IMPLEMENTACIÓN PASO A PASO

### Paso 1: Base de Datos (5 minutos)

```bash
# Ejecutar en Supabase SQL Editor
cat supabase/migrations/create_planes_config.sql | psql

# Verificar
SELECT * FROM planes_config;
```

### Paso 2: Wizard - Step 4 (15 minutos)

```tsx
// app/admin/negocios/nuevo/page.tsx
import { useLimitesLocal } from '@/hooks/useLimites';

function StepParametros({ data, onChange }) {
  const plan = formData.plan; // Del Step 1
  const { validarParametros } = useLimitesLocal(plan);
  
  const validacion = validarParametros(data.length);
  
  return (
    <button 
      onClick={handleAgregar}
      disabled={!validacion.permitido}
    >
      Agregar Tarifa
    </button>
  );
}
```

### Paso 3: Módulos Dashboard (20 minutos por módulo)

```tsx
// components/dashboard/configuracion/TarifasTab.tsx
import { useLimites } from '@/hooks/useLimites';
import { AlertaLimite } from '@/components/limites/AlertaLimite';

export default function TarifasTab({ negocioId }) {
  const { validarParametros } = useLimites({ negocioId });
  const validacion = validarParametros(parametros.length);
  
  return (
    <>
      <AlertaLimite validacion={validacion} />
      <button disabled={!validacion.permitido}>
        Agregar
      </button>
    </>
  );
}
```

### Paso 4: API Endpoints (10 minutos)

```tsx
// app/api/parametros/route.ts
import { validarAgregarParametro } from '@/lib/planes-limites-db';

export async function POST(req) {
  const { negocio_id } = await req.json();
  
  const validacion = await validarAgregarParametro(negocio_id);
  
  if (!validacion.permitido) {
    return Response.json({ error: validacion.mensaje }, { status: 403 });
  }
  
  // Continuar con inserción...
}
```

---

## 🎨 DISEÑO DE UI PROPUESTO

### 1. Botones Deshabilitados con Tooltip

```tsx
<div className="relative group">
  <button
    disabled={!validacion.permitido}
    className={`px-4 py-2 rounded-lg ${
      validacion.permitido 
        ? 'bg-green-500 hover:bg-green-600' 
        : 'bg-gray-500 opacity-50 cursor-not-allowed'
    }`}
  >
    Agregar Usuario
  </button>
  
  {!validacion.permitido && (
    <div className="absolute bottom-full mb-2 hidden group-hover:block">
      <div className="bg-red-500/90 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
        {validacion.mensaje}
      </div>
    </div>
  )}
</div>
```

### 2. Badge de Progreso

```tsx
<BadgeLimite 
  actual={usuarios.length} 
  maximo={10}
  showProgress 
/>
```

**Visualización:**
```
┌─────────────────────────────┐
│ [👤] 8 / 10 (80%)           │
│ ████████░░                   │  ← Barra verde→amarilla→roja
└─────────────────────────────┘
```

### 3. Alerta Sticky Superior

```tsx
<AlertaLimite 
  validacion={validacion}
  sticky // Fijo en la parte superior
  onActualizarPlan={() => router.push('/contacto')}
/>
```

**Visualización:**
```
╔════════════════════════════════════════════════════╗
║ ⚠️ Cerca del límite (8/10 usuarios)                ║
║ Considera actualizar tu plan.  [Actualizar Plan] ║
╚════════════════════════════════════════════════════╝
```

### 4. Modal Informativo

```tsx
<ModalLimiteAlcanzado
  open={showModal}
  tipoRecurso="usuarios"
  planActual="demo"
  limiteActual={1}
/>
```

**Visualización:**
```
┌────────────────────────────────┐
│         🚫                     │
│    Límite Alcanzado            │
│                                │
│  Has alcanzado el límite de 1  │
│  usuario(s) en tu plan DEMO    │
│                                │
│  ✨ Actualiza y obtén:         │
│  • Más usuarios                │
│  • Funcionalidades premium     │
│  • Soporte prioritario         │
│                                │
│  [Cerrar] [Contactar Soporte] │
└────────────────────────────────┘
```

---

## 📊 COMPORTAMIENTO POR ESCENARIO

### Escenario 1: Plan DEMO - Agregar 2do Usuario

```
Estado Inicial: 1/1 usuarios
Acción: Click en "Agregar Usuario"
Resultado:
  ✅ Botón deshabilitado
  ✅ Tooltip: "Límite alcanzado (1/1)"
  ✅ Modal informativo se abre
  ❌ No se crea usuario
```

### Escenario 2: Plan DEMO - Agregar 11va Tarjeta

```
Estado Inicial: 10/10 tarjetas
Acción: Click en "Agregar Tarjeta"
Resultado:
  ✅ Botón deshabilitado
  ✅ Alerta roja visible
  ✅ Modal "Contactar para actualizar"
  ❌ No se crea tarjeta
```

### Escenario 3: Plan PREMIUM - Cerca del Límite

```
Estado Inicial: 8/10 usuarios (80%)
Acción: Entrar a Configuración > Usuarios
Resultado:
  ✅ Alerta naranja: "Cerca del límite"
  ✅ Badge: "8/10 (80%)" en amarillo
  ✅ Botón agregar habilitado
  ✅ Botón "Actualizar Plan" visible
```

---

## 🔒 VALIDACIONES EN MÚLTIPLES CAPAS

### Capa 1: UI (Prevención)
```tsx
<button disabled={!validacion.permitido}>
  Agregar
</button>
```
**Objetivo**: Evitar clicks innecesarios

### Capa 2: Client-Side (Hook)
```tsx
const validacion = validarUsuarios(usuarios.length);
if (!validacion.permitido) {
  alert(validacion.mensaje);
  return;
}
```
**Objetivo**: Feedback inmediato

### Capa 3: Server-Side API (Seguridad)
```tsx
const validacion = await validarAgregarUsuario(negocioId);
if (!validacion.permitido) {
  return Response.json({ error: 'Límite alcanzado' }, { status: 403 });
}
```
**Objetivo**: Evitar bypass de validación

### Capa 4: Database (Último recurso)
```sql
CREATE FUNCTION validar_limite_usuarios()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM usuarios WHERE negocio_id = NEW.negocio_id) >= 
     (SELECT usuarios_maximo FROM planes_config pc JOIN negocios n ON n.plan = pc.plan_tipo WHERE n.id = NEW.negocio_id)
  THEN
    RAISE EXCEPTION 'Límite de usuarios alcanzado';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```
**Objetivo**: Garantía a nivel de datos

---

## 💰 CONSIDERACIONES DE NEGOCIO

### Estrategia de Conversión

```typescript
// Cuando alcanza 80% del límite
if (validacion.cerca_limite) {
  mostrarBanner({
    mensaje: "¿Necesitas más espacio?",
    cta: "Actualizar a Premium - 50% OFF",
    urgencia: "Oferta válida hoy"
  });
}
```

### Límites Flexibles para Onboarding

```typescript
// Primeros 7 días: límites relajados
const diasDesdeCreacion = differenceInDays(new Date(), negocio.fecha_creacion);

if (diasDesdeCreacion <= 7) {
  limite_usuarios += 2; // Demo: 1→3, Premium: 10→12
}
```

### Agregar Plan Intermedio "BÁSICO"

```sql
INSERT INTO planes_config (
  plan_tipo, 
  usuarios_maximo, 
  tarjetas_maximo, 
  parametros_maximo
) VALUES (
  'basica',
  5,    -- Entre demo (1) y premium (10)
  50,   -- Entre demo (10) y premium (100)
  5     -- Entre demo (2) y premium (10)
);
```

---

## 📈 MÉTRICAS A MONITOREAR

### Dashboard Admin

```sql
-- Negocios cerca del límite (potenciales upgrades)
SELECT 
  n.nombre,
  n.plan,
  COUNT(u.id) as usuarios_actuales,
  pc.usuarios_maximo,
  ROUND(COUNT(u.id)::float / pc.usuarios_maximo * 100) as porcentaje_uso
FROM negocios n
JOIN usuarios u ON u.negocio_id = n.id
JOIN planes_config pc ON pc.plan_tipo = n.plan
GROUP BY n.id, pc.usuarios_maximo
HAVING ROUND(COUNT(u.id)::float / pc.usuarios_maximo * 100) >= 80
ORDER BY porcentaje_uso DESC;
```

### Notificaciones Automáticas

```typescript
// Enviar email cuando alcanza 90%
if (porcentajeUso >= 90) {
  enviarEmail({
    to: negocio.email,
    subject: `Cerca del límite de ${tipoRecurso}`,
    template: 'limite-cercano',
    data: { actual, maximo, planActual }
  });
}
```

---

## ✅ PRÓXIMOS PASOS

### Inmediato (Hoy)
1. ✅ Ejecutar migración SQL → 5 min
2. ✅ Probar lectura de tabla `planes_config` → 2 min
3. ✅ Implementar validación en wizard Step 4 → 15 min

### Corto Plazo (Esta Semana)
4. ⏳ Implementar en módulo Usuarios → 30 min
5. ⏳ Implementar en módulo Tarjetas → 30 min
6. ⏳ Implementar en módulo Tarifas → 30 min
7. ⏳ Agregar alertas visuales → 20 min

### Mediano Plazo (Próximas 2 Semanas)
8. ⏳ Validaciones server-side en APIs → 1 hora
9. ⏳ Panel admin para modificar límites → 2 horas
10. ⏳ Sistema de notificaciones automáticas → 1 hora
11. ⏳ Métricas y dashboard de uso → 1 hora

### Largo Plazo (Próximo Mes)
12. ⏳ A/B testing de límites para conversión
13. ⏳ Plan "Básico" intermedio
14. ⏳ Límites dinámicos por región
15. ⏳ Sistema de créditos/excedentes

---

## 📞 CONTACTO Y SOPORTE

**Documentación Completa**: `/docs/SISTEMA-LIMITES-PLANES.md`  
**Ejemplos Prácticos**: En el mismo archivo  
**API Reference**: Incluida en documentación  

---

**🎯 CONCLUSIÓN: Usa la Opción A (Tabla `planes_config`) para máxima flexibilidad, escalabilidad y mejor experiencia de usuario.**
