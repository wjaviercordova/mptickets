# Guía Paso a Paso: Crear Índices Compuestos en Supabase

## ⚠️ IMPORTANTE - Lee Esto Primero

Tu base de datos **YA TIENE índices simples básicos** que fueron creados con las tablas. 

Este script agrega **índices COMPUESTOS** que optimizan queries con múltiples columnas (ej: `WHERE negocio_id = ? AND clave = ?`).

### ¿Qué son índices compuestos?
- **Índice simple:** Optimiza 1 columna → `WHERE negocio_id = ?`
- **Índice compuesto:** Optimiza 2+ columnas → `WHERE negocio_id = ? AND clave = ?`

Los índices compuestos son mucho más eficientes para queries complejos.

---

## 📋 Requisitos
- Acceso a tu proyecto Supabase
- Permisos de administrador en la base de datos

## 🚀 Método 1: Desde Supabase Dashboard (Recomendado)

### Paso 1: Acceder al SQL Editor
1. Abre tu navegador y ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto **MP Tickets**
4. En el menú lateral izquierdo, haz clic en **SQL Editor**

### Paso 2: Crear una Nueva Query
1. En SQL Editor, haz clic en el botón **"+ New query"** (esquina superior derecha)
2. Dale un nombre descriptivo: `Optimización - Crear Índices`

### Paso 3: Copiar el Script SQL
1. Abre el archivo `/database/create_indexes.sql` de tu proyecto
2. Copia **todo el contenido** del archivo
3. Pégalo en el editor SQL de Supabase

### Paso 4: Ejecutar el Script
1. Revisa que el script esté completo en el editor
2. Haz clic en el botón **"Run"** (o presiona `Ctrl+Enter` / `Cmd+Enter`)
3. Espera a que se ejecute (puede tardar 10-30 segundos)

### Paso 5: Verificar la Creación
Deberías ver un mensaje de éxito:
```
Success. No rows returned
```

Al final del script verás una tabla con TODOS tus índices (aproximadamente 40-50 en total).

Busca los NUEVOS índices que empiezan con:
- `idx_config_negocio_clave`
- `idx_config_negocio_categoria`
- `idx_parametros_negocio_prioridad`
- `idx_parametros_activos`
- `idx_auditoria_negocio_fecha_desc`
- `idx_codigos_negocio_estado_entrada`
- Y más...

---

## 🔧 Método 2: Desde Terminal con psql (Alternativo)

Si prefieres usar la línea de comandos:

### Paso 1: Obtener tu Connection String
1. En Supabase Dashboard → **Settings** → **Database**
2. En "Connection string", selecciona la pestaña **"URI"**
3. Copia la connection string (se ve así):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
4. Reemplaza `[YOUR-PASSWORD]` con tu contraseña real

### Paso 2: Ejecutar desde Terminal
```bash
# Navega al directorio del proyecto
cd /Users/javiercordova/Documents/GitHub/mptickets

# Ejecuta el script usando psql
psql "postgresql://postgres:[TU-PASSWORD]@db.xxxxx.supabase.co:5432/postgres" \
  -f database/create_indexes.sql
```

---

## 📊 Método 3: Ejecutar Índices Individualmente (Más Seguro)

Si prefieres ir paso a paso para ver el efecto de cada índice:

### 1. Índices para configuracion_sistema
```sql
-- Ejecutar uno a uno en SQL Editor

CREATE INDEX IF NOT EXISTS idx_configuracion_sistema_negocio_clave 
ON public.configuracion_sistema(negocio_id, clave);

CREATE INDEX IF NOT EXISTS idx_configuracion_sistema_categoria 
ON public.configuracion_sistema(negocio_id, categoria);
```

### 2. Índices para parametros
```sql
CREATE INDEX IF NOT EXISTS idx_parametros_negocio_prioridad 
ON public.parametros(negocio_id, prioridad);

CREATE INDEX IF NOT EXISTS idx_parametros_tipo_vehiculo 
ON public.parametros(negocio_id, tipo_vehiculo);

CREATE INDEX IF NOT EXISTS idx_parametros_estado 
ON public.parametros(negocio_id, estado) 
WHERE estado = 'activo';
```

