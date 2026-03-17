"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import type { NegocioExtended, PlanType } from "@/types/admin";
import { ModalVerDetalles } from "@/components/admin/negocios/ModalVerDetalles";
import { ModalEditarLicencia } from "@/components/admin/negocios/ModalEditarLicencia";
import { ModalConfirmacion } from "@/components/admin/negocios/ModalConfirmacion";

type FilterEstado = "all" | "activo" | "inactivo" | "suspendido";
type FilterPlan = "all" | "DEMO" | "PREMIUM" | "basica";

export default function NegociosPage() {
  const [negocios, setNegocios] = useState<NegocioExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<FilterEstado>("all");
  const [filterPlan, setFilterPlan] = useState<FilterPlan>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Estados para modales
  const [modalVerOpen, setModalVerOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [selectedNegocio, setSelectedNegocio] = useState<NegocioExtended | null>(null);

  // Estados para modal de confirmación/alerta
  const [modalConfirmacionOpen, setModalConfirmacionOpen] = useState(false);
  const [modalConfirmacionConfig, setModalConfirmacionConfig] = useState<{
    tipo: "error" | "confirmacion" | "exito";
    titulo: string;
    mensaje: string | string[];
    textoConfirmar?: string;
    textoCancelar?: string;
    onConfirmar?: () => void;
  }>({
    tipo: "error",
    titulo: "",
    mensaje: "",
    textoCancelar: "Cerrar",
  });

  useEffect(() => {
    fetchNegocios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterEstado, filterPlan]);

  const fetchNegocios = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filterEstado !== "all") params.append("estado", filterEstado);
      if (filterPlan !== "all") params.append("plan", filterPlan);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/admin/negocios?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setNegocios(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching negocios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchNegocios();
  };

  const handleVerDetalles = (negocio: NegocioExtended) => {
    setSelectedNegocio(negocio);
    setModalVerOpen(true);
  };

  const handleEditarLicencia = (negocio: NegocioExtended) => {
    setSelectedNegocio(negocio);
    setModalEditarOpen(true);
  };

  const handleDelete = async (negocio: NegocioExtended) => {
    // Validar condiciones antes de mostrar confirmación
    if (negocio.plan !== "demo") {
      setModalConfirmacionConfig({
        tipo: "error",
        titulo: "No Permitido",
        mensaje: "Solo se pueden eliminar negocios con plan DEMO",
        textoCancelar: "Entendido",
      });
      setModalConfirmacionOpen(true);
      return;
    }

    // Calcular si la licencia está activa
    let licenciaActiva = true;
    if (negocio.fecha_expiracion) {
      const diasRestantes = Math.ceil(
        (new Date(negocio.fecha_expiracion).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      licenciaActiva = diasRestantes > 0;
    }

    if (licenciaActiva) {
      setModalConfirmacionConfig({
        tipo: "error",
        titulo: "Licencia Activa",
        mensaje: [
          "Solo se pueden eliminar negocios DEMO con licencia INACTIVA (vencida).",
          `Este negocio aún tiene ${negocio.dias_restantes} días restantes.`,
        ],
        textoCancelar: "Entendido",
      });
      setModalConfirmacionOpen(true);
      return;
    }

    // Mostrar confirmación de eliminación
    setModalConfirmacionConfig({
      tipo: "confirmacion",
      titulo: "⚠️ Eliminar Negocio",
      mensaje: [
        "Esta acción es IRREVERSIBLE",
        "",
        "Se eliminará permanentemente:",
        `• Negocio: ${negocio.nombre}`,
        "• Todos los usuarios asociados",
        "• Todas las tarjetas",
        "• Todos los registros de ingresos",
        "• Toda la configuración",
        "",
        "¿Estás seguro de continuar?",
      ],
      textoConfirmar: "Sí, Eliminar",
      textoCancelar: "Cancelar",
      onConfirmar: async () => {
        setModalConfirmacionOpen(false);
        
        try {
          const response = await fetch(`/api/admin/negocios/${negocio.id}`, {
            method: "DELETE",
          });

          const data = await response.json();

          if (data.success) {
            // Mostrar éxito
            setModalConfirmacionConfig({
              tipo: "exito",
              titulo: "Eliminado Exitosamente",
              mensaje: "Negocio y todos sus datos relacionados han sido eliminados",
              textoCancelar: "Cerrar",
            });
            setModalConfirmacionOpen(true);
            fetchNegocios();
          } else {
            // Mostrar error
            setModalConfirmacionConfig({
              tipo: "error",
              titulo: "Error al Eliminar",
              mensaje: data.error || "Error al eliminar negocio",
              textoCancelar: "Cerrar",
            });
            setModalConfirmacionOpen(true);
          }
        } catch (error) {
          console.error("Error deleting negocio:", error);
          setModalConfirmacionConfig({
            tipo: "error",
            titulo: "Error",
            mensaje: "Error al eliminar negocio. Por favor intenta nuevamente.",
            textoCancelar: "Cerrar",
          });
          setModalConfirmacionOpen(true);
        }
      },
    });
    setModalConfirmacionOpen(true);
  };

  const getEstadoBadge = (estado: string) => {
    const configs = {
      activo: { color: "bg-emerald-500/20 text-emerald-300", label: "Activo" },
      inactivo: { color: "bg-red-500/20 text-red-300", label: "Inactivo" },
      suspendido: { color: "bg-yellow-500/20 text-yellow-300", label: "Suspendido" },
    };
    const config = configs[estado as keyof typeof configs] || configs.inactivo;
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-caption text-xs font-semibold ${config.color}`}>
        {estado === "activo" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
        {config.label}
      </span>
    );
  };

  const getPlanBadge = (plan: PlanType) => {
    const configs = {
      demo: { color: "bg-blue-500/20 text-blue-300", label: "DEMO" },
      premium: { color: "bg-purple-500/20 text-purple-300", label: "PREMIUM" },
    };
    const config = configs[plan] || configs.demo;
    return (
      <span className={`rounded-full px-2.5 py-1 font-caption text-xs font-semibold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getLicenciaStatus = (negocio: NegocioExtended) => {
    if (negocio.estado_licencia === "Sin vencimiento") {
      return <span className="font-caption text-xs text-emerald-300">Sin vencimiento</span>;
    }

    if (negocio.estado_licencia === "Expirada") {
      return (
        <span className="flex items-center gap-1 font-caption text-xs text-red-300">
          <AlertCircle className="h-3 w-3" />
          Expirada
        </span>
      );
    }

    return (
      <span className="font-caption text-xs text-blue-200/60">
        {negocio.dias_restantes} días restantes
      </span>
    );
  };

  const filteredNegocios = negocios.filter((negocio) =>
    negocio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    negocio.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    negocio.ciudad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-500/20 border-t-purple-400"></div>
          <p className="mt-4 font-body text-sm text-blue-200/60">Cargando negocios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con búsqueda y acciones */}
      <div className="glass-card border-purple-400/20 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-400/60" />
            <input
              type="text"
              placeholder="Buscar por nombre, código o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="glass-input w-full border-purple-500/20 bg-[#0f172a]/60 !pl-11 text-white placeholder:text-blue-200/40 focus:border-purple-400/40"
            />
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/25 to-green-600/15 px-4 py-2.5 text-sm font-medium text-emerald-200 backdrop-blur-sm transition hover:from-emerald-500/35 hover:to-green-600/25 ${
                showFilters ? "from-emerald-500/35 to-green-600/25" : ""
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </button>

            <Link
              href="/admin/negocios/nuevo"
              className="group flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/25 to-green-600/15 px-4 py-2.5 text-sm font-medium text-emerald-200 backdrop-blur-sm transition hover:from-emerald-500/35 hover:to-green-600/25"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span>Nuevo Negocio</span>
            </Link>
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 grid gap-4 border-t border-purple-400/10 pt-4 md:grid-cols-2"
          >
            <div>
              <label className="mb-2 block font-body text-sm font-medium text-blue-200/80">
                Estado
              </label>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value as FilterEstado)}
                className="glass-input w-full border-purple-500/20 bg-[#0f172a]/60 text-white"
              >
                <option value="all">Todos</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
                <option value="suspendido">Suspendidos</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-body text-sm font-medium text-blue-200/80">
                Plan
              </label>
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value as FilterPlan)}
                className="glass-input w-full border-purple-500/20 bg-[#0f172a]/60 text-white"
              >
                <option value="all">Todos</option>
                <option value="DEMO">DEMO</option>
                <option value="PREMIUM">PREMIUM</option>
                <option value="basica">Básica</option>
              </select>
            </div>
          </motion.div>
        )}
      </div>

      {/* Contador */}
      <div className="flex items-center justify-between">
        <p className="font-body text-sm text-blue-200/60">
          Mostrando <span className="font-semibold text-white">{filteredNegocios.length}</span>{" "}
          {filteredNegocios.length === 1 ? "negocio" : "negocios"}
        </p>
      </div>

      {/* Lista de negocios */}
      {filteredNegocios.length === 0 ? (
        <div className="glass-card border-purple-400/20 p-12 text-center">
          <Building2 className="mx-auto h-16 w-16 text-purple-300/40" />
          <h3 className="mt-4 font-display text-lg font-semibold text-white">
            No se encontraron negocios
          </h3>
          <p className="mt-2 font-body text-sm text-blue-200/60">
            {searchTerm || filterEstado !== "all" || filterPlan !== "all"
              ? "Intenta cambiar los filtros de búsqueda"
              : "Crea el primer negocio para comenzar"}
          </p>
          {!searchTerm && filterEstado === "all" && filterPlan === "all" && (
            <Link
              href="/admin/negocios/nuevo"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/25 to-green-600/15 px-4 py-2.5 text-sm font-medium text-emerald-200 backdrop-blur-sm transition hover:from-emerald-500/35 hover:to-green-600/25"
            >
              <Plus className="h-4 w-4" />
              Crear primer negocio
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredNegocios.map((negocio) => (
            <motion.div
              key={negocio.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card group border-purple-400/20 p-6 transition-all hover:border-purple-400/40 hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Info principal */}
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-purple-400/30 bg-gradient-to-br from-purple-500/20 to-pink-600/10">
                      <Building2 className="h-6 w-6 text-purple-300" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display text-lg font-bold text-white">
                            {negocio.nombre}
                          </h3>
                          <p className="mt-1 font-caption text-xs text-purple-300/60">
                            Código: {negocio.codigo}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {getEstadoBadge(negocio.estado)}
                          {getPlanBadge(negocio.plan)}
                        </div>
                      </div>

                      {/* Información de contacto */}
                      <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        <div className="flex items-center gap-2 font-caption text-xs text-blue-200/60">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          {negocio.ciudad || "N/A"}
                        </div>
                        <div className="flex items-center gap-2 font-caption text-xs text-blue-200/60">
                          <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                          {negocio.email}
                        </div>
                        {negocio.telefono && (
                          <div className="flex items-center gap-2 font-caption text-xs text-blue-200/60">
                            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                            {negocio.telefono}
                          </div>
                        )}
                      </div>

                      {/* Estadísticas */}
                      <div className="mt-3 flex flex-wrap gap-4 font-caption text-xs text-blue-200/60">
                        <div>
                          <span className="font-semibold text-white">{negocio.usuarios_activos}</span> /{" "}
                          {negocio.limite_usuarios} usuarios
                        </div>
                        <div>
                          <span className="font-semibold text-white">{negocio.tarjetas_usadas}</span> /{" "}
                          {negocio.limite_tarjetas} tarjetas
                        </div>
                        <div>
                          <span className="font-semibold text-white">{negocio.vehiculos_activos}</span>{" "}
                          vehículos
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {getLicenciaStatus(negocio)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 lg:flex-col lg:w-32">
                  <button
                    onClick={() => handleVerDetalles(negocio)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-400/40 bg-gradient-to-r from-blue-500/25 to-cyan-600/15 px-4 py-2 text-sm font-medium text-blue-200 backdrop-blur-sm transition hover:from-blue-500/35 hover:to-cyan-600/25"
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Ver</span>
                  </button>

                  <button
                    onClick={() => handleEditarLicencia(negocio)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-400/40 bg-gradient-to-r from-blue-500/25 to-cyan-600/15 px-4 py-2 text-sm font-medium text-blue-200 backdrop-blur-sm transition hover:from-blue-500/35 hover:to-cyan-600/25"
                    title="Editar licencia"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => handleDelete(negocio)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-400/40 bg-gradient-to-r from-blue-500/25 to-cyan-600/15 px-4 py-2 text-sm font-medium text-blue-200 backdrop-blur-sm transition hover:from-blue-500/35 hover:to-cyan-600/25"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modales */}
      <ModalVerDetalles
        negocio={selectedNegocio}
        isOpen={modalVerOpen}
        onClose={() => {
          setModalVerOpen(false);
          setSelectedNegocio(null);
        }}
      />

      <ModalEditarLicencia
        negocio={selectedNegocio}
        isOpen={modalEditarOpen}
        onClose={() => {
          setModalEditarOpen(false);
          setSelectedNegocio(null);
        }}
        onSuccess={() => {
          fetchNegocios(); // Recargar lista después de actualizar
        }}
      />

      <ModalConfirmacion
        isOpen={modalConfirmacionOpen}
        tipo={modalConfirmacionConfig.tipo}
        titulo={modalConfirmacionConfig.titulo}
        mensaje={modalConfirmacionConfig.mensaje}
        textoConfirmar={modalConfirmacionConfig.textoConfirmar}
        textoCancelar={modalConfirmacionConfig.textoCancelar}
        onConfirmar={modalConfirmacionConfig.onConfirmar}
        onCancelar={() => setModalConfirmacionOpen(false)}
      />
    </div>
  );
}
