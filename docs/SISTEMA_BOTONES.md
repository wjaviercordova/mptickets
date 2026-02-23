# Sistema de Botones Estandarizado

## Descripción General

Este documento define el sistema de estilos estandarizado para todos los botones de acción en **MP Tickets**. El sistema mantiene la consistencia visual basada en el diseño **Glassmorphism Adaptativo Profesional** (Modern Glass Dashboard).

---

## Archivo de Configuración

📁 **Ubicación:** `/lib/button-styles.ts`

Este archivo exporta:
- `buttonStyles`: Objeto con todos los estilos de botones por tipo de acción
- `buttonSizes`: Variantes de tamaño (sm, md, lg, xl)
- `motionButtonProps`: Props para animaciones con Framer Motion

---

## Tipos de Botones

### 1. **GUARDAR / REGISTRAR / CONFIRMAR** (`buttonStyles.save`)

**Color:** Cyan/Blue gradient  
**Uso:** Acción primaria positiva (guardar cambios, registrar datos, confirmar)

```tsx
import { buttonStyles, motionButtonProps } from "@/lib/button-styles";

<motion.button
  {...motionButtonProps}
  onClick={handleSave}
  disabled={loading}
  className={buttonStyles.save}
>
  <Save className="h-5 w-5" />
  Guardar Cambios
</motion.button>
```

**Estilo Visual:**
- Border: `border-cyan-400/40`
- Background: `from-cyan-500/30 to-blue-600/30`
- Hover: `from-cyan-500/50 to-blue-600/50`
- Shadow: `shadow-cyan-500/30`

---

### 2. **EDITAR / MODIFICAR** (`buttonStyles.edit`)

**Color:** Purple/Pink gradient  
**Uso:** Acciones de modificación o edición

```tsx
<motion.button
  {...motionButtonProps}
  onClick={handleEdit}
  className={buttonStyles.edit}
>
  <Edit className="h-5 w-5" />
  Editar
</motion.button>
```

**Estilo Visual:**
- Border: `border-purple-400/40`
- Background: `from-purple-500/30 to-pink-600/30`
- Hover: `from-purple-500/50 to-pink-600/50`
- Shadow: `shadow-purple-500/30`

---

### 3. **VISTA PREVIA / VER** (`buttonStyles.preview`)

**Color:** Purple gradient (lighter)  
**Uso:** Acciones de visualización temporal o preview

```tsx
<motion.button
  {...motionButtonProps}
  onClick={handlePreview}
  className={buttonStyles.preview}
>
  <Eye className="h-5 w-5" />
  Vista Previa
</motion.button>
```

**Estilo Visual:**
- Border: `border-purple-400/40`
- Background: `from-purple-500/30 to-pink-600/30`
- Hover: `from-purple-500/50 to-pink-600/50`

---

### 4. **RESTAURAR / REVERTIR** (`buttonStyles.restore`)

**Color:** Blue slate neutral  
**Uso:** Acciones de restauración o reversión a estado anterior

```tsx
<motion.button
  {...motionButtonProps}
  onClick={handleRestore}
  className={buttonStyles.restore}
>
  <RefreshCw className="h-5 w-5" />
  Restaurar Predeterminado
</motion.button>
```

**Estilo Visual:**
- Border: `border-blue-500/30`
- Background: `bg-[#1e293b]/60`
- Hover: `hover:bg-blue-500/20`
- Text: `text-blue-200`

---

### 5. **CANCELAR / CERRAR** (`buttonStyles.cancel`)

**Color:** Gray neutral  
**Uso:** Acciones de cancelación o cierre

```tsx
<motion.button
  {...motionButtonProps}
  onClick={handleCancel}
  className={buttonStyles.cancel}
>
  <X className="h-5 w-5" />
  Cancelar
</motion.button>
```

**Estilo Visual:**
- Border: `border-gray-500/30`
- Background: `bg-gray-800/40`
- Hover: `hover:bg-gray-700/50`
- Text: `text-gray-200`

