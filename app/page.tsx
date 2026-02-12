"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  ParkingCircle,
  User,
} from "lucide-react";

type LoginStatus = "idle" | "loading" | "success" | "error";

export default function Home() {
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<LoginStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const usuario = formData.get("usuario")?.toString().trim() ?? "";
    const password = formData.get("password")?.toString() ?? "";
    const negocioCodigo = formData.get("negocioCodigo")?.toString().trim() ?? "";

    if (!usuario || !password || !negocioCodigo) {
      setStatus("error");
      setMessage("Completa usuario, contraseña y código de negocio.");
      return;
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuario, password, negocioCodigo }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        const detail = data?.detail ? ` (${data.detail})` : "";
        setMessage((data?.message ?? "Error de autenticación.") + detail);
        return;
      }

      setStatus("success");
      setMessage(data?.message ?? "Acceso concedido.");
      setTimeout(() => router.push("/dashboard"), 800);
    } catch (error) {
      setStatus("error");
      setMessage("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0a0e27] via-[#16213e] to-[#0f1729]">
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
          <div className="glass-card space-y-6 p-8 border border-blue-500/20 bg-gradient-to-br from-[#1e293b]/70 to-[#0f172a]/90 shadow-xl shadow-blue-500/10">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-blue-500/30 to-cyan-600/20 shadow-lg shadow-cyan-500/20">
                <ParkingCircle className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
                  MP Tickets
                </p>
                <h1 className="font-display text-2xl text-white">
                  Acceso al Sistema
                </h1>
                <p className="text-sm text-blue-200/60">
                  Gestión comercial de parqueaderos
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block space-y-2 text-sm text-blue-100/80">
                Usuario
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400/70" />
                  <input
                    name="usuario"
                    type="text"
                    placeholder="admin"
                    className="glass-input pl-11 border-blue-500/30 bg-[#0f172a]/60 text-white placeholder:text-blue-200/40"
                    autoComplete="username"
                  />
                </div>
              </label>

              <label className="block space-y-2 text-sm text-blue-100/80">
                Contraseña
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400/70" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="glass-input pl-11 pr-12 border-blue-500/30 bg-[#0f172a]/60 text-white placeholder:text-blue-200/40"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-cyan-400/70 transition hover:text-cyan-300"
                    aria-label={
                      showPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </label>

              <label className="block space-y-2 text-sm text-blue-100/80">
                Código de negocio
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400/70" />
                  <input
                    name="negocioCodigo"
                    type="text"
                    placeholder="MP-001"
                    className="glass-input pl-11 border-blue-500/30 bg-[#0f172a]/60 text-white placeholder:text-blue-200/40"
                  />
                </div>
              </label>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="glass-button w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-blue-400/30 shadow-lg shadow-blue-500/20 hover:shadow-cyan-500/30"
                disabled={status === "loading"}
              >
                <LogIn className="h-4 w-4" />
                {status === "loading" ? "Validando..." : "Ingresar"}
              </motion.button>
            </form>

            {message && (
              <div
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
                  status === "success"
                    ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-200 shadow-lg shadow-emerald-500/15"
                    : "border-amber-400/40 bg-amber-500/20 text-amber-200 shadow-lg shadow-amber-500/15"
                }`}
              >
                {status === "success" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span>{message}</span>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-blue-200/50">
            Seguridad profesional con autenticación y control de accesos.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
