# Sistema de Temas - MP Tickets

## 📋 Descripción General

El sistema de temas permite a cada negocio personalizar la apariencia visual del dashboard manteniendo la estructura y diseño base consistente. Solo cambian los colores, mientras que las fuentes, iconos, formas de botones y espaciados permanecen iguales.

## 🎨 Temas Disponibles

### Temas Oscuros
1. **Glassmorphism Dark** (Predeterminado)
   - Estilo moderno con efectos de vidrio esmerilado
   - Colores: Azules y púrpuras con acentos neón
   - Ideal para: Uso prolongado, aspecto futurista

2. **Minimal Dark**
   - Diseño minimalista con tonos grises
   - Colores: Grises con acentos azules sutiles
   - Ideal para: Profesionales, oficinas corporativas

3. **Vibrant Dark**
   - Colores vibrantes y energéticos
   - Colores: Púrpuras intensos con acentos rosas y verdes
   - Ideal para: Ambientes dinámicos, jóvenes

### Temas Claros
4. **Glassmorphism Light**
   - Versión clara del tema glassmorphism
   - Colores: Blancos y grises claros con acentos azules
   - Ideal para: Ambientes luminosos, accesibilidad

5. **Minimal Light**
   - Diseño limpio y profesional
   - Colores: Blancos con grises suaves
   - Ideal para: Oficinas durante el día

6. **Vibrant Light**
   - Versión clara con toques de color
   - Colores: Fondos claros con acentos coloridos
   - Ideal para: Interfaces alegres y modernas

## ⚙️ Opciones de Configuración

### 1. Preset de Tema
Selecciona uno de los 6 temas predefinidos. Al seleccionar un preset, automáticamente se aplican todos sus colores asociados.

### 2. Intensidad de Blur (Desenfoque)
- **Bajo**: 8px - Para hardware de bajos recursos
- **Medio**: 16px - Balance recomendado
- **Alto**: 24px - Máximo efecto glassmorphism

### 3. Opacidad de Vidrio
- Rango: 20% - 100%
- Controla la transparencia de los paneles
- Valores bajos (20-40%): Más transparente, efecto vidrio pronunciado
- Valores altos (80-100%): Más sólido, mejor legibilidad

### 4. Radio de Bordes
- **Pequeño**: 0.5rem (8px) - Aspecto moderno angular
- **Medio**: 1rem (16px) - Balance recomendado
- **Grande**: 1.5rem (24px) - Aspecto suave y redondeado

### 5. Intensidad de Sombras
- **Sin sombras**: Sin efectos de profundidad
- **Baja**: Sombras sutiles
- **Media**: Balance entre profundidad y sutileza
- **Alta**: Sombras pronunciadas para máximo contraste

### 6. Velocidad de Animaciones
- **Sin animaciones**: Máxima performance, accesibilidad
- **Lenta**: 0.5s - Para presentaciones, demos
- **Normal**: 0.3s - Balance recomendado
- **Rápida**: 0.15s - Respuesta inmediata

### 7. Densidad de UI
- **Compacta**: Espaciado reducido, más contenido visible
- **Normal**: Balance recomendado
- **Cómoda**: Espaciado amplio, mejor accesibilidad

## 🔄 Flujo de Trabajo

### 1. Previsualizar Cambios
- Haz cambios en las configuraciones
- Clic en **"Vista Previa"**
- Los cambios se aplican temporalmente
- Si no guardas, se revierten al recargar

### 2. Guardar Cambios
- Después de previsualizar y confirmar
- Clic en **"Guardar Cambios"**
- Se persisten en la base de datos
- Se aplican automáticamente en todas las sesiones

### 3. Restaurar Predeterminado
- Si no te gustan los cambios
- Clic en **"Restaurar Predeterminado"**
- Vuelve al tema Glassmorphism Dark original

## 🏗️ Arquitectura Técnica

### Componentes Principales

1. **`/lib/theme-config.ts`**
   - Define todos los presets de temas
   - Interface `ThemeConfig` con todas las opciones
   - Función `generateThemeCSS()` para crear variables CSS
   - Exporta `defaultThemeConfig` (Glassmorphism Dark)