---

### 6. **ELIMINAR / BORRAR** (`buttonStyles.delete`)

**Color:** Red/Orange gradient  
**Uso:** Acciones destructivas (eliminar, borrar, remover)

```tsx
<motion.button
  {...motionButtonProps}
  onClick={handleDelete}
  disabled={loading}
  className={buttonStyles.delete}
>
  <Trash2 className="h-5 w-5" />
  Eliminar
</motion.button>
```

**Estilo Visual:**
- Border: `border-red-400/40`
- Background: `from-red-500/30 to-orange-600/30`
- Hover: `from-red-500/50 to-orange-600/50`
- Shadow: `shadow-red-500/30`

---

### 7. **SELECCIONAR / ELEGIR** (`buttonStyles.select`)

**Color:** Cyan/Blue gradient (suave)  
**Uso:** Acciones de selección o elección

```tsx
<motion.button
  {...motionButtonProps}
  onClick={handleSelect}
  className={buttonStyles.select}
>
  <CreditCard className="h-5 w-5" />
  Seleccionar
</motion.button>
```

**Estilo Visual:**
- Border: `border-cyan-400/40`
- Background: `from-cyan-500/20 to-blue-600/20`
- Hover: `from-cyan-500/30 to-blue-600/30`
- Text: `text-cyan-300`

---

### 8. **ÉXITO / SUCCESS** (`buttonStyles.success`)

**Color:** Emerald/Green gradient  
**Uso:** Acciones principales de éxito o registro (botones destacados)

```tsx
<motion.button
  {...motionButtonProps}
  onClick={handleRegistrar}
  disabled={loading}
  className={buttonStyles.success}
>
  <PlusCircle className="h-6 w-6" />
  Registrar Ingreso
</motion.button>
```

**Estilo Visual:**
- Border: `border-emerald-400/40`
- Background: `from-emerald-500/30 to-green-600/30`
- Hover: `from-emerald-500/50 to-green-600/50`
- Shadow: `shadow-emerald-500/20`

---

## Variantes de Tamaño

```tsx
import { buttonSizes } from "@/lib/button-styles";

// Pequeño
<button className={`${buttonStyles.save} ${buttonSizes.sm}`}>Guardar</button>

// Mediano (por defecto)
<button className={buttonStyles.save}>Guardar</button>

// Grande
<button className={`${buttonStyles.save} ${buttonSizes.lg}`}>Guardar</button>

// Extra Grande
<button className={`${buttonStyles.save} ${buttonSizes.xl}`}>Guardar</button>
```

---

## Animaciones con Framer Motion

Todos los botones deben usar las animaciones estándar:

```tsx
import { motion } from "framer-motion";
import { motionButtonProps } from "@/lib/button-styles";

<motion.button
  {...motionButtonProps}  // Incluye whileHover y whileTap
  onClick={handleClick}
  className={buttonStyles.save}
>
  Contenido
</motion.button>
```

**Animaciones incluidas:**
- `whileHover: { scale: 1.02 }` - Escala ligera al hover
- `whileTap: { scale: 0.98 }` - Efecto de presión al click

---

## Ejemplos de Uso

### Formulario de Configuración

```tsx
<div className="flex gap-3">
  <motion.button {...motionButtonProps} onClick={handlePreview} className={buttonStyles.preview}>
    <Eye className="h-5 w-5" />
    Vista Previa
  </motion.button>

  <motion.button {...motionButtonProps} onClick={handleSave} disabled={loading} className={buttonStyles.save}>
    <Save className="h-5 w-5" />
    {loading ? "Guardando..." : "Guardar Cambios"}
  </motion.button>

  <motion.button {...motionButtonProps} onClick={handleRestore} className={buttonStyles.restore}>
    <RefreshCw className="h-5 w-5" />
    Restaurar
  </motion.button>
</div>
```

