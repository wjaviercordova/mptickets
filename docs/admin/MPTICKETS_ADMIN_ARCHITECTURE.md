# 🔐 MPTickets Admin - Arquitectura Multi-Tenant

## 📋 Resumen Ejecutivo

**MPTickets Admin** es el panel de administración principal que permite gestionar la plataforma multi-tenant de MPTickets. Este sistema permite al **Administrador General** crear, configurar y gestionar negocios de parqueaderos con diferentes planes de licencia.

### Características Principales
- ✅ Autenticación separada para administradores
- ✅ CRUD completo de negocios
- ✅ Gestión de licencias (DEMO/PREMIUM)
- ✅ Sistema de plantillas automáticas
- ✅ Cambio de contraseñas de administradores de negocio
- ✅ Dashboard con métricas de la plataforma
- ✅ Diseño moderno con glassmorphism (consistente con la app)

---

## 🏗️ Arquitectura General

### Diagrama de Flujo de Autenticación

```
┌─────────────────────────────────────────────────────────────┐
│                    MPTickets Ecosystem                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐           ┌──────────────────┐        │
│  │  Login Normal    │           │  Login Admin     │        │
│  │  /login          │           │  /admin/login    │        │
│  │  (Negocios)      │           │  (Superadmin)    │        │
│  └────────┬─────────┘           └────────┬─────────┘        │
│           │                              │                   │
│           │ usuario: admin               │ usuario: superadmin│
│           │ codigo: mp01                 │ password: ****    │
│           │                              │                   │
│           ▼                              ▼                   │
│  ┌──────────────────┐           ┌──────────────────┐        │
│  │  Dashboard       │           │  Admin Dashboard │        │
│  │  /dashboard      │           │  /admin          │        │
│  │  (Operaciones)   │           │  (Gestión)       │        │
│  └──────────────────┘           └──────────────────┘        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Separación de Contextos

| Aspecto | Dashboard Normal | Admin Dashboard |
|---------|-----------------|-----------------|
| **Ruta Base** | `/dashboard` | `/admin` |
| **Login** | `/` (page.tsx) | `/admin/login` |
| **Usuario** | Usuarios de negocios | Superadmin |
| **Base de Datos** | `usuarios` table | `admin_users` table |
| **Permisos** | Por negocio | Plataforma completa |
| **Middleware** | `negocio_id` required | `is_superadmin` required |
| **Diseño** | Glassmorphism oscuro | Glassmorphism oscuro (mismo estilo) |

---

## 🗄️ Estructura de Base de Datos

### Nueva Tabla: `admin_users`

```sql
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  usuario VARCHAR NOT NULL UNIQUE,
  nombre VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  password VARCHAR NOT NULL,
  rol VARCHAR DEFAULT 'superadmin' CHECK (
    rol IN ('superadmin', 'admin_support')
  ),
  estado VARCHAR(1) DEFAULT '1' CHECK (estado IN ('0', '1')),
  ultimo_acceso TIMESTAMP WITH TIME ZONE,
  ip_ultimo_acceso INET,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT admin_users_pkey PRIMARY KEY (id)
);

-- Índices
CREATE INDEX idx_admin_users_usuario ON public.admin_users(usuario);
CREATE INDEX idx_admin_users_email ON public.admin_users(email);
CREATE INDEX idx_admin_users_estado ON public.admin_users(estado);

