# Ejemplos de Uso - Sistema de Licencias

## 📱 Integración en NextJS

### 1. Verificar licencia al cargar el dashboard

```typescript
// app/dashboard/page.tsx
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = createServerClient();
  const negocioId = cookies().get("mp_negocio_id")?.value;

  // Verificar si la licencia está activa
  const { data: licenciaActiva } = await supabase
    .rpc('is_licencia_activa', { negocio_uuid: negocioId });

  if (!licenciaActiva) {
    // Redirigir a página de licencia expirada
    redirect('/licencia-expirada');
  }

  // Obtener días restantes (para mostrar advertencia)
  const { data: diasRestantes } = await supabase
    .rpc('get_dias_restantes_licencia', { negocio_uuid: negocioId });

  // Resto del código...
}
```

### 2. Mostrar información de licencia en el dashboard

```typescript
// components/dashboard/LicenseWarning.tsx
"use client";

interface LicenseWarningProps {
  plan: 'demo' | 'basica' | 'premium';
  diasRestantes: number | null;
}

export function LicenseWarning({ plan, diasRestantes }: LicenseWarningProps) {
  if (plan !== 'demo' || diasRestantes === null) {
    return null; // No mostrar nada para planes sin vencimiento
  }

  const isUrgent = diasRestantes <= 7;
  const isCritical = diasRestantes <= 3;

  return (
    <div className={`rounded-2xl border p-4 ${
      isCritical 
        ? 'border-red-400/40 bg-red-500/20 text-red-200'
        : isUrgent 
          ? 'border-amber-400/40 bg-amber-500/20 text-amber-200'
          : 'border-blue-400/40 bg-blue-500/20 text-blue-200'
    }`}>
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5" />
        <div>
          <p className="font-semibold">
            {isCritical 
              ? '¡Licencia por expirar!'
              : isUrgent
                ? 'Tu licencia expira pronto'
                : 'Licencia Demo activa'
            }
          </p>
          <p className="text-sm">
            {diasRestantes === 0 
              ? 'Expira hoy'
              : diasRestantes === 1
                ? 'Expira mañana'
                : `${diasRestantes} días restantes`
            }
          </p>
        </div>
        <button className="ml-auto rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20">
          Actualizar Plan
        </button>
      </div>
    </div>
  );
}
```

### 3. Validar límite de tarjetas antes de crear

```typescript
// app/api/configuracion/tarjetas/route.ts
export async function POST(request: Request) {
  const supabase = createServerClient();
  const negocioId = cookies().get("mp_negocio_id")?.value;

  // Obtener información del negocio
  const { data: negocio } = await supabase
    .from('negocios')
    .select('limite_tarjetas')
    .eq('id', negocioId)
    .single();

  // Contar tarjetas activas
  const { count: tarjetasActivas } = await supabase
    .from('tarjetas')
    .select('id', { count: 'exact', head: true })
    .eq('negocio_id', negocioId)
    .eq('estado', '1');

  // Validar límite
  if (tarjetasActivas >= negocio.limite_tarjetas) {
    return NextResponse.json(
      { 
        message: `Límite de tarjetas alcanzado (${negocio.limite_tarjetas}). Actualice su plan para agregar más.` 
      },
      { status: 403 }
    );
  }

  // Continuar con la creación...
}
```

