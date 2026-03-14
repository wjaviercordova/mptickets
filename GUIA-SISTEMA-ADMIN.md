# 🚀 Guía del Sistema de Administración MPTickets

## 📋 Resumen del Sistema

El sistema se ha restructurado para simplificar la creación de negocios. Ahora el **superadmin solo ingresa el código del negocio y el plan**, y el sistema crea automáticamente todos los datos necesarios.

---

## 🔑 Credenciales del Superadmin

Ya tienes creado el superadmin en la tabla `administradores_sistema`:

- **URL**: http://localhost:3000/admin/login
- **Usuario**: `superadmin`
- **Password**: `Admin123!`

---

## 🎯 Flujo Simplificado de Creación de Negocios

### Paso 1: El superadmin ingresa
- ✅ **Código del Negocio** (Ej: PARK001)
- ✅ **Plan** (demo o premium)
- ✅ **Fecha de Expiración** (solo si es demo, por defecto: hoy + 30 días)

### Paso 2: El sistema crea automáticamente

#### 1️⃣ **Tabla `negocios`**
Se crea con datos base desde: `/data/defaults/negocio-base.json`

```json
{
  "nombre": "nombre-mptickets",
  "descripcion": "Sistema de gestión de parqueadero - mptickets",
  "direccion": "direccion-mptickets",
  "telefono": "9999999999",
  "email": "correo@dominio.com",
  "ciudad": "Ciudad",
  "limite_usuarios": 1,
  "limite_tarjetas": 10,
  "capacidad_maxima": 10,
  "estado": "activo"
}
```

**+ El código y plan que ingresó el superadmin**

---

#### 2️⃣ **Tabla `usuarios` - Usuario Admin**
Se crea automáticamente desde: `/data/defaults/usuario-admin-base.json`

**Credenciales por defecto:**
- **Usuario**: `admin`
- **Password**: `admin123`
- **Rol**: `admin`
- **Email**: admin@mipartking.com

Este usuario es el administrador del negocio recién creado y puede ingresar a:
- **URL**: http://localhost:3000/login

---

#### 3️⃣ **Tabla `configuracion_sistema` - 30 registros**
Se crean automáticamente desde: `/data/defaults/configuracion-sistema-base.json`

Incluye configuraciones como:
- Capacidades (autos: 10, motos: 3, pesados: 0, camionetas: 3)
- Moneda (USD)
- IVA (15%)
- Horarios de atención
- Configuración de impresión
- Tema del sistema
- Y 20+ configuraciones más

---

#### 4️⃣ **Tabla `parametros` - 2 registros**
Se crean automáticamente desde: `/data/defaults/parametros-base.json`

**Tarifas por defecto:**

**AUTO:**
- 1-9 min: $1.00
- 10-59 min: $1.00
- Jornada Diurna: $6.00
- Jornada Nocturna: $4.00
- Jornada Total: $9.00

**MOTO:**
- 1-2 min: $0.50
- 3-59 min: $1.00
- Jornada Diurna: $3.00
- Jornada Nocturna: $2.00
- Jornada Total: $4.00

---

#### 5️⃣ **Tabla `tarjetas` - 10 registros**
Se crean automáticamente 10 tarjetas numeradas del 1 al 10:

```
- Código: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
- Estado: activo (1)
- Perdida: no (0)
- Asignadas al usuario admin que se creó
```

---

## 📊 Diferencia entre Planes

### 🔵 **Plan DEMO**
- **Duración**: 30 días (editable por el superadmin)
- **Fecha de Expiración**: Hoy + 30 días (puede ser modificada)
- **Propósito**: Prueba temporal

### 🟣 **Plan PREMIUM**
- **Duración**: Sin vencimiento
- **Fecha de Expiración**: `NULL` (ilimitado)
- **Propósito**: Plan permanente

---

## 🔄 Orden de Creación

El sistema crea las tablas en este orden para evitar conflictos:

