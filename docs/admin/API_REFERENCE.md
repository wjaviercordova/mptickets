# 📡 MPTickets Admin - API Reference

Documentación completa de los endpoints del API del panel de administración.

---

## 🔐 Autenticación

### POST `/api/admin/auth/login`

Autenticación de usuarios administradores.

**Request Body:**
```json
{
  "usuario": "superadmin",
  "password": "Admin@2024"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "usuario": "superadmin",
    "nombre": "Administrador MPTickets",
    "email": "admin@mptickets.com",
    "rol": "superadmin"
  },
  "token": "jwt_token_here"
}
```

**Response Error (401):**
```json
{
  "success": false,
  "error": "Credenciales inválidas"
}
```

---

### POST `/api/admin/auth/logout`

Cerrar sesión de administrador.

**Headers:**
```
Cookie: admin_session=jwt_token
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

---

## 🏢 Gestión de Negocios

### GET `/api/admin/negocios`

Listar todos los negocios de la plataforma.

**Query Parameters:**
- `plan` (optional): `demo` | `premium` | `basica`
- `estado` (optional): `activo` | `inactivo` | `suspendido`
- `page` (optional): número de página (default: 1)
- `limit` (optional): registros por página (default: 20)
- `search` (optional): búsqueda por nombre o código

**Request:**
```
GET /api/admin/negocios?plan=demo&estado=activo&page=1&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nombre": "Mipartking",
      "codigo": "mp01",
      "email": "contacto@mipartking.com",
      "plan": "DEMO",
      "estado": "activo",
      "fecha_creacion": "2024-01-15T10:00:00Z",
      "fecha_expiracion": "2024-02-14T10:00:00Z",
      "limite_usuarios": 1,
      "limite_tarjetas": 10,
      "capacidad_maxima": 10,
      "dias_restantes": 12,
      "licencia_activa": true,
      "tarjetas_usadas": 5,
      "usuarios_activos": 1,
      "vehiculos_activos": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### GET `/api/admin/negocios/[id]`

Obtener detalles completos de un negocio específico.

**Request:**
```
GET /api/admin/negocios/550e8400-e29b-41d4-a716-446655440000
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombre": "Mipartking",
    "codigo": "mp01",
    "descripcion": "Parqueadero centro comercial",
    "email": "contacto@mipartking.com",
    "telefono": "+593987654321",
    "direccion": "Av. Principal 123",
    "ciudad": "Quito",
    "plan": "PREMIUM",
    "estado": "activo",
    "configuracion": {
      "tema": "moderno",
      "idioma": "es",
      "moneda": "USD"
    },
    "fecha_creacion": "2024-01-15T10:00:00Z",
    "fecha_expiracion": null,
    "limite_usuarios": 10,
    "limite_tarjetas": 100,
    "capacidad_maxima": 100,
    // Datos calculados
    "usuarios_activos": 3,
    "tarjetas_usadas": 45,
    "vehiculos_activos": 23,
    "ocupacion_porcentaje": 23,
    "ingresos_mes_actual": 4500.50,
    // Usuario admin del negocio
    "admin_user": {
      "id": "uuid",
      "usuario": "admin",
      "nombre": "Juan Pérez",
      "email": "admin@mipartking.com",
      "ultimo_acceso": "2024-03-12T08:30:00Z"
    }
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "error": "Negocio no encontrado"
}
```

---

### POST `/api/admin/negocios`

Crear un nuevo negocio.

