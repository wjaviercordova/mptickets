"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  User,
  Settings,
  DollarSign,
  CreditCard,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  Plus,
  Trash2,
  Edit2,
  FileCheck,
  Car,
  Clock,
} from "lucide-react";

// Tipos
interface NegocioData {
  codigo: string;
  plan: "demo" | "anual" | "premium";
  fecha_expiracion: string | null;
  nombre: string;
  descripcion: string;
  direccion: string;
  telefono: string;
  email: string;
  ciudad: string;
  limite_usuarios: number;
  limite_tarjetas: number;
  capacidad_maxima: number;
}

interface UsuarioAdminData {
  usuario: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono: string | null;
}

interface ConfiguracionItem {
  clave: string;
  valor: string;
  tipo: string;
  descripcion: string;
  categoria: string;
}

interface ParametroItem {
  tipo_vehiculo: string;
  nombre: string;
  descripcion: string;
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
  estado: string;
}

interface TarjetaItem {
  codigo: string;
  estado: string;
}

const STEPS = [
  { id: 1, title: "Datos del Negocio", icon: Building2, color: "from-blue-500 to-cyan-500" },
  { id: 2, title: "Usuario Administrador", icon: User, color: "from-purple-500 to-pink-500" },
  { id: 3, title: "Configuración Sistema", icon: Settings, color: "from-orange-500 to-red-500" },
  { id: 4, title: "Parámetros Tarifas", icon: DollarSign, color: "from-green-500 to-emerald-500" },
  { id: 5, title: "Tarjetas", icon: CreditCard, color: "from-indigo-500 to-purple-500" },
  { id: 6, title: "Resumen", icon: FileCheck, color: "from-emerald-500 to-teal-500" },
];