### 4. Middleware para verificar licencia en todas las rutas

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function middleware(request: NextRequest) {
  const supabase = createServerClient();
  const negocioId = request.cookies.get('mp_negocio_id')?.value;

  if (!negocioId) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verificar licencia solo en rutas del dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const { data: licenciaActiva } = await supabase
      .rpc('is_licencia_activa', { negocio_uuid: negocioId });

    if (!licenciaActiva) {
      return NextResponse.redirect(new URL('/licencia-expirada', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};
```

### 5. Página de licencia expirada

```typescript
// app/licencia-expirada/page.tsx
import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export default async function LicenciaExpiradaPage() {
  const supabase = createServerClient();
  const negocioId = cookies().get("mp_negocio_id")?.value;

  const { data: negocio } = await supabase
    .from('negocios')
    .select('nombre, plan, fecha_expiracion')
    .eq('id', negocioId)
    .single();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
      <div className="max-w-md rounded-3xl border border-red-400/30 bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-8 text-center shadow-2xl">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full border-4 border-red-400/30 bg-red-500/20 p-4">
            <LockIcon className="h-12 w-12 text-red-400" />
          </div>
        </div>
        
        <h1 className="mb-4 text-2xl font-bold text-white">
          Licencia Expirada
        </h1>
        
        <p className="mb-6 text-blue-200/70">
          Tu período de prueba de 30 días ha finalizado para <strong>{negocio?.nombre}</strong>.
        </p>

        <div className="mb-6 space-y-3">
          <PlanCard 
            name="Plan Básico"
            price="$XX/mes"
            features={['50 tarjetas', '50 espacios', 'Sin vencimiento']}
          />
          <PlanCard 
            name="Plan Premium"
            price="$XX/mes"
            features={['100 tarjetas', '100 espacios', 'Sin vencimiento', 'Soporte prioritario']}
          />
        </div>

        <button className="w-full rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/30 to-green-600/30 px-6 py-3 font-semibold text-white backdrop-blur-xl transition hover:from-emerald-500/50 hover:to-green-600/50">
          Actualizar Ahora
        </button>
      </div>
    </div>
  );
}
```

## 🔔 Notificaciones Automáticas

### Job de notificación por email (ejecutar diariamente)

```typescript
// scripts/check-expiring-licenses.ts
import { createClient } from '@supabase/supabase-js';

async function checkExpiringLicenses() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  // Obtener negocios que expiran en 7 días o menos
  const { data: negociosExpirando } = await supabase
    .from('vista_licencias')
    .select('*')
    .not('dias_restantes', 'is', null)
    .lte('dias_restantes', 7)
    .gt('dias_restantes', 0)
    .eq('estado', 'activo');

  for (const negocio of negociosExpirando) {
    // Enviar email de notificación
    await sendExpirationEmail({
      to: negocio.email,
      subject: `Tu licencia expira en ${negocio.dias_restantes} días`,
      negocioNombre: negocio.nombre,
      diasRestantes: negocio.dias_restantes,
      fechaExpiracion: negocio.fecha_expiracion
    });
  }

  console.log(`Enviadas ${negociosExpirando.length} notificaciones de expiración`);
}
```

### Cron job para suspender licencias expiradas

```typescript
// scripts/suspend-expired-licenses.ts
async function suspendExpiredLicenses() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  // El trigger ya hace esto automáticamente, pero puedes ejecutar manualmente:
  const { data: negociosExpirados } = await supabase
    .from('negocios')
    .update({ estado: 'suspendido' })
    .lt('fecha_expiracion', new Date().toISOString())
    .eq('plan', 'demo')
    .eq('estado', 'activo')
    .select();

  console.log(`Suspendidos ${negociosExpirados?.length} negocios por expiración`);
}
```

## 📊 Reportes y Estadísticas

### Dashboard de administración

```typescript
// app/admin/licencias/page.tsx
export default async function LicenciasAdminPage() {
  const supabase = createServerClient();

  // Estadísticas generales
  const { data: stats } = await supabase
    .from('vista_licencias')
    .select('plan, estado_licencia')
    .then(result => {
      const data = result.data || [];
      return {
        total: data.length,
        demo: data.filter(n => n.plan === 'demo').length,
        basica: data.filter(n => n.plan === 'basica').length,
        premium: data.filter(n => n.plan === 'premium').length,
        activas: data.filter(n => n.estado_licencia === 'Activa').length,
        expiradas: data.filter(n => n.estado_licencia === 'Expirada').length
      };
    });

  return (
    <div>
      <h1>Panel de Licencias</h1>
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard title="Total Negocios" value={stats.total} />
        <StatCard title="Plan Demo" value={stats.demo} />
        <StatCard title="Plan Básica" value={stats.basica} />
        <StatCard title="Plan Premium" value={stats.premium} />
      </div>
      {/* Lista de licencias... */}
    </div>
  );
}
```

## 🧪 Tests

```typescript
// __tests__/licencias.test.ts
describe('Sistema de Licencias', () => {
  it('debería crear un negocio Demo con 30 días de expiración', async () => {
    const negocio = await crearNegocio({ plan: 'demo' });
    const diasRestantes = await getDiasRestantes(negocio.id);
    expect(diasRestantes).toBeGreaterThanOrEqual(29);
    expect(diasRestantes).toBeLessThanOrEqual(30);
  });

  it('no debería permitir crear más tarjetas que el límite', async () => {
    const negocio = await crearNegocio({ plan: 'demo', limite_tarjetas: 10 });
    // Crear 10 tarjetas
    for (let i = 0; i < 10; i++) {
      await crearTarjeta(negocio.id);
    }
    // Intentar crear la 11ava debería fallar
    await expect(crearTarjeta(negocio.id)).rejects.toThrow('Límite alcanzado');
  });

  it('debería suspender automáticamente un negocio Demo expirado', async () => {
    const negocio = await crearNegocio({ 
      plan: 'demo',
      fecha_expiracion: new Date(Date.now() - 1000) // 1 segundo atrás
    });
    const licenciaActiva = await isLicenciaActiva(negocio.id);
    expect(licenciaActiva).toBe(false);
  });
});
```

---

Con estos ejemplos puedes integrar completamente el sistema de licencias en tu aplicación. 🚀