**Request Body:**
```json
{
  // Información básica
  "nombre": "Parking Tower",
  "codigo": "pt01",
  "email": "contacto@parkingtower.com",
  "telefono": "+593987654321",
  "direccion": "Calle Norte 456",
  "ciudad": "Guayaquil",
  "descripcion": "Parqueadero edificio comercial",
  
  // Configuración de licencia
  "plan": "DEMO", // o "PREMIUM"
  
  // Usuario administrador inicial
  "admin_usuario": "admin",
  "admin_password": "Temp@123!",
  "admin_nombre": "María González",
  "admin_email": "admin@parkingtower.com",
  
  // Opciones adicionales
  "seed_data": true, // Crear datos iniciales
  "enviar_email": true // Enviar credenciales por email
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Negocio creado exitosamente",
  "data": {
    "negocio": {
      "id": "uuid",
      "nombre": "Parking Tower",
      "codigo": "pt01",
      "plan": "DEMO",
      "fecha_expiracion": "2024-04-11T10:00:00Z"
    },
    "admin_user": {
      "id": "uuid",
      "usuario": "admin",
      "password_temporal": "Temp@123!"
    },
    "seeds_creados": {
      "configuracion_sistema": 30,
      "parametros": 3,
      "tarjetas": 10
    }
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "error": "Código de negocio ya existe",
  "details": {
    "field": "codigo",
    "message": "El código 'pt01' ya está en uso"
  }
}
```

---

### PATCH `/api/admin/negocios/[id]`

Actualizar información de un negocio.

**Request Body (parcial):**
```json
{
  "nombre": "Parking Tower - Sucursal Norte",
  "telefono": "+593999999999",
  "estado": "activo"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Negocio actualizado exitosamente",
  "data": {
    // negocio actualizado completo
  }
}
```

---

### DELETE `/api/admin/negocios/[id]`

Eliminar un negocio (soft delete).

**Request:**
```
DELETE /api/admin/negocios/550e8400-e29b-41d4-a716-446655440000
```

**Query Parameters:**
- `hard_delete` (optional): `true` para eliminación permanente (default: false)

**Response (200):**
```json
{
  "success": true,
  "message": "Negocio eliminado exitosamente",
  "tipo_eliminacion": "soft", // o "hard"
  "registros_afectados": {
    "usuarios": 5,
    "tarjetas": 50,
    "codigos": 2340,
    "configuracion_sistema": 30,
    "parametros": 3
  }
}
```

---

### POST `/api/admin/negocios/[id]/seed`

Ejecutar seed de datos iniciales para un negocio existente.

**Request Body:**
```json
{
  "tipos": ["configuracion_sistema", "parametros", "tarjetas"],
  "sobrescribir": false, // Si true, elimina datos existentes
  "cantidad_tarjetas": 10
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Seeds ejecutados exitosamente",
  "resultados": {
    "configuracion_sistema": {
      "creados": 30,
      "actualizados": 0
    },
    "parametros": {
      "creados": 3,
      "actualizados": 0
    },
    "tarjetas": {
      "creados": 10,
      "actualizados": 0
    }
  }
}
```

---

## 🔑 Gestión de Licencias

### GET `/api/admin/licencias`

Listar todas las licencias con su estado.

