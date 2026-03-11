# 📊 Módulo de Reportes - MPTickets

## Descripción General

El módulo de Reportes proporciona análisis avanzados y visualización de datos para toma de decisiones en el sistema de gestión de parqueaderos. Incluye 6 tipos de reportes especializados con filtros configurables y funcionalidad de impresión optimizada.

## Tipos de Reportes Disponibles

### 1. Dashboard Ejecutivo 🎯
**Propósito**: Vista consolidada de KPIs principales para alta dirección

**Métricas incluidas**:
- Ingresos totales vs período anterior
- Ingreso promedio por transacción
- Duración promedio de estadía
- Tasa de descuento aplicada
- Tipo de vehículo más frecuente
- Método de pago preferido
- Gráfico de tendencia de ingresos
- Alertas inteligentes (ej: tasa de descuento alta)

**Ideal para**: Gerentes, directores, reportes rápidos de gestión

---

### 2. Ingresos Consolidado 💰
**Propósito**: Análisis financiero detallado del período

**Métricas incluidas**:
- Ingresos brutos (antes de descuentos)
- Descuentos otorgados totales y porcentuales
- Ingresos netos finales
- Análisis de crecimiento/decrecimiento
- Distribución por método de pago
- Tabla diaria de ingresos con promedios
- Comparación entre mitades del período

**Ideal para**: Contabilidad, análisis financiero, auditorías

---

### 3. Ocupación y Performance 📈
**Propósito**: Análisis de uso del estacionamiento y patrones de ocupación

**Métricas incluidas**:
- Total de vehículos atendidos
- Duración promedio de estadía
- Promedio diario de vehículos
- Distribución por hora del día (gráfico de barras)
- Identificación de horas pico (top 5)
- Actividad por día de la semana
- Días de alta ocupación

**Ideal para**: Operaciones, planificación de personal, optimización de recursos

---

### 4. Análisis por Tipo de Vehículo 🚗
**Propósito**: Entender preferencias y patrones por categoría de vehículo

**Métricas incluidas**:
- Distribución porcentual por tipo
- Ingresos generados por tipo
- Duración promedio por categoría
- Descuentos aplicados por tipo
- Gráfico circular de distribución
- Tabla comparativa completa
- Ticket promedio por tipo

**Ideal para**: Marketing, pricing strategy, análisis de mercado

---

### 5. Métodos de Pago 💳
**Propósito**: Análisis de preferencias de pago y canales

**Métricas incluidas**:
- Ingresos totales por método
- Número de métodos disponibles
- Método preferido (más utilizado)
- Distribución porcentual de ingresos y transacciones
- Barras comparativas duales (ingresos vs transacciones)
- Ticket promedio por método
- Insights de preferencias

**Ideal para**: Finanzas, configuración de TPV, análisis de costos operativos

---

### 6. Productividad de Usuarios 👥
**Propósito**: Evaluación del desempeño de operadores del sistema

**Métricas incluidas**:
- Usuarios activos en el período
- Promedio de transacciones por usuario
- Ingresos promedio generados
- Top 3 mejores performers (con medallas)
- Transacciones y participación porcentual
- Descuentos otorgados por usuario
- Tasa de descuento individual
- Tabla completa con rankings

**Ideal para**: Recursos humanos, gestión de personal, incentivos

---

## Filtros Disponibles

### Criterios de Filtrado

1. **Rango de Fechas**
   - Fecha Inicio
   - Fecha Fin
   - Períodos rápidos predefinidos:
     - Hoy
     - Última semana
     - Último mes (por defecto)
     - Últimos 3 meses
     - Último año

2. **Selección de Tipo de Reporte**
   - Interfaz de tarjetas visuales
   - Indicador del reporte activo
   - Cambio instantáneo entre reportes

---

## Características Técnicas

### Sistema de Impresión Inteligente

El módulo utiliza un **componente especializado de impresión** (`ReporteImprimible.tsx`) que convierte automáticamente los gráficos visuales en **reportes ejecutivos en formato texto**:

**Características de impresión:**

