# 🎨 MPTickets - Modern Dark Glassmorphism Design System

## 📋 Resumen del Diseño

**Nombre:** "Modern Dark Glassmorphism with Neon Accents"  
**Estilo:** Modo oscuro adaptativo con efectos de cristal y acentos neón  
**Framework:** Next.js 16 + Tailwind CSS + Framer Motion

---

## 🌈 Paleta de Colores

### Fondos Principales
```css
/* Fondo principal del layout */
bg-gradient-to-br from-[#0a0e27] via-[#16213e] to-[#0f1729]

/* Fondo de cards */
bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/80

/* Fondo de inputs y elementos interactivos */
bg-[#0f172a]/50
bg-[#1e293b]/40
```

### Colores Temáticos con Efectos Neón

#### 🟢 Verde (Éxito, Entrada, Activo)
```css
/* Gradiente */
from-emerald-500/20 to-green-600/10

/* Bordes */
border-emerald-400/30
border-emerald-400/40  /* hover */

/* Iconos y texto */
text-emerald-400
text-emerald-200

/* Sombras (glow effect) */
shadow-emerald-500/10
shadow-emerald-500/15  /* hover */
shadow-[0_0_16px_rgba(52,211,153,0.8)]  /* animación pulsante */
```

#### 🟡 Amarillo/Ámbar (Pagos, Advertencias)
```css
/* Gradiente */
from-amber-500/20 to-yellow-600/10

/* Bordes */
border-amber-400/30
border-amber-400/40  /* hover */

/* Iconos y texto */
text-amber-400
text-amber-200

/* Sombras */
shadow-amber-500/10
shadow-amber-500/15  /* hover */
```

#### 🔵 Azul/Cyan (Información, Sistema, Principal)
```css
/* Gradiente */
from-blue-500/20 to-cyan-600/10
from-cyan-500/20 to-blue-600/10

/* Bordes */
border-blue-500/20
border-blue-500/30
border-cyan-400/30
border-cyan-400/40  /* hover */
border-cyan-400/50  /* active */

/* Iconos y texto */
text-blue-400
text-cyan-400
text-cyan-300
text-blue-200/70
text-blue-200/80

/* Sombras */
shadow-blue-500/5
shadow-blue-500/10
shadow-cyan-500/10
shadow-cyan-500/20  /* hover */
```

#### 🟣 Morado/Rosa (Consultas, Especial)
```css
/* Gradiente */
from-purple-500/20 to-pink-600/10

/* Bordes */
border-purple-400/30

/* Iconos y texto */
text-purple-400

/* Sombras */
shadow-purple-500/10
```

#### 🔴 Rojo (Errores, Salir, Crítico)
```css
/* Gradiente */
from-red-500/25 to-pink-600/15

/* Bordes */
border-red-400/40
border-red-400/60  /* hover */

/* Iconos y texto */
text-red-400
text-red-200

/* Sombras */
shadow-red-500/15
shadow-red-500/25  /* hover */
```

---

## 🎭 Efectos Glassmorphism

### Glass Cards
```css
.glass-card {
  @apply rounded-2xl 
         border border-blue-500/20 
         bg-gradient-to-br from-[#1e293b]/50 to-[#0f172a]/70 
         shadow-xl shadow-blue-500/5 
         backdrop-blur-xl;
}
```

### Glass Inputs
```css
.glass-input {
  @apply w-full 
         rounded-xl 
         border border-blue-500/20 
         bg-[#0f172a]/50 
         px-4 py-3 
         text-white 
         placeholder:text-blue-200/40 
         outline-none 
         transition 
         focus:border-cyan-400/60 
         focus:ring-2 
         focus:ring-cyan-500/30 
         hover:border-blue-400/40;
}
```

### Glass Buttons
```css
.glass-button {
  @apply inline-flex items-center justify-center gap-2 
         rounded-xl 
         border border-cyan-400/30 
         bg-gradient-to-r from-blue-500 to-cyan-500 
         px-4 py-3 
         text-sm font-semibold text-white 
         shadow-lg shadow-blue-500/20 
         transition 
         hover:border-cyan-400/50 
         hover:from-blue-600 
         hover:to-cyan-600 
         hover:shadow-xl 
         hover:shadow-cyan-500/30 
         focus:outline-none 
         focus:ring-2 
         focus:ring-cyan-500/50 
         disabled:cursor-not-allowed 
         disabled:opacity-70;
}
```

