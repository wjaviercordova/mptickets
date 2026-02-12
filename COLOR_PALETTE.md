# 🎨 MPTickets - Paleta de Colores Visual

## Fondo Principal
```
#0a0e27 → #16213e → #0f1729
████████████████████████████████
Azul oscuro casi negro con tonos profundos
```

## Colores Neón por Función

### 🟢 Verde Emerald (Entradas, Activos, Éxito)
```css
/* Iconos */
text-emerald-400    #34d399  ████
text-emerald-300    #6ee7b7  ████
text-emerald-200    #a7f3d0  ████

/* Bordes */
border-emerald-400/30  rgba(52, 211, 153, 0.3)  ████
border-emerald-400/40  rgba(52, 211, 153, 0.4)  ████

/* Gradientes */
from-emerald-500/20    rgba(16, 185, 129, 0.2)  ████
to-green-600/10        rgba(22, 163, 74, 0.1)   ████

/* Sombras (Glow) */
shadow-emerald-500/10  rgba(16, 185, 129, 0.1)  ████
shadow-emerald-500/15  rgba(16, 185, 129, 0.15) ████
```

**Uso:**
- Vehículos activos
- Entradas de vehículos
- Estado "Turno activo"
- Mensajes de éxito
- Indicadores "Todo operativo"

---

### 🟡 Amarillo/Ámbar (Pagos, Ingresos, Advertencias)
```css
/* Iconos */
text-amber-400     #fbbf24  ████
text-amber-300     #fcd34d  ████
text-amber-200     #fde68a  ████
text-yellow-400    #facc15  ████

/* Bordes */
border-amber-400/30   rgba(251, 191, 36, 0.3)  ████
border-amber-400/40   rgba(251, 191, 36, 0.4)  ████

/* Gradientes */
from-amber-500/20     rgba(245, 158, 11, 0.2)  ████
to-yellow-600/10      rgba(202, 138, 4, 0.1)   ████

/* Sombras (Glow) */
shadow-amber-500/10   rgba(245, 158, 11, 0.1)  ████
shadow-amber-500/15   rgba(245, 158, 11, 0.15) ████
```

**Uso:**
- Ingresos del día
- Procesamiento de pagos
- Advertencias suaves
- "Alertas pendientes"
- Acciones de cobro

---

### 🔵 Cyan/Azul (Sistema, Información, Principal)
```css
/* Iconos */
text-cyan-400      #22d3ee  ████
text-cyan-300      #67e8f9  ████
text-blue-400      #60a5fa  ████
text-blue-200      #bfdbfe  ████

/* Bordes */
border-blue-500/20    rgba(59, 130, 246, 0.2)   ████
border-blue-500/30    rgba(59, 130, 246, 0.3)   ████
border-cyan-400/30    rgba(34, 211, 238, 0.3)   ████
border-cyan-400/40    rgba(34, 211, 238, 0.4)   ████
border-cyan-400/50    rgba(34, 211, 238, 0.5)   ████

/* Gradientes */
from-blue-500/20      rgba(59, 130, 246, 0.2)   ████
from-cyan-500/20      rgba(6, 182, 212, 0.2)    ████
to-blue-600/10        rgba(37, 99, 235, 0.1)    ████
to-cyan-600/10        rgba(8, 145, 178, 0.1)    ████

/* Fondos */
bg-[#0f172a]/50       rgba(15, 23, 42, 0.5)     ████
bg-[#1e293b]/40       rgba(30, 41, 59, 0.4)     ████
bg-[#1e293b]/60       rgba(30, 41, 59, 0.6)     ████

/* Sombras (Glow) */
shadow-blue-500/5     rgba(59, 130, 246, 0.05)  ████
shadow-blue-500/10    rgba(59, 130, 246, 0.1)   ████
shadow-cyan-500/10    rgba(6, 182, 212, 0.1)    ████
shadow-cyan-500/20    rgba(6, 182, 212, 0.2)    ████
```

**Uso:**
- Tiempo promedio
- Navegación y menús
- Sistema general
- Información neutral
- Últimos movimientos
- Fondo de cards principales

---

### 🟣 Morado/Rosa (Consultas, Especial)
```css
/* Iconos */
text-purple-400    #c084fc  ████
text-purple-300    #d8b4fe  ████

/* Bordes */
border-purple-400/30  rgba(192, 132, 252, 0.3)  ████

/* Gradientes */
from-purple-500/20    rgba(168, 85, 247, 0.2)   ████
to-pink-600/10        rgba(219, 39, 119, 0.1)   ████

/* Sombras (Glow) */
shadow-purple-500/10  rgba(168, 85, 247, 0.1)   ████
```

