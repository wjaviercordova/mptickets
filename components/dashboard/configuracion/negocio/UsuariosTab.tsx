"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  User,
  Mail,
  Phone,
  Shield,
  UserCircle2,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

interface Usuario {
  id: string;
  negocio_id: string;
  usuario: string;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  avatar_url: string | null;
  password: string;
  estado: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  rol: string;
  permisos: {
    ingreso?: boolean;
    pago?: boolean;
    consultas?: boolean;
    reportes?: boolean;
    configuracion?: boolean;
    [key: string]: boolean | undefined;
  };
}

interface UsuariosTabProps {
  negocioId: string;
  usuarios: Usuario[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const emptyUsuario = {
  usuario: "",
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  password: "",
  confirmPassword: "",
  rol: "operador",
  permisos: {
    ingreso: true,
    pago: true,
    consultas: false,
    reportes: false,
    configuracion: false,
  },
  genero: "hombre",
};

const MODULOS = [
  { id: "ingreso", label: "Ingreso de Vehículos" },
  { id: "pago", label: "Pago y Salida" },
  { id: "consultas", label: "Consultas" },
  { id: "reportes", label: "Reportes" },
  { id: "configuracion", label: "Configuración" },
];

export function UsuariosTab({
  negocioId,
  usuarios,
  onSuccess,
  onError,
}: UsuariosTabProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState(emptyUsuario);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleCreate = () => {
    setEditingUser(null);
    setFormData(emptyUsuario);
    setShowModal(true);
  };

  const handleEdit = (user: Usuario) => {
    setEditingUser(user);
    setFormData({
      usuario: user.usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email || "",
      telefono: user.telefono || "",
      password: "",
      confirmPassword: "",
      rol: user.rol,
      permisos: { ...emptyUsuario.permisos, ...(user.permisos || {}) },
      genero: user.avatar_url?.includes("woman") ? "mujer" : "hombre",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validar contraseña si es creación o si se está cambiando
    if (!editingUser || formData.password) {
      if (formData.password !== formData.confirmPassword) {
        onError("Las contraseñas no coinciden");
        setLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        onError("La contraseña debe tener al menos 6 caracteres");
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        negocioId,
        usuario: formData.usuario,
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email || null,
        telefono: formData.telefono || null,
        rol: formData.rol,
        permisos: formData.permisos,
        avatar_url: formData.genero === "mujer" 
          ? "https://api.dicebear.com/7.x/avataaars/svg?seed=woman" 
          : "https://api.dicebear.com/7.x/avataaars/svg?seed=man",
        ...(formData.password && { password: formData.password }),
      };

      const response = await fetch("/api/configuracion/usuarios", {
        method: editingUser ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingUser ? { ...payload, userId: editingUser.id } : payload
        ),
      });

      const result = await response.json();

      if (response.ok) {
        onSuccess(
          editingUser
            ? "Usuario actualizado exitosamente"
            : "Usuario creado exitosamente"
        );
        setShowModal(false);
        router.refresh();
      } else {
        onError(result.message || "Error al guardar usuario");
      }
    } catch {
      onError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    setLoading(true);

    try {
      const response = await fetch("/api/configuracion/usuarios", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (response.ok) {
        onSuccess("Usuario eliminado exitosamente");
        setDeleteConfirm(null);
        router.refresh();
      } else {
        onError(result.message || "Error al eliminar usuario");
      }
    } catch {
      onError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const getRolBadge = (rol: string) => {
    const roles: Record<string, { label: string; color: string }> = {
      admin: {
        label: "Administrador",
        color: "from-purple-500/20 to-indigo-600/20 text-purple-300 border-purple-400/30",
      },
      operador: {
        label: "Operador",
        color: "from-cyan-500/20 to-blue-600/20 text-cyan-300 border-cyan-400/30",
      },
      visor: {
        label: "Visor",
        color: "from-gray-500/20 to-gray-600/20 text-gray-300 border-gray-400/30",
      },
    };
    return roles[rol] || roles.operador;
  };

  return (
    <div className={`space-y-6 transition-all duration-300 ${showModal ? 'min-h-[800px] xl:min-h-[900px] 2xl:min-h-[1000px]' : ''}`}>
      {/* Header con botón agregar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-xl text-white">
            Gestión de Usuarios
          </h3>
          <p className="text-sm text-blue-200/70">
            Administre los usuarios del negocio con sus roles y permisos
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/30 to-green-600/30 px-5 py-2.5 font-semibold text-white backdrop-blur-xl transition hover:from-emerald-500/50 hover:to-green-600/50 hover:shadow-xl hover:shadow-emerald-500/30"
        >
          <Plus className="h-5 w-5" />
          Agregar Usuario
        </motion.button>
      </div>

      {/* Lista de usuarios */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {usuarios.map((user) => {
          const rolInfo = getRolBadge(user.rol);
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl border border-blue-400/20 bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-6 shadow-lg backdrop-blur-xl transition hover:border-cyan-400/40 hover:shadow-cyan-500/20"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/20">
                    <User className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">
                      {user.nombre} {user.apellido}
                    </h4>
                    <p className="text-sm text-blue-200/70">@{user.usuario}</p>
                  </div>
                </div>
                <div
                  className={`rounded-3xl border bg-gradient-to-r px-2 py-1 text-xs font-semibold backdrop-blur-sm ${rolInfo.color}`}
                >
                  {rolInfo.label}
                </div>
              </div>

              <div className="space-y-2 text-sm text-blue-200/80">
                {user.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-cyan-400" />
                    {user.email}
                  </div>
                )}
                {user.telefono && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-cyan-400" />
                    {user.telefono}
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEdit(user)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-200 backdrop-blur-sm transition hover:bg-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/20"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteConfirm(user.id)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-200 backdrop-blur-sm transition hover:bg-red-500/30 hover:shadow-lg hover:shadow-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal de creación/edición */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-8 shadow-2xl shadow-cyan-500/20"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/20">
                    <User className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
                    </h3>
                    <p className="text-sm text-blue-200/70">
                      Complete todos los campos del usuario
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowModal(false)}
                  className="rounded-xl p-2 text-blue-200 transition hover:bg-blue-950/50"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Usuario */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-200">
                      <UserCircle2 className="h-4 w-4 text-cyan-400" />
                      Usuario
                    </label>
                    <input
                      type="text"
                      value={formData.usuario}
                      onChange={(e) =>
                        setFormData({ ...formData, usuario: e.target.value })
                      }
                      className="glass-input w-full rounded-3xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20"
                      required
                      disabled={!!editingUser}
                    />
                  </div>

                  {/* Rol */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-200">
                      <Shield className="h-4 w-4 text-cyan-400" />
                      Rol
                    </label>
                    <select
                      value={formData.rol}
                      onChange={(e) =>
                        setFormData({ ...formData, rol: e.target.value })
                      }
                      className="glass-input w-full rounded-3xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20"
                      required
                    >
                      <option value="admin">Administrador</option>
                      <option value="operador">Operador</option>
                      <option value="visor">Visor</option>
                    </select>
                  </div>

                  {/* Nombre */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-200">
                      <User className="h-4 w-4 text-cyan-400" />
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) =>
                        setFormData({ ...formData, nombre: e.target.value })
                      }
                      className="glass-input w-full rounded-3xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20"
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
                      value={formData.apellido}
                      onChange={(e) =>
                        setFormData({ ...formData, apellido: e.target.value })
                      }
                      className="glass-input w-full rounded-3xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-200">
                      <Mail className="h-4 w-4 text-cyan-400" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="glass-input w-full rounded-3xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20"
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-200">
                      <Phone className="h-4 w-4 text-cyan-400" />
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) =>
                        setFormData({ ...formData, telefono: e.target.value })
                      }
                      className="glass-input w-full rounded-3xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20"
                    />
                  </div>

                  {/* Género (para avatar) */}
                  <div className="md:col-span-2">
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-200">
                      <UserCircle2 className="h-4 w-4 text-cyan-400" />
                      Avatar
                    </label>
                    <div className="flex gap-4">
                      <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-blue-400/20 bg-blue-950/30 px-4 py-3 transition hover:border-cyan-400/40">
                        <input
                          type="radio"
                          name="genero"
                          value="hombre"
                          checked={formData.genero === "hombre"}
                          onChange={(e) =>
                            setFormData({ ...formData, genero: e.target.value })
                          }
                          className="text-cyan-500"
                        />
                        <span className="text-white">Hombre</span>
                      </label>
                      <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-blue-400/20 bg-blue-950/30 px-4 py-3 transition hover:border-cyan-400/40">
                        <input
                          type="radio"
                          name="genero"
                          value="mujer"
                          checked={formData.genero === "mujer"}
                          onChange={(e) =>
                            setFormData({ ...formData, genero: e.target.value })
                          }
                          className="text-cyan-500"
                        />
                        <span className="text-white">Mujer</span>
                      </label>
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-200">
                      <Lock className="h-4 w-4 text-cyan-400" />
                      Contraseña {editingUser && "(dejar vacío para no cambiar)"}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="glass-input w-full rounded-3xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 pr-12 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20"
                        required={!editingUser}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-cyan-400"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirmar Contraseña */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-200">
                      <Lock className="h-4 w-4 text-cyan-400" />
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="glass-input w-full rounded-3xl border border-blue-500/30 bg-[#1e293b]/60 px-4 py-3 pr-12 text-white backdrop-blur-xl outline-none transition focus:border-cyan-400/60 focus:bg-[#1e293b]/80 focus:shadow-lg focus:shadow-cyan-500/20"
                        required={!editingUser}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-cyan-400"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Permisos */}
                <div>
                  <label className="mb-3 flex items-center gap-2 text-sm font-medium text-blue-200">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    Permisos de Acceso a Módulos
                  </label>
                  <div className="space-y-2">
                    {MODULOS.map((modulo) => (
                      <label
                        key={modulo.id}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-blue-400/20 bg-blue-950/30 px-4 py-3 transition hover:border-cyan-400/40"
                      >
                        <input
                          type="checkbox"
                          checked={
                            (formData.permisos[
                              modulo.id as keyof typeof formData.permisos
                            ] as boolean) || false
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permisos: {
                                ...formData.permisos,
                                [modulo.id]: e.target.checked,
                              },
                            })
                          }
                          className="h-5 w-5 rounded border-cyan-400/30 bg-blue-950/50 text-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                        />
                        <span className="text-white">{modulo.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-blue-400/30 bg-blue-950/30 px-6 py-3 font-semibold text-blue-200 backdrop-blur-xl transition hover:border-blue-400/50 hover:bg-blue-900/40"
                  >
                    <X className="h-5 w-5" />
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 px-6 py-3 font-semibold text-white backdrop-blur-xl transition hover:from-cyan-500/50 hover:to-blue-600/50 hover:shadow-xl hover:shadow-cyan-500/30 disabled:opacity-50"
                  >
                    <Save className="h-5 w-5" />
                    {loading
                      ? "Guardando..."
                      : editingUser
                      ? "Actualizar Usuario"
                      : "Crear Usuario"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de confirmación de eliminación */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl border border-red-500/30 bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-8 shadow-2xl shadow-red-500/20"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-400/30 bg-red-500/20">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Confirmar Eliminación
                  </h3>
                  <p className="text-sm text-blue-200/70">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>

              <p className="mb-6 text-blue-200/80">
                ¿Está seguro que desea eliminar este usuario? Perderá acceso al
                sistema inmediatamente.
              </p>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeleteConfirm(null)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-blue-400/30 bg-blue-950/30 px-6 py-3 font-semibold text-blue-200 backdrop-blur-xl transition hover:border-blue-400/50 hover:bg-blue-900/40"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-400/40 bg-gradient-to-r from-red-500/30 to-red-600/30 px-6 py-3 font-semibold text-white backdrop-blur-xl transition hover:from-red-500/50 hover:to-red-600/50 hover:shadow-xl hover:shadow-red-500/30 disabled:opacity-50"
                >
                  {loading ? "Eliminando..." : "Eliminar"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