---

## 🎬 Animaciones con Framer Motion

### Hover Effects - Cards
```tsx
<motion.div
  whileHover={{ scale: 1.03, y: -6 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
>
```

### Hover Effects - Botones
```tsx
<motion.button
  whileHover={{ scale: 1.02, y: -2 }}
  whileTap={{ scale: 0.98 }}
>
```

### Hover Effects - Iconos
```tsx
<motion.div
  whileHover={{ scale: 1.1, rotate: 5 }}
  transition={{ duration: 0.3 }}
>
```

### Entrada/Aparición
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1 }}
>
```

### Animación Pulsante (Estado Activo)
```tsx
<motion.div
  animate={{ scale: [1, 1.2, 1] }}
  transition={{ repeat: Infinity, duration: 2 }}
  className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.8)]"
/>
```

---

## 🎯 Componentes de Iconos (Lucide React)

### Librería
```bash
npm install lucide-react
```

### Iconos Principales por Categoría

#### Dashboard & Navegación
```tsx
import { 
  Home, Menu, X, ChevronRight,
  ParkingCircle, Building2, Settings,
  LogOut, HelpCircle
} from 'lucide-react'
```

#### Estadísticas
```tsx
import {
  Car, DollarSign, Timer, Activity,
  TrendingUp, BarChart3, Clock
} from 'lucide-react'
```

#### Acciones
```tsx
import {
  CreditCard, Search, Zap,
  MonitorSpeaker
} from 'lucide-react'
```

#### Autenticación
```tsx
import {
  User, Lock, Eye, EyeOff,
  LogIn, AlertCircle, CheckCircle
} from 'lucide-react'
```

### Tamaños Estándar
```css
h-4 w-4   /* 16px - Inputs, botones pequeños */
h-5 w-5   /* 20px - Navegación */
h-6 w-6   /* 24px - Cards, headers */
h-7 w-7   /* 28px - StatCards (grande) */
h-8 w-8   /* 32px - Iconos principales */
h-12 w-12 /* 48px - Iconos hero */
```

### Ejemplos de Uso
```tsx
{/* Icono con contenedor glass y efecto glow */}
<div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-blue-500/30 to-cyan-600/20 shadow-lg shadow-cyan-500/20">
  <ParkingCircle className="h-6 w-6 text-cyan-400" />
</div>

{/* Icono en navegación con hover */}
<div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-950/30 transition group-hover:border-cyan-400/40 group-hover:bg-cyan-500/20 group-hover:shadow-lg group-hover:shadow-cyan-400/30">
  <Icon className="h-4 w-4 text-cyan-400 transition group-hover:text-cyan-300" />
</div>
```

---

## 🔤 Tipografía

### Fuentes
```tsx
// layout.tsx
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});
```

### Clases de Tipografía
```css
.font-display  /* Títulos grandes - peso 700-800 */
.font-heading  /* Subtítulos - peso 600 */
.font-body     /* Texto normal - peso 400 */
.font-caption  /* Texto pequeño - peso 500 */
.font-mono     /* Código - JetBrains Mono */
```

### Jerarquía de Texto
```tsx
{/* Títulos principales */}
<h1 className="font-display text-2xl text-white">Título Principal</h1>

{/* Subtítulos */}
<h2 className="font-heading text-xl text-white">Subtítulo</h2>

{/* Labels superiores */}
<p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300/70">
  ETIQUETA
</p>

{/* Texto normal */}
<p className="text-sm text-blue-200/70">Descripción</p>

{/* Texto secundario */}
<p className="text-xs text-blue-200/60">Información adicional</p>
```

---

## 🎨 StatCard con Colores Personalizados

### Interface Extendida
```tsx
interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  borderColor?: string;
  iconColor?: string;
  shadowColor?: string;
}
```

### Ejemplo de Uso
```tsx
<StatCard
  title="Vehículos Activos"
  value="24"
  description="+3 hoy"
  icon={Car}
  gradient="from-emerald-500/20 to-green-600/10"
  borderColor="border-emerald-400/30"
  iconColor="text-emerald-400"
  shadowColor="shadow-emerald-500/10"