**Uso:**
- Ocupación del parqueadero
- Consultas rápidas
- Funciones especiales
- Estadísticas avanzadas

---

### 🔴 Rojo (Salidas, Errores, Crítico)
```css
/* Iconos */
text-red-400       #f87171  ████
text-red-200       #fecaca  ████

/* Bordes */
border-red-400/40     rgba(248, 113, 113, 0.4)  ████
border-red-400/60     rgba(248, 113, 113, 0.6)  ████

/* Gradientes */
from-red-500/25       rgba(239, 68, 68, 0.25)   ████
to-pink-600/15        rgba(219, 39, 119, 0.15)  ████

/* Sombras (Glow) */
shadow-red-500/15     rgba(239, 68, 68, 0.15)   ████
shadow-red-500/25     rgba(239, 68, 68, 0.25)   ████
```

**Uso:**
- Cerrar sesión
- Salida de vehículos
- Errores críticos
- Alertas importantes

---

## 🌟 Efectos Especiales

### Resplandor Pulsante (Estado Activo)
```css
className="h-3 w-3 rounded-full bg-emerald-400 
           shadow-[0_0_16px_rgba(52,211,153,0.8)]"

animate={{ scale: [1, 1.2, 1] }}
transition={{ repeat: Infinity, duration: 2 }}
```

### Transparencias de Texto
```css
/* Texto principal */
text-white              #ffffff  ████ (100%)
text-white/90           #ffffff  ████ (90%)
text-white/80           #ffffff  ████ (80%)

/* Texto secundario */
text-blue-100/80        #dbeafe  ████ (80%)
text-blue-200/70        #bfdbfe  ████ (70%)
text-blue-200/60        #bfdbfe  ████ (60%)

/* Texto terciario */
text-blue-200/50        #bfdbfe  ████ (50%)
text-blue-200/40        #bfdbfe  ████ (40%)
text-cyan-300/70        #67e8f9  ████ (70%)
```

---

## 📐 Espaciado y Bordes

### Border Radius
```css
rounded-xl      12px  ⬜ Inputs, botones
rounded-2xl     16px  ⬜ Cards, contenedores
rounded-3xl     24px  ⬜ Secciones grandes
```

### Espaciado
```css
gap-3    12px
gap-4    16px
gap-6    24px

p-4      16px
p-6      24px
p-8      32px
```

### Backdrop Blur
```css
backdrop-blur-sm     4px
backdrop-blur-xl     24px
```

---

## 🎯 Ejemplos de Combinaciones

### Card de Entrada/Activo
```tsx
className="border border-emerald-400/30 
           bg-gradient-to-br from-emerald-500/20 to-green-600/10 
           shadow-lg shadow-emerald-500/10 
           hover:shadow-emerald-500/20"
```

### Card de Pago/Ingreso
```tsx
className="border border-amber-400/30 
           bg-gradient-to-br from-amber-500/20 to-yellow-600/10 
           shadow-lg shadow-amber-500/10 
           hover:shadow-amber-500/20"
```

### Card de Sistema/Info
```tsx
className="border border-cyan-400/30 
           bg-gradient-to-br from-cyan-500/20 to-blue-600/10 
           shadow-lg shadow-cyan-500/10 
           hover:shadow-cyan-500/20"
```

### Card de Consulta/Especial
```tsx
className="border border-purple-400/30 
           bg-gradient-to-br from-purple-500/20 to-pink-600/10 
           shadow-lg shadow-purple-500/10"
```

### Button Cerrar Sesión
```tsx
className="border border-red-400/40 
           bg-gradient-to-r from-red-500/25 to-pink-600/15 
           shadow-lg shadow-red-500/15 
           hover:border-red-400/60 
           hover:shadow-red-500/25"
```

---

## 🖼️ Referencias Visuales

### Jerarquía de Colores
1. **Iconos principales**: 400 (más brillantes)
2. **Texto principal**: 200-300 + 80-90% opacidad
3. **Bordes**: 400 con 20-40% opacidad
4. **Sombras**: 500 con 5-20% opacidad
5. **Fondos**: Gradientes con 10-25% opacidad

### Modo de Uso
- **Hover**: Aumentar opacidad de border (+10-20%) y shadow (+5-10%)
- **Active**: Aumentar saturación del color
- **Focus**: Ring con color principal al 30-50%

---

Documento generado el 12 de febrero de 2026  
Versión: 1.0 - Modern Dark Glassmorphism Design
