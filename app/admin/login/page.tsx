"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Shield,
  User,
} from "lucide-react";

type LoginStatus = "idle" | "loading" | "success" | "error";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<LoginStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const usuario = formData.get("usuario")?.toString().trim() ?? "";
    const password = formData.get("password")?.toString() ?? "";

    if (!usuario || !password) {
      setStatus("error");
      setMessage("Usuario y contraseña son requeridos.");
      return;
    }

    try {
      console.log('🔐 [CLIENT LOGIN] Enviando credenciales al servidor...');
      
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Importante: incluir cookies
        body: JSON.stringify({ usuario, password }),
      });

      console.log('🔐 [CLIENT LOGIN] Respuesta recibida:', response.status, response.statusText);

      const data = await response.json();
      
      console.log('🔐 [CLIENT LOGIN] Datos:', data);

      if (!response.ok) {
        console.error('❌ [CLIENT LOGIN] Error en respuesta:', data);
        setStatus("error");
        setMessage(data?.error ?? "Error de autenticación.");
        return;
      }

      console.log('✅ [CLIENT LOGIN] Login exitoso, preparando redirección...');
      setStatus("success");
      setMessage("Acceso concedido. Redirigiendo...");
      
      // Dar tiempo para que la cookie se establezca y luego redirigir
      setTimeout(() => {
        console.log('🔄 [CLIENT LOGIN] Redirigiendo a /admin...');
        window.location.href = "/admin";
      }, 1000);
    } catch (error) {
      console.error('❌ [CLIENT LOGIN] Error en login:', error);
      setStatus("error");
      setMessage("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0a0e27] via-[#16213e] to-[#0f1729]">
      {/* Efectos de fondo */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.15),_transparent_45%)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full bg-cyan-500/8 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-16 h-80 w-80 rounded-full bg-purple-500/8 blur-3xl" />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Card principal */}
          <div className="glass-card overflow-hidden border-purple-400/30 shadow-2xl shadow-purple-500/10">
            {/* Header */}
            <div className="space-y-4 p-8 pb-6">
              {/* Logo con badge de Admin */}
              <div className="flex items-center justify-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/40 bg-gradient-to-br from-purple-500/30 to-pink-600/20 shadow-lg shadow-purple-500/20 overflow-hidden"
                >
                  <Image
                    src="/images/logos/mptickets.png"
                    alt="MPTickets Logo"
                    width={32}
                    height={32}
                    className="object-contain w-8 h-8"
                    priority
                  />
                </motion.div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-400" />
                  <span className="font-display text-sm font-semibold text-purple-400">
                    ADMIN
                  </span>
                </div>
              </div>

              {/* Título */}
              <div className="space-y-2 text-center">
                <h1 className="font-display text-3xl font-bold tracking-tight text-white">
                  Panel de Administración
                </h1>
                <p className="font-body text-sm text-blue-200/60">
                  Sistema de gestión multi-tenant MPTickets
                </p>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4 p-8 pt-2">
              {/* Usuario */}
              <div>
                <label
                  htmlFor="usuario"
                  className="font-body mb-2 block text-sm font-medium text-blue-200/80"
                >
                  Usuario Administrador
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400/60" />
                  <input
                    id="usuario"
                    name="usuario"
                    type="text"
                    placeholder="superadmin"
                    disabled={status === "loading" || status === "success"}
                    className="glass-input !pl-12 border-purple-500/30 bg-[#0f172a]/60 text-white placeholder:text-blue-200/40 focus:border-purple-400/50 focus:ring-purple-400/20"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label
                  htmlFor="password"
                  className="font-body mb-2 block text-sm font-medium text-blue-200/80"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400/60" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    disabled={status === "loading" || status === "success"}
                    className="glass-input !pl-12 !pr-12 border-purple-500/30 bg-[#0f172a]/60 text-white placeholder:text-blue-200/40 focus:border-purple-400/50 focus:ring-purple-400/20"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={status === "loading" || status === "success"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400/60 transition-colors hover:text-purple-400 disabled:opacity-50"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Alert de estado */}
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-3 rounded-xl border p-3 ${
                    status === "error"
                      ? "border-red-500/30 bg-red-500/10"
                      : status === "success"
                        ? "border-emerald-500/30 bg-emerald-500/10"
                        : "border-blue-500/30 bg-blue-500/10"
                  }`}
                >
                  {status === "error" ? (
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                  ) : status === "success" ? (
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                  ) : null}
                  <p
                    className={`font-body text-sm ${
                      status === "error"
                        ? "text-red-200"
                        : status === "success"
                          ? "text-emerald-200"
                          : "text-blue-200"
                    }`}
                  >
                    {message}
                  </p>
                </motion.div>
              )}

              {/* Botón de login */}
              <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                className="glass-button group relative w-full overflow-hidden border-purple-400/30 bg-gradient-to-r from-purple-500/20 to-pink-600/10 px-6 py-3 shadow-lg shadow-purple-500/20 transition-all hover:border-purple-400/50 hover:shadow-purple-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 font-body font-semibold text-white">
                  {status === "loading" ? (
                    <>
                      <motion.div
                        className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      />
                      Verificando...
                    </>
                  ) : status === "success" ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Acceso concedido
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                      Ingresar al Panel
                    </>
                  )}
                </span>
              </button>

              {/* Link al login normal */}
              <div className="pt-4 text-center">
                <Link
                  href="/"
                  className="font-body text-sm text-purple-300/60 transition-colors hover:text-purple-300"
                >
                  ← Volver al login de negocios
                </Link>
              </div>
            </form>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="font-caption text-xs text-blue-200/40">
              Sistema exclusivo para administradores de MPTickets
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