/>
```

### Configuraciones Predefinidas

#### Verde - Vehículos Activos
```tsx
{
  gradient: 'from-emerald-500/20 to-green-600/10',
  borderColor: 'border-emerald-400/30',
  iconColor: 'text-emerald-400',
  shadowColor: 'shadow-emerald-500/10'
}
```

#### Ámbar - Ingresos
```tsx
{
  gradient: 'from-amber-500/20 to-yellow-600/10',
  borderColor: 'border-amber-400/30',
  iconColor: 'text-amber-400',
  shadowColor: 'shadow-amber-500/10'
}
```

#### Cyan - Tiempo Promedio
```tsx
{
  gradient: 'from-cyan-500/20 to-blue-600/10',
  borderColor: 'border-cyan-400/30',
  iconColor: 'text-cyan-400',
  shadowColor: 'shadow-cyan-500/10'
}
```

#### Morado - Ocupación
```tsx
{
  gradient: 'from-purple-500/20 to-pink-600/10',
  borderColor: 'border-purple-400/30',
  iconColor: 'text-purple-400',
  shadowColor: 'shadow-purple-500/10'
}
```

---

## 📐 Layouts y Espaciado

### Grid Layouts
```tsx
{/* Dashboard Stats */}
<section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

{/* Acciones Rápidas */}
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

{/* Actividad + Estado */}
<section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
```

### Espaciado Consistente
```css
gap-3    /* Spacing pequeño (12px) */
gap-4    /* Spacing medio (16px) */
gap-6    /* Spacing grande (24px) */
p-4      /* Padding pequeño */
p-6      /* Padding medio */
p-8      /* Padding grande */
```

### Radios de Borde
```css
rounded-xl    /* 12px - inputs, botones */
rounded-2xl   /* 16px - cards, contenedores */
rounded-3xl   /* 24px - secciones grandes */
```

---

## 🛠️ Mejores Prácticas

### 1. Separación Server/Client Components
```tsx
// ❌ No usar Framer Motion en Server Components
export default function Page() {
  return <motion.div>...</motion.div>  // Error!
}

// ✅ Crear Client Component separado
"use client"
export function AnimatedCard() {
  return <motion.div>...</motion.div>  // OK!
}
```

### 2. Consistencia en Efectos Glow
Siempre combinar border + shadow del mismo color:
```tsx
className="border-cyan-400/30 shadow-cyan-500/10"
```

### 3. Estados Hover
Incrementar la opacidad y añadir glow en hover:
```tsx
className="border-blue-500/20 hover:border-cyan-400/40 hover:shadow-cyan-500/20"
```

### 4. Jerarquía Visual
- Elementos activos: colores más brillantes (400)
- Texto principal: /80-/90
- Texto secundario: /60-/70
- Texto terciario: /40-/50

### 5. Transiciones Suaves
Siempre agregar `transition` en elementos interactivos:
```tsx
className="... transition hover:..."
```

---

## 📦 Archivos Clave del Sistema

### Estilos Globales
- `/app/globals.css` - Clases utility (.glass-card, .glass-input, .glass-button)

### Layout
- `/app/dashboard/layout.tsx` - Layout principal con fondo oscuro

### Componentes de UI
- `/components/dashboard/Navbar.tsx` - Navegación superior
- `/components/dashboard/Sidebar.tsx` - Menú lateral
- `/components/dashboard/StatCard.tsx` - Tarjetas de estadísticas
- `/components/dashboard/DashboardStats.tsx` - Grid de stats y actividad
- `/components/dashboard/DashboardHeader.tsx` - Header con animaciones

### Páginas
- `/app/page.tsx` - Login con glassmorphism
- `/app/dashboard/page.tsx` - Dashboard principal

---

## 🚀 Siguientes Pasos

Para mantener la consistencia del diseño en futuros módulos:

1. **Reutilizar StatCard** con colores personalizados
2. **Usar iconos de Lucide** con los tamaños estándar
3. **Aplicar .glass-card** en todas las secciones
4. **Mantener la paleta de colores** neón (emerald, amber, cyan, purple)
5. **Separar animaciones** en Client Components
6. **Seguir la jerarquía de texto** establecida
7. **Usar motion effects** consistentes (whileHover, transitions)

---

## 📄 Licencia y Créditos

**Proyecto:** MPTickets - Sistema de Gestión de Parqueaderos  
**Diseño:** Modern Dark Glassmorphism with Neon Accents  
**Tecnologías:** Next.js 16 + TypeScript + Tailwind CSS + Framer Motion + Lucide React  
**Fuentes:** Plus Jakarta Sans + JetBrains Mono (Google Fonts)  
**Seguridad:** bcryptjs + Supabase RLS