- **Formato profesional A4** con márgenes optimizados (1.5cm)
- **Cabecera corporativa**: Nombre de la empresa, sistema y fecha de generación
- **Título dinámico**: Se adapta al tipo de reporte seleccionado
- **Período analizado**: Rango de fechas con formato legible
- **Contenido estructurado**:
  - Secciones claramente delimitadas
  - Tablas con bordes y formato profesional
  - Métricas en texto con contexto explicativo
  - Análisis de tendencias en formato narrativo
  - Rankings y comparativas textuales
  - Totales y subtotales resaltados
- **Pie de página**: Información de confidencialidad

**Comportamiento al imprimir:**

1. Los componentes visuales (gráficos SVG, cards animadas) se **ocultan automáticamente**
2. Se muestra **solo** el componente `ReporteImprimible` con formato texto
3. El navegador abre la vista previa nativa
4. El usuario puede:
   - Imprimir a impresora física
   - Guardar como PDF (opción del navegador)
   - Configurar orientación y márgenes

**Ventajas del formato texto:**

- ✅ Compatible con cualquier impresora
- ✅ Archivos PDF livianos y buscables
- ✅ Formato profesional para auditorías
- ✅ Fácil de archivar y compartir
- ✅ No depende de renderizado de gráficos
- ✅ Legible en blanco y negro

### Performance

- **Carga asíncrona**: Los datos se cargan en background
- **Estados de carga**: Indicadores visuales durante procesamiento
- **Caché**: No caching (revalidate: 0) para datos siempre actualizados
- **Agregación en backend**: Cálculos pesados en servidor

### API Endpoint

**Ruta**: `/api/reportes/datos-consolidados`

**Método**: `GET`

**Query Parameters**:
- `negocio_id` (requerido): ID del negocio
- `fecha_inicio` (opcional): Fecha inicial en formato YYYY-MM-DD
- `fecha_fin` (opcional): Fecha final en formato YYYY-MM-DD
- `tipo_reporte` (opcional): Tipo de reporte solicitado

**Response Structure**:
```typescript
{
  resumen: {
    totalRegistros: number;
    totalIngresos: number;
    totalDescuentos: number;
    totalCostos: number;
    ingresoPromedio: number;
    duracionPromedio: number;
    tasaDescuento: number;
  },
  porTipoVehiculo: Record<string, {
    cantidad: number;
    ingresos: number;
    descuentos: number;
    duracionPromedio: number;
  }>,
  porMetodoPago: Record<string, {
    cantidad: number;
    ingresos: number;
  }>,
  porHora: Record<number, number>,
  porDiaSemana: Record<string, {
    cantidad: number;
    ingresos: number;
  }>,
  tendenciaTemporal: Array<{
    fecha: string;
    cantidad: number;
    ingresos: number;
  }>,
  porUsuario: Record<string, {
    transacciones: number;
    ingresos: number;
    descuentos: number;
  }>
}
```

---

## Arquitectura de Archivos

```
app/dashboard/reportes/
└── page.tsx                 # Página principal (Server Component)

app/api/reportes/
└── datos-consolidados/
    └── route.ts             # API endpoint para datos agregados

components/dashboard/reportes/
├── types.ts                    # Tipos TypeScript compartidos
├── ReportesForm.tsx            # Componente principal con selector y filtros
├── ReporteImprimible.tsx       # 🆕 Componente de impresión en formato texto
├── ReporteEjecutivo.tsx        # Dashboard ejecutivo (visual)
├── ReporteConsolidado.tsx      # Reporte de ingresos (visual)
├── ReporteOcupacion.tsx        # Análisis de ocupación (visual)
├── ReporteTipoVehiculo.tsx     # Análisis por tipo (visual)
├── ReporteMetodosPago.tsx      # Análisis de métodos de pago (visual)
└── ReporteProductividad.tsx    # Análisis de usuarios (visual)

app/globals.css                 # Estilos de impresión optimizados (@media print)
```

**Flujo de impresión:**

1. Usuario hace clic en "Imprimir" o "Descargar PDF"
2. `ReportesForm.tsx` renderiza `ReporteImprimible` (oculto en pantalla con `hidden print:block`)
3. Al ejecutar `window.print()`:
   - CSS `@media print` oculta todos los componentes visuales
   - Solo `ReporteImprimible` se vuelve visible
   - Se genera un documento de texto estructurado listo para imprimir
