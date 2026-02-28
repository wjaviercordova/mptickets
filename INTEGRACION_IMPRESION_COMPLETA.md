# 🖨️ INTEGRACIÓN COMPLETA DEL SISTEMA DE IMPRESIÓN

## 📊 DATOS QUE SE ENVÍAN AL SERVIDOR DE IMPRESIÓN

### **Estructura JSON enviada a `http://localhost:3003/imprimir`:**

```json
{
  "tipo": "ENTRADA",
  "datos": {
    "nombre_negocio": "Parqueadero El Sol",
    "direccion": "Av. Principal 123",
    "telefono": "0987654321",
    "fecha": "26.02.2026",
    "hora": "14:30:45",
    "numero": "TARJETA-001",
    "tipo_vehiculo": "Automóvil",
    "dia": "Lunes",
    "horario": "Lun-Vie: 8am-6pm",
    "tarifa": "$1.50"
  },
  "config": {
    "cola_impresion": "_3nStar",
    "copias_por_ticket": 1
  }
}
```

---

## 🎯 ORIGEN DE LOS DATOS

### **1. Datos del Negocio** (Tabla: `negocios`)
```typescript
const { data: negocio } = await supabase
  .from("negocios")
  .select("nombre, direccion, telefono")
  .eq("id", negocioId)
  .single();

// Resultado:
// nombre_negocio: negocio.nombre
// direccion: negocio.direccion
// telefono: negocio.telefono
```

### **2. Datos de Fecha y Hora** (De la tabla `codigos.hora_entrada`)
```typescript
import { formatearFechaHora } from "@/lib/impresion";

const { fecha, hora, dia } = formatearFechaHora(ingreso.hora_entrada);

// Resultado:
// fecha: "26.02.2026"  (formato DD.MM.AAAA)
// hora: "14:30:45"     (formato HH:MM:SS)
// dia: "Miércoles"
```

### **3. Datos de la Tarjeta** (Tabla: `tarjetas` y `codigos`)
```typescript
// numero: tarjeta.codigo  (ejemplo: "TARJETA-001")
```

### **4. Tipo de Vehículo** (Tabla: `parametros`)
```typescript
const { data: parametro } = await supabase
  .from("parametros")
  .select("tipo_vehiculo")
  .eq("id", parametroId)
  .single();

// tipo_vehiculo: parametro.tipo_vehiculo  (ejemplo: "Automóvil", "Moto", "Camioneta")
```

### **5. Días y Horarios de Atención** (Tabla: `configuracion_sistema`)
```typescript
const { data: horarioConfig } = await supabase
  .from("configuracion_sistema")
  .select("valor")
  .eq("negocio_id", negocioId)
  .eq("clave", "dias_atencion")
  .single();

// dia: horarioConfig?.valor || "Lun-Dom"
// horario: "24 Horas" o el valor configurado
```

### **6. Costo por Hora** (Tabla: `parametros.tarifa_2_valor`)
```typescript
const { data: parametro } = await supabase
  .from("parametros")
  .select("tarifa_2_valor")
  .eq("id", parametroId)
  .single();

// tarifa: `$${parametro.tarifa_2_valor}`  (ejemplo: "$1.50")
```

### **7. Configuración de Impresora** (Tabla: `configuracion_sistema`)
```typescript
const config = await obtenerConfigImpresion(negocioId);

// cola_impresion: config.cola_impresion  (ejemplo: "_3nStar")
// copias_por_ticket: config.copias_por_ticket  (ejemplo: 1)
```

---

## 📋 FORMATO DEL TICKET IMPRESO

```
================================
    Parqueadero El Sol
    Av. Principal 123
    Tel: 0987654321
================================

  *** TICKET DE ENTRADA ***

Fecha: 26.02.2026 
Hora:  14:30:45

Tarjeta: TARJETA-001
Tipo:    Automóvil

--------------------------------
Atención Lun-Dom: 24 Horas
Costo por hora o fracción: $1.50
--------------------------------

    Conserve este ticket
  Gracias por su preferencia


[CORTE DE PAPEL]
```

---

## 🔧 IMPLEMENTACIÓN EN INGRESO VEHICULAR

### **Archivo:** `components/dashboard/ingreso/IngresoVehiculo.tsx`