export default function NuevoNegocioWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [installing, setInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [installStep, setInstallStep] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [installedModules, setInstalledModules] = useState<string[]>([]);

  // Estados de datos
  const [negocioData, setNegocioData] = useState<NegocioData>({
    codigo: "",
    plan: "demo",
    fecha_expiracion: calcularFecha30Dias(),
    nombre: "nombre-mptickets",
    descripcion: "Sistema de gestión de parqueadero - mptickets",
    direccion: "direccion-mptickets",
    telefono: "9999999999",
    email: "correo@dominio.com",
    ciudad: "Ciudad",
    limite_usuarios: 1,
    limite_tarjetas: 10,
    capacidad_maxima: 10,
  });

  const [usuarioData, setUsuarioData] = useState<UsuarioAdminData>({
    usuario: "admin",
    nombre: "Administrador",
    apellido: "Sistema",
    email: "admin@mipartking.com",
    password: "admin123",
    telefono: null,
  });

  const [configuraciones, setConfiguraciones] = useState<ConfiguracionItem[]>([]);
  const [parametros, setParametros] = useState<ParametroItem[]>([]);
  const [tarjetas, setTarjetas] = useState<TarjetaItem[]>(
    Array.from({ length: 10 }, (_, i) => ({ codigo: (i + 1).toString(), estado: "1" }))
  );

  // Cargar datos por defecto al montar
  useEffect(() => {
    cargarDatosDefecto();
  }, []);

  function calcularFecha30Dias() {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 30);
    return fecha.toISOString().split("T")[0];
  }

  async function cargarDatosDefecto() {
    try {
      // Cargar configuraciones
      const configResp = await fetch("/data/defaults/configuracion-sistema-base.json");
      const configData = await configResp.json();
      setConfiguraciones(configData);

      // Cargar parámetros
      const paramResp = await fetch("/data/defaults/parametros-base.json");
      const paramData = await paramResp.json();
      setParametros(paramData);
    } catch (err) {
      console.error("Error cargando datos por defecto:", err);
    }
  }

  const validateStep = (step: number): boolean => {
    setError(null);

    if (step === 1) {
      if (!negocioData.codigo.trim()) {
        setError("El código del negocio es requerido");
        return false;
      }
      if (!/^[A-Z0-9]+$/i.test(negocioData.codigo)) {
        setError("El código solo puede contener letras y números");
        return false;
      }
      if (negocioData.codigo.length < 3) {
        setError("El código debe tener al menos 3 caracteres");
        return false;
      }
    }

    if (step === 2) {
      if (!usuarioData.usuario.trim() || !usuarioData.password.trim()) {
        setError("Usuario y contraseña son requeridos");
        return false;
      }
      if (usuarioData.password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setInstalling(true);
    setInstallProgress(0);
    
    const modules: string[] = [];

    try {
      // Paso 1: Crear negocio (20%)
      setInstallStep("Creando negocio...");
      setInstallProgress(20);
      await sleep(800);
      modules.push("Negocio creado");

      // Paso 2: Crear usuario admin (40%)
      setInstallStep("Creando usuario administrador...");
      setInstallProgress(40);
      await sleep(800);
      modules.push("Usuario administrador creado");

      // Paso 3: Insertar configuraciones (60%)
      setInstallStep(`Instalando ${configuraciones.length} configuraciones del sistema...`);
      setInstallProgress(60);
      await sleep(1000);
      modules.push(`${configuraciones.length} configuraciones instaladas`);

      // Paso 4: Insertar parámetros (80%)
      setInstallStep(`Configurando ${parametros.length} parámetros de tarifas...`);
      setInstallProgress(80);
      await sleep(800);
      modules.push(`${parametros.length} parámetros configurados`);

      // Paso 5: Crear tarjetas (100%)
      setInstallStep(`Generando ${tarjetas.length} tarjetas...`);
      setInstallProgress(95);
      await sleep(800);
      modules.push(`${tarjetas.length} tarjetas generadas`);

      // Hacer la petición real a la API
      const response = await fetch("/api/admin/negocios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          negocio: negocioData,
          usuario: usuarioData,
          configuraciones,
          parametros,
          tarjetas,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("Error del servidor:", result);
        console.error("Status:", response.status);
        console.error("Error detallado:", result.error);
        console.error("Details:", result.details);
        throw new Error(result.error || "Error al crear el negocio");
      }

      setInstallProgress(100);
      setInstallStep("¡Instalación completada!");
      setInstalledModules(modules);
      await sleep(500);
      setSuccess(true);

      setTimeout(() => {
        router.push("/admin/negocios");
      }, 5000);
    } catch (err: unknown) {
      console.error("Error:", err);
      const errorMessage = err instanceof Error ? err.message : "Error al crear el negocio";
      setError(errorMessage);
      setInstalling(false);
      setInstallProgress(0);
    }
  };

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Pantalla de instalación
  if (installing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Instalando Negocio</h2>
              <p className="text-blue-200/60">{installStep}</p>
            </div>

            {/* Barra de progreso */}
            <div className="relative w-full h-6 bg-white/10 rounded-full overflow-hidden mb-4">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${installProgress}%` }}
                transition={{ duration: 0.5 }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-white">{installProgress}%</span>
              </div>
            </div>

            {/* Progreso circular adicional */}
            <div className="flex justify-center mt-8">
              <div className="relative w-32 h-32">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-white/10"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - installProgress / 100)}`}
                    className="text-cyan-500"
                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{installProgress}%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Pantalla de éxito
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-3xl"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-3">¡Instalación Completada!</h2>
              <p className="text-xl text-blue-200/80 mb-2">
                Negocio <span className="font-bold text-cyan-400">{negocioData.codigo}</span> creado exitosamente
              </p>
            </div>

            {/* Resumen Ejecutivo */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8 mb-6">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                Resumen Ejecutivo
              </h3>

              {/* Información del Negocio */}
              <div className="mb-6 bg-white/5 border border-white/10 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-400" />
                  Datos del Negocio
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-200/60">Código:</span>
                    <span className="ml-2 font-mono font-bold text-cyan-300">{negocioData.codigo}</span>
                  </div>
                  <div>
                    <span className="text-blue-200/60">Plan:</span>
                    <span className="ml-2 font-bold text-white">{negocioData.plan.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-blue-200/60">Nombre:</span>
                    <span className="ml-2 text-white">{negocioData.nombre}</span>
                  </div>
                  <div>
                    <span className="text-blue-200/60">Ciudad:</span>
                    <span className="ml-2 text-white">{negocioData.ciudad}</span>
                  </div>
                  <div>
                    <span className="text-blue-200/60">Email:</span>
                    <span className="ml-2 text-white">{negocioData.email}</span>
                  </div>
                  <div>
                    <span className="text-blue-200/60">Teléfono:</span>
                    <span className="ml-2 text-white">{negocioData.telefono}</span>
                  </div>
                </div>
              </div>

              {/* Módulos Instalados */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-white mb-4">Módulos Instalados</h4>
                <div className="space-y-3">
                  {installedModules.map((module, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-3 text-blue-100 bg-white/5 border border-white/10 rounded-lg p-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="font-medium">{module}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Estadísticas Rápidas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-cyan-400">{configuraciones.length}</div>
                  <div className="text-xs text-blue-200/60 mt-1">Configuraciones</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{parametros.length}</div>
                  <div className="text-xs text-blue-200/60 mt-1">Parámetros</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-400">{tarjetas.length}</div>
                  <div className="text-xs text-blue-200/60 mt-1">Tarjetas</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-amber-400">{negocioData.capacidad_maxima}</div>
                  <div className="text-xs text-blue-200/60 mt-1">Capacidad</div>
                </div>
              </div>
            </div>

            {/* Credenciales */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-2xl p-6">
              <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-cyan-400" />
                Credenciales de Acceso
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-200/60">URL:</span>
                  <span className="font-mono text-cyan-300">http://localhost:3000/login</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200/60">Código Negocio:</span>
                  <span className="font-mono text-cyan-300">{negocioData.codigo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200/60">Usuario:</span>
                  <span className="font-mono text-cyan-300">{usuarioData.usuario}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200/60">Contraseña:</span>
                  <span className="font-mono text-cyan-300">{usuarioData.password}</span>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-blue-300/60 mt-6">
              Redirigiendo al panel de negocios...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/admin/negocios")}
            className="flex items-center gap-2 text-blue-200/60 hover:text-blue-200 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Negocios
          </button>

          <h1 className="text-4xl font-bold text-white mb-3">Asistente de Creación de Negocio</h1>
          <p className="text-blue-200/70 text-lg">
            Configura todos los datos iniciales del negocio paso a paso
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-3 relative">
                  {/* Número del paso con diseño */}
                  <motion.div
                    className={`relative w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all ${
                      currentStep >= step.id
                        ? `bg-gradient-to-br ${step.color} border-white/30 shadow-lg shadow-${step.color.split("-")[1]}-500/30`
                        : "border-white/20 bg-white/5"
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-7 h-7 text-white" />
                    ) : (
                      <span className={`text-2xl font-bold ${currentStep >= step.id ? "text-white" : "text-white/40"}`}>
                        {step.id}
                      </span>
                    )}
                    {currentStep === step.id && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl bg-white/20"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.div>

                  {/* Label */}
                  <div className="text-center">
                    <step.icon className={`w-6 h-6 mx-auto mb-1 ${currentStep >= step.id ? "text-white" : "text-white/40"}`} />
                    <p className={`text-xs font-medium ${currentStep >= step.id ? "text-white" : "text-white/40"}`}>
                      {step.title}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 rounded-full ${currentStep > step.id ? "bg-gradient-to-r from-cyan-500 to-blue-500" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            {/* PASO 1: DATOS DEL NEGOCIO */}
            {currentStep === 1 && (
              <StepNegocio
                key="step1"
                data={negocioData}
                onChange={setNegocioData}
              />
            )}

            {/* PASO 2: USUARIO ADMINISTRADOR */}
            {currentStep === 2 && (
              <StepUsuario
                key="step2"
                data={usuarioData}
                onChange={setUsuarioData}
              />
            )}

            {/* PASO 3: CONFIGURACIÓN SISTEMA */}
            {currentStep === 3 && (
              <StepConfiguracion
                key="step3"
                data={configuraciones}
                onChange={setConfiguraciones}
              />
            )}

            {/* PASO 4: PARÁMETROS */}
            {currentStep === 4 && (
              <StepParametros
                key="step4"
                data={parametros}
                onChange={setParametros}
              />
            )}

            {/* PASO 5: TARJETAS */}
            {currentStep === 5 && (
              <StepTarjetas
                key="step5"
                data={tarjetas}
                onChange={setTarjetas}
              />
            )}

            {/* PASO 6: RESUMEN */}
            {currentStep === 6 && (
              <StepResumen
                key="step6"
                negocio={negocioData}
                usuario={usuarioData}
                configuraciones={configuraciones}
                parametros={parametros}
                tarjetas={tarjetas}
              />
            )}
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-300"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <button
              onClick={handleBack}
              disabled={currentStep === 1 || installing}
              className="flex items-center gap-2 px-6 py-3 text-blue-200 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
              Anterior
            </button>

            <div className="text-sm text-blue-200/60">
              Paso {currentStep} de {STEPS.length}
            </div>

            {currentStep < STEPS.length ? (
              <button
                onClick={handleNext}
                disabled={installing}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium rounded-xl shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
              >
                Siguiente
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={installing}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50"
              >
                <Check className="w-5 h-5" />
                Instalar Negocio
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===============================================
// COMPONENTES DE CADA PASO
// ===============================================

function StepNegocio({ data, onChange }: { data: NegocioData; onChange: (data: NegocioData) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <Building2 className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Datos del Negocio</h2>
          <p className="text-blue-200/60">Configura la información básica del negocio</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-200/80 flex items-start gap-2">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          Se crearán los siguientes datos en la tabla <span className="font-mono text-cyan-300">negocios</span>. Puedes editar los valores por defecto antes de continuar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-blue-100 mb-2">
            Código del Negocio <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={data.codigo}
            onChange={(e) => onChange({ ...data, codigo: e.target.value.toUpperCase() })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-blue-300/40 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
            placeholder="Ej: PARK001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-100 mb-2">
            Plan <span className="text-red-400">*</span>
          </label>
          <select
            value={data.plan}
            onChange={(e) => {
              const selectedPlan = e.target.value as "demo" | "anual" | "premium";
              const updatedData = { ...data, plan: selectedPlan };
              
              // Actualizar límites según el plan
              if (selectedPlan === "demo") {
                updatedData.limite_usuarios = 1;
                updatedData.limite_tarjetas = 10;
                updatedData.capacidad_maxima = 10;
              } else if (selectedPlan === "anual" || selectedPlan === "premium") {
                updatedData.limite_usuarios = 99999;
                updatedData.limite_tarjetas = 99999;
                updatedData.capacidad_maxima = 99999;
              }
              
              onChange(updatedData);
            }}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
          >
            <option value="demo">DEMO (30 días)</option>
            <option value="anual">ANUAL (1 año)</option>
            <option value="premium">PREMIUM (Sin vencimiento)</option>
          </select>
        </div>

        {(data.plan === "demo" || data.plan === "anual") && (
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-2">Fecha de Expiración</label>
            <input
              type="date"
              value={data.fecha_expiracion || ""}
              onChange={(e) => onChange({ ...data, fecha_expiracion: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-blue-100 mb-2">Nombre del Negocio</label>
          <input
            type="text"
            value={data.nombre}
            onChange={(e) => onChange({ ...data, nombre: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-100 mb-2">Email</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-100 mb-2">Teléfono</label>
          <input
            type="tel"
            value={data.telefono}
            onChange={(e) => onChange({ ...data, telefono: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-100 mb-2">Ciudad</label>
          <input
            type="text"
            value={data.ciudad}
            onChange={(e) => onChange({ ...data, ciudad: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-blue-100 mb-2">Dirección</label>
          <input
            type="text"
            value={data.direccion}
            onChange={(e) => onChange({ ...data, direccion: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-blue-100 mb-2">Descripción</label>
          <textarea
            value={data.descripcion}
            onChange={(e) => onChange({ ...data, descripcion: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-100 mb-2">Límite de Usuarios</label>
          <input
            type="number"
            value={data.limite_usuarios}
            onChange={(e) => onChange({ ...data, limite_usuarios: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-100 mb-2">Límite de Tarjetas</label>
          <input
            type="number"
            value={data.limite_tarjetas}
            onChange={(e) => onChange({ ...data, limite_tarjetas: parseInt(e.target.value) || 10 })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-100 mb-2">Capacidad Máxima</label>
          <input
            type="number"
            value={data.capacidad_maxima}
            onChange={(e) => onChange({ ...data, capacidad_maxima: parseInt(e.target.value) || 10 })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>
    </motion.div>
  );
}

function StepUsuario({ data, onChange }: { data: UsuarioAdminData; onChange: (data: UsuarioAdminData) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <User className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Usuario Administrador</h2>
          <p className="text-blue-200/60">Configura las credenciales del administrador del negocio</p>
        </div>
      </div>

      <div className="bg-purple-500/10 border border-purple-400/30 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-200/80 flex items-start gap-2">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          Se creará un usuario en la tabla <span className="font-mono text-cyan-300">usuarios</span> con rol de administrador.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-blue-100 mb-2">
            Usuario <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={data.usuario}
            onChange={(e) => onChange({ ...data, usuario: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-100 mb-2">
            Contraseña <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={data.password}
            onChange={(e) => onChange({ ...data, password: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-100 mb-2">Nombre</label>
          <input
            type="text"
            value={data.nombre}
            onChange={(e) => onChange({ ...data, nombre: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-100 mb-2">Apellido</label>
          <input
            type="text"
            value={data.apellido}
            onChange={(e) => onChange({ ...data, apellido: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-100 mb-2">Email</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-100 mb-2">Teléfono (opcional)</label>
          <input
            type="tel"
            value={data.telefono || ""}
            onChange={(e) => onChange({ ...data, telefono: e.target.value || null })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
          />
        </div>
      </div>
    </motion.div>
  );
}

function StepConfiguracion({ data, onChange }: { data: ConfiguracionItem[]; onChange: (data: ConfiguracionItem[]) => void }) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <Settings className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Configuración del Sistema</h2>
          <p className="text-blue-200/60">Se instalarán {data.length} configuraciones en la tabla configuracion_sistema</p>
        </div>
      </div>

      <div className="bg-orange-500/10 border border-orange-400/30 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-200/80 flex items-start gap-2">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          Haz clic en <Edit2 className="w-4 h-4 inline" /> para editar cualquier configuración.
        </p>
      </div>

      <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2">
        {data.map((config, index) => (
          <div
            key={index}
            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
          >
            {editingIndex === index ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={config.clave}
                  onChange={(e) => {
                    const newData = [...data];
                    newData[index].clave = e.target.value;
                    onChange(newData);
                  }}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                  placeholder="Clave"
                />
                <input
                  type="text"
                  value={config.valor}
                  onChange={(e) => {
                    const newData = [...data];
                    newData[index].valor = e.target.value;
                    onChange(newData);
                  }}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                  placeholder="Valor"
                />
                <button
                  onClick={() => setEditingIndex(null)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm"
                >
                  Guardar
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-cyan-400 text-sm">{config.clave}</span>
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">{config.categoria}</span>
                  </div>
                  <p className="text-white text-sm">{config.valor}</p>
                </div>
                <button
                  onClick={() => setEditingIndex(index)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-blue-300" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function StepParametros({ data, onChange }: { data: ParametroItem[]; onChange: (data: ParametroItem[]) => void }) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const updateParametro = (index: number, field: string, value: string | number) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
          <DollarSign className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Parámetros de Tarifas</h2>
          <p className="text-blue-200/60">Se configurarán {data.length} tipos de tarifas en la tabla parametros</p>
        </div>
      </div>

      <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-200/80 flex items-start gap-2">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          Configura las tarifas para AUTO y MOTO.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((param, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            {/* Header Card */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{param.tipo_vehiculo}</h3>
                    <p className="text-sm text-blue-200/60">{param.nombre}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  {editingIndex === index ? "Cerrar" : "Editar"}
                </button>
              </div>

              {editingIndex !== index && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-blue-200/60 mb-1">{param.tarifa_1_nombre}</p>
                    <p className="text-lg font-bold text-emerald-400">${param.tarifa_1_valor}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-blue-200/60 mb-1">{param.tarifa_5_nombre}</p>
                    <p className="text-lg font-bold text-emerald-400">${param.tarifa_5_valor}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-blue-200/60 mb-1">{param.tarifa_7_nombre}</p>
                    <p className="text-lg font-bold text-emerald-400">${param.tarifa_7_valor}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Formulario Expandido */}
            {editingIndex === index && (
              <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                {/* Sección 1: Información Básica */}
                <div className="space-y-4 rounded-2xl border border-blue-500/20 bg-[#0a0e27]/40 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-5 h-5 text-blue-400" />
                    <h4 className="text-base font-semibold text-white">Información Básica</h4>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-blue-200/80 mb-2">Tipo de Vehículo</label>
                      <select
                        value={param.tipo_vehiculo}
                        onChange={(e) => updateParametro(index, 'tipo_vehiculo', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                      >
                        <option value="MOTO">MOTO</option>
                        <option value="AUTO">AUTO</option>
                        <option value="CAMIONETA">CAMIONETA</option>
                        <option value="PESADO">PESADO</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-blue-200/80 mb-2">Nombre de Tarifa</label>
                      <input
                        type="text"
                        value={param.nombre}
                        onChange={(e) => updateParametro(index, 'nombre', e.target.value)}
                        placeholder="Ej: Tarifa para Motocicletas"
                        className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-blue-200/80 mb-2">Descripción</label>
                      <textarea
                        value={param.descripcion}
                        onChange={(e) => updateParametro(index, 'descripcion', e.target.value)}
                        placeholder="Descripción opcional de la tarifa"
                        rows={2}
                        className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-blue-200/80 mb-2">Prioridad</label>
                        <input
                          type="number"
                          value={param.prioridad}
                          onChange={(e) => updateParametro(index, 'prioridad', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-blue-200/80 mb-2">Estado</label>
                        <select
                          value={param.estado}
                          onChange={(e) => updateParametro(index, 'estado', e.target.value)}
                          className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                        >
                          <option value="activo">Activo</option>
                          <option value="inactivo">Inactivo</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección 2: Tarifas Progresivas */}
                <div className="space-y-4 rounded-2xl border border-purple-500/20 bg-[#0a0e27]/40 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <h4 className="text-base font-semibold text-white">Tarifas Progresivas (Horas)</h4>
                  </div>

                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <div key={num} className="grid gap-3 md:grid-cols-2">
                        <div>
                          <label className="block text-xs font-medium text-blue-200/80 mb-2">Nombre Tarifa {num}</label>
                          <input
                            type="text"
                            value={param[`tarifa_${num}_nombre` as keyof ParametroItem] as string}
                            onChange={(e) => updateParametro(index, `tarifa_${num}_nombre`, e.target.value)}
                            placeholder={`Ej: ${num === 1 ? '1-2' : num === 2 ? '3-59' : `Tarifa ${num}`}`}
                            className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/20 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-blue-200/80 mb-2">Valor ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={param[`tarifa_${num}_valor` as keyof ParametroItem] as number}
                            onChange={(e) => updateParametro(index, `tarifa_${num}_valor`, parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/20 transition-all"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sección 3: Tarifas Adicionales */}
                <div className="space-y-4 rounded-2xl border border-emerald-500/20 bg-[#0a0e27]/40 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-base font-semibold text-white">Tarifas Adicionales</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-blue-200/80 mb-2">Tarifa Extra</label>
                      <input
                        type="number"
                        step="0.01"
                        value={param.tarifa_extra}
                        onChange={(e) => updateParametro(index, 'tarifa_extra', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-blue-200/80 mb-2">Tarifa Auxiliar</label>
                      <input
                        type="number"
                        step="0.01"
                        value={param.tarifa_auxiliar}
                        onChange={(e) => updateParametro(index, 'tarifa_auxiliar', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-blue-200/80 mb-2">Tarifa Nocturna</label>
                      <input
                        type="number"
                        step="0.01"
                        value={param.tarifa_nocturna}
                        onChange={(e) => updateParametro(index, 'tarifa_nocturna', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-blue-200/80 mb-2">Tarifa Fin de Semana</label>
                      <input
                        type="number"
                        step="0.01"
                        value={param.tarifa_fin_semana}
                        onChange={(e) => updateParametro(index, 'tarifa_fin_semana', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function StepTarjetas({ data, onChange }: { data: TarjetaItem[]; onChange: (data: TarjetaItem[]) => void }) {
  const agregarTarjeta = () => {
    const nuevoCodigo = (data.length + 1).toString();
    onChange([...data, { codigo: nuevoCodigo, estado: "1" }]);
  };

  const eliminarTarjeta = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <CreditCard className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Tarjetas del Sistema</h2>
          <p className="text-blue-200/60">Se crearán {data.length} tarjetas en la tabla tarjetas</p>
        </div>
      </div>

      <div className="bg-indigo-500/10 border border-indigo-400/30 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-200/80 flex items-start gap-2">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          Puedes añadir, editar o eliminar tarjetas antes de la instalación.
        </p>
      </div>

      <div className="mb-4">
        <button
          onClick={agregarTarjeta}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg"
        >
          <Plus className="w-5 h-5" />
          Agregar Tarjeta
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-h-[400px] overflow-y-auto pr-2">
        {data.map((tarjeta, index) => (
          <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-blue-200/60">Tarjeta #{index + 1}</span>
              <button
                onClick={() => eliminarTarjeta(index)}
                className="p-1 hover:bg-red-500/20 rounded"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
            <input
              type="text"
              value={tarjeta.codigo}
              onChange={(e) => {
                const newData = [...data];
                newData[index].codigo = e.target.value;
                onChange(newData);
              }}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-center font-bold text-lg"
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function StepResumen({
  negocio,
  usuario,
  configuraciones,
  parametros,
  tarjetas,
}: {
  negocio: NegocioData;
  usuario: UsuarioAdminData;
  configuraciones: ConfiguracionItem[];
  parametros: ParametroItem[];
  tarjetas: TarjetaItem[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
          <FileCheck className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Resumen Ejecutivo</h2>
          <p className="text-blue-200/60">Revisa todos los datos antes de crear el negocio</p>
        </div>
      </div>

      <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-200/80 flex items-start gap-2">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          Verifica que todos los datos sean correctos. Puedes regresar a cualquier paso anterior para hacer cambios.
        </p>
      </div>

      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
        {/* Datos del Negocio */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            Datos del Negocio
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-200/60">Código:</span>
              <span className="ml-2 font-mono font-bold text-cyan-300">{negocio.codigo}</span>
            </div>
            <div>
              <span className="text-blue-200/60">Plan:</span>
              <span className="ml-2 font-bold text-white">{negocio.plan.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-blue-200/60">Nombre:</span>
              <span className="ml-2 text-white">{negocio.nombre}</span>
            </div>
            <div>
              <span className="text-blue-200/60">Ciudad:</span>
              <span className="ml-2 text-white">{negocio.ciudad}</span>
            </div>
            <div>
              <span className="text-blue-200/60">Email:</span>
              <span className="ml-2 text-white">{negocio.email}</span>
            </div>
            <div>
              <span className="text-blue-200/60">Teléfono:</span>
              <span className="ml-2 text-white">{negocio.telefono}</span>
            </div>
            <div>
              <span className="text-blue-200/60">Capacidad Máxima:</span>
              <span className="ml-2 font-bold text-emerald-400">{negocio.capacidad_maxima} vehículos</span>
            </div>
            <div>
              <span className="text-blue-200/60">Límite Tarjetas:</span>
              <span className="ml-2 font-bold text-purple-400">{negocio.limite_tarjetas}</span>
            </div>
          </div>
        </div>

        {/* Usuario Administrador */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            Usuario Administrador
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-200/60">Usuario:</span>
              <span className="ml-2 font-mono font-bold text-purple-300">{usuario.usuario}</span>
            </div>
            <div>
              <span className="text-blue-200/60">Nombre:</span>
              <span className="ml-2 text-white">{usuario.nombre} {usuario.apellido}</span>
            </div>
            <div>
              <span className="text-blue-200/60">Email:</span>
              <span className="ml-2 text-white">{usuario.email}</span>
            </div>
            <div>
              <span className="text-blue-200/60">Contraseña:</span>
              <span className="ml-2 font-mono text-white">{'•'.repeat(usuario.password.length)}</span>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <Settings className="w-8 h-8 mx-auto mb-2 text-orange-400" />
            <div className="text-3xl font-bold text-orange-400">{configuraciones.length}</div>
            <div className="text-xs text-blue-200/60 mt-1">Configuraciones del Sistema</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <div className="text-3xl font-bold text-green-400">{parametros.length}</div>
            <div className="text-xs text-blue-200/60 mt-1">Parámetros de Tarifas</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <CreditCard className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
            <div className="text-3xl font-bold text-indigo-400">{tarjetas.length}</div>
            <div className="text-xs text-blue-200/60 mt-1">Tarjetas Generadas</div>
          </div>
        </div>

        {/* Advertencia Final */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/30 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-300 mb-2">Importante</h4>
              <ul className="text-sm text-blue-200/80 space-y-1 list-disc list-inside">
                <li>Se creará un nuevo negocio en la base de datos</li>
                <li>Se instalarán {configuraciones.length} configuraciones del sistema</li>
                <li>Se configurarán {parametros.length} tipos de vehículos con tarifas</li>
                <li>Se generarán {tarjetas.length} tarjetas de parqueadero</li>
                <li>Esta acción no se puede deshacer automáticamente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
