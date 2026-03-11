"use client";

import { DatosReportes } from "./types";

interface ReporteImprimibleProps {
  tipoReporte: string;
  datos: DatosReportes;
  fechaInicio: string;
  fechaFin: string;
  nombreNegocio?: string;
}

const currencyFormatter = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
});

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
};

export function ReporteImprimible({
  tipoReporte,
  datos,
  fechaInicio,
  fechaFin,
  nombreNegocio = "MPTickets",
}: ReporteImprimibleProps) {
  const { resumen, porTipoVehiculo, porMetodoPago, porDiaSemana, porUsuario, tendenciaTemporal } = datos;

  const fechaGeneracion = new Date().toLocaleDateString("es-EC", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-EC", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTituloReporte = () => {
    switch (tipoReporte) {
      case "ejecutivo":
        return "Dashboard Ejecutivo";
      case "consolidado":
        return "Ingresos Consolidados";
      case "ocupacion":
        return "Ocupación y Performance";
      case "vehiculos":
        return "Análisis por Tipo de Vehículo";
      case "metodos_pago":
        return "Métodos de Pago";
      case "productividad":
        return "Productividad de Usuarios";
      default:
        return "Reporte General";
    }
  };

  // Calcular crecimiento para reportes que lo necesitan
  const mitad = Math.floor(tendenciaTemporal.length / 2);
  const primeraMetadIngresos = tendenciaTemporal
    .slice(0, mitad)
    .reduce((sum, d) => sum + d.ingresos, 0);
  const segundaMetadIngresos = tendenciaTemporal
    .slice(mitad)
    .reduce((sum, d) => sum + d.ingresos, 0);
  const crecimiento =
    primeraMetadIngresos > 0
      ? ((segundaMetadIngresos - primeraMetadIngresos) / primeraMetadIngresos) * 100
      : 0;

  // Ordenar datos para análisis
  const tiposOrdenados = Object.entries(porTipoVehiculo).sort(
    ([, a], [, b]) => b.cantidad - a.cantidad
  );
  const metodosOrdenados = Object.entries(porMetodoPago).sort(
    ([, a], [, b]) => b.ingresos - a.ingresos
  );
  const usuariosOrdenados = Object.entries(porUsuario)
    .filter(([id]) => id !== "Sin asignar")
    .sort(([, a], [, b]) => b.transacciones - a.transacciones);

  return (
    <div className="hidden print:block bg-white p-8 text-gray-900" style={{ fontSize: "11pt", lineHeight: "1.4" }}>
      {/* Cabecera */}
      <div className="border-b-2 border-gray-300 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{nombreNegocio}</h1>
            <p className="text-sm text-gray-600">Sistema de Gestión de Parqueaderos</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>Fecha de generación:</p>
            <p className="font-medium">{fechaGeneracion}</p>
          </div>
        </div>
      </div>

      {/* Título del reporte */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold uppercase text-gray-900 tracking-wide">
          {getTituloReporte()}
        </h2>
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>Período analizado:</strong> {formatFecha(fechaInicio)} - {formatFecha(fechaFin)}
          </p>
        </div>
      </div>

      {/* Contenido según tipo de reporte */}
      {tipoReporte === "ejecutivo" && (
        <div className="space-y-4">
          <section>
            <h3 className="font-bold text-base mb-2 pb-1 border-b border-gray-300">INDICADORES CLAVE DE DESEMPEÑO (KPIs)</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-gray-600">Total de Ingresos</p>
                <p className="text-lg font-bold">{currencyFormatter.format(resumen.totalIngresos)}</p>
                <p className="text-xs text-gray-500">{resumen.totalRegistros} transacciones procesadas</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-gray-600">Ingreso Promedio por Transacción</p>
                <p className="text-lg font-bold">{currencyFormatter.format(resumen.ingresoPromedio)}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-gray-600">Duración Promedio de Estadía</p>
                <p className="text-lg font-bold">{formatDuration(resumen.duracionPromedio)}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-gray-600">Tasa de Descuento Aplicada</p>
                <p className="text-lg font-bold">{resumen.tasaDescuento.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">
                  {currencyFormatter.format(resumen.totalDescuentos)} en descuentos
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-base mb-2 pb-1 border-b border-gray-300">ANÁLISIS DE CRECIMIENTO</h3>
            <div className="text-sm p-2 bg-gray-50 rounded">
              <p>
                <strong>Tendencia del período:</strong>{" "}
                {crecimiento >= 0 ? (
                  <span className="text-green-700 font-medium">
                    ↑ Crecimiento del {crecimiento.toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-red-700 font-medium">
                    ↓ Disminución del {Math.abs(crecimiento).toFixed(1)}%
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Comparación entre segunda mitad vs primera mitad del período analizado
              </p>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-base mb-2 pb-1 border-b border-gray-300">TIPO DE VEHÍCULO MÁS FRECUENTE</h3>
            {tiposOrdenados.length > 0 && (
              <div className="text-sm p-2 bg-gray-50 rounded">
                <p>
                  <strong>{tiposOrdenados[0][0]}</strong> - {tiposOrdenados[0][1].cantidad} transacciones (
                  {((tiposOrdenados[0][1].cantidad / resumen.totalRegistros) * 100).toFixed(1)}%)
                </p>
                <p className="text-gray-600">
                  Ingresos generados: {currencyFormatter.format(tiposOrdenados[0][1].ingresos)}
                </p>
              </div>
            )}
          </section>

          <section>
            <h3 className="font-bold text-base mb-2 pb-1 border-b border-gray-300">MÉTODO DE PAGO PREFERIDO</h3>
            {metodosOrdenados.length > 0 && (
              <div className="text-sm p-2 bg-gray-50 rounded">
                <p>
                  <strong>{metodosOrdenados[0][0]}</strong> - {metodosOrdenados[0][1].cantidad} transacciones
                </p>
                <p className="text-gray-600">
                  Ingresos procesados: {currencyFormatter.format(metodosOrdenados[0][1].ingresos)} (
                  {((metodosOrdenados[0][1].ingresos / resumen.totalIngresos) * 100).toFixed(1)}%)
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      {tipoReporte === "consolidado" && (
        <div className="space-y-4">
          <section>
            <h3 className="font-bold text-base mb-2 pb-1 border-b border-gray-300">RESUMEN FINANCIERO</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="font-medium">Ingresos Brutos:</span>
                <span className="font-bold">{currencyFormatter.format(resumen.totalCostos)}</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="font-medium">Descuentos Otorgados:</span>
                <span className="font-bold text-red-700">
                  -{currencyFormatter.format(resumen.totalDescuentos)} ({resumen.tasaDescuento.toFixed(1)}%)
                </span>
              </div>
              <div className="flex justify-between p-2 bg-blue-50 rounded border border-blue-200">
                <span className="font-bold">Ingresos Netos:</span>
                <span className="font-bold text-lg">{currencyFormatter.format(resumen.totalIngresos)}</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-base mb-2 pb-1 border-b border-gray-300">TENDENCIA DE INGRESOS</h3>
            <div className="text-sm p-2 bg-gray-50 rounded">
              <p>
                {crecimiento >= 0 ? (
                  <span>
                    Los ingresos han experimentado un <strong className="text-green-700">crecimiento del {crecimiento.toFixed(1)}%</strong> durante el período analizado.
                  </span>
                ) : (
                  <span>
                    Los ingresos han experimentado una <strong className="text-red-700">disminución del {Math.abs(crecimiento).toFixed(1)}%</strong> durante el período analizado.
                  </span>
                )}
              </p>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-base mb-2 pb-1 border-b border-gray-300">DISTRIBUCIÓN POR MÉTODO DE PAGO</h3>
            <div className="text-sm space-y-1">
              {metodosOrdenados.map(([metodo, datos]) => {
                const porcentaje = (datos.ingresos / resumen.totalIngresos) * 100;
                return (
                  <div key={metodo} className="flex justify-between p-1.5 hover:bg-gray-50">
                    <span>
                      <strong>{metodo}</strong> - {datos.cantidad} transacciones
                    </span>
                    <span className="font-medium">
                      {currencyFormatter.format(datos.ingresos)} ({porcentaje.toFixed(1)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="font-bold text-base mb-2 pb-1 border-b border-gray-300">INGRESOS DIARIOS (ÚLTIMOS 10 DÍAS)</h3>
            <div className="text-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-1.5 text-left">Fecha</th>
                    <th className="border border-gray-300 p-1.5 text-right">Transacciones</th>
                    <th className="border border-gray-300 p-1.5 text-right">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {tendenciaTemporal.slice(-10).reverse().map((dia) => (
                    <tr key={dia.fecha}>
                      <td className="border border-gray-300 p-1.5">
                        {new Date(dia.fecha).toLocaleDateString("es-EC", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="border border-gray-300 p-1.5 text-right">{dia.cantidad}</td>
                      <td className="border border-gray-300 p-1.5 text-right font-medium">
                        {currencyFormatter.format(dia.ingresos)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td className="border border-gray-300 p-1.5">TOTAL</td>
                    <td className="border border-gray-300 p-1.5 text-right">{resumen.totalRegistros}</td>
                    <td className="border border-gray-300 p-1.5 text-right">
                      {currencyFormatter.format(resumen.totalIngresos)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </div>
      )}

      {tipoReporte === "ocupacion" && (
        <div className="space-y-4">
          <section>
            <h3 className="font-bold text-base mb-2 pb-1 border-b border-gray-300">MÉTRICAS DE OCUPACIÓN</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="p-2 bg-gray-50 rounded text-center">
                <p className="text-gray-600 text-xs">Total Vehículos</p>
                <p className="text-xl font-bold">{resumen.totalRegistros}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded text-center">
                <p className="text-gray-600 text-xs">Duración Promedio</p>
                <p className="text-xl font-bold">{formatDuration(resumen.duracionPromedio)}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded text-center">
                <p className="text-gray-600 text-xs">Promedio Diario</p>
                <p className="text-xl font-bold">
                  {Math.round(resumen.totalRegistros / tendenciaTemporal.length)}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-base mb-2 pb-1 border-b border-gray-300">ACTIVIDAD POR DÍA DE LA SEMANA</h3>
            <div className="text-sm">
              {Object.entries(porDiaSemana)
                .sort(([, a], [, b]) => b.cantidad - a.cantidad)
                .map(([dia, datos], index) => {
                  const porcentaje = (datos.cantidad / resumen.totalRegistros) * 100;
                  return (
                    <div key={dia} className="flex justify-between p-1.5 hover:bg-gray-50">
                      <span>
                        <strong>{dia}</strong>
                        {index < 3 && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Alta actividad</span>}
                      </span>
                      <span>
                        {datos.cantidad} vehículos ({porcentaje.toFixed(1)}%) - {currencyFormatter.format(datos.ingresos)}
                      </span>
                    </div>
                  );
                })}
            </div>
          </section>

          <section>
            <h3 className="font-bold text-base mb-2 pb-1 border-b border-gray-300">HORAS PICO (TOP 5)</h3>
            <div className="text-sm">
              {Object.entries(datos.porHora)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([hora, cantidad]) => (
                  <div key={hora} className="flex justify-between p-1.5 bg-gray-50 mb-1 rounded">
                    <span className="font-medium">{hora}:00 hrs</span>
                    <span>{cantidad} vehículos</span>
                  </div>
                ))}
            </div>
          </section>
        </div>
      )}

      {tipoReporte === "vehiculos" && (
        <div className="space-y-4">
          <section>
            <h3 className="font-bold text-base mb-2 pb-1 border-b border-gray-300">DISTRIBUCIÓN POR TIPO DE VEHÍCULO</h3>
            <div className="text-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-1.5 text-left">Tipo</th>
                    <th className="border border-gray-300 p-1.5 text-right">Cantidad</th>
                    <th className="border border-gray-300 p-1.5 text-right">%</th>
                    <th className="border border-gray-300 p-1.5 text-right">Ingresos</th>
                    <th className="border border-gray-300 p-1.5 text-right">Promedio</th>
                    <th className="border border-gray-300 p-1.5 text-right">Duración</th>
                  </tr>
                </thead>
                <tbody>
                  {tiposOrdenados.map(([tipo, datos]) => {
                    const porcentaje = (datos.cantidad / resumen.totalRegistros) * 100;
                    return (
                      <tr key={tipo}>
                        <td className="border border-gray-300 p-1.5 font-medium">{tipo}</td>
                        <td className="border border-gray-300 p-1.5 text-right">{datos.cantidad}</td>
                        <td className="border border-gray-300 p-1.5 text-right">{porcentaje.toFixed(1)}%</td>
                        <td className="border border-gray-300 p-1.5 text-right">
                          {currencyFormatter.format(datos.ingresos)}
                        </td>
                        <td className="border border-gray-300 p-1.5 text-right">
                          {currencyFormatter.format(datos.ingresos / datos.cantidad)}
                        </td>
                        <td className="border border-gray-300 p-1.5 text-right">
                          {formatDuration(datos.duracionPromedio || 0)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td className="border border-gray-300 p-1.5">TOTAL</td>
                    <td className="border border-gray-300 p-1.5 text-right">{resumen.totalRegistros}</td>
                    <td className="border border-gray-300 p-1.5 text-right">100%</td>
                    <td className="border border-gray-300 p-1.5 text-right">
                      {currencyFormatter.format(resumen.totalIngresos)}
                    </td>
                    <td className="border border-gray-300 p-1.5 text-right" colSpan={2}>
                      {currencyFormatter.format(resumen.ingresoPromedio)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-base mb-2 pb-1 border-b border-gray-300">ANÁLISIS DESTACADO</h3>
            <div className="text-sm space-y-2">
              {tiposOrdenados.slice(0, 3).map(([tipo, datos], index) => {
                const porcentaje = (datos.cantidad / resumen.totalRegistros) * 100;
                const etiqueta = index === 0 ? "Más frecuente" : index === 1 ? "Segundo lugar" : "Tercer lugar";
                return (
                  <div key={tipo} className="p-2 bg-gray-50 rounded">
                    <p className="font-bold">
                      {etiqueta}: {tipo}
                    </p>
                    <p className="text-gray-700">
                      {datos.cantidad} transacciones ({porcentaje.toFixed(1)}%) generando {currencyFormatter.format(datos.ingresos)} en ingresos
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {tipoReporte === "metodos_pago" && (
        <div className="space-y-4">
          <section>
            <h3 className="font-bold text-base mb-2 pb-1 border-b border-gray-300">RESUMEN DE MÉTODOS DE PAGO</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="p-2 bg-gray-50 rounded text-center">
                <p className="text-gray-600 text-xs">Ingresos Totales</p>
                <p className="text-lg font-bold">{currencyFormatter.format(resumen.totalIngresos)}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded text-center">
                <p className="text-gray-600 text-xs">Métodos Disponibles</p>
                <p className="text-lg font-bold">{metodosOrdenados.length}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded text-center">
                <p className="text-gray-600 text-xs">Método Preferido</p>
                <p className="text-lg font-bold truncate">{metodosOrdenados[0]?.[0] || "N/A"}</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-base mb-2 pb-1 border-b border-gray-300">COMPARATIVA DE MÉTODOS</h3>
            <div className="text-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-1.5 text-left">Método</th>
                    <th className="border border-gray-300 p-1.5 text-right">Transacciones</th>
                    <th className="border border-gray-300 p-1.5 text-right">% Trans.</th>
                    <th className="border border-gray-300 p-1.5 text-right">Ingresos</th>
                    <th className="border border-gray-300 p-1.5 text-right">% Ing.</th>
                    <th className="border border-gray-300 p-1.5 text-right">Ticket Prom.</th>
                  </tr>
                </thead>
                <tbody>
                  {metodosOrdenados.map(([metodo, datos]) => {
                    const porcentajeCantidad = (datos.cantidad / resumen.totalRegistros) * 100;
                    const porcentajeIngresos = (datos.ingresos / resumen.totalIngresos) * 100;
                    const ticketPromedio = datos.ingresos / datos.cantidad;
                    return (
                      <tr key={metodo}>
                        <td className="border border-gray-300 p-1.5 font-medium">{metodo}</td>
                        <td className="border border-gray-300 p-1.5 text-right">{datos.cantidad}</td>
                        <td className="border border-gray-300 p-1.5 text-right">{porcentajeCantidad.toFixed(1)}%</td>
                        <td className="border border-gray-300 p-1.5 text-right">
                          {currencyFormatter.format(datos.ingresos)}
                        </td>
                        <td className="border border-gray-300 p-1.5 text-right">{porcentajeIngresos.toFixed(1)}%</td>
                        <td className="border border-gray-300 p-1.5 text-right">
                          {currencyFormatter.format(ticketPromedio)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-base mb-2 pb-1 border-b border-gray-300">INSIGHTS DE PREFERENCIAS</h3>
            <div className="text-sm p-2 bg-gray-50 rounded">
              <p>
                El método de pago <strong>{metodosOrdenados[0]?.[0]}</strong> es el preferido por los usuarios,
                representando el{" "}
                <strong>
                  {((metodosOrdenados[0]?.[1]?.ingresos || 0 / resumen.totalIngresos) * 100).toFixed(1)}%
                </strong>{" "}
                de los ingresos totales.
                {metodosOrdenados.length > 1 && (
                  <>
                    {" "}Le sigue <strong>{metodosOrdenados[1][0]}</strong> con{" "}
                    <strong>
                      {((metodosOrdenados[1][1].ingresos / resumen.totalIngresos) * 100).toFixed(1)}%
                    </strong>
                    .
                  </>
                )}
              </p>
            </div>
          </section>
        </div>
      )}

      {tipoReporte === "productividad" && (
        <div className="space-y-4">
          <section>
            <h3 className="font-bold text-base mb-2 pb-1 border-b border-gray-300">MÉTRICAS GENERALES</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="p-2 bg-gray-50 rounded text-center">
                <p className="text-gray-600 text-xs">Usuarios Activos</p>
                <p className="text-lg font-bold">{usuariosOrdenados.length}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded text-center">
                <p className="text-gray-600 text-xs">Promedio/Usuario</p>
                <p className="text-lg font-bold">
                  {Math.round(resumen.totalRegistros / (usuariosOrdenados.length || 1))}
                </p>
                <p className="text-xs text-gray-500">transacciones</p>
              </div>
              <div className="p-2 bg-gray-50 rounded text-center">
                <p className="text-gray-600 text-xs">Ingresos Promedio</p>
                <p className="text-lg font-bold">
                  {currencyFormatter.format(resumen.totalIngresos / (usuariosOrdenados.length || 1))}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-base mb-2 pb-1 border-b border-gray-300">TOP 3 MEJORES PERFORMERS</h3>
            <div className="text-sm space-y-2">
              {usuariosOrdenados.slice(0, 3).map(([usuarioId, datos], index) => {
                const medalla = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";
                const porcentaje = (datos.transacciones / resumen.totalRegistros) * 100;
                return (
                  <div key={usuarioId} className="p-2 bg-gray-50 rounded">
                    <p className="font-bold">
                      {medalla} #{index + 1} - Usuario {usuarioId}
                    </p>
                    <p className="text-gray-700">
                      <strong>{datos.transacciones}</strong> transacciones ({porcentaje.toFixed(1)}%) |{" "}
                      {currencyFormatter.format(datos.ingresos)} en ingresos |{" "}
                      {currencyFormatter.format(datos.descuentos)} en descuentos
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="font-bold text-base mb-2 pb-1 border-b border-gray-300">DETALLE COMPLETO DE USUARIOS</h3>
            <div className="text-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-1.5 text-left">Usuario</th>
                    <th className="border border-gray-300 p-1.5 text-right">Trans.</th>
                    <th className="border border-gray-300 p-1.5 text-right">%</th>
                    <th className="border border-gray-300 p-1.5 text-right">Ingresos</th>
                    <th className="border border-gray-300 p-1.5 text-right">Desc.</th>
                    <th className="border border-gray-300 p-1.5 text-right">Tasa Desc.</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosOrdenados.map(([usuarioId, datos]) => {
                    const porcentaje = (datos.transacciones / resumen.totalRegistros) * 100;
                    const tasaDescuento =
                      datos.ingresos > 0 ? (datos.descuentos / (datos.ingresos + datos.descuentos)) * 100 : 0;
                    return (
                      <tr key={usuarioId}>
                        <td className="border border-gray-300 p-1.5 font-medium">
                          Usuario {usuarioId}
                        </td>
                        <td className="border border-gray-300 p-1.5 text-right">{datos.transacciones}</td>
                        <td className="border border-gray-300 p-1.5 text-right">{porcentaje.toFixed(1)}%</td>
                        <td className="border border-gray-300 p-1.5 text-right">
                          {currencyFormatter.format(datos.ingresos)}
                        </td>
                        <td className="border border-gray-300 p-1.5 text-right">
                          {currencyFormatter.format(datos.descuentos)}
                        </td>
                        <td className="border border-gray-300 p-1.5 text-right">{tasaDescuento.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td className="border border-gray-300 p-1.5">TOTAL</td>
                    <td className="border border-gray-300 p-1.5 text-right">{resumen.totalRegistros}</td>
                    <td className="border border-gray-300 p-1.5 text-right">100%</td>
                    <td className="border border-gray-300 p-1.5 text-right">
                      {currencyFormatter.format(resumen.totalIngresos)}
                    </td>
                    <td className="border border-gray-300 p-1.5 text-right">
                      {currencyFormatter.format(resumen.totalDescuentos)}
                    </td>
                    <td className="border border-gray-300 p-1.5 text-right">
                      {resumen.tasaDescuento.toFixed(1)}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* Pie de página */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500 text-center">
        <p>
          Este reporte fue generado automáticamente por el Sistema de Gestión de Parqueaderos MPTickets
        </p>
        <p className="mt-1">
          Documento confidencial - Para uso interno únicamente
        </p>
      </div>
    </div>
  );
}