4. Usuario ve vista previa del navegador con formato texto profesional

---

## Guía de Uso

### Para Usuarios Finales

1. **Acceder al módulo**: Navegar a "Reportes" desde el menú lateral
2. **Seleccionar tipo de reporte**: Click en la tarjeta del reporte deseado
3. **Configurar filtros**:
   - Usar períodos rápidos O
   - Establecer fechas personalizadas
4. **Actualizar**: Click en botón "Actualizar" para regenerar
5. **Imprimir o Descargar**:
   - Click en botón "Imprimir" para vista previa
   - En la vista previa, verás un **reporte ejecutivo en formato texto** profesional
   - Desde la vista previa puedes:
     - Imprimir directamente a impresora
     - Guardar como PDF con tu navegador
   - Click en "Descargar PDF" abre la misma vista previa

#### ¿Qué verás al imprimir?

El sistema genera automáticamente un **reporte ejecutivo en formato texto** con:

- **Cabecera**: Nombre de la empresa y fecha de generación
- **Título**: Tipo de reporte seleccionado
- **Período**: Rango de fechas analizado
- **Resultados**: Todos los datos en formato texto legible
  - Tablas con valores numéricos
  - Métricas clave con descripciones
  - Análisis de tendencias en texto
  - Comparativas y rankings
  - Totales y porcentajes

**Ventaja**: Los gráficos visuales se traducen a texto estructurado, perfecto para documentación formal, auditorías o reportes ejecutivos imprimibles.

### Para Desarrolladores

#### Agregar un Nuevo Reporte

1. Crear componente en `components/dashboard/reportes/ReporteNuevo.tsx`
2. Agregar tipo de reporte en `ReportesForm.tsx` array `tiposReporte`
3. Importar componente y agregar caso en el switch de renderizado
4. (Opcional) Extender lógica de agregación en API si necesita datos específicos

#### Modificar Cálculos

Editar función `calcularMetricas()` en `/app/api/reportes/datos-consolidados/route.ts`

#### Personalizar Estilos de Impresión

Modificar sección `@media print` en `/app/globals.css`

---

## Roadmap y Mejoras Futuras

### En Progreso
- [ ] Exportación a PDF (botón ya disponible)
- [ ] Exportación a Excel con múltiples hojas
- [ ] Comparación entre períodos (año actual vs anterior)

### Planeado
- [ ] Gráficos interactivos con drill-down
- [ ] Reportes programados vía email
- [ ] Dashboard personalizable (drag & drop KPIs)
- [ ] Predicción de ocupación con ML
- [ ] Análisis de rentabilidad por hora/día
- [ ] Benchmarking con otros negocios

---

## Soporte de Base de Datos

### Tablas Utilizadas

- `codigos`: Transacciones de entrada/salida
- `negocios`: Información del negocio
- `usuarios`: Datos de operadores (para productividad)

### Campos Clave

**codigos**:
- `hora_entrada`, `hora_salida`: Para duraciones y tendencias temporales
- `costo`, `descuento`, `total`: Para análisis financiero
- `tipo_vehiculo`: Para segmentación
- `metodo_pago`: Para análisis de pagos
- `usuario_entrada_id`, `usuario_salida_id`: Para productividad

---

## Notas de Performance

### Optimizaciones Aplicadas

1. **Agregación en servidor**: Todos los cálculos pesados en backend
2. **Índices de BD**: Aprovechar índices en `hora_salida`, `negocio_id`
3. **Filtrado temprano**: WHERE clauses en query inicial
4. **Lazy loading**: Componentes se cargan solo cuando se seleccionan
5. **Animaciones CSS**: Uso de transform y opacity para 60fps

### Recomendaciones

- Para períodos > 1 año, considerar paginación o límite de registros
- Ejecutar análisis pesados en horario de baja actividad
- Revisar plan de Supabase si hay > 100k transacciones/mes

---

## Troubleshooting

### El reporte no carga datos
- ✓ Verificar que existan registros con `hora_salida` no nula en el rango de fechas
- ✓ Confirmar que el `negocio_id` en cookies sea válido
- ✓ Revisar logs de consola para errores de API