-- Usuario inicial (password: Admin@2024)
INSERT INTO public.admin_users (usuario, nombre, email, password, rol)
VALUES (
  'superadmin',
  'Administrador MPTickets',
  'admin@mptickets.com',
  '$2a$10$YourHashedPasswordHere',  -- Debe ser hasheado con bcrypt
  'superadmin'
);
```

### Tablas Existentes Utilizadas

#### 1. `negocios` (Tabla principal)
```sql
-- Campos relevantes para el Admin
id UUID PRIMARY KEY
nombre VARCHAR NOT NULL
codigo VARCHAR(20) UNIQUE
email VARCHAR UNIQUE
plan VARCHAR CHECK (plan IN ('demo', 'basica', 'premium'))
estado VARCHAR CHECK (estado IN ('activo', 'inactivo', 'suspendido'))
fecha_creacion TIMESTAMP
fecha_expiracion TIMESTAMP
configuracion JSONB
limite_usuarios INTEGER
limite_tarjetas INTEGER
capacidad_maxima INTEGER
```

#### 2. `configuracion_sistema` (30 registros por negocio)
```sql
id UUID PRIMARY KEY
negocio_id UUID REFERENCES negocios(id)
clave VARCHAR
valor TEXT
tipo VARCHAR CHECK (tipo IN ('string', 'number', 'boolean', 'json'))
categoria VARCHAR
descripcion TEXT
```

#### 3. `usuarios` (Admin inicial por negocio)
```sql
id UUID PRIMARY KEY
negocio_id UUID REFERENCES negocios(id)
usuario VARCHAR
nombre VARCHAR
password VARCHAR
rol VARCHAR CHECK (rol IN ('admin', 'operador', 'visor'))
```

#### 4. `vista_licencias` (Vista consolidada)
```sql
-- Ya existe, se utiliza para métricas
SELECT * FROM vista_licencias;
```

---

## 🎨 Estructura de Rutas y Archivos

```
mptickets/
├── app/
│   ├── admin/                          # 🆕 NUEVA CARPETA
│   │   ├── login/
│   │   │   └── page.tsx               # Login para superadmin
│   │   ├── layout.tsx                  # Layout admin (Sidebar + Navbar)
│   │   ├── page.tsx                    # Dashboard principal admin
│   │   ├── negocios/
│   │   │   ├── page.tsx               # Lista de negocios
│   │   │   ├── nuevo/
│   │   │   │   └── page.tsx           # Crear negocio (Wizard)
│   │   │   └── [id]/
│   │   │       ├── page.tsx           # Ver/Editar negocio
│   │   │       └── editar/
│   │   │           └── page.tsx       # Editar negocio
│   │   ├── licencias/
│   │   │   ├── page.tsx               # Gestión de licencias
│   │   │   └── renovar/
│   │   │       └── page.tsx           # Renovar licencias
│   │   ├── usuarios/
│   │   │   └── page.tsx               # Gestión usuarios admin
│   │   └── reportes/
│   │       └── page.tsx               # Reportes de plataforma
│   ├── api/
│   │   └── admin/
│   │       ├── auth/
│   │       │   ├── login/
│   │       │   │   └── route.ts       # POST: Login admin
│   │       │   └── logout/
│   │       │       └── route.ts       # POST: Logout admin
│   │       ├── negocios/
│   │       │   ├── route.ts           # GET: Listar, POST: Crear
│   │       │   ├── [id]/
│   │       │   │   └── route.ts       # GET, PATCH, DELETE
│   │       │   └── seed/
│   │       │       └── route.ts       # POST: Seed datos iniciales
│   │       ├── licencias/
│   │       │   ├── route.ts           # GET: Lista licencias
│   │       │   └── [id]/
│   │       │       └── route.ts       # PATCH: Actualizar licencia
│   │       └── stats/
│   │           └── route.ts           # GET: Estadísticas plataforma
├── components/
│   └── admin/                          # 🆕 NUEVOS COMPONENTES
│       ├── Sidebar.tsx                 # Menú lateral admin
│       ├── Navbar.tsx                  # Navbar superior admin
│       ├── DashboardStats.tsx          # Estadísticas plataforma
│       ├── NegociosList.tsx            # Lista de negocios
│       ├── NegocioCard.tsx             # Card individual negocio
│       ├── NegocioForm.tsx             # Formulario crear/editar
│       ├── LicenciaManager.tsx         # Gestor de licencias
│       └── PasswordChangeModal.tsx     # Modal cambio contraseña
├── lib/
│   ├── supabase/
│   │   └── admin-client.ts             # Cliente Supabase para admin
│   ├── admin/
│   │   ├── auth.ts                     # Funciones autenticación admin
│   │   ├── negocios.ts                 # CRUD negocios
│   │   ├── templates.ts                # Plantillas configuración
│   │   └── seeds.ts                    # Seeds iniciales
│   └── utils/
│       └── plan-config.ts              # Configuración planes DEMO/PREMIUM
├── middleware-admin.ts                 # Middleware protección rutas admin
└── types/
    └── admin.ts                        # Types TypeScript para admin
```

---

## 🔐 Sistema de Autenticación Admin

### Flujo de Login Admin

```typescript
// 1. Usuario accede a /admin/login
// 2. Ingresa credenciales (usuario: superadmin, password)
// 3. POST /api/admin/auth/login
// 4. Validación contra tabla admin_users
// 5. Genera token JWT con rol 'superadmin'
// 6. Cookie httpOnly: admin_session
// 7. Redirección a /admin
```

### Middleware de Protección

```typescript
// middleware-admin.ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Proteger rutas /admin/* excepto /admin/login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminSession = request.cookies.get('admin_session');
    
    if (!adminSession) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    // Verificar token JWT y rol superadmin
    const isValid = await verifyAdminToken(adminSession.value);
    if (!isValid) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}
