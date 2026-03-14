# 🎫 MPTickets - Sistema de Gestión de Parqueaderos

Sistema comercial profesional **multi-tenant** para la gestión de parqueaderos con diseño moderno de glassmorfismo oscuro y efectos neón.

## 🆕 Panel de Administración MPTickets Admin

**MPTickets** es ahora una plataforma **multi-tenant** que permite gestionar múltiples negocios de parqueaderos desde un panel de administración centralizado.

### 🔐 Características del Admin Dashboard

- ✅ **Autenticación separada** para administradores (superadmins)
- ✅ **CRUD completo de negocios** - Crear, editar, eliminar negocios
- ✅ **Gestión de licencias** - Planes DEMO (30 días) y PREMIUM (ilimitado)
- ✅ **Sistema de plantillas** - Creación automática de configuraciones iniciales
- ✅ **Dashboard con métricas** - Estadísticas en tiempo real de toda la plataforma
- ✅ **Cambio de contraseñas** - Gestión de admins de cada negocio
- ✅ **Seeds automáticos** - 30 configuraciones + parámetros + tarjetas

### 📚 Documentación Completa

Toda la documentación del panel admin está en [`/docs/admin/`](./docs/admin/):

- **[README.md](./docs/admin/README.md)** - Índice y quick start
- **[MPTICKETS_ADMIN_ARCHITECTURE.md](./docs/admin/MPTICKETS_ADMIN_ARCHITECTURE.md)** - Arquitectura completa
- **[API_REFERENCE.md](./docs/admin/API_REFERENCE.md)** - Documentación del API
- **[GUIA_IMPLEMENTACION.md](./docs/admin/GUIA_IMPLEMENTACION.md)** - Tutorial paso a paso

### 🚀 Quick Start Admin

```bash
# 1. Ejecutar migration de admin_users en Supabase
# Ver: /supabase/migrations/create_admin_users.sql

# 2. Instalar dependencias adicionales
npm install bcryptjs jsonwebtoken

# 3. Configurar JWT_SECRET en .env.local
JWT_SECRET=tu_secret_key_aqui

# 4. Acceder al panel admin
# URL: http://localhost:3000/admin/login
# Usuario: superadmin
# Password: Admin@2024 (cambiar en producción)
```

---

## 🎨 Características del Diseño

