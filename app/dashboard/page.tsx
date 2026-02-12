import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const currencyFormatter = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatDuration = (minutes: number) => {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "0m";
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours <= 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
};

const formatRelative = (dateValue?: string | null) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.max(0, Math.round(diffMs / (1000 * 60)));
  if (diffMin < 1) return "Hace 1 min";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHours = Math.round(diffMin / 60);
  return `Hace ${diffHours} h`;
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const negocioId = cookieStore.get("mp_negocio_id")?.value;

  let negocioNombre = "";
  let recentMovements: Array<{
    id: string;
    codigo: string | null;
    placa: string | null;
    hora_entrada: string | null;
    hora_salida: string | null;
    total: number | null;
    relative: string;
  }> = [];

  const stats = [
    {
      title: "Vehículos activos",
      value: "0",
      description: "Entradas registradas en el turno actual",
      icon: "car",
      gradient:
        "from-emerald-500/20 to-emerald-600/10 border-emerald-500/20",
    },
    {
      title: "Cobros del día",
      value: currencyFormatter.format(0),
      description: "Recaudación actual con pagos en efectivo y tarjeta",
      icon: "dollar",
      gradient: "from-amber-500/20 to-amber-600/10 border-amber-500/20",
    },
    {
      title: "Tickets emitidos",
      value: "0",
      description: "Códigos generados durante el día",
      icon: "ticket",
      gradient: "from-purple-500/20 to-purple-600/10 border-purple-500/20",
    },
    {
      title: "Tiempo promedio",
      value: "0m",
      description: "Promedio de permanencia por vehículo",
      icon: "timer",
      gradient: "from-blue-500/20 to-blue-600/10 border-blue-500/20",
    },
  ];

  let warningMessage: string | null = null;

  if (negocioId) {
    try {
      const supabase = createServerClient();
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const startIso = startOfDay.toISOString();

      const { data: negocioData } = await supabase
        .from("negocios")
        .select("nombre")
        .eq("id", negocioId)
        .single();

      negocioNombre = negocioData?.nombre ?? "";

      const { count: activosCount } = await supabase
        .from("codigos")
        .select("id", { count: "exact", head: true })
        .eq("negocio_id", negocioId)
        .eq("estado", "1")
        .is("hora_salida", null);

      const { data: ticketsHoy, count: ticketsCount } = await supabase
        .from("codigos")
        .select("total, hora_entrada, hora_salida", { count: "exact" })
        .eq("negocio_id", negocioId)
        .gte("hora_entrada", startIso);

      const { data: movimientos } = await supabase
        .from("codigos")
        .select("id, codigo, placa, hora_entrada, hora_salida, total")
        .eq("negocio_id", negocioId)
        .order("fecha_creacion", { ascending: false })
        .limit(3);

      recentMovements =
        movimientos?.map((item) => ({
          ...item,
          relative: formatRelative(item.hora_salida ?? item.hora_entrada),
        })) ?? [];

      const totalCobros =
        ticketsHoy?.reduce((acc, item) => acc + Number(item.total ?? 0), 0) ??
        0;

      const duraciones =
        ticketsHoy
          ?.filter((item) => item.hora_entrada && item.hora_salida)
          .map((item) => {
            const entrada = new Date(item.hora_entrada as string).getTime();
            const salida = new Date(item.hora_salida as string).getTime();
            return (salida - entrada) / (1000 * 60);
          }) ?? [];

      const promedio =
        duraciones.length > 0
          ? duraciones.reduce((acc, value) => acc + value, 0) /
            duraciones.length
          : 0;

      stats[0].value = String(activosCount ?? 0);
      stats[1].value = currencyFormatter.format(totalCobros);
      stats[2].value = String(ticketsCount ?? 0);
      stats[3].value = formatDuration(promedio);
    } catch (error) {
      warningMessage = "No se pudieron cargar los datos en tiempo real.";
    }
  } else {
    warningMessage = "No se encontró un negocio activo para esta sesión.";
  }

  return (
    <div className="space-y-8">
      <DashboardHeader
        negocioNombre={negocioNombre}
        warningMessage={warningMessage}
      />

      <DashboardStats stats={stats} movements={recentMovements} />
    </div>
  );
}