**Query Parameters:**
- `vencen_en_dias` (optional): filtrar licencias que vencen en X días
- `estado` (optional): `Activa` | `Expirada` | `Sin vencimiento`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "negocio_id": "uuid",
      "negocio_nombre": "Mipartking",
      "plan": "DEMO",
      "estado": "activo",
      "fecha_expiracion": "2024-03-20T00:00:00Z",
      "dias_restantes": 8,
      "estado_licencia": "Activa",
      "licencia_activa": true,
      "alerta": "vence_pronto" // si faltan <= 7 días
    }
  ],
  "resumen": {
    "total_licencias": 45,
    "activas": 38,
    "expiradas": 5,
    "vencen_7_dias": 3,
    "vencen_30_dias": 8
  }
}
```

---

### PATCH `/api/admin/licencias/[negocio_id]`

Actualizar licencia de un negocio.

**Request Body:**
```json
{
  "accion": "cambiar_plan", // o "renovar", "extender"
  "nuevo_plan": "PREMIUM", // si accion = cambiar_plan
  "dias_extension": 30 // si accion = renovar o extender
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Licencia actualizada a PREMIUM",
  "data": {
    "plan_anterior": "DEMO",
    "plan_nuevo": "PREMIUM",
    "fecha_expiracion_anterior": "2024-03-20T00:00:00Z",
    "fecha_expiracion_nueva": null,
    "limite_usuarios_anterior": 1,
    "limite_usuarios_nuevo": 10,
    "limite_tarjetas_anterior": 10,
    "limite_tarjetas_nuevo": 100,
    "capacidad_maxima_anterior": 10,
    "capacidad_maxima_nuevo": 100
  }
}
```

---

### POST `/api/admin/licencias/[negocio_id]/renovar`

Renovar licencia DEMO por X días.

**Request Body:**
```json
{
  "dias": 30
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Licencia renovada por 30 días",
  "data": {
    "fecha_expiracion_anterior": "2024-03-20T00:00:00Z",
    "fecha_expiracion_nueva": "2024-04-19T00:00:00Z",
    "dias_agregados": 30,
    "estado": "activo"
  }
}
```

---

### PATCH `/api/admin/licencias/[negocio_id]/suspender`

Suspender o reactivar un negocio.

**Request Body:**
```json
{
  "accion": "suspender", // o "reactivar"
  "motivo": "Falta de pago" // opcional
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Negocio suspendido exitosamente",
  "data": {
    "estado_anterior": "activo",
    "estado_nuevo": "suspendido",
    "motivo": "Falta de pago",
    "sesiones_cerradas": 3
  }
}
```

---

## 🔧 Gestión de Contraseñas

### PATCH `/api/admin/negocios/[negocio_id]/admin-password`

Cambiar contraseña del administrador de un negocio.

**Request Body:**
```json
{
  "nueva_password": "NuevaPass@2024",
  "enviar_email": true, // Notificar al admin del negocio
  "require_cambio_login": true // Forzar cambio en primer login
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente",
  "data": {
    "usuario_admin": "admin",
    "email_enviado": true,
    "require_cambio_login": true,
    "fecha_cambio": "2024-03-12T10:30:00Z"
  }
}
```

---

## 📊 Estadísticas y Reportes

### GET `/api/admin/stats`

Obtener estadísticas generales de la plataforma.

**Response (200):**
```json
{
  "success": true,
  "data": {
    // Negocios
    "total_negocios": 45,
    "negocios_activos": 38,
    "negocios_demo": 20,
    "negocios_premium": 18,
    "negocios_suspendidos": 5,
    "negocios_expirados": 2,
    
    // Usuarios
    "total_usuarios": 150,
    "usuarios_activos_hoy": 87,
    "usuarios_activos_semana": 120,
    
    // Capacidad
    "capacidad_total_plataforma": 2450,
    "vehiculos_activos_ahora": 1230,
    "ocupacion_promedio": 50.2,
    
    // Licencias
    "licencias_vencen_7_dias": 3,
    "licencias_vencen_30_dias": 8,
    "licencias_expiradas": 2,
    
    // Actividad
    "ingresos_registrados": 245000.50,
    "tickets_procesados_mes": 15230,
    "tickets_procesados_hoy": 456,
    
    // Tendencias
    "crecimiento_negocios_mes": 8.5, // porcentaje
    "conversion_demo_premium": 45.2 // porcentaje
  },
  "fecha_calculo": "2024-03-12T10:00:00Z"
}
```

---

### GET `/api/admin/stats/negocios-por-plan`

Distribución de negocios por plan.

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "plan": "DEMO", "cantidad": 20, "porcentaje": 44.4 },
    { "plan": "PREMIUM", "cantidad": 18, "porcentaje": 40.0 },
    { "plan": "basica", "cantidad": 7, "porcentaje": 15.6 }
  ]
}
```

---

### GET `/api/admin/stats/actividad-reciente`

Últimas acciones realizadas en la plataforma.