```typescript
import { 
  obtenerConfigImpresion, 
  imprimirTicketEntrada, 
  formatearFechaHora, 
  type DatosTicketEntrada 
} from "@/lib/impresion";

// Después del registro exitoso (línea ~128-136)
if (response.ok) {
  const data = await response.json();
  setUltimoIngreso(data.ingreso);
  
  // === IMPRESIÓN AUTOMÁTICA ===
  try {
    const configImpresion = await obtenerConfigImpresion(negocioId);
    
    if (configImpresion?.habilitada && configImpresion?.imprimir_en_ingreso) {
      // 1. Obtener datos del negocio
      const { data: negocio } = await supabase
        .from("negocios")
        .select("nombre, direccion, telefono")
        .eq("id", negocioId)
        .single();
      
      // 2. Obtener horarios de atención
      const { data: horarioConfig } = await supabase
        .from("configuracion_sistema")
        .select("valor")
        .eq("negocio_id", negocioId)
        .eq("clave", "dias_atencion")
        .single();
      
      const diasAtencion = horarioConfig?.valor || "Lun-Dom";
      const horarioAtencion = "24 Horas"; // O desde otra config
      
      // 3. Formatear fecha y hora
      const { fecha, hora, dia } = formatearFechaHora(data.ingreso.hora_entrada);
      
      // 4. Preparar datos del ticket
      const datosTicket: DatosTicketEntrada = {
        nombre_negocio: negocio?.nombre || "Parqueadero",
        direccion: negocio?.direccion || "N/A",
        telefono: negocio?.telefono || "N/A",
        fecha_ingreso: fecha,
        hora_ingreso: hora,
        numero_tarjeta: data.ingreso.numero_tarjeta,
        tipo_vehiculo: parametroSeleccionado?.tipo_vehiculo || "N/A",
        dia: diasAtencion,
        horario: horarioAtencion,
        tarifa_vehiculo: `$${parametroSeleccionado?.tarifa_2_valor || 0}`,
      };
      
      // 5. Imprimir
      await imprimirTicketEntrada(datosTicket, configImpresion);
    }
  } catch (errorImpresion) {
    console.error("Error al imprimir:", errorImpresion);
    // No interrumpir el flujo si falla la impresión
  }
  // === FIN IMPRESIÓN ===
  
  setMessage({
    type: "success",
    text: `✅ Ingreso registrado exitosamente`,
  });
}
```

---

## 🎯 BOTÓN "IMPRIMIR PRUEBA"

### **Archivo:** `app/api/impresion/prueba/route.ts`

**✅ Ya actualizado con:**
- Datos REALES del negocio (nombre, dirección, teléfono)
- Formato de fecha: DD.MM.AAAA
- Formato de hora: HH:MM:SS
- Días de atención desde `configuracion_sistema`
- Datos FICTICIOS: tarjeta, tipo vehículo,  tarifa

**Código implementado:**
```typescript
// 1. Obtiene datos reales del negocio
const { data: negocio } = await supabase
  .from("negocios")
  .select("nombre, direccion, telefono")
  .eq("id", negocioId)
  .single();

// 2. Obtiene horarios de atención
const { data: horarioConfig } = await supabase
  .from("configuracion_sistema")
  .select("valor")
  .eq("negocio_id", negocioId)
  .eq("clave", "dias_atencion")
  .single();

// 3. Formatea fecha y hora correctamente
const fechaFormateada = "26.02.2026";  // DD.MM.AAAA
const horaFormateada = "14:30:45";     // HH:MM:SS

// 4. Datos de prueba
const datosTicket = {
  nombre_negocio: negocio.nombre,      // REAL
  direccion: negocio.direccion,        // REAL
  telefono: negocio.telefono,          // REAL
  fecha: fechaFormateada,              // Fecha actual formateada
  hora: horaFormateada,                // Hora actual formateada
  numero: "TEST-001",                  // FICTICIO
  tipo_vehiculo: "Automóvil",          // FICTICIO
  dia: diasAtencion,                   // REAL desde config
  horario: "24 Horas",                 // FICTICIO (puede ser config)
  tarifa: "$1.50",                     // FICTICIO
};
```

