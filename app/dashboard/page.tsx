import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { defaultThemeConfig, type ThemeConfig } from "@/lib/theme-config";

// Revalidar cada 30 segundos - dashboard necesita datos más frescos
export const revalidate = 30;

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
  const usuarioId = cookieStore.get("mp_user_id")?.value;

  let negocioNombre = "";
  let usuarioNombre = "Administrador";
  let themeConfig: ThemeConfig = defaultThemeConfig;
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
      title: "Vehículos Activos",
      value: "0",
      description: "+3 hoy",
      icon: "car",
      gradient: "from-emerald-500/20 to-green-600/10",
    },
    {
      title: "Ingresos Hoy",
      value: currencyFormatter.format(0),
      description: "+12.5% vs ayer",
      icon: "dollar",
      gradient: "from-amber-500/20 to-yellow-600/10",
    },
    {
      title: "Tiempo Promedio",
      value: "0h 0min",
      description: "Última semana",
      icon: "timer",
      gradient: "from-cyan-500/20 to-blue-600/10",
    },
    {
      title: "Ocupación",
      value: "0%",
      description: "Capacidad máxima",
      icon: "activity",
      gradient: "from-purple-500/20 to-pink-600/10",
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
        .select("nombre, capacidad_maxima")
        .eq("id", negocioId)
        .single();

      negocioNombre = negocioData?.nombre ?? "";
      const capacidadMaxima = negocioData?.capacidad_maxima ?? 100;

      // Obtener configuración del tema
      const { data: temaData } = await supabase
        .from("configuracion_sistema")
        .select("valor")
        .eq("negocio_id", negocioId)
        .eq("categoria", "apariencia")
        .eq("clave", "tema_config")
        .single();

      // Parsear configuración del tema si existe
      if (temaData?.valor) {
        try {
          const parsedTheme = JSON.parse(temaData.valor);
          themeConfig = parsedTheme;
        } catch {
          // Usar tema por defecto si hay error
        }
      }

      // Obtener nombre del usuario
      if (usuarioId) {
        const { data: usuarioData } = await supabase
          .from("usuarios")
          .select("nombre")
          .eq("id", usuarioId)
          .single();

        usuarioNombre = usuarioData?.nombre ?? "Administrador";
      }

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
        .eq("estado", "1")
        .gte("hora_entrada", startIso);

      // Obtener tickets de ayer para comparación
      const startOfYesterday = new Date(startOfDay);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      const endOfYesterday = new Date(startOfDay);
      
      const { data: ticketsAyer } = await supabase
        .from("codigos")
        .select("total")
        .eq("negocio_id", negocioId)
        .eq("estado", "1")
        .gte("hora_entrada", startOfYesterday.toISOString())
        .lt("hora_entrada", endOfYesterday.toISOString());

      const { data: movimientos } = await supabase
        .from("codigos")
        .select("id, codigo, placa, hora_entrada, hora_salida, total")
        .eq("negocio_id", negocioId)
        .eq("estado", "1")
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

      const totalCobrosAyer =
        ticketsAyer?.reduce((acc, item) => acc + Number(item.total ?? 0), 0) ??
        0;

      // Calcular porcentaje de cambio en ingresos
      let cambioIngresos = 0;
      if (totalCobrosAyer > 0) {
        cambioIngresos = ((totalCobros - totalCobrosAyer) / totalCobrosAyer) * 100;
      } else if (totalCobros > 0) {
        cambioIngresos = 100;
      }

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

      const ocupacion = capacidadMaxima > 0 
        ? Math.round((Number(activosCount ?? 0) / capacidadMaxima) * 100)
        : 0;

      // Actualizar estadísticas con datos reales
      stats[0].value = String(activosCount ?? 0);
      stats[0].description = ticketsCount ? `${ticketsCount} registros hoy` : "Sin vehículos activos";
      
      stats[1].value = currencyFormatter.format(totalCobros);
      const signo = cambioIngresos >= 0 ? "+" : "";
      stats[1].description = totalCobrosAyer > 0 
        ? `${signo}${cambioIngresos.toFixed(1)}% vs ayer`
        : totalCobros > 0 
          ? "Primeros ingresos del día" 
          : "Sin ingresos hoy";
      
      stats[2].value = formatDuration(promedio);
      stats[2].description = duraciones.length > 0 
        ? `Basado en ${duraciones.length} vehículos` 
        : "Sin datos de estancia";
      
      stats[3].value = `${ocupacion}%`;
      stats[3].description = `${activosCount ?? 0}/${capacidadMaxima} espacios ocupados`;
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
      warningMessage = "No se pudieron cargar los datos en tiempo real.";
    }
  } else {
    warningMessage = "No se encontró un negocio activo para esta sesión.";
  }

  return (
    <div className="space-y-8">
      <DashboardHeader
        negocioNombre={negocioNombre}
        usuarioNombre={usuarioNombre}
        warningMessage={warningMessage}
        themeConfig={themeConfig}
      />

      <DashboardStats stats={stats} movements={recentMovements} />
    </div>
  );
}
