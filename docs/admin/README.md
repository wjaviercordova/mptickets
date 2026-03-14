# 🔐 MPTickets Admin - Documentación Completa

Panel de Administración Multi-Tenant para MPTickets

---

## 📚 Índice de Documentación

### 1. [Arquitectura del Sistema](./MPTICKETS_ADMIN_ARCHITECTURE.md)
**Documento principal** con la arquitectura completa del panel admin:
- Diagrama de flujo de autenticación
- Separación de contextos (Dashboard vs Admin)
- Estructura de base de datos
- Estructura de rutas y archivos
- Sistema de autenticación
- Planes de licencia (DEMO vs PREMIUM)
- Sistema de creación de negocios
- Sistema de plantillas (30 registros configuración_sistema)
- Dashboard con métricas
- Gestión de licencias
- Componentes UI

**📖 Lee este primero para entender el sistema completo.**

### 2. [API Reference](./API_REFERENCE.md)
Documentación detallada de todos los endpoints del API:
- Autenticación (login/logout)
- CRUD de Negocios
- Gestión de Licencias
- Estadísticas y Reportes
- Búsqueda y Filtros
- Códigos de error
- Ejemplos de uso

**📖 Consulta aquí para integrar el API.**

### 3. [Guía de Implementación](./GUIA_IMPLEMENTACION.md)
Tutorial paso a paso para implementar todo el sistema:
- Fase 0: Preparación
- Fase 1: Base de Datos
- Fase 2: Autenticación
- Fase 3: Layout y Dashboard
- Fase 4: CRUD de Negocios
- Fase 5: Sistema de Plantillas
- Fase 6: Gestión de Licencias
- Fase 7: Testing

**📖 Sigue esta guía para implementar desde cero.**

---

## 🗂️ Archivos de Código Creados

### Types y Configuraciones

| Archivo | Descripción |
|---------|-------------|
| `/types/admin.ts` | TypeScript types completos para todo el sistema admin |
| `/lib/utils/plan-config.ts` | Configuración de planes DEMO/PREMIUM y funciones helper |
| `/lib/admin/templates.ts` | Plantillas de configuración (30 registros), parámetros y tarjetas |

### Base de Datos

| Archivo | Descripción |
|---------|-------------|
| `/supabase/migrations/create_admin_users.sql` | Migration completa: tabla admin_users, índices, triggers, funciones RPC |

---

## 🎯 Resumen Ejecutivo

### ¿Qué es MPTickets Admin?

**MPTickets Admin** es el panel de administración que permite al **Administrador General** gestionar todos los negocios de la plataforma multi-tenant MPTickets.

### Características Principales

✅ **Autenticación Separada**: Login independiente con tabla `admin_users`  
✅ **CRUD Completo de Negocios**: Crear, editar, eliminar negocios  
✅ **Gestión de Licencias**: Cambiar planes, renovar, suspender  
✅ **Sistema de Plantillas**: Crea automáticamente 30 configuraciones + parámetros + tarjetas  
✅ **Dashboard con Métricas**: Estadísticas en tiempo real de toda la plataforma  
✅ **Cambio de Contraseñas**: Cambiar password de admins de negocios  
✅ **Diseño Consistente**: Mismo glassmorphism oscuro del proyecto principal

### Planes de Licencia

#### 🟡 DEMO (30 días)
- 1 usuario
- 10 tarjetas
- Capacidad: 10 vehículos
- Expira en 30 días

#### 🟢 PREMIUM (Sin límite)
- 10 usuarios
- 100 tarjetas
- Capacidad: 100 vehículos
- Sin fecha de expiración

---

## 🚀 Quick Start

### 1. Generar Hash de Contraseña

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Admin@2024', 10).then(hash => console.log(hash));"
```

### 2. Ejecutar Migration

1. Abrir Supabase → SQL Editor
2. Copiar contenido de `/supabase/migrations/create_admin_users.sql`
3. Reemplazar hash en el INSERT del usuario superadmin
4. Ejecutar

### 3. Instalar Dependencias

```bash
npm install bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### 4. Configurar Variables de Entorno

Agregar a `.env.local`:

```env
JWT_SECRET=tu_secret_key_aqui_generado_con_openssl
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### 5. Comenzar Implementación

Sigue la [Guía de Implementación](./GUIA_IMPLEMENTACION.md) paso a paso.

---

## 📊 Flujo de Creación de Negocio

```
1. Admin ingresa a /admin/negocios/nuevo
   ↓
2. Completa Wizard de 4 pasos:
   - Paso 1: Info básica (nombre, código, email)
   - Paso 2: Seleccionar plan (DEMO/PREMIUM)
   - Paso 3: Crear usuario admin inicial
   - Paso 4: Confirmación
   ↓
3. Sistema ejecuta automáticamente:
   a) Crea registro en tabla "negocios" → obtiene negocio_id
   b) Crea usuario admin inicial en tabla "usuarios"
   c) Crea 30 registros en "configuracion_sistema"
   d) Crea 3 parámetros (auto, moto, camioneta)
   e) Crea 10 tarjetas (DEMO) o 50 (PREMIUM)
   f) Registra en auditoría
   ↓