### Modern Dark Glassmorphism with Neon Accents
- **Fondo ultra oscuro** (#0a0e27 → #16213e → #0f1729)
- **Efectos glass** con backdrop-blur-xl y transparencias sutiles
- **Colores neón** personalizados por función:
  - 🟢 **Verde (Emerald)**: Entradas, vehículos activos, éxito
  - 🟡 **Ámbar**: Pagos, ingresos, advertencias
  - 🔵 **Cyan/Azul**: Sistema, información, navegación
  - 🟣 **Morado**: Consultas, acciones especiales
  - 🔴 **Rojo**: Salidas, errores, alertas críticas
- **Efectos glow** en bordes y sombras para mayor profundidad
- **Animaciones fluidas** con Framer Motion

Ver especificación completa en [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

## 🚀 Stack Tecnológico

### Frontend
- **Next.js 16.1.6** - Framework React con App Router
- **React 19** - Biblioteca UI
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first CSS
- **Framer Motion** - Animaciones
- **Lucide React** - 1,500+ iconos SVG modernos

### Backend & Database
- **Supabase** - PostgreSQL con Row Level Security
- **bcryptjs** - Hashing de contraseñas
- **Server Actions** - API routes nativas de Next.js

### Fuentes
- **Plus Jakarta Sans** (200-800) - Fuente principal
- **JetBrains Mono** (400-700) - Código y monospace

## 📁 Estructura del Proyecto

```
mptickets/
├── app/
│   ├── api/
│   │   └── login/
│   │       └── route.ts          # Endpoint de autenticación
│   ├── dashboard/
│   │   ├── layout.tsx            # Layout con fondo oscuro
│   │   └── page.tsx              # Dashboard principal (server)
│   ├── globals.css               # Estilos globales + utilities
│   ├── layout.tsx                # Root layout + fuentes
│   └── page.tsx                  # Login page
├── components/
│   └── dashboard/
│       ├── DashboardHeader.tsx   # Header animado (client)
│       ├── DashboardStats.tsx    # Grid de stats + actividad (client)
│       ├── Navbar.tsx            # Navegación superior (client)
│       ├── Sidebar.tsx           # Menú lateral (client)
│       └── StatCard.tsx          # Tarjeta de estadística (client)
├── lib/
│   └── supabase/
│       ├── client.ts             # Cliente Supabase (frontend)
│       └── server.ts             # Cliente Supabase (backend)
├── middleware.ts                 # Protección de rutas
├── DESIGN_SYSTEM.md              # Especificación completa del diseño
├── start-services.sh             # Script para iniciar servicios
├── stop-services.sh              # Script para detener servicios
└── .env.local                    # Variables de entorno
```

## 🔧 Configuración Inicial

### 1. Clonar el repositorio
```bash
git clone https://github.com/wjaviercordova/mptickets.git
cd mptickets
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### 4. Iniciar servicios
```bash
chmod +x start-services.sh stop-services.sh
./start-services.sh
```

O manualmente:
```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 🗄️ Estructura de Base de Datos

### Tablas principales (Supabase)
- **negocios** - Empresas de parqueaderos
- **usuarios** - Usuarios del sistema
- **codigos** - Tickets/códigos de entrada
- **tarjetas** - Tarjetas de clientes frecuentes
- **parametros** - Configuración de tarifas
- **configuracion_sistema** - Settings globales
- **auditoria** - Log de acciones

## 🔐 Autenticación

### Login
- **Usuario**: admin
- **Contraseña**: (hasheada con bcrypt)
- **Código de negocio**: mp01 (Mipartking)

### Seguridad
- ✅ Contraseñas hasheadas con bcrypt (salt rounds: 10)
- ✅ Sesiones con cookies httpOnly
- ✅ Row Level Security (RLS) en Supabase
- ✅ Service Role Key para operaciones backend
- ✅ Middleware de protección de rutas

## 📊 Dashboard Principal

### Métricas en Tiempo Real
- **Vehículos Activos**: Contador de vehículos en el parqueadero
- **Ingresos Hoy**: Total de ingresos del día
- **Tiempo Promedio**: Duración promedio de estancia
- **Ocupación**: Porcentaje de capacidad utilizada

### Secciones
1. **Acciones Rápidas**: Ingreso de vehículo, procesar pago, consultas, reportes
2. **Últimos Movimientos**: Actividad reciente con timestamps relativos
3. **Estado del Turno**: Información del turno activo y personal

## 🎨 Guía de Estilo

### Colores por Función
```tsx
// Verde - Entradas/Activo
<StatCard 
  gradient="from-emerald-500/20 to-green-600/10"
  borderColor="border-emerald-400/30"
  iconColor="text-emerald-400"
  shadowColor="shadow-emerald-500/10"
/>

// Ámbar - Pagos/Ingresos
<StatCard 
  gradient="from-amber-500/20 to-yellow-600/10"
  borderColor="border-amber-400/30"
  iconColor="text-amber-400"
  shadowColor="shadow-amber-500/10"
/>

// Cyan - Información
<StatCard 
  gradient="from-cyan-500/20 to-blue-600/10"
  borderColor="border-cyan-400/30"
  iconColor="text-cyan-400"
  shadowColor="shadow-cyan-500/10"
/>

// Morado - Especial
<StatCard 
  gradient="from-purple-500/20 to-pink-600/10"
  borderColor="border-purple-400/30"
  iconColor="text-purple-400"
  shadowColor="shadow-purple-500/10"
/>
```

### Clases Utility
```css
.glass-card    /* Cards con efecto cristal */
.glass-input   /* Inputs con glassmorphism */
.glass-button  /* Botones con gradiente neón */

.font-display  /* Títulos (bold) */
.font-heading  /* Subtítulos (semibold) */
.font-body     /* Texto normal */
.font-caption  /* Texto pequeño (medium) */
```

### Iconos (Lucide React)
```tsx
import { Car, DollarSign, Timer, Activity } from 'lucide-react'

// Tamaños estándar
h-4 w-4   // 16px - Inputs, botones
h-5 w-5   // 20px - Navegación
h-6 w-6   // 24px - Cards
h-7 w-7   // 28px - StatCards
h-8 w-8   // 32px - Iconos principales
```

## 🔄 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Compilar para producción
npm run build

# Iniciar en producción
npm start

# Linting
npm run lint

# Iniciar servicios con script
./start-services.sh

# Detener servicios
./stop-services.sh
```

## 🚧 Próximos Módulos

- [ ] **Tickets**: Gestión completa de tickets (entrada/salida)
- [ ] **Vehículos**: Base de datos de vehículos y placas
- [ ] **Clientes**: Gestión de clientes frecuentes
- [ ] **Reportes**: Analytics y reportes detallados
- [ ] **Configuración**: Panel de administración de tarifas
- [ ] **WebSockets**: Actualizaciones en tiempo real

## 📝 Notas de Desarrollo

### Server vs Client Components
- **Server**: Componentes que consultan DB (dashboard/page.tsx)
- **Client**: Componentes con Framer Motion y estado (DashboardStats, Navbar, etc.)

### Supabase Connection
- **Frontend**: Usa `NEXT_PUBLIC_SUPABASE_ANON_KEY` + RLS
- **Backend**: Usa `SUPABASE_SERVICE_ROLE_KEY` (bypassa RLS)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit tus cambios (`git commit -m 'feat: Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y está bajo desarrollo comercial.

## 👨‍💻 Autor

**Javier Córdova**
- GitHub: [@wjaviercordova](https://github.com/wjaviercordova)
- Proyecto: MPTickets - Sistema de Gestión de Parqueaderos

---

**Última actualización**: Febrero 12, 2026  
**Versión**: 1.0.0 - Modern Dark Glassmorphism Design
