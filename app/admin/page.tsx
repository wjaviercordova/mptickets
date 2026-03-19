import Link from "next/link";
import { Building2, Plus, Calendar, MapPin, Search, FileBarChart } from "lucide-react";
import DashboardStats from "@/components/admin/DashboardStats";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

async function getDashboardData() {
  try {
    // Obtener estadísticas
    const [negociosResult, adminsResult, usuariosResult] = await Promise.all([
      supabaseAdmin.from("negocios").select("id, estado", { count: "exact" }),
      supabaseAdmin.from("administradores_sistema").select("id", { count: "exact" }),
      supabaseAdmin.from("usuarios").select("id", { count: "exact" }),
    ]);

    const totalNegocios = negociosResult.count || 0;
    const negociosActivos =
      negociosResult.data?.filter((n) => n.estado === "activo").length || 0;
    const totalAdmins = adminsResult.count || 0;
    const totalUsuarios = usuariosResult.count || 0;

    // Obtener negocios recientes
    const { data: negociosRecientes, error: negociosError } = await supabaseAdmin
      .from("negocios")
      .select("id, nombre, ciudad, estado, fecha_creacion")
      .order("fecha_creacion", { ascending: false })
      .limit(5);

    if (negociosError) {
      console.error("Error fetching negocios:", negociosError);
    }

    return {
      stats: {
        totalNegocios,
        negociosActivos,
        totalAdmins,
        totalUsuarios,
      },
      negociosRecientes: negociosRecientes || [],
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      stats: {
        totalNegocios: 0,
        negociosActivos: 0,
        totalAdmins: 0,
        totalUsuarios: 0,
      },
      negociosRecientes: [],
    };
  }
}

export default async function AdminDashboardPage() {
  const { stats, negociosRecientes } = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* Estadísticas */}
      <DashboardStats stats={stats} />

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/admin/negocios/nuevo"
          className="group flex items-start gap-4 rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 to-green-600/10 p-6 backdrop-blur-sm shadow-lg shadow-emerald-500/10 transition-all hover:border-emerald-400/40 hover:shadow-xl hover:shadow-emerald-500/20"
        >
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-400/30 bg-[#0f172a]/60 shadow-md shadow-emerald-500/10 backdrop-blur-sm transition group-hover:scale-110">
              <Plus className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-white">Nuevo Negocio</h3>
              <p className="mt-1 font-body text-sm text-blue-200/60">
                Registrar un nuevo cliente en el sistema
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/negocios"
          className="group flex items-start gap-4 rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/20 to-yellow-600/10 p-6 backdrop-blur-sm shadow-lg shadow-amber-500/10 transition-all hover:border-amber-400/40 hover:shadow-xl hover:shadow-amber-500/20"
        >
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/30 bg-[#0f172a]/60 shadow-md shadow-amber-500/10 backdrop-blur-sm transition group-hover:scale-110">
              <Building2 className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-white">Gestionar Negocios</h3>
              <p className="mt-1 font-body text-sm text-blue-200/60">
                Ver, editar y administrar todos los negocios
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/consultas"
          className="group flex items-start gap-4 rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-500/20 to-pink-600/10 p-6 backdrop-blur-sm shadow-lg shadow-purple-500/10 transition-all hover:border-purple-400/40 hover:shadow-xl hover:shadow-purple-500/20"
        >
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-400/30 bg-[#0f172a]/60 shadow-md shadow-purple-500/10 backdrop-blur-sm transition group-hover:scale-110">
              <Search className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-white">Consultas</h3>
              <p className="mt-1 font-body text-sm text-blue-200/60">
                Buscar Negocios
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/reportes"
          className="group flex items-start gap-4 rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 to-blue-600/10 p-6 backdrop-blur-sm shadow-lg shadow-cyan-500/10 transition-all hover:border-cyan-400/40 hover:shadow-xl hover:shadow-cyan-500/20"
        >
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/30 bg-[#0f172a]/60 shadow-md shadow-cyan-500/10 backdrop-blur-sm transition group-hover:scale-110">
              <FileBarChart className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-white">Reportes</h3>
              <p className="mt-1 font-body text-sm text-blue-200/60">
                Reportes e Informes
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Negocios recientes */}
      <div className="glass-card border-purple-400/20 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-white">Negocios Recientes</h2>
          <Link
            href="/admin/negocios"
            className="font-body text-sm text-purple-300 transition-colors hover:text-purple-200"
          >
            Ver todos →
          </Link>
        </div>

        {negociosRecientes.length === 0 ? (
          <div className="rounded-xl border border-purple-400/20 bg-purple-500/5 p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-purple-300/40" />
            <p className="mt-4 font-body text-sm text-blue-200/60">
              No hay negocios registrados aún
            </p>
            <Link
              href="/admin/negocios/nuevo"
              className="glass-button mt-4 inline-flex items-center gap-2 border-purple-400/30 bg-gradient-to-r from-purple-500/20 to-pink-600/10 px-4 py-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              Crear primer negocio
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {negociosRecientes.map((negocio) => (
              <div
                key={negocio.id}
                className="flex items-center justify-between rounded-xl border border-purple-400/20 bg-purple-500/5 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-purple-400/30 bg-gradient-to-br from-purple-500/20 to-pink-600/10">
                    <Building2 className="h-5 w-5 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="font-body font-semibold text-white">{negocio.nombre}</h3>
                    <div className="mt-1 flex items-center gap-3 font-caption text-xs text-blue-200/60">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {negocio.ciudad}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(negocio.fecha_creacion).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 font-caption text-xs font-semibold ${
                      negocio.estado === "activo"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {negocio.estado === "activo" ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