### Datos incorrectos
- ✓ Verificar zona horaria en `negocios.configuracion.zona_horaria`
- ✓ Confirmar formato de fechas en filtros (YYYY-MM-DD)
- ✓ Revisar que campos `total`, `costo`, `descuento` tengan valores válidos

### Impresión con formato incorrecto o vacío

**Si la vista previa aparece vacía:**
- ✓ Asegúrate de tener datos cargados (haz clic en "Actualizar" primero)
- ✓ Espera a que termine de cargar el reporte visual antes de imprimir
- ✓ Verifica que tu navegador soporte `@media print` (Chrome, Edge, Firefox modernos)
- ✓ Intenta recargar la página del dashboard (F5)

**Si aparecen gráficos en lugar de texto:**
- ✓ Las reglas CSS de impresión pueden no estar cargando correctamente
- ✓ Haz un "hard refresh": Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac)
- ✓ Desactiva extensiones del navegador que puedan interferir con CSS

**Optimización de impresión:**
- ✓ Usar navegadores modernos (Chrome, Edge recomendados)
- ✓ Seleccionar orientación "Portrait" (vertical) en diálogo de impresión
- ✓ Márgenes: Usar "Default" o personalizar a 1.5cm
- ✓ Para guardar como PDF: En la vista previa, selecciona "Guardar como PDF" como destino

---

## FAQ

**Q: ¿Los reportes se actualizan en tiempo real?**  
R: No, debes hacer click en "Actualizar" para recargar datos. Esto es intencional para evitar refresh constante durante análisis.

**Q: ¿Puedo exportar a Excel?**  
R: Actualmente no. La funcionalidad de impresión genera reportes en formato texto profesional. Usa "Guardar como PDF" desde la vista previa de impresión para crear documentos archivables.

**Q: ¿Por qué al imprimir veo texto en lugar de gráficos?**  
R: Es el diseño intencional. Los reportes imprimibles usan **formato texto ejecutivo** para garantizar:
- Compatibilidad total con cualquier impresora
- Archivos PDF livianos y buscables
- Formato profesional para auditorías y documentación formal
- Legibilidad perfecta en blanco y negro

Los gráficos visuales están optimizados para visualización en pantalla, mientras que el formato de impresión está optimizado para documentación profesional.

**Q: ¿Cómo descargo el reporte como PDF?**  
R: 
1. Haz clic en "Imprimir" o "Descargar PDF"
2. En la vista previa que se abre, selecciona destino **"Guardar como PDF"** (en lugar de una impresora física)
3. Elige la ubicación y guarda el archivo
4. El PDF contendrá todo el reporte en formato texto ejecutivo profesional

**Q: ¿Los reportes incluyen datos de vehículos aún estacionados?**  
R: No, solo transacciones completadas (con `hora_salida` registrada).

**Q: ¿Cómo se calculan los "períodos anteriores" para comparación?**  
R: Se divide el rango seleccionado en dos mitades y se compara la segunda mitad vs la primera.

**Q: ¿Puedo filtrar por tipo de vehículo o método de pago?**  
R: En esta versión no, pero cada reporte muestra desglose por esos criterios.

---

## Créditos

**Desarrollado para**: MPTickets - Sistema de Gestión de Parqueaderos  
**Versión**: 1.1.0  
**Última actualización**: Marzo 2026  
**Framework**: Next.js 14 + TypeScript + Tailwind CSS  
**Animaciones**: Framer Motion  
**Base de datos**: Supabase (PostgreSQL)

**Changelog v1.1.0:**
- ✨ Nuevo: Sistema de impresión inteligente con formato texto ejecutivo
- ✨ Nuevo: Componente `ReporteImprimible.tsx` para generación automática de reportes textuales
- ✨ Mejora: Función "Descargar PDF" ahora utiliza el sistema de impresión del navegador
- 🎨 Mejora: CSS de impresión optimizado para ocultar gráficos y mostrar solo texto
- 📝 Mejora: Documentación completa del sistema de impresión

---

**¿Preguntas o sugerencias?** Contacta al equipo de desarrollo.