### Formulario de Ingreso

```tsx
<motion.button
  {...motionButtonProps}
  onClick={handleRegistrar}
  disabled={!isValid || loading}
  className={`${buttonStyles.save} w-full flex items-center justify-center gap-3`}
>
  <PlusCircle className="h-6 w-6" />
  {loading ? "Registrando..." : "Registrar Ingreso"}
</motion.button>
```

### Modal de Confirmación

```tsx
<div className="flex gap-3 justify-end">
  <motion.button {...motionButtonProps} onClick={onClose} className={buttonStyles.cancel}>
    Cancelar
  </motion.button>

  <motion.button {...motionButtonProps} onClick={handleConfirm} className={buttonStyles.delete}>
    <Trash2 className="h-5 w-5" />
    Eliminar
  </motion.button>
</div>
```

---

## Buenas Prácticas

### ✅ DO (Hacer)

1. **Usar siempre los estilos estandarizados** desde `button-styles.ts`
2. **Incluir iconos** de Lucide React para mejor UX
3. **Usar motion.button** con `motionButtonProps` para animaciones
4. **Incluir estados de carga** (disabled, loading text)
5. **Mantener consistencia** de colores según la acción

```tsx
// ✅ Correcto
import { buttonStyles, motionButtonProps } from "@/lib/button-styles";

<motion.button
  {...motionButtonProps}
  onClick={handleSave}
  disabled={loading}
  className={buttonStyles.save}
>
  <Save className="h-5 w-5" />
  {loading ? "Guardando..." : "Guardar"}
</motion.button>
```

### ❌ DON'T (No hacer)

1. **No crear estilos inline personalizados** para botones de acción
2. **No usar colores sólidos** (mantener glassmorphism)
3. **No mezclar estilos** de diferentes tipos de acción
4. **No olvidar el disabled state**

```tsx
// ❌ Incorrecto - estilos hardcodeados
<button
  onClick={handleSave}
  className="bg-blue-500 text-white px-4 py-2 rounded"
>
  Guardar
</button>

// ❌ Incorrecto - colores no estandarizados
<button className="bg-gradient-to-r from-yellow-500 to-orange-500">
  Guardar
</button>
```

---

## Personalización Adicional

Si necesitas agregar clases adicionales (width, flex, etc.), usa template strings:

```tsx
// Agregar width completo
<motion.button
  {...motionButtonProps}
  className={`${buttonStyles.save} w-full`}
>
  Guardar
</motion.button>

// Agregar flex y gap
<motion.button
  {...motionButtonProps}
  className={`${buttonStyles.save} flex items-center gap-2`}
>
  <Save className="h-5 w-5" />
  Guardar
</motion.button>

// Agregar tamaño personalizado
<motion.button
  {...motionButtonProps}
  className={`${buttonStyles.delete} ${buttonSizes.lg}`}
>
  Eliminar
</motion.button>
```

---

## Archivos de Referencia

- **Definición de estilos:** [`/lib/button-styles.ts`](../lib/button-styles.ts)
- **Ejemplo de uso:** [`/components/dashboard/ingreso/IngresoVehiculo.tsx`](../components/dashboard/ingreso/IngresoVehiculo.tsx)
- **Configuración:** [`/components/dashboard/configuracion/AparienciaTab.tsx`](../components/dashboard/configuracion/AparienciaTab.tsx)

---

## Mantenimiento

Al agregar nuevos tipos de acciones:

1. Definir el estilo en `/lib/button-styles.ts`
2. Seguir el patrón glassmorphism (border + gradient + backdrop-blur)
3. Incluir estados hover, disabled
4. Documentar en este archivo
5. Usar en toda la aplicación consistentemente

---

## Changelog

- **2026-02-23:** Sistema de botones estandarizado creado
  - 8 tipos de botones definidos
  - Integración con Framer Motion
  - Documentación completa