### 3. Índices para auditoria
```sql
CREATE INDEX IF NOT EXISTS idx_auditoria_negocio_fecha 
ON public.auditoria(negocio_id, fecha_hora DESC);

CREATE INDEX IF NOT EXISTS idx_auditoria_usuario 
ON public.auditoria(usuario_id, fecha_hora DESC);

CREATE INDEX IF NOT EXISTS idx_auditoria_tabla 
ON public.auditoria(tabla, fecha_hora DESC);
```

---

## ✅ Verificación de Resultados

### Ver todos los índices creados
```sql
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

### Ver tamaño de cada índice
```sql
SELECT
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid::regclass)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY pg_relation_size(indexrelid::regclass) DESC;
```

### Analizar uso de índices
```sql
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY idx_scan DESC;
```

---

## 🎯 Impacto Esperado

| Tabla | Query Afectado | Antes | Después |
|-------|---------------|-------|---------|
| `configuracion_sistema` | Búsqueda por negocio_id | 50-100ms | 5-10ms |
| `parametros` | Lista de tarifas ordenadas | 30-60ms | 3-8ms |
| `auditoria` | Historial por fecha | 100-200ms | 10-20ms |

**Mejora total:** Entre **70-90% más rápido** en queries que usan índices.

---

## ⚠️ Resolución de Problemas

### Error: "permission denied"
**Solución:** Asegúrate de estar usando la contraseña correcta y tener role de `postgres` (admin).

### Error: "relation does not exist"
**Solución:** Algunas tablas aún no existen (ej: `tarjetas`). Esto es normal, ejecuta los demás índices.

### Los índices no mejoran el rendimiento
**Solución:**
1. Ejecuta `ANALYZE` en las tablas:
   ```sql
   ANALYZE public.configuracion_sistema;
   ANALYZE public.parametros;
   ANALYZE public.auditoria;
   ```
2. Espera 5-10 minutos para que PostgreSQL optimice el query planner

### Ver si un índice se está usando
```sql
EXPLAIN ANALYZE
SELECT * FROM configuracion_sistema 
WHERE negocio_id = '09753da3-535a-4b7c-9f46-50196b8364c6';
```
Deberías ver: `Index Scan using idx_configuracion_sistema_negocio_clave`

---

## 🔄 Mantenimiento Periódico

### Actualizar estadísticas (1 vez por semana)
```sql
ANALYZE public.configuracion_sistema;
ANALYZE public.parametros;
ANALYZE public.auditoria;
```

### Reindexar (1 vez al mes, en horario de bajo tráfico)
```sql
REINDEX TABLE CONCURRENTLY public.configuracion_sistema;
REINDEX TABLE CONCURRENTLY public.parametros;
REINDEX TABLE CONCURRENTLY public.auditoria;
```

---

## 📈 Monitoreo en Producción

### Opción 1: Supabase Dashboard
1. Ve a **Reports** → **Database**
2. Revisa "Slow Queries"
3. Identifica queries que tarden >100ms

### Opción 2: Query desde SQL
```sql
-- Top 10 queries más lentas
SELECT 
    calls,
    total_time,
    mean_time,
    query
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## 🎓 Recursos Adicionales

- [Supabase Database Indexes](https://supabase.com/docs/guides/database/postgres/indexes)
- [PostgreSQL Index Types](https://www.postgresql.org/docs/current/indexes-types.html)
- [Query Performance Analysis](https://supabase.com/docs/guides/platform/performance)

---

## ✨ Próximos Pasos Después de Crear Índices

1. ✅ Ejecutar el script `create_indexes.sql`
2. ✅ Verificar que se crearon correctamente
3. ✅ Ejecutar `ANALYZE` en todas las tablas
4. 🔄 Probar tu aplicación (`npm run build && npm start`)
5. 📊 Comparar velocidad antes/después con DevTools
6. 📝 Anotar las mejoras de performance

---

**¿Necesitas ayuda?** Si encuentras algún error durante la ejecución, copia el mensaje de error y pregúntame. ¡Estoy aquí para ayudarte! 🚀