**Query Parameters:**
- `limit` (optional): cantidad de registros (default: 50)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tipo": "negocio_creado",
      "descripcion": "Nuevo negocio 'Parking Tower' creado",
      "usuario_admin": "superadmin",
      "fecha": "2024-03-12T09:45:00Z",
      "metadata": {
        "negocio_id": "uuid",
        "negocio_nombre": "Parking Tower",
        "plan": "DEMO"
      }
    },
    {
      "id": "uuid",
      "tipo": "licencia_actualizada",
      "descripcion": "Licencia de 'Mipartking' actualizada a PREMIUM",
      "usuario_admin": "superadmin",
      "fecha": "2024-03-12T08:30:00Z",
      "metadata": {
        "negocio_id": "uuid",
        "plan_anterior": "DEMO",
        "plan_nuevo": "PREMIUM"
      }
    }
  ]
}
```

---

## 🔍 Búsqueda y Filtros

### GET `/api/admin/search`

Búsqueda global en la plataforma.

**Query Parameters:**
- `q` (required): término de búsqueda
- `tipo` (optional): `negocios` | `usuarios` | `all` (default: all)

**Request:**
```
GET /api/admin/search?q=parking&tipo=negocios
```

**Response (200):**
```json
{
  "success": true,
  "query": "parking",
  "resultados": {
    "negocios": [
      {
        "id": "uuid",
        "nombre": "Parking Tower",
        "codigo": "pt01",
        "plan": "DEMO",
        "estado": "activo",
        "match_score": 0.95
      }
    ],
    "usuarios": [],
    "total": 1
  }
}
```

---

## ❌ Códigos de Error

| Código | Mensaje | Descripción |
|--------|---------|-------------|
| 400 | Bad Request | Datos inválidos en el request |
| 401 | Unauthorized | No autenticado o token inválido |
| 403 | Forbidden | No tiene permisos para esta acción |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto (ej: código duplicado) |
| 422 | Unprocessable Entity | Error de validación |
| 500 | Internal Server Error | Error del servidor |

---

## 🔒 Seguridad

### Headers Requeridos

Todos los endpoints (excepto login) requieren:

```
Cookie: admin_session=jwt_token_here
```

O alternativamente:

```
Authorization: Bearer jwt_token_here
```

### Rate Limiting

- **Endpoints de lectura**: 100 requests/minuto
- **Endpoints de escritura**: 30 requests/minuto
- **Login**: 5 intentos/minuto por IP

---

## 📝 Ejemplos de Uso

### Flujo completo: Crear negocio con datos iniciales

```typescript
// 1. Login como superadmin
const loginRes = await fetch('/api/admin/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    usuario: 'superadmin',
    password: 'Admin@2024'
  })
});

const { token } = await loginRes.json();

// 2. Crear nuevo negocio
const negocioRes = await fetch('/api/admin/negocios', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    nombre: 'Parking Tower',
    codigo: 'pt01',
    email: 'contacto@parkingtower.com',
    plan: 'DEMO',
    admin_usuario: 'admin',
    admin_password: 'Temp@123!',
    admin_nombre: 'María González',
    seed_data: true
  })
});

const negocio = await negocioRes.json();
console.log('Negocio creado:', negocio.data.negocio.id);
console.log('Password temporal:', negocio.data.admin_user.password_temporal);
```

### Actualizar licencia DEMO a PREMIUM

```typescript
const licenciaRes = await fetch(`/api/admin/licencias/${negocioId}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    accion: 'cambiar_plan',
    nuevo_plan: 'PREMIUM'
  })
});

const resultado = await licenciaRes.json();
console.log('Licencia actualizada:', resultado.data);
```

---

## 🚀 Webhooks (Futuro)

En futuras versiones, se implementarán webhooks para notificar eventos:

- `negocio.creado`
- `negocio.actualizado`
- `negocio.suspendido`
- `licencia.actualizada`
- `licencia.por_vencer`
- `licencia.expirada`
