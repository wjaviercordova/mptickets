# 🔧 MPTickets - Guía de Resolución de Problemas

## 📋 Tabla de Contenidos
1. [Errores Comunes](#errores-comunes)
2. [Dependencias](#dependencias)
3. [Base de Datos](#base-de-datos)
4. [Soluciones Rápidas](#soluciones-rápidas)

---

## ❌ Errores Comunes

### Error: "Export resolveFetch doesn't exist in target module"

**Síntoma:**
```
Export resolveFetch doesn't exist in target module
./node_modules/@supabase/functions-js/dist/module/FunctionsClient.js
```

**Causa:** 
- Dependencias de Supabase corruptas o versiones incompatibles
- Cache de node_modules corrupto

**Solución:**
```bash
# 1. Detener el servidor
pkill -f "next dev"

# 2. Limpiar completamente
rm -rf node_modules package-lock.json .next

# 3. Reinstalar con versiones estables
npm install --legacy-peer-deps

# 4. Reiniciar el servidor
npm run dev
```

---

### Error: "ERESOLVE unable to resolve dependency tree"

**Síntoma:**
```
npm error ERESOLVE unable to resolve dependency tree
npm error peer react@"^16.5.1 || ^17.0.0 || ^18.0.0"
```

**Causa:**
- Conflictos de versiones entre React 19 y librerías que esperan React 18

**Solución:**
```bash
npm install --legacy-peer-deps
```

O agregar archivo `.npmrc`:
```
legacy-peer-deps=true
```

---

### Error: "cookieStore.get is not a function"

**Síntoma:**
```
TypeError: cookieStore.get is not a function
```

**Causa:**
- En Next.js 15+, `cookies()` retorna una Promise

**Solución:**
```typescript
// ❌ Incorrecto
const cookieStore = cookies();
const value = cookieStore.get("key");

// ✅ Correcto
const cookieStore = await cookies();
const value = cookieStore.get("key");
```

---

### Error: "Attempted to call createMotionComponent() from the server"

**Síntoma:**
```
Error: Attempted to call createMotionComponent() from the server
```

**Causa:**
- Intentar usar Framer Motion en un Server Component

**Solución:**
```typescript
// Agregar "use client" al inicio del archivo
"use client"

import { motion } from "framer-motion"
```

---

## 📦 Dependencias

### Versiones Compatibles (Verificadas)

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.7",
    "@types/bcryptjs": "^2.4.6",
    "bcryptjs": "^2.4.3",
    "framer-motion": "^11.15.0",
    "lucide-react": "^0.468.0",
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3"
  }
}
```

### Actualizar Dependencias

```bash
# Ver versiones desactualizadas
npm outdated

# Actualizar a versiones menores/patch (seguro)
npm update

# Actualizar a versiones mayores (con cuidado)
npm install package@latest
```

---

## 🗄️ Base de Datos

### Error: "No se pudieron cargar los datos en tiempo real"

**Síntoma:**
- Dashboard muestra mensaje de advertencia
- Stats muestran valores en 0

**Verificar:**

1. **Variables de entorno (.env.local)**
```bash
# Verificar que existan
cat .env.local

# Debe contener:
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

2. **Conexión a Supabase**
```typescript
// Probar en una ruta de API
const supabase = createServerClient();
const { data, error } = await supabase.from('negocios').select('*').limit(1);
console.log('Conexión:', error ? 'Fallida' : 'Exitosa');
```

3. **Row Level Security (RLS)**
```sql
-- Verificar políticas en Supabase Dashboard
-- Authentication > Policies

-- Temporalmente deshabilitar RLS para debug (NO EN PRODUCCIÓN)
ALTER TABLE negocios DISABLE ROW LEVEL SECURITY;
```

---

### Error: "Negocio no encontrado"

**Causa:**
- Cookie de sesión perdida
- Código de negocio incorrecto

**Solución:**
```bash
# 1. Limpiar cookies del navegador
# Chrome: DevTools > Application > Cookies > Clear All

# 2. Volver a hacer login con código correcto
# Default: mp01
```

---

## ⚡ Soluciones Rápidas

### Reinicio Completo del Proyecto

```bash
# 1. Detener todos los procesos
pkill -f "next dev"

# 2. Limpiar todo
rm -rf node_modules package-lock.json .next

# 3. Reinstalar
npm install --legacy-peer-deps

# 4. Reiniciar
npm run dev
```

### Limpiar Cache de Next.js

```bash
rm -rf .next
npm run dev
```

### Verificar Puerto en Uso

```bash
# Ver qué está usando el puerto 3000
lsof -i :3000

# Matar proceso en puerto 3000
kill -9 $(lsof -t -i:3000)
```

### Regenerar package-lock.json

```bash
rm -f package-lock.json
npm install --legacy-peer-deps
```

---

## 🔍 Debugging Avanzado

### Habilitar Logs Verbose de npm

```bash
npm install --legacy-peer-deps --loglevel verbose
```

### Ver Conflictos de Dependencias

```bash
npm ls @supabase/supabase-js
npm ls react
```

### Verificar Versiones Instaladas

```bash
npm list --depth=0
```

---

## 🚀 Comandos de Mantenimiento

### Actualización de Seguridad

```bash
# Auditoría de seguridad
npm audit

# Corregir vulnerabilidades automáticamente
npm audit fix

# Corregir con breaking changes (cuidado)
npm audit fix --force
```

### Limpieza de npm Cache

```bash
npm cache clean --force
```

### Verificar Integridad de node_modules

```bash
npm ci
```

---

## 📝 Checklist de Diagnóstico

Cuando algo no funciona, verificar en orden:

- [ ] ¿El servidor está corriendo? (`npm run dev`)
- [ ] ¿Hay errores en la terminal?
- [ ] ¿Hay errores en el navegador (F12 > Console)?
- [ ] ¿Las variables de entorno están configuradas?
- [ ] ¿Las dependencias están instaladas? (`ls node_modules`)
- [ ] ¿El puerto 3000 está libre?
- [ ] ¿Hay cambios sin guardar?
- [ ] ¿Se reinició el servidor después de cambios?

---

## 🔗 Links Útiles

- [Next.js Troubleshooting](https://nextjs.org/docs/messages)
- [Supabase Docs](https://supabase.com/docs)
- [npm Error Codes](https://docs.npmjs.com/cli/commands)
- [Framer Motion Docs](https://www.framer.com/motion/)

---

**Última actualización:** 12 de Febrero, 2026  
**Mantenedor:** Javier Córdova
