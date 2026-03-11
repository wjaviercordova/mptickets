// Tipos compartidos para el módulo de reportes

export interface DatosReportes {
  resumen: {
    totalRegistros: number;
    totalIngresos: number;
    totalDescuentos: number;
    totalCostos: number;
    ingresoPromedio: number;
    duracionPromedio: number;
    tasaDescuento: number;
  };
  porTipoVehiculo: Record<
    string,
    {
      cantidad: number;
      ingresos: number;
      descuentos: number;
      duracionPromedio?: number;
      duraciones?: number[];
    }
  >;
  porMetodoPago: Record<
    string,
    {
      cantidad: number;
      ingresos: number;
    }
  >;
  porHora: Record<number, number>;
  porDiaSemana: Record<
    string,
    {
      cantidad: number;
      ingresos: number;
    }
  >;
  tendenciaTemporal: Array<{
    fecha: string;
    cantidad: number;
    ingresos: number;
  }>;
  porUsuario: Record<
    string,
    {
      transacciones: number;
      ingresos: number;
      descuentos: number;
    }
  >;
}

export interface BaseReporteProps {
  datos: DatosReportes;
  fechaInicio: string;
  fechaFin: string;
}