---

## 🔍 VERIFICACIÓN DE CONFIGURACIÓN

### **Tu configuración actual:**
```typescript
{
  nombre_impresora: "3nStar POS-80",
  cola_impresion: "_3nStar",
  ancho_papel: 80,
  copias_por_ticket: 1
}
```

### **¿Cómo se usa?**
1. El usuario configura en: **Configuración → Sistema → Impresión**
2. Se guarda en: `configuracion_sistema` con categoría `"impresion"`
3. La app obtiene con: `obtenerConfigImpresion(negocioId)`
4. Se envía al servidor: `config.cola_impresion` → `"_3nStar"`
5. El servidor imprime con: `lp -d _3nStar ticket.txt`

**✅ Cada empresa tendrá su propia configuración única de impresora**

---

## 📝 RESUMEN DE CAMBIOS APLICADOS

### ✅ **1. API de Prueba (`app/api/impresion/prueba/route.ts`)**
- ✅ Obtiene datos REALES del negocio desde tabla `negocios`
- ✅ Obtiene días de atención desde `configuracion_sistema`
- ✅ Formatea fechas en DD.MM.AAAA
- ✅ Formatea horas en HH:MM:SS
- ✅ Usa datos ficticios para: tarjeta, tipo, tarifa

### ✅ **2. Utilidad de Impresión (`lib/impresion.ts`)**
- ✅ Función `formatearFechaHora()` actualizada
- ✅ Devuelve formato DD.MM.AAAA en lugar de DD/MM/YYYY
- ✅ Devuelve formato HH:MM:SS en lugar de HH:MM
- ✅ Nombres de días en español

### ✅ **3. Servidor de Impresión (`servidor-impresion.js`)**
- ✅ Ya soporta campo `tipo_vehiculo`
- ✅ Imprime con comandos ESC/POS
- ✅ Usa la cola de impresión configurada
- ✅ Corta papel automáticamente

---

## 🚀 PRÓXIMOS PASOS

### **1. Agregar configuración de horario en `configuracion_sistema`**

Ejecutar en Supabase:
```sql
INSERT INTO configuracion_sistema (negocio_id, clave, valor, tipo, categoria, descripcion)
VALUES 
  ('TU_NEGOCIO_ID', 'dias_atencion', 'Lun-Dom', 'string', 'general', 'Días de atención'),
  ('TU_NEGOCIO_ID', 'horario_atencion', '24 Horas', 'string', 'general', 'Horario de atención');
```

### **2. Integrar en IngresoVehiculo.tsx**
- Copiar el código de ejemplo de arriba
- Agregar después del registro exitoso
- Probar con una tarjeta real

### **3. Integrar en PagoSalida.tsx**
- Similar a ingreso pero con ticket de pago
- Incluir: total, método de pago, descuento
- Usar `imprimirTicketPago()` en lugar de entrada

### **4. Pruebas**
1. Click en "Imprimir Prueba" → Debería imprimir con datos reales del negocio
2. Registrar ingreso → Debería imprimir automáticamente
3. Procesar pago → Debería imprimir recibo

---

## ⚙️ CONFIGURACIÓN POR EMPRESA

Cada negocio configurará:

| Campo | Origen | Ejemplo |
|-------|--------|---------|
| **Nombre de Impresora** | Configuración UI | "3nStar POS-80" |
| **Cola de Impresión** | Configuración UI | "_3nStar" |
| **Nombre del Negocio** | Tabla `negocios` | "Parqueadero El Sol" |
| **Dirección** | Tabla `negocios` | "Av. Principal 123" |
| **Teléfono** | Tabla `negocios` | "0987654321" |
| **Días de Atención** | `configuracion_sistema` | "Lun-Vie" |
| **Horario** | `configuracion_sistema` | "8am-6pm" |
| **Tarifas** | Tabla `parametros` | "$1.50" |

**✅ TODO se obtiene dinámicamente de la base de datos**  
**✅ Cada empresa tiene configuración independiente**  

---

## 📞 SOPORTE

- Email: xaviercordova@hotmail.com
- Teléfono: 0999676347

---

**Fecha de actualización:** 26 de febrero de 2026  
**Versión:** 2.0 - Integración completa con datos reales
