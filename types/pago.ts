export interface TarjetaPendiente {
  id: string;
  codigo: string;
  codigo_barras: string | null;
  qr_code: string | null;
  estado: string;
  ingreso_id: string;
  hora_entrada: string;
  tipo_vehiculo: string;
  placa: string;
  color: string;
  marca: string;
  modelo: string;
}

export interface InformacionVehicular {
  tipoVehiculo: string;
  placa: string;
  color: string;
  marca: string;
  modelo: string;
  horaEntrada: string;
  fechaEntrada: string;
}

export interface CalculoTarifa {
  tiempoTotal: {
    horas: number;
    minutos: number;
    segundos: number;
    totalMinutos: number;
    totalMinutosCobro: number; // Minutos para cálculo de tarifa (redondeado hacia arriba)
    totalSegundos: number;
  };
  desglose: DesgloseTarifa[];
  totalAPagar: number;
}

export interface DesgloseTarifa {
  descripcion: string;
  minutos: number;
  tarifa: number;
  subtotal: number;
}

export interface DatosPago {
  ingresoId: string;
  codigoTarjeta: string;
  tarjetaId: string;
  horaEntrada: string;
  horaSalida: string;
  tiempoTotal: string;
  totalAPagar: number;
  descuento: number;
  metodoPago: string;
  observaciones: string;
  usuarioSalidaId: string;
  negocioId: string;
}

export interface DatosRecibo {
  fecha: string;
  horaEntrada: string;
  horaSalida: string;
  numeroTarjeta: string;
  tiempoTotal: string;
  costoTotal: number;
  metodoPago: string;
  descuento: number;
}