```

---

## 📦 Planes de Licencia

### Plan DEMO (30 días)

```typescript
export const PLAN_DEMO = {
  plan: 'DEMO',
  duracion_dias: 30,
  configuracion: {
    tema: 'moderno',
    idioma: 'es',
    moneda: 'USD',
    formato_hora: '24h',
    zona_horaria: 'America/Guayaquil',
    formato_fecha: 'DD/MM/YYYY'
  },
  limites: {
    usuarios: 1,
    tarjetas: 10,
    capacidad_maxima: 10
  },
  estado: 'activo',
  fecha_expiracion: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
};
```

### Plan PREMIUM (Sin límite)

```typescript
export const PLAN_PREMIUM = {
  plan: 'PREMIUM',
  duracion_dias: null, // Sin vencimiento
  configuracion: {
    tema: 'moderno',
    idioma: 'es',
    moneda: 'USD',
    formato_hora: '24h',
    zona_horaria: 'America/Guayaquil',
    formato_fecha: 'DD/MM/YYYY'
  },
  limites: {
    usuarios: 10,
    tarjetas: 100,
    capacidad_maxima: 100
  },
  estado: 'activo',
  fecha_expiracion: null // Sin vencimiento
};
```

---

## 🛠️ Sistema de Creación de Negocios

### Flujo Completo (Wizard Multi-Step)

```
┌────────────────────────────────────────────────────────┐
│           WIZARD CREAR NUEVO NEGOCIO                    │
├────────────────────────────────────────────────────────┤
│                                                          │
│  PASO 1: Información Básica                             │
│  ┌────────────────────────────────────────────────┐    │
│  │  • Nombre del negocio                          │    │
│  │  • Código de negocio (mp02, mp03, etc.)       │    │
│  │  • Email                                        │    │
│  │  • Teléfono                                     │    │
│  │  • Dirección                                    │    │
│  │  • Ciudad                                       │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  PASO 2: Configuración de Licencia                     │
│  ┌────────────────────────────────────────────────┐    │
│  │  • Tipo de Plan: ⚪ DEMO    ⚪ PREMIUM        │    │
│  │                                                 │    │
│  │  Si DEMO:                                       │    │
│  │    - Fecha expiración: [Auto: +30 días]        │    │
│  │    - Límite usuarios: 1                         │    │
│  │    - Límite tarjetas: 10                        │    │
│  │    - Capacidad máxima: 10                       │    │
│  │                                                 │    │
│  │  Si PREMIUM:                                    │    │
│  │    - Sin fecha expiración                       │    │
│  │    - Límite usuarios: 10                        │    │
│  │    - Límite tarjetas: 100                       │    │
│  │    - Capacidad máxima: 100                      │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  PASO 3: Usuario Administrador Inicial                 │
│  ┌────────────────────────────────────────────────┐    │
│  │  • Usuario: [admin] (default)                  │    │
│  │  • Contraseña temporal: [generada]             │    │
│  │  • Nombre completo: ___________________        │    │
│  │  • Email admin: ___________________            │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  PASO 4: Confirmación y Creación                       │
│  ┌────────────────────────────────────────────────┐    │
│  │  Resumen de configuración:                     │    │
│  │  ✓ Negocio: Mipartking 2                       │    │
│  │  ✓ Código: mp02                                │    │
│  │  ✓ Plan: DEMO (30 días)                        │    │
│  │  ✓ Usuario admin: admin                        │    │
│  │  ✓ Contraseña: Temp@123! (temporal)            │    │
│  │                                                 │    │
│  │  [CREAR NEGOCIO] [CANCELAR]                    │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└────────────────────────────────────────────────────────┘
```

### Proceso Interno de Creación

```typescript
async function crearNegocio(data: NegocioFormData) {
  // PASO 1: Crear registro en tabla negocios
  const negocio = await crearRegistroNegocio(data);
  const negocio_id = negocio.id;
  
  // PASO 2: Crear usuario administrador inicial
  await crearUsuarioAdmin(negocio_id, {
    usuario: data.admin_usuario || 'admin',
    password: data.admin_password,
    nombre: data.admin_nombre,
    rol: 'admin'
  });
  
  // PASO 3: Seed configuracion_sistema (30 registros)
  await seedConfiguracionSistema(negocio_id);
  
  // PASO 4: Seed parametros iniciales (3 tipos de vehículo)
  await seedParametros(negocio_id);
  
  // PASO 5: Seed tarjetas iniciales (10 tarjetas para DEMO, 50 para PREMIUM)
  await seedTarjetas(negocio_id, data.plan);
  
  // PASO 6: Registrar en auditoría
  await registrarAuditoria({
    tabla: 'negocios',
    accion: 'INSERT',
    datos_nuevos: negocio
  });
  
  return negocio;
}
```

---

## 📊 Sistema de Plantillas

### Plantilla `configuracion_sistema` (30 registros)

```typescript
export const TEMPLATE_CONFIG_SISTEMA = [
  // 1. Configuración General
  { clave: 'nombre_negocio', valor: '', tipo: 'string', categoria: 'general' },
  { clave: 'descripcion_negocio', valor: '', tipo: 'string', categoria: 'general' },
  { clave: 'logo_url', valor: '', tipo: 'string', categoria: 'general' },
  { clave: 'tema', valor: 'moderno', tipo: 'string', categoria: 'general' },
  { clave: 'idioma', valor: 'es', tipo: 'string', categoria: 'general' },
  { clave: 'moneda', valor: 'USD', tipo: 'string', categoria: 'general' },
  { clave: 'formato_fecha', valor: 'DD/MM/YYYY', tipo: 'string', categoria: 'general' },
  { clave: 'formato_hora', valor: '24h', tipo: 'string', categoria: 'general' },
  { clave: 'zona_horaria', valor: 'America/Guayaquil', tipo: 'string', categoria: 'general' },
  
  // 2. Configuración de Impresión
  { clave: 'impresora_habilitada', valor: 'true', tipo: 'boolean', categoria: 'impresion' },
  { clave: 'impresora_nombre', valor: '', tipo: 'string', categoria: 'impresion' },
  { clave: 'impresora_ancho_papel', valor: '58', tipo: 'number', categoria: 'impresion' },
  { clave: 'impresion_auto', valor: 'true', tipo: 'boolean', categoria: 'impresion' },
  { clave: 'copias_ticket', valor: '2', tipo: 'number', categoria: 'impresion' },
  
  // 3. Configuración de Notificaciones
  { clave: 'notificaciones_email', valor: 'true', tipo: 'boolean', categoria: 'notificaciones' },
  { clave: 'notificaciones_sms', valor: 'false', tipo: 'boolean', categoria: 'notificaciones' },
  { clave: 'email_alertas', valor: '', tipo: 'string', categoria: 'notificaciones' },
  
  // 4. Configuración de Operación
  { clave: 'hora_apertura', valor: '08:00', tipo: 'string', categoria: 'operacion' },
  { clave: 'hora_cierre', valor: '18:00', tipo: 'string', categoria: 'operacion' },
  { clave: 'dias_atencion', valor: 'Lun-Vie', tipo: 'string', categoria: 'operacion' },
  { clave: 'permitir_reingreso', valor: 'false', tipo: 'boolean', categoria: 'operacion' },
  { clave: 'tiempo_gracia_minutos', valor: '5', tipo: 'number', categoria: 'operacion' },
  
  // 5. Configuración de Pagos
  { clave: 'metodos_pago', valor: '["efectivo","tarjeta","transferencia"]', tipo: 'json', categoria: 'pagos' },
  { clave: 'require_pago_previo', valor: 'false', tipo: 'boolean', categoria: 'pagos' },
  { clave: 'descuentos_habilitados', valor: 'true', tipo: 'boolean', categoria: 'pagos' },
  
  // 6. Configuración de Seguridad
  { clave: 'sesiones_multiples', valor: 'false', tipo: 'boolean', categoria: 'seguridad' },
  { clave: 'tiempo_sesion_minutos', valor: '480', tipo: 'number', categoria: 'seguridad' },
  { clave: 'require_cambio_password', valor: 'true', tipo: 'boolean', categoria: 'seguridad' },
  
  // 7. Configuración de Capacidad
  { clave: 'alerta_capacidad_porcentaje', valor: '90', tipo: 'number', categoria: 'capacidad' },
  { clave: 'reservas_habilitadas', valor: 'false', tipo: 'boolean', categoria: 'capacidad' }
];
```

### Función de Seed

```typescript
async function seedConfiguracionSistema(negocio_id: string) {
  const configs = TEMPLATE_CONFIG_SISTEMA.map(config => ({
    negocio_id,
    clave: config.clave,
    valor: config.valor,
    tipo: config.tipo,
    categoria: config.categoria,
    descripcion: config.descripcion || ''
  }));
  
  const { data, error } = await supabase
    .from('configuracion_sistema')
    .insert(configs);
  
  if (error) throw error;
  return data;
}
```

---

## 🎯 Dashboard Admin - Métricas

### Estadísticas Principales

```typescript
interface AdminStats {
  // Negocios
  total_negocios: number;
  negocios_activos: number;
  negocios_demo: number;
  negocios_premium: number;
  negocios_expirados: number;
  