2. **`/components/theme/ThemeProvider.tsx`**
   - Componente cliente que aplica el tema globalmente
   - Se ejecuta en el layout del dashboard
   - Inyecta variables CSS en `<style id="theme-variables">`
   - Se actualiza cuando cambia `themeConfig`

3. **`/components/dashboard/configuracion/AparienciaTab.tsx`**
   - UI del configurador de temas
   - 6 cards de presets con preview de colores
   - Controles para todas las opciones
   - Botones: Vista Previa, Guardar, Restaurar

4. **`/app/dashboard/layout.tsx`**
   - Layout del dashboard (Server Component)
   - Lee tema desde `configuracion_sistema` table
   - Pasa `themeConfig` al `ThemeProvider`

### Flujo de Datos

```
1. Usuario carga dashboard
   ↓
2. layout.tsx lee tema de DB
   ↓
3. ThemeProvider recibe themeConfig
   ↓
4. Se inyectan variables CSS
   ↓
5. Todo el UI usa esas variables
```

```
1. Usuario modifica tema en AparienciaTab
   ↓
2. Clic en "Vista Previa"
   ↓
3. AparienciaTab.applyTheme() inyecta CSS
   ↓
4. UI se actualiza sin guardar
```

```
1. Usuario confirma y hace clic en "Guardar"
   ↓
2. POST a /api/configuracion/sistema
   ↓
3. Se guarda JSON en configuracion_sistema
   ↓
4. AparienciaTab.applyTheme() actualiza UI
   ↓
5. En próxima recarga, layout lee nuevo tema
```

### Variables CSS Generadas

El sistema genera ~40 variables CSS:
```css
:root {
  /* Colores de fondo */
  --bg-primary: ...;
  --bg-secondary: ...;
  --bg-tertiary: ...;
  
  /* Colores de vidrio/glass */
  --glass-base: ...;
  --glass-overlay: ...;
  
  /* Bordes */
  --border-primary: ...;
  --border-secondary: ...;
  
  /* Texto */
  --text-primary: ...;
  --text-secondary: ...;
  --text-tertiary: ...;
  
  /* Acentos */
  --accent-1: ...;
  --accent-2: ...;
  --accent-3: ...;
  --accent-4: ...;
  --accent-5: ...;
  
  /* Sombras */
  --shadow-color: ...;
  
  /* Efectos */
  --blur-intensity: 16px;
  --glass-opacity: 0.6;
  --border-radius: 1rem;
  --shadow-intensity: 0.5;
  --animation-speed: 0.3s;
}
```

## 💾 Almacenamiento en Base de Datos

### Tabla: `configuracion_sistema`
```sql
INSERT INTO configuracion_sistema (
  negocio_id,
  categoria,
  clave,
  valor,
  tipo,
  descripcion
) VALUES (
  'uuid-del-negocio',
  'apariencia',
  'tema_config',
  '{"mode":"dark","preset":"glassmorphism-dark",...}',  -- JSON completo
  'json',
  'Configuración del tema visual'
);
```

### Estructura del JSON
```typescript
{
  mode: "dark" | "light",
  preset: "glassmorphism-dark" | "glassmorphism-light" | ...,
  colors: {
    bgPrimary: "#0f172a",
    bgSecondary: "#1e293b",
    // ... 12 colores más
  },
  blurIntensity: "medium",
  glassOpacity: 60,
  borderRadius: "medium",
  shadowIntensity: "medium",
  animationSpeed: "normal",
  uiDensity: "normal",
  sidebarCollapsed: false,
  logoUrl?: "url-opcional",
  faviconUrl?: "url-opcional"
}
```

## 🎯 Elementos Adicionales Configurables (Sugerencias)

### 🏆 Alta Prioridad (Branding)

#### 1. Logo Personalizado
**Valor**: Cada negocio puede usar su propio logo
```typescript
logoUrl: string | null;
logoWidth: number; // px
logoHeight: number; // px
```
**Implementación**: Input de file upload + vista previa

#### 2. Favicon Personalizado
**Valor**: Branding en la pestaña del navegador
```typescript
faviconUrl: string | null;
```
**Implementación**: Upload .ico/.png 32x32 o 64x64

#### 3. Nombre y Slogan
**Valor**: Personalización de textos del negocio
```typescript
nombreNegocio: string;
slogan?: string;
mostrarSloganEnLogin: boolean;
```

