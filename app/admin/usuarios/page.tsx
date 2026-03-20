"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Building2,
  Eye,
  Edit,
  Calendar,
  Mail,
  Phone,
  X,
  AlertCircle,
  CheckCircle,
  Lock,
  Save,
  Search,
  Filter,
  MapPin,
  ParkingCircle,
} from "lucide-react";
import type { UsuarioAdminConNegocio } from "@/types/admin";

type ModalType = "ver" | "editar" | null;

export default function UsuariosAdminPage() {
  const [usuarios, setUsuarios] = useState<UsuarioAdminConNegocio[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState<ModalType>(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioAdminConNegocio | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/usuarios");
      const data = await response.json();

      if (data.success) {
        setUsuarios(data.data);
      } else {
        console.error("Error cargando usuarios:", data.error);
      }
    } catch (error) {
      console.error("Error en cargarUsuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalles = (usuario: UsuarioAdminConNegocio) => {
    setUsuarioSeleccionado(usuario);
    setModalAbierto("ver");
  };

  const handleEditar = (usuario: UsuarioAdminConNegocio) => {
    setUsuarioSeleccionado(usuario);
    setModalAbierto("editar");
  };

  const handleCerrarModal = () => {
    setModalAbierto(null);
    setUsuarioSeleccionado(null);
  };

  const handleActualizacionExitosa = () => {
    cargarUsuarios();
    handleCerrarModal();
  };

  const getPlanBadge = (plan: string) => {
    const configs = {
      demo: { color: "bg-blue-500/20 text-blue-300 border-blue-400/30", label: "DEMO" },
      basica: { color: "bg-cyan-500/20 text-cyan-300 border-cyan-400/30", label: "BÁSICA" },
      anual: { color: "bg-amber-500/20 text-amber-300 border-amber-400/30", label: "ANUAL" },
      premium: { color: "bg-purple-500/20 text-purple-300 border-purple-400/30", label: "PREMIUM" },
    };
    const config = configs[plan as keyof typeof configs] || configs.demo;
    return (
      <div
        className={`rounded-3xl border bg-gradient-to-r px-2 py-1 text-xs font-semibold backdrop-blur-sm ${config.color}`}
      >
        {config.label}
      </div>
    );
  };

  const getEstadoBadge = (estado: string) => {
    const configs = {
      activo: { color: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30", label: "Activo" },
      inactivo: { color: "bg-red-500/20 text-red-300 border-red-400/30", label: "Inactivo" },
    };
    const config = estado === "1" ? configs.activo : configs.inactivo;
    return (
      <div className={`rounded-3xl border bg-gradient-to-r px-2 py-1 text-xs font-semibold backdrop-blur-sm ${config.color}`}>
        {config.label}
      </div>
    );
  };

  // Filtrar usuarios
  const filteredUsuarios = usuarios.filter((usuario) =>
    usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.negocio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.negocio.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-500/20 border-t-purple-400"></div>
          <p className="mt-4 font-body text-sm text-blue-200/60">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con búsqueda */}
      <div className="glass-card border-purple-400/20 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-400/60" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o negocio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input w-full border-purple-500/20 bg-[#0f172a]/60 !pl-11 text-white placeholder:text-blue-200/40 focus:border-purple-400/40"
            />
          </div>

          {/* Botón de filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/25 to-green-600/15 px-4 py-2.5 text-sm font-medium text-emerald-200 backdrop-blur-sm transition hover:from-emerald-500/35 hover:to-green-600/25 ${
              showFilters ? "from-emerald-500/35 to-green-600/25" : ""
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Contador */}
      <div className="flex items-center justify-between">
        <p className="font-body text-sm text-blue-200/60">
          Mostrando <span className="font-semibold text-white">{filteredUsuarios.length}</span>{" "}
          {filteredUsuarios.length === 1 ? "usuario" : "usuarios"}
        </p>
      </div>

      {/* Lista de usuarios en cards */}
      {filteredUsuarios.length === 0 ? (
        <div className="glass-card border-purple-400/20 p-12 text-center">
          <User className="mx-auto h-16 w-16 text-purple-300/40" />
          <h3 className="mt-4 font-display text-lg font-semibold text-white">
            No se encontraron usuarios
          </h3>
          <p className="mt-2 font-body text-sm text-blue-200/60">
            {searchTerm
              ? "Intenta cambiar los términos de búsqueda"
              : "No hay usuarios administradores registrados"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredUsuarios.map((usuario) => (
            <motion.div
              key={usuario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl border border-blue-400/20 bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-6 shadow-lg backdrop-blur-xl transition hover:border-cyan-400/40 hover:shadow-cyan-500/20"
            >
              {/* Header con usuario y badges en esquina superior derecha */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/20">
                    <User className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">
                      {usuario.nombre} {usuario.apellido}
                    </h4>
                    <p className="text-sm text-blue-200/70">
                      {usuario.email}
                    </p>
                  </div>
                </div>
                {/* Badges en esquina superior derecha */}
                <div className="flex flex-col gap-1">
                  {getEstadoBadge(usuario.estado)}
                  {getPlanBadge(usuario.negocio.plan)}
                </div>
              </div>

              {/* Información del negocio - mismo color y tamaño */}
              <div className="mb-4 space-y-2 text-sm text-blue-200/80">
                <div className="flex items-center gap-2">
                  <ParkingCircle className="h-4 w-4 text-cyan-400" />
                  {usuario.negocio.nombre}
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-cyan-400" />
                  {usuario.negocio.codigo}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-cyan-400" />
                  {usuario.negocio.ciudad}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleVerDetalles(usuario)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-200 backdrop-blur-sm transition hover:bg-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/20"
                >
                  <Eye className="h-4 w-4" />
                  Ver
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEditar(usuario)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-200 backdrop-blur-sm transition hover:bg-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/20"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modales */}
      <AnimatePresence mode="wait">
        {modalAbierto === "ver" && usuarioSeleccionado && (
          <ModalVerDetalles usuario={usuarioSeleccionado} onCerrar={handleCerrarModal} />
        )}
        {modalAbierto === "editar" && usuarioSeleccionado && (
          <ModalEditarUsuario
            usuario={usuarioSeleccionado}
            onCerrar={handleCerrarModal}
            onActualizado={handleActualizacionExitosa}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ==============================================
// Modal Ver Detalles
// ==============================================

function ModalVerDetalles({
  usuario,
  onCerrar,
}: {
  usuario: UsuarioAdminConNegocio;
  onCerrar: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onCerrar}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-8 shadow-2xl shadow-cyan-500/20"
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/20">
              <Eye className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Detalles del Usuario Admin
              </h3>
              <p className="text-sm text-blue-200/70">
                Información completa del administrador
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onCerrar}
            className="rounded-xl p-2 text-blue-200 transition hover:bg-blue-950/50"
          >
            <X className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Contenido */}
        <div className="space-y-6">
          {/* Información del Usuario */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-cyan-400">
              <User className="h-5 w-5" />
              Información del Usuario
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-blue-500/30 bg-blue-950/20 p-4 backdrop-blur-sm">
                <p className="mb-1 text-xs uppercase tracking-wider text-blue-300/60">
                  Nombre Completo
                </p>
                <p className="font-body text-sm font-semibold text-white">
                  {usuario.nombre} {usuario.apellido}
                </p>
              </div>
              <div className="rounded-3xl border border-blue-500/30 bg-blue-950/20 p-4 backdrop-blur-sm">
                <p className="mb-1 text-xs uppercase tracking-wider text-blue-300/60">
                  Usuario
                </p>
                <p className="text-sm font-semibold text-white">
                  {usuario.usuario}
                </p>
              </div>
              <div className="rounded-3xl border border-blue-500/30 bg-blue-950/20 p-4 backdrop-blur-sm">
                <p className="mb-1 flex items-center gap-1.5 font-caption text-xs uppercase tracking-wider text-blue-300/60">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </p>
                <p className="text-sm font-semibold text-white">
                  {usuario.email}
                </p>
              </div>
              <div className="rounded-3xl border border-blue-500/30 bg-blue-950/20 p-4 backdrop-blur-sm">
                <p className="mb-1 flex items-center gap-1.5 font-caption text-xs uppercase tracking-wider text-blue-300/60">
                  <Phone className="h-3.5 w-3.5" />
                  Teléfono
                </p>
                <p className="font-body text-sm font-semibold text-white">
                  {usuario.telefono || "No especificado"}
                </p>
              </div>
            </div>
          </div>

          {/* Información del Negocio */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-purple-400">
              <Building2 className="h-5 w-5" />
              Negocio Asignado
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-purple-500/30 bg-purple-950/20 p-4 backdrop-blur-sm">
                <p className="mb-1 text-xs uppercase tracking-wider text-purple-300/60">
                  Nombre
                </p>
                <p className="text-sm font-semibold text-white">
                  {usuario.negocio.nombre}
                </p>
              </div>
              <div className="rounded-3xl border border-purple-500/30 bg-purple-950/20 p-4 backdrop-blur-sm">
                <p className="mb-1 text-xs uppercase tracking-wider text-purple-300/60">
                  Código
                </p>
                <p className="text-sm font-semibold text-white">
                  {usuario.negocio.codigo}
                </p>
              </div>
              <div className="rounded-3xl border border-purple-500/30 bg-purple-950/20 p-4 backdrop-blur-sm">
                <p className="mb-1 text-xs uppercase tracking-wider text-purple-300/60">
                  Ciudad
                </p>
                <p className="text-sm font-semibold text-white">
                  {usuario.negocio.ciudad}
                </p>
              </div>
              <div className="rounded-3xl border border-purple-500/30 bg-purple-950/20 p-4 backdrop-blur-sm">
                <p className="mb-1 font-caption text-xs uppercase tracking-wider text-purple-300/60">
                  Plan
                </p>
                <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-500/20 px-3 py-1 font-caption text-xs font-semibold uppercase text-amber-300">
                  {usuario.negocio.plan}
                </span>
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-emerald-400">
              <Calendar className="h-5 w-5" />
              Información Adicional
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-4 backdrop-blur-sm">
                <p className="mb-1 font-caption text-xs uppercase tracking-wider text-emerald-300/60">
                  Fecha de Creación
                </p>
                <p className="font-body text-sm font-semibold text-white">
                  {new Date(usuario.fecha_creacion).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-4 backdrop-blur-sm">
                <p className="mb-1 font-caption text-xs uppercase tracking-wider text-emerald-300/60">
                  Estado
                </p>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 font-caption text-xs font-semibold ${
                    usuario.estado === "1"
                      ? "border-emerald-400/30 bg-emerald-500/20 text-emerald-300"
                      : "border-red-400/30 bg-red-500/20 text-red-300"
                  }`}
                >
                  {usuario.estado === "1" ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="mt-6 flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCerrar}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-blue-400/30 bg-blue-950/30 px-6 py-3 font-semibold text-blue-200 backdrop-blur-xl transition hover:border-blue-400/50 hover:bg-blue-900/40"
          >
            <X className="h-5 w-5" />
            Cerrar
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==============================================
// Modal Editar Usuario
// ==============================================

function ModalEditarUsuario({
  usuario,
  onCerrar,
  onActualizado,
}: {
  usuario: UsuarioAdminConNegocio;
  onCerrar: () => void;
  onActualizado: () => void;
}) {
  const [nombre, setNombre] = useState(usuario.nombre);
  const [apellido, setApellido] = useState(usuario.apellido);
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "success" | "error"; texto: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    // Validar campos
    if (!nombre.trim() || !apellido.trim()) {
      setMensaje({ tipo: "error", texto: "Nombre y apellido son requeridos" });
      return;
    }

    // Si hay password, validar coincidencia
    if (password.trim() !== "") {
      if (password !== confirmarPassword) {
        setMensaje({ tipo: "error", texto: "Las contraseñas no coinciden" });
        return;
      }
      if (password.length < 6) {
        setMensaje({ tipo: "error", texto: "La contraseña debe tener al menos 6 caracteres" });
        return;
      }
    }

    try {
      setGuardando(true);

      const response = await fetch(`/api/admin/usuarios/${usuario.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          ...(password.trim() !== "" && {
            password: password,
            confirmarPassword: confirmarPassword,
          }),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMensaje({ tipo: "success", texto: "Usuario actualizado correctamente" });
        setTimeout(() => {
          onActualizado();
        }, 1500);
      } else {
        setMensaje({ tipo: "error", texto: data.error || "Error al actualizar" });
      }
    } catch {
      setMensaje({ tipo: "error", texto: "Error de conexión" });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onCerrar}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-8"
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/20">
              <Edit className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-white">
                Editar Usuario Admin
              </h2>
              <p className="font-caption text-sm text-blue-200/60">
                {usuario.nombre} {usuario.apellido}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onCerrar}
            className="rounded-xl p-2 text-blue-200 transition hover:bg-blue-950/50"
          >
            <X className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Información del negocio (no editable) */}
            <div className="rounded-3xl border border-purple-500/30 bg-purple-950/20 p-4">
              <div className="flex items-center gap-2 text-purple-400">
                <Building2 className="h-4 w-4" />
                <span className="font-caption text-xs uppercase tracking-wider">
                  Negocio Asignado
                </span>
              </div>
              <p className="mt-1 font-body text-sm text-white">
                {usuario.negocio.nombre} • {usuario.negocio.codigo}
              </p>
            </div>

            {/* Nombre */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-200">
                <User className="h-4 w-4 text-cyan-400" />
                Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={guardando}
                className="glass-input w-full rounded-3xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20 disabled:opacity-50"
                placeholder="Ingrese el nombre"
                required
              />
            </div>

            {/* Apellido */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-200">
                <User className="h-4 w-4 text-cyan-400" />
                Apellido
              </label>
              <input
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                disabled={guardando}
                className="glass-input w-full rounded-3xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20 disabled:opacity-50"
                placeholder="Ingrese el apellido"
                required
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-200">
                <Lock className="h-4 w-4 text-cyan-400" />
                Contraseña <span className="text-blue-300/60">(dejar vacío para no cambiar)</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={guardando}
                  className="glass-input w-full rounded-3xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20 disabled:opacity-50"
                  placeholder="Nueva contraseña"
                />
              </div>
            </div>

            {/* Confirmar Contraseña */}
            {password.trim() !== "" && (
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-200">
                  <Lock className="h-4 w-4 text-cyan-400" />
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    disabled={guardando}
                    className="glass-input w-full rounded-3xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20 disabled:opacity-50"
                    placeholder="Confirme la contraseña"
                  />
                </div>
              </div>
            )}

            {/* Mensaje */}
            <AnimatePresence>
              {mensaje && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-start gap-3 rounded-3xl border p-4 ${
                    mensaje.tipo === "success"
                      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                      : "border-red-400/30 bg-red-500/10 text-red-200"
                  }`}
                >
                  {mensaje.tipo === "success" ? (
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                  )}
                  <p className="font-body text-sm">{mensaje.texto}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Botones */}
          <div className="mt-6 flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCerrar}
              disabled={guardando}
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-blue-400/30 bg-blue-950/30 px-6 py-3 font-semibold text-blue-200 backdrop-blur-xl transition hover:border-blue-400/50 hover:bg-blue-900/40 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
              Cancelar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={guardando}
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 px-6 py-3 font-semibold text-white backdrop-blur-xl transition hover:from-cyan-500/50 hover:to-blue-600/50 hover:shadow-xl hover:shadow-cyan-500/30 disabled:opacity-50"
            >
              {guardando ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                  />
                  Actualizando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Actualizar
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
