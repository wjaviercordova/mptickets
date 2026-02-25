export interface Parametro {
  id: string;
  negocio_id: string;
  tipo_vehiculo: string;
  nombre: string;
  descripcion: string | null;
  prioridad: number;
  tarifa_1_nombre: string;
  tarifa_1_valor: number;
  tarifa_2_nombre: string;
  tarifa_2_valor: number;
  tarifa_3_nombre: string;
  tarifa_3_valor: number;
  tarifa_4_nombre: string;
  tarifa_4_valor: number;
  tarifa_5_nombre: string;
  tarifa_5_valor: number;
  tarifa_6_nombre: string;
  tarifa_6_valor: number;
  tarifa_7_nombre: string;
  tarifa_7_valor: number;
  tarifa_extra: number;
  tarifa_auxiliar: number;
  tarifa_nocturna: number;
  tarifa_fin_semana: number;
  configuracion_avanzada: Record<string, unknown>;
  horarios_especiales: Record<string, unknown>;
  fecha_creacion: string;
  fecha_actualizacion: string;
  estado: string;
}

export interface Tarjeta {
  id: string;
  codigo: string;
  codigo_barras: string | null;
  qr_code: string | null;
  estado: string;
}

export interface UltimoIngreso {
  id: string;
  numeroTarjeta: string;
  codigoBarras?: string;
  horaEntrada: string;
  tipoVehiculo: string;
  estado: string;
  placa: string;
  color: string;
  marca: string;
  modelo: string;
}

export interface IngresoFormData {
  codigoTarjeta: string;
  tipoVehiculo: string;
  parametroId: string;
  tarjetaId: string;
}