### 📊 Media Prioridad (UX/Funcionalidad)

#### 4. Configuración de Notificaciones
**Valor**: Personalizar feedback visual/auditivo
```typescript
notificaciones: {
  posicion: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  duracion: number; // segundos
  sonidosHabilitados: boolean;
  sonidoExito: string; // URL del sonido
  sonidoError: string;
  sonidoAdvertencia: string;
}
```

#### 5. Formato de Fecha y Hora
**Valor**: Importante para registros de entrada/salida
```typescript
formatoFechaHora: {
  formatoFecha: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
  formatoHora: "12h" | "24h";
  zonaHoraria: string; // "America/Mexico_City"
  mostrarSegundos: boolean;
}
```

#### 6. Moneda y Formato Numérico
**Valor**: Para mostrar tarifas correctamente
```typescript
moneda: {
  codigo: "MXN" | "USD" | "EUR" | ...;
  simbolo: "$" | "€" | ...;
  posicionSimbolo: "antes" | "despues";
  separadorDecimal: "." | ",";
  separadorMiles: "," | "." | " ";
  decimales: 0 | 2;
}
```

#### 7. Idioma/Localización
**Valor**: Para expansión internacional
```typescript
idioma: "es" | "en" | "pt";
```
**Implementación**: Sistema i18n completo

### 🎨 Baja Prioridad (Personalización Avanzada)

#### 8. Tipografía Base
**Valor**: Permite cambiar fuentes (opcional)
```typescript
tipografia: {
  fuenteHeading: string; // Nombre de Google Font
  fuenteBody: string;
  tamanoBase: 14 | 16 | 18; // px
  lineHeight: 1.5 | 1.6 | 1.7;
}
```

#### 9. Colores Personalizados Avanzados
**Valor**: Para usuarios expertos
```typescript
permitirColoresPersonalizados: boolean;
// Si true, mostrar color pickers para cada variable
```

#### 10. Sidebar Personalizado
**Valor**: Configurar comportamiento del menú
```typescript
sidebar: {
  colapsadoPorDefecto: boolean;
  anchoExpandido: 256 | 288 | 320; // px
  anchoColapsado: 64 | 80; // px
  mostrarTooltipsColapsado: boolean;
}
```

#### 11. Dashboard Personalizado
**Valor**: Widgets y cards configurables
```typescript
dashboard: {
  mostrarReloj: boolean;
  widgetsHabilitados: string[]; // IDs de widgets
  ordenWidgets: string[];
  actualizacionAutomatica: boolean;
  intervaloActualizacion: number; // segundos
}
```

## 📝 Recomendaciones de Implementación

### Fase 1 - Branding Básico (Ahora)
✅ Sistema de temas con 6 presets (Completado)
- Logo personalizado
- Favicon personalizado
- Nombre y slogan

### Fase 2 - Configuración Regional
- Formato de fecha/hora
- Moneda y formato numérico
- Zona horaria

### Fase 3 - UX Avanzada
- Configuración de notificaciones
- Sidebar personalizado
- Dashboard widgets

### Fase 4 - Localización (Futuro)
- Idioma/i18n completo
- Traducciones

## 🐛 Solución de Problemas

### El tema no se aplica al cargar
1. Verificar que existe configuración en DB:
```sql
SELECT * FROM configuracion_sistema 
WHERE categoria = 'apariencia' 
AND clave = 'tema_config';
```

2. Verificar que el JSON es válido
3. Revisar console del navegador por errores

### Los cambios no persisten
1. Verificar que el botón "Guardar Cambios" se ejecutó
2. Revisar respuesta de API en Network tab
3. Verificar permisos de usuario en Supabase

### Performance lenta con blur alto
- Reducir `blurIntensity` a "low" o "medium"
- Reducir `glassOpacity` para menos capas
- Desactivar animaciones si es necesario

## 📚 Referencias

- **Código principal**: `/lib/theme-config.ts`
- **UI del configurador**: `/components/dashboard/configuracion/AparienciaTab.tsx`
- **Provider global**: `/components/theme/ThemeProvider.tsx`
- **API endpoint**: `/app/api/configuracion/sistema/route.ts`
- **Integración**: `/app/dashboard/layout.tsx`

---

**Última actualización**: Creación del sistema de temas
**Versión**: 1.0.0