4. Negocio listo para usar!
```

---

## 🔄 Estructura de Rutas

```
/admin
├── /login                    # Login superadmin
├── /                         # Dashboard principal
├── /negocios
│   ├── /                     # Lista de negocios
│   ├── /nuevo                # Wizard crear negocio
│   └── /[id]                 # Ver/Editar negocio
├── /licencias                # Gestión de licencias
├── /usuarios                 # Gestión admins
└── /reportes                 # Reportes plataforma
```

---

## 🗄️ Estructura de Base de Datos

### Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| `admin_users` | Usuarios administradores (superadmins) |
| `negocios` | Negocios de parqueaderos |
| `usuarios` | Usuarios de cada negocio |
| `configuracion_sistema` | 30 configuraciones por negocio |
| `parametros` | Tarifas por tipo de vehículo |
| `tarjetas` | Tarjetas de entrada/salida |
| `codigos` | Tickets generados |

### Vistas

| Vista | Descripción |
|-------|-------------|
| `vista_licencias` | Consolidado de licencias con días restantes |

### Funciones RPC

| Función | Descripción |
|---------|-------------|
| `get_admin_dashboard_stats()` | Estadísticas del dashboard admin |
| `get_dias_restantes_licencia(uuid)` | Días restantes de licencia |
| `is_licencia_activa(uuid)` | Verifica si licencia está activa |
| `cerrar_sesiones_negocio(uuid)` | Cierra sesiones de un negocio |

---

## 📦 Plantillas Incluidas

### Configuración Sistema (30 registros)

| Categoría | Registros | Ejemplos |
|-----------|-----------|----------|
| General | 9 | nombre_negocio, tema, idioma, moneda, zona_horaria |
| Impresión | 5 | impresora_habilitada, ancho_papel, copias_ticket |
| Notificaciones | 3 | notificaciones_email, email_alertas |
| Operación | 5 | hora_apertura, hora_cierre, tiempo_gracia |
| Pagos | 3 | metodos_pago, descuentos_habilitados |
| Seguridad | 3 | sesiones_multiples, tiempo_sesion |
| Capacidad | 2 | alerta_capacidad, reservas_habilitadas |

### Parámetros (3registros)

- **Auto**: Tarifa base $1.00, adicionales $0.50-$0.75
- **Moto**: Tarifa base $0.50, todas las horas $0.50
- **Camioneta**: Tarifa base $1.50, adicionales $0.75-$1.00

### Tarjetas

- **DEMO**: 10 tarjetas (MP01-0001 a MP01-0010)
- **PREMIUM**: 50 tarjetas (MP02-0001 a MP02-0050)

---

## 🎨 Diseño UI

### Colores por Función

| Función | Color | Uso |
|---------|-------|-----|
| Negocios Activos | Emerald | Stats, badges |
| Negocios DEMO | Amber | Plans, warnings |
| Negocios PREMIUM | Emerald | Plans, success |
| Licencias | Purple | Alerts, badges |
| Dashboard | Cyan | Navigation, info |

### Componentes Principales

- **Sidebar**: Navegación lateral con glassmorphism
- **Navbar**: Barra superior con perfil admin
- **DashboardStats**: Grid de estadísticas
- **NegocioCard**: Card individual con estado
- **LicenciaManager**: Gestor de cambio de planes
- **PasswordChangeModal**: Modal cambio contraseña

---

## 🔐 Seguridad

### Implementaciones de Seguridad

✅ **Passwords hasheados**: bcrypt con 10 rounds  
✅ **JWT Tokens**: Tokens con 8 horas de expiración  
✅ **HttpOnly Cookies**: Cookies seguras para sesiones  
✅ **Middleware Protection**: Verificación en cada request  
✅ **Service Role Key**: Solo server-side, nunca frontend  
✅ **RLS (opcional)**: Row Level Security en Supabase

### Variables de Entorno Críticas

```env
JWT_SECRET=                    # Generar con: openssl rand -base64 32
SUPABASE_SERVICE_ROLE_KEY=     # Desde Supabase Dashboard
```

---

## 🧪 Testing Checklist

### Autenticación
- [ ] Login con credenciales correctas
- [ ] Login con credenciales incorrectas
- [ ] Logout y limpieza de sesión
- [ ] Token expirado → Auto logout
- [ ] Usuario inactivo → No puede login

### CRUD Negocios
- [ ] Crear negocio DEMO
- [ ] Crear negocio PREMIUM
- [ ] Editar información de negocio
- [ ] Suspender negocio
- [ ] Reactivar negocio
- [ ] Eliminar negocio (soft delete)

### Licencias
- [ ] Cambiar DEMO → PREMIUM
- [ ] Renovar licencia DEMO
- [ ] Extender licencia por días
- [ ] Ver días restantes correctos
- [ ] Alertas de vencimiento (7 días)

### Seeds
- [ ] Verificar 30 configs creadas
- [ ] Verificar 3 parámetros creados
- [ ] Verificar tarjetas según plan

### Validaciones
- [ ] Código de negocio duplicado → Error
- [ ] Email duplicado → Error
- [ ] Límites de plan respetados

---

## 📞 Soporte

Para dudas o problemas durante la implementación, revisa:

1. **Primero**: [Arquitectura](./MPTICKETS_ADMIN_ARCHITECTURE.md) completa
2. **API**: [API Reference](./API_REFERENCE.md) con ejemplos
3. **Implementación**: [Guía paso a paso](./GUIA_IMPLEMENTACION.md)

---

## 🚀 Próximos Pasos

1. Lee la [Arquitectura](./MPTICKETS_ADMIN_ARCHITECTURE.md) completa
2. Revisa los tipos en `/types/admin.ts`
3. Comienza con [Fase 1: Base de Datos](./GUIA_IMPLEMENTACION.md#fase-1-base-de-datos)
4. Sigue la guía secuencialmente

---

**¡Todo listo para implementar tu panel de administración multi-tenant! 🎉**
