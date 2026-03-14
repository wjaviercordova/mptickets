# 🚀 Guía de Implementación MPTickets Admin

Esta guía te llevará paso a paso por la implementación completa del panel de administración.

---

## 📋 Tabla de Contenidos

1. [Fase 0: Preparación](#fase-0-preparación)
2. [Fase 1: Base de Datos](#fase-1-base-de-datos)
3. [Fase 2: Autenticación](#fase-2-autenticación)
4. [Fase 3: Layout y Dashboard](#fase-3-layout-y-dashboard)
5. [Fase 4: CRUD de Negocios](#fase-4-crud-de-negocios)
6. [Fase 5: Sistema de Plantillas](#fase-5-sistema-de-plantillas)
7. [Fase 6: Gestión de Licencias](#fase-6-gestión-de-licencias)
8. [Fase 7: Testing](#fase-7-testing)

---

## Fase 0: Preparación

### ✅ Checklist Previo

- [ ] Tener acceso a Supabase
- [ ] Proyecto MPTickets funcionando correctamente
- [ ] Git configurado con repositorio remoto
- [ ] Entorno de desarrollo configurado

### 📦 Archivos de Configuración Ya Creados

```
✅ /docs/admin/MPTICKETS_ADMIN_ARCHITECTURE.md
✅ /docs/admin/API_REFERENCE.md
✅ /types/admin.ts
✅ /lib/utils/plan-config.ts
✅ /lib/admin/templates.ts
✅ /supabase/migrations/create_admin_users.sql
```

---

## Fase 1: Base de Datos

### Paso 1.1: Generar Hash de Contraseña

```bash
# En tu terminal, dentro del proyecto
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Admin@2024', 10).then(hash => console.log(hash));"
```

**Resultado esperado:**
```
$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOP
```

Copia este hash, lo necesitarás en el siguiente paso.

### Paso 1.2: Ejecutar Migration en Supabase

1. Abre Supabase Dashboard
2. Ve a **SQL Editor**
3. Abre el archivo `/supabase/migrations/create_admin_users.sql`
4. **IMPORTANTE**: Reemplaza la línea:
   ```sql
   password VARCHAR NOT NULL,
   ```
   Con el hash generado en Paso 1.1:
   ```sql
   '$2a$10$tuHashGeneradoAqui',
   ```

5. Ejecuta el script completo
6. Verifica que se creó la tabla:
   ```sql
   SELECT * FROM admin_users;
   ```

**Resultado esperado:**
```
✅ Tabla admin_users creada
✅ Índices creados
✅ Triggers configurados
✅ Función get_admin_dashboard_stats() creada
✅ Usuario superadmin insertado
```

### Paso 1.3: Verificar Estructura

```sql
-- Verificar columnas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admin_users';

-- Verificar usuario
SELECT usuario, nombre, email, rol, estado 
FROM admin_users 
WHERE usuario = 'superadmin';
```

✅ **Fase 1 completada** - Base de datos lista

---

## Fase 2: Autenticación

### Paso 2.1: Crear Cliente Supabase para Admin

**Archivo:** `/lib/supabase/admin-client.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

// Cliente para operaciones de administrador
// Usa Service Role Key para bypasear RLS
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ⚠️ Solo usar en server-side
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Cliente para uso desde componentes (frontend)
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Paso 2.2: Crear Funciones de Autenticación

**Archivo:** `/lib/admin/auth.ts`

```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase/admin-client';
import type { AdminUser } from '@/types/admin';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface LoginResult {
  success: boolean;
  user?: Omit<AdminUser, 'password'>;
  token?: string;
  error?: string;
}

/**
 * Autentica un administrador
 */
export async function loginAdmin(
  usuario: string,
  password: string
): Promise<LoginResult> {
  try {
    // 1. Buscar usuario admin
    const { data: adminUser, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('usuario', usuario)
      .eq('estado', '1')
      .single();

    if (error || !adminUser) {
      return {
        success: false,
        error: 'Usuario o contraseña incorrectos'
      };
    }

    // 2. Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, adminUser.password);

    if (!passwordMatch) {
      return {
        success: false,
        error: 'Usuario o contraseña incorrectos'
      };
    }

    // 3. Actualizar último acceso
    await supabaseAdmin
      .from('admin_users')
      .update({
        ultimo_acceso: new Date().toISOString()
      })
      .eq('id', adminUser.id);

    // 4. Generar token JWT
    const token = jwt.sign(
      {
        id: adminUser.id,
        usuario: adminUser.usuario,
        rol: adminUser.rol
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // 5. Retornar usuario sin password
    const { password: _, ...userWithoutPassword } = adminUser;

    return {
      success: true,
      user: userWithoutPassword,
      token
    };
  } catch (error) {
    console.error('Error en loginAdmin:', error);
    return {
      success: false,
      error: 'Error al autenticar'
    };
  }
}

/**
 * Verifica un token JWT
 */
export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Verificar que el usuario sigue activo
    const { data: user } = await supabaseAdmin
      .from('admin_users')
      .select('estado')
      .eq('id', decoded.id)
      .single();

    return user?.estado === '1';
  } catch (error) {
    return false;
  }
}

/**
 * Obtiene datos del usuario desde el token
 */
export async function getAdminFromToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const { data: user } = await supabaseAdmin
      .from('admin_users')
      .select('id, usuario, nombre, email, rol')
      .eq('id', decoded.id)
      .single();

    return user;
  } catch (error) {
    return null;
  }
}
```

### Paso 2.3: Crear API Route de Login

**Archivo:** `/app/api/admin/auth/login/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { loginAdmin } from '@/lib/admin/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { usuario, password } = await request.json();

    // Validar datos
    if (!usuario || !password) {
      return NextResponse.json(
        { success: false, error: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Autenticar
    const result = await loginAdmin(usuario, password);

    if (!result.success) {
      return NextResponse.json(result, { status: 401 });
    }

    // Crear cookie con el token
    cookies().set('admin_session', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8 // 8 horas
    });

    return NextResponse.json({
      success: true,
      user: result.user
    });
  } catch (error) {
    console.error('Error en POST /api/admin/auth/login:', error);
    return NextResponse.json(
      { success: false, error: 'Error del servidor' },
      { status: 500 }
    );
  }
}
```

### Paso 2.4: Crear Middleware de Protección

**Archivo:** `/middleware.ts` (actualizar el existente)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminToken } from '@/lib/admin/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ========================================
  // PROTECCIÓN RUTAS ADMIN
  // ========================================
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminSession = request.cookies.get('admin_session');

    if (!adminSession) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Verificar token
    const isValid = await verifyAdminToken(adminSession.value);
    if (!isValid) {
      // Token inválido, eliminar cookie y redirigir
      const response = NextResponse.redirect(
        new URL('/admin/login', request.url)
      );
      response.cookies.delete('admin_session');
      return response;
    }
  }

  // ========================================
  // PROTECCIÓN RUTAS NORMALES (ya existente)
  // ========================================
  if (pathname.startsWith('/dashboard')) {
    // Tu lógica existente para dashboard normal
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
};
```

### Paso 2.5: Crear Página de Login Admin

**Archivo:** `/app/admin/login/page.tsx`

Ver código completo en la siguiente sección...

✅ **Fase 2 completada** - Autenticación configurada

---

## Fase 3: Layout y Dashboard

### Paso 3.1: Crear Layout Admin

**Archivo:** `/app/admin/layout.tsx`

### Paso 3.2: Crear Sidebar Admin

**Archivo:** `/components/admin/Sidebar.tsx`

### Paso 3.3: Crear Navbar Admin

**Archivo:** `/components/admin/Navbar.tsx`

### Paso 3.4: Crear Dashboard Stats

**Archivo:** `/components/admin/DashboardStats.tsx`

### Paso 3.5: Crear Página Principal Admin

**Archivo:** `/app/admin/page.tsx`

✅ **Fase 3 completada** - Layout y dashboard funcionales

---

## Fase 4: CRUD de Negocios

### Paso 4.1: Crear Funciones CRUD

**Archivo:** `/lib/admin/negocios.ts`

### Paso 4.2: Crear API Routes

**Archivos:**
- `/app/api/admin/negocios/route.ts` (GET, POST)
- `/app/api/admin/negocios/[id]/route.ts` (GET, PATCH, DELETE)

### Paso 4.3: Crear Lista de Negocios

**Archivo:** `/app/admin/negocios/page.tsx`

### Paso 4.4: Crear Wizard de Creación

**Archivo:** `/app/admin/negocios/nuevo/page.tsx`

✅ **Fase 4 completada** - CRUD de negocios funcional

---

## Fase 5: Sistema de Plantillas

### Paso 5.1: Crear Funciones de Seed

**Archivo:** `/lib/admin/seeds.ts`

### Paso 5.2: Crear API de Seed

**Archivo:** `/app/api/admin/negocios/[id]/seed/route.ts`

### Paso 5.3: Integrar con Wizard

Actualizar wizard para ejecutar seeds automáticamente.

✅ **Fase 5 completada** - Seeds automáticos configurados

---

## Fase 6: Gestión de Licencias

### Paso 6.1: Crear Funciones de Licencias

**Archivo:** `/lib/admin/licencias.ts`

### Paso 6.2: Crear API Routes

**Archivos:**
- `/app/api/admin/licencias/route.ts`
- `/app/api/admin/licencias/[id]/route.ts`

### Paso 6.3: Crear Página de Licencias

**Archivo:** `/app/admin/licencias/page.tsx`

✅ **Fase 6 completada** - Gestión de licencias funcional

---

## Fase 7: Testing

### Paso 7.1: Testing Manual

1. **Login Admin:**
   - Usuario: `superadmin`
   - Password: `Admin@2024`
   - Verificar redirección a `/admin`

2. **Crear Negocio DEMO:**
   - Completar wizard
   - Verificar creación en Supabase
   - Verificar seeds creados

3. **Cambiar Plan a PREMIUM:**
   - Seleccionar negocio DEMO
   - Cambiar a PREMIUM
   - Verificar límites actualizados

4. **Cambiar Contraseña de Admin:**
   - Seleccionar negocio
   - Cambiar password
   - Intentar login con nueva contraseña

### Paso 7.2: Testing de Validaciones

- [ ] Código de negocio duplicado
- [ ] Email duplicado
- [ ] Usuario admin duplicado
- [ ] Licencia expirada
- [ ] Límites de plan alcanzados

### Paso 7.3: Testing de Seguridad

- [ ] Acceso sin autenticación → Redirigir
- [ ] Token expirado → Cerrar sesión
- [ ] Usuario inactivo → No puede login

✅ **Fase 7 completada** - Sistema testeado

---

## 🎯 Resultado Final

Al completar esta guía, tendrás:

- ✅ Panel de administración completamente funcional
- ✅ Sistema de autenticación separado
- ✅ CRUD completo de negocios
- ✅ Gestión de licencias DEMO/PREMIUM
- ✅ Seeds automáticos de datos iniciales
- ✅ Dashboard con métricas en tiempo real

---

## 📚 Recursos Adicionales

- [Documentación Arquitectura](./MPTICKETS_ADMIN_ARCHITECTURE.md)
- [API Reference](./API_REFERENCE.md)
- [Types Reference](../../types/admin.ts)

---

## 💡 Comandos Útiles

```bash
# Instalar dependencias
npm install bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken

# Generar hash de contraseña
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('TuPassword', 10).then(hash => console.log(hash));"

# Verificar estructura de base de datos
psql -h [host] -U [usuario] -d [database] -c "\d admin_users"

# Ejecutar proyecto
npm run dev
```

---

## ⚠️ Notas Importantes

1. **JWT_SECRET**: Genera uno seguro en producción:
   ```bash
   openssl rand -base64 32
   ```

2. **Service Role Key**: Nunca expongas esta key en el frontend.

3. **Passwords**: Siempre usar bcrypt con al menos 10 rounds.

4. **Backup**: Hacer backup antes de ejecutar migrations.

---

¿Listo para comenzar? Ve a **Fase 1** y sigue los pasos! 🚀