1. **negocios** → Crea el negocio base
2. **usuarios** → Crea el usuario admin (relacionado con negocio_id)
3. **configuracion_sistema** → Crea 30 configuraciones (relacionadas con negocio_id)
4. **parametros** → Crea 2 tarifas (relacionadas con negocio_id)
5. **tarjetas** → Crea 10 tarjetas (relacionadas con negocio_id y usuario_creacion_id)

---

## 🎨 Interfaz del Wizard

El nuevo wizard tiene **solo 2 pasos**:

### Paso 1: Configuración Básica
- Campo: Código del Negocio (REQUERIDO, min 3 caracteres, alfanumérico)
- Selector: Plan (demo o premium)
- Campo: Fecha de Expiración (solo visible si es demo, editable)

### Paso 2: Confirmación
- Resumen de datos
- Lista de lo que se creará automáticamente
- Botón "Crear Negocio"

---

## 🗂️ Archivos de Datos Base

Todos los datos base están en: `/data/defaults/`

- `negocio-base.json` → Datos del negocio
- `usuario-admin-base.json` → Usuario administrador
- `configuracion-sistema-base.json` → 30 configuraciones
- `parametros-base.json` → 2 tarifas (AUTO y MOTO)

**Puedes editar estos archivos para cambiar los datos por defecto.**

---

## ✅ Cómo Probar

### 1. Ingresar al panel de admin:
```
URL: http://localhost:3000/admin/login
Usuario: superadmin
Password: Admin123!
```

### 2. Crear un negocio nuevo:
- Clic en "Nuevo Negocio"
- Ingresar código: `PARK001`
- Seleccionar plan: `premium`
- Clic en "Siguiente"
- Revisar resumen
- Clic en "Crear Negocio"

### 3. Verificar la creación:
El sistema mostrará:
- ✅ Negocio creado
- ✅ Usuario admin creado (admin / admin123)
- ✅ 30 configuraciones creadas
- ✅ 2 parámetros creados
- ✅ 10 tarjetas creadas

### 4. Ingresar al negocio creado:
```
URL: http://localhost:3000/login
Usuario: admin
Password: admin123
Código de Negocio: PARK001
```

---

## 🔧 Modificaciones Realizadas

### ✅ Archivos Nuevos Creados:
- `/data/defaults/negocio-base.json`
- `/data/defaults/usuario-admin-base.json`
- `/data/defaults/configuracion-sistema-base.json`
- `/data/defaults/parametros-base.json`

### ✅ Archivos Modificados:
- `/lib/admin/negocios.ts` → Función `createNegocio()` completamente reescrita
- `/app/admin/negocios/nuevo/page.tsx` → Wizard simplificado a 2 pasos
- `/app/api/admin/negocios/route.ts` → Validaciones actualizadas
- `/types/admin.ts` → Tipo `NegocioFormData` simplificado, `PlanType` actualizado
- `/lib/utils/plan-config.ts` → Planes actualizados a 'demo' y 'premium'
- `/app/admin/negocios/page.tsx` → Badges de planes actualizados

### ✅ Cambios en la Base de Datos:
- Plan types: `DEMO, PREMIUM, basica` → `demo, premium`
- Tabla: `admin_users` → `administradores_sistema`

---

## 🛠️ Mantenimiento

### Cambiar datos por defecto:
Edita los archivos JSON en `/data/defaults/`

### Agregar más configuraciones:
Edita `/data/defaults/configuracion-sistema-base.json`

### Modificar tarifas:
Edita `/data/defaults/parametros-base.json`

### Cambiar credenciales del admin:
Edita `/data/defaults/usuario-admin-base.json` (la contraseña se encriptará automáticamente)

---

## 🎉 ¡Listo para Usar!

El sistema está completamente configurado y listo para crear negocios de manera automática y rápida.

**¿Alguna duda o necesitas más funcionalidades?** Solo indica qué necesitas y lo implementamos.
