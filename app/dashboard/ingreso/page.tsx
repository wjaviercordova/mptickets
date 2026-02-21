import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { IngresoVehiculo } from "@/components/dashboard/ingreso/IngresoVehiculo";
import type { Parametro, UltimoIngreso } from "@/types/ingreso";

export const revalidate = 10; // Revalidar cada 10 segundos

export default async function IngresoPage() {
  const cookieStore = await cookies();
  const negocioId = cookieStore.get("mp_negocio_id")?.value;
  const usuarioId = cookieStore.get("mp_user_id")?.value;

  if (!negocioId || !usuarioId) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-red-400">No hay sesión activa</p>
      </div>
    );
  }

  const supabase = createServerClient();

  // Obtener parámetros (tipos de vehículo)
  const { data: parametros = [] } = await supabase
    .from("parametros")
    .select("*")
    .eq("negocio_id", negocioId)
    .eq("estado", "activo")
    .order("prioridad", { ascending: false })
    .order("nombre");

  // Obtener último ingreso
  const { data: ultimoIngresoData } = await supabase
    .from("codigos")
    .select(`
      id,
      codigo,
      hora_entrada,
      tipo_vehiculo,
      estado,
      placa,
      color,
      marca,
      modelo,
      tarjeta_id,
      tarjetas (
        codigo
      )
    `)
    .eq("negocio_id", negocioId)
    .order("fecha_creacion", { ascending: false })
    .limit(1)
    .single();

  let ultimoIngreso: UltimoIngreso | null = null;
  if (ultimoIngresoData) {
    const tarjetaData = ultimoIngresoData.tarjetas as unknown as { codigo: string } | null;
    ultimoIngreso = {
      id: ultimoIngresoData.id,
      numeroTarjeta: tarjetaData?.codigo || ultimoIngresoData.codigo,
      horaEntrada: ultimoIngresoData.hora_entrada,
      tipoVehiculo: ultimoIngresoData.tipo_vehiculo,
      estado: ultimoIngresoData.estado,
      placa: ultimoIngresoData.placa,
      color: ultimoIngresoData.color,
      marca: ultimoIngresoData.marca,
      modelo: ultimoIngresoData.modelo,
    };
  }

  return (
    <IngresoVehiculo
      parametros={parametros as Parametro[]}
      negocioId={negocioId}
      usuarioId={usuarioId}
      ultimoIngresoInicial={ultimoIngreso}
    />
  );
}