  // Usuarios
  total_usuarios_plataforma: number;
  usuarios_activos_hoy: number;
  
  // Ingresos (si se maneja facturación)
  ingresos_mes_actual: number;
  ingresos_mes_anterior: number;
  
  // Capacidad
  capacidad_total_plataforma: number;
  vehiculos_activos_total: number;
  ocupacion_promedio: number;
  
  // Licencias próximas a vencer
  licencias_vencen_7dias: number;
  licencias_vencen_30dias: number;
}
```

### Queries para Dashboard

```typescript
// 1. Estadísticas de negocios
const { data: negociosStats } = await supabase
  .rpc('get_admin_dashboard_stats');

// 2. Negocios por plan
const { data: negociosPorPlan } = await supabase
  .from('negocios')
  .select('plan, count(*)')
  .groupBy('plan');

// 3. Licencias próximas a vencer
const { data: licenciasVencer } = await supabase
  .from('vista_licencias')
  .select('*')
  .lte('dias_restantes', 7)
  .eq('estado_licencia', 'Activa');

// 4. Actividad reciente
const { data: actividadReciente } = await supabase
  .from('auditoria')
  .select('*')
  .order('fecha_creacion', { ascending: false })
  .limit(10);
```

---

## 🔄 Gestión de Licencias

### Cambiar Plan DEMO → PREMIUM

```typescript
async function actualizarPlanAPremium(negocio_id: string) {
  const { data, error } = await supabase
    .from('negocios')
    .update({
      plan: 'PREMIUM',
      fecha_expiracion: null,
      limite_usuarios: 10,
      limite_tarjetas: 100,
      capacidad_maxima: 100,
      fecha_actualizacion: new Date().toISOString()
    })
    .eq('id', negocio_id);
  
  if (error) throw error;
  
  // Registar en auditoría
  await registrarCambioLicencia(negocio_id, 'DEMO', 'PREMIUM');
  
  return data;
}
```

### Renovar Licencia DEMO

```typescript
async function renovarLicenciaDemo(negocio_id: string, dias: number = 30) {
  const nuevaExpiracion = new Date();
  nuevaExpiracion.setDate(nuevaExpiracion.getDate() + dias);
  
  const { data, error } = await supabase
    .from('negocios')
    .update({
      fecha_expiracion: nuevaExpiracion.toISOString(),
      estado: 'activo',
      fecha_actualizacion: new Date().toISOString()
    })
    .eq('id', negocio_id);
  
  if (error) throw error;
  return data;
}
```

### Suspender Negocio

```typescript
async function suspenderNegocio(negocio_id: string, motivo: string) {
  const { data, error } = await supabase
    .from('negocios')
    .update({
      estado: 'suspendido',
      metadata: { motivo_suspension: motivo, fecha_suspension: new Date() },
      fecha_actualizacion: new Date().toISOString()
    })
    .eq('id', negocio_id);
  
  if (error) throw error;
  
  // Cerrar todas las sesiones activas del negocio
  await cerrarSesionesNegocio(negocio_id);
  
  return data;
}
```

---

## 🔧 Cambio de Contraseña Admin de Negocio

### Modal de Cambio de Contraseña

```typescript
async function cambiarPasswordAdminNegocio(
  negocio_id: string,
  nueva_password: string
) {
  // 1. Obtener usuario admin del negocio
  const { data: adminUser } = await supabase
    .from('usuarios')
    .select('id')
    .eq('negocio_id', negocio_id)
    .eq('rol', 'admin')
    .single();
  
  if (!adminUser) throw new Error('Admin no encontrado');
  
  // 2. Hashear nueva contraseña
  const hashedPassword = await bcrypt.hash(nueva_password, 10);
  
  // 3. Actualizar contraseña
  const { error } = await supabase
    .from('usuarios')
    .update({
      password: hashedPassword,
      fecha_actualizacion: new Date().toISOString()
    })
    .eq('id', adminUser.id);
  
  if (error) throw error;
  
  // 4. Registrar en auditoría
  await registrarCambioPassword(adminUser.id, 'Superadmin');
  
  // 5. Enviar email notificación (opcional)
  await enviarEmailCambioPassword(negocio_id);
}
```

---

## 🎨 Componentes UI del Admin Dashboard

### Sidebar Admin

```typescript
const menuItems = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    href: '/admin',
    color: 'cyan'
  },
  {
    icon: Building2,
    label: 'Negocios',
    href: '/admin/negocios',
    color: 'emerald'
  },
  {
    icon: Key,
    label: 'Licencias',
    href: '/admin/licencias',
    color: 'amber'
  },
  {
    icon: Users,
    label: 'Administradores',
    href: '/admin/usuarios',
    color: 'purple'
  },
  {
    icon: FileText,
    label: 'Reportes',
    href: '/admin/reportes',
    color: 'blue'
  },
  {
    icon: Settings,
    label: 'Configuración',
    href: '/admin/configuracion',
    color: 'slate'
  }
];
```

### Tabla de Negocios (Componente Principal)

Columnas:
- **Logo** - Imagen del negocio
- **Nombre** - Nombre + código
- **Plan** - Badge DEMO/PREMIUM
- **Estado** - Badge activo/suspendido/expirado
- **Licencia** - Días restantes / "Sin vencimiento"
- **Capacidad** - Utilización actual
- **Fecha creación** - Timestamp
- **Acciones** - Ver, Editar, Suspender, Cambiar Password

---

## 📋 Checklist de Implementación

### Fase 1: Base de Datos ✅
- [ ] Crear tabla `admin_users`
- [ ] Insertar usuario superadmin inicial
- [ ] Crear índices necesarios
- [ ] Crear función RPC `get_admin_dashboard_stats`
- [ ] Testear consultas de vista_licencias

### Fase 2: Autenticación 🔄
- [ ] Crear `/app/admin/login/page.tsx`
- [ ] Crear `/app/api/admin/auth/login/route.ts`
- [ ] Implementar `middleware-admin.ts`
- [ ] Crear `lib/admin/auth.ts`
- [ ] Implementar cookies seguras con JWT

### Fase 3: Dashboard Principal 🔄
- [ ] Crear `/app/admin/layout.tsx`
- [ ] Crear `/app/admin/page.tsx`
- [ ] Implementar `components/admin/Sidebar.tsx`
- [ ] Implementar `components/admin/Navbar.tsx`
- [ ] Implementar `components/admin/DashboardStats.tsx`

### Fase 4: CRUD Negocios 🔄
- [ ] Crear `/app/admin/negocios/page.tsx`
- [ ] Crear `/app/admin/negocios/nuevo/page.tsx` (Wizard)
- [ ] Crear `/app/api/admin/negocios/route.ts`
- [ ] Implementar `lib/admin/negocios.ts`
- [ ] Crear componentes: NegociosList, NegocioCard, NegocioForm

### Fase 5: Sistema de Plantillas 🔄
- [ ] Crear `lib/admin/templates.ts`
- [ ] Crear `lib/admin/seeds.ts`
- [ ] Implementar seedConfiguracionSistema
- [ ] Implementar seedParametros
- [ ] Implementar seedTarjetas
- [ ] Crear `/app/api/admin/negocios/seed/route.ts`

### Fase 6: Gestión Licencias 🔄
- [ ] Crear `/app/admin/licencias/page.tsx`
- [ ] Implementar `components/admin/LicenciaManager.tsx`
- [ ] Crear `/app/api/admin/licencias/[id]/route.ts`
- [ ] Implementar funciones: actualizarPlan, renovarLicencia, suspenderNegocio

### Fase 7: Cambio de Contraseñas 🔄
- [ ] Implementar `components/admin/PasswordChangeModal.tsx`
- [ ] Crear endpoint PATCH para cambio contraseña
- [ ] Implementar notificaciones email

### Fase 8: Testing & Documentación 🔄
- [ ] Tests unitarios de API endpoints
- [ ] Tests de integración flujo completo
- [ ] Documentar API con ejemplos
- [ ] Crear guía de usuario administrador

---

## 🚀 Siguiente Paso

Te recomiendo comenzar por:

1. **Crear la base de datos** (tabla `admin_users`)
2. **Implementar autenticación admin**
3. **Crear el layout y dashboard principal**
4. **Desarrollar el wizard de creación de negocios**

¿Deseas que comience con la implementación? Puedo crear los archivos en el orden correcto siguiendo esta arquitectura.
