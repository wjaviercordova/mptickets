"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, RefreshCw, Eye, Palette, Sparkles, Monitor, Moon, Sun } from "lucide-react";
import {
  type ThemeConfig,
  type ThemePreset,
  defaultThemeConfig,
  themePresets,
  presetMetadata,
  generateThemeCSS,
} from "@/lib/theme-config";

interface AparienciaTabProps {
  configActual: ThemeConfig;
  onSave: (config: ThemeConfig) => Promise<void>;
}

export function AparienciaTab({
  configActual,
  onSave,
}: AparienciaTabProps) {
  const [config, setConfig] = useState<ThemeConfig>(configActual || defaultThemeConfig);
  const [loading, setLoading] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const handlePresetChange = (preset: ThemePreset) => {
    setConfig({
      ...config,
      preset,
      colors: themePresets[preset],
      mode: presetMetadata[preset].mode,
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(config);
      setPreviewing(false);
      
      // Aplicar tema inmediatamente
      applyTheme(config);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    setPreviewing(true);
    applyTheme(config);
  };

  const handleRestore = () => {
    setConfig(defaultThemeConfig);
    setPreviewing(false);
    applyTheme(defaultThemeConfig);
  };

  const applyTheme = (themeConfig: ThemeConfig) => {
    const style = document.getElementById("theme-variables");
    if (style) {
      style.textContent = generateThemeCSS(themeConfig);
    } else {
      const newStyle = document.createElement("style");
      newStyle.id = "theme-variables";
      newStyle.textContent = generateThemeCSS(themeConfig);
      document.head.appendChild(newStyle);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Palette className="h-6 w-6 text-purple-400" />
          <h3 className="font-heading text-2xl text-white">Personalización de Apariencia</h3>
        </div>
        <p className="text-sm text-blue-200/70">
          Configura el tema visual, colores y efectos del sistema
        </p>
      </div>

      {/* Presets de Temas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-heading text-lg text-white">Temas Predefinidos</h4>
          <div className="flex items-center gap-2 rounded-full border border-blue-500/20 bg-[#1e293b]/40 px-3 py-1.5 text-sm backdrop-blur-sm">
            {config.mode === "dark" ? (
              <>
                <Moon className="h-4 w-4 text-cyan-400" />
                <span className="text-cyan-400">Oscuro</span>
              </>
            ) : (
              <>
                <Sun className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-400">Claro</span>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(presetMetadata).map(([key, metadata]) => {
            const preset = key as ThemePreset;
            const colors = themePresets[preset];
            const isSelected = config.preset === preset;

            return (
              <motion.button
                key={preset}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePresetChange(preset)}
                className={`group relative overflow-hidden rounded-2xl border p-5 text-left backdrop-blur-xl transition ${
                  isSelected
                    ? "border-cyan-400/50 bg-gradient-to-br from-cyan-500/20 to-blue-600/10 shadow-lg shadow-cyan-500/20"
                    : "border-blue-500/20 bg-gradient-to-br from-[#1e293b]/60 to-[#0a0e27]/80 hover:border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-500/10"
                }`}
              >
                {/* Color Preview */}
                <div className="mb-4 flex gap-2">
                  <div
                    className="h-8 w-8 rounded-lg border border-white/20 shadow-md"
                    style={{ backgroundColor: colors.accentCyan }}
                  />
                  <div
                    className="h-8 w-8 rounded-lg border border-white/20 shadow-md"
                    style={{ backgroundColor: colors.accentPurple }}
                  />
                  <div
                    className="h-8 w-8 rounded-lg border border-white/20 shadow-md"
                    style={{ backgroundColor: colors.accentEmerald }}
                  />
                </div>

                {/* Metadata */}
                <div className="space-y-1">
                  <h5 className="font-heading text-base text-white flex items-center gap-2">
                    {metadata.name}
                    {isSelected && <Sparkles className="h-4 w-4 text-cyan-400" />}
                  </h5>
                  <p className="text-xs text-blue-200/70">{metadata.description}</p>
                </div>

                {/* Mode Badge */}
                <div className="absolute right-3 top-3">
                  {metadata.mode === "dark" ? (
                    <Moon className="h-4 w-4 text-blue-300/60" />
                  ) : (
                    <Sun className="h-4 w-4 text-yellow-300/60" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Opciones Avanzadas */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Intensidad de Blur */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-blue-200">
            Intensidad de Desenfoque
          </label>
          <div className="flex gap-2">
            {(["low", "medium", "high"] as const).map((intensity) => (
              <button
                key={intensity}
                onClick={() => setConfig({ ...config, blurIntensity: intensity })}
                className={`flex-1 rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  config.blurIntensity === intensity
                    ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-200"
                    : "border-blue-500/20 bg-[#1e293b]/40 text-blue-200/70 hover:border-cyan-400/30 hover:bg-cyan-500/10"
                }`}
              >
                {intensity === "low" ? "Bajo" : intensity === "medium" ? "Medio" : "Alto"}
              </button>
            ))}
          </div>
        </div>

        {/* Opacidad de Vidrio */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-blue-200">Opacidad del Vidrio</label>
            <span className="text-sm font-semibold text-cyan-400">{config.glassOpacity}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            value={config.glassOpacity}
            onChange={(e) => setConfig({ ...config, glassOpacity: parseInt(e.target.value) })}
            className="w-full accent-cyan-400"
          />
        </div>

        {/* Radio de Bordes */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-blue-200">
            Redondeo de Esquinas
          </label>
          <div className="flex gap-2">
            {(["small", "medium", "large"] as const).map((radius) => (
              <button
                key={radius}
                onClick={() => setConfig({ ...config, borderRadius: radius })}
                className={`flex-1 rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  config.borderRadius === radius
                    ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-200"
                    : "border-blue-500/20 bg-[#1e293b]/40 text-blue-200/70 hover:border-cyan-400/30 hover:bg-cyan-500/10"
                }`}
              >
                {radius === "small" ? "Pequeño" : radius === "medium" ? "Medio" : "Grande"}
              </button>
            ))}
          </div>
        </div>

        {/* Intensidad de Sombras */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-blue-200">
            Intensidad de Sombras
          </label>
          <div className="flex gap-2">
            {(["none", "low", "medium", "high"] as const).map((shadow) => (
              <button
                key={shadow}
                onClick={() => setConfig({ ...config, shadowIntensity: shadow })}
                className={`flex-1 rounded-xl border px-4 py-2 text-xs font-medium transition ${
                  config.shadowIntensity === shadow
                    ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-200"
                    : "border-blue-500/20 bg-[#1e293b]/40 text-blue-200/70 hover:border-cyan-400/30 hover:bg-cyan-500/10"
                }`}
              >
                {shadow === "none" ? "Sin" : shadow === "low" ? "Baja" : shadow === "medium" ? "Media" : "Alta"}
              </button>
            ))}
          </div>
        </div>

        {/* Velocidad de Animaciones */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-blue-200">
            Velocidad de Animaciones
          </label>
          <div className="flex gap-2">
            {(["none", "slow", "normal", "fast"] as const).map((speed) => (
              <button
                key={speed}
                onClick={() => setConfig({ ...config, animationSpeed: speed })}
                className={`flex-1 rounded-xl border px-4 py-2 text-xs font-medium transition ${
                  config.animationSpeed === speed
                    ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-200"
                    : "border-blue-500/20 bg-[#1e293b]/40 text-blue-200/70 hover:border-cyan-400/30 hover:bg-cyan-500/10"
                }`}
              >
                {speed === "none" ? "Sin" : speed === "slow" ? "Lenta" : speed === "normal" ? "Normal" : "Rápida"}
              </button>
            ))}
          </div>
        </div>

        {/* Densidad de UI */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-blue-200">
            Densidad de Interfaz
          </label>
          <div className="flex gap-2">
            {(["compact", "normal", "comfortable"] as const).map((density) => (
              <button
                key={density}
                onClick={() => setConfig({ ...config, uiDensity: density })}
                className={`flex-1 rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  config.uiDensity === density
                    ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-200"
                    : "border-blue-500/20 bg-[#1e293b]/40 text-blue-200/70 hover:border-cyan-400/30 hover:bg-cyan-500/10"
                }`}
              >
                {density === "compact" ? "Compacta" : density === "normal" ? "Normal" : "Cómoda"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePreview}
          className="flex items-center gap-2 rounded-2xl border border-purple-400/40 bg-gradient-to-r from-purple-500/30 to-pink-600/30 px-6 py-3 font-semibold text-white backdrop-blur-xl transition hover:from-purple-500/50 hover:to-pink-600/50 hover:shadow-xl hover:shadow-purple-500/30"
        >
          <Eye className="h-5 w-5" />
          Vista Previa
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 rounded-2xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 px-6 py-3 font-semibold text-white backdrop-blur-xl transition hover:from-cyan-500/50 hover:to-blue-600/50 hover:shadow-xl hover:shadow-cyan-500/30 disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          {loading ? "Guardando..." : "Guardar Cambios"}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRestore}
          className="flex items-center gap-2 rounded-2xl border border-blue-500/30 bg-[#1e293b]/60 px-6 py-3 font-semibold text-blue-200 backdrop-blur-xl transition hover:bg-blue-500/20"
        >
          <RefreshCw className="h-5 w-5" />
          Restaurar Predeterminado
        </motion.button>
      </div>

      {/* Nota de Vista Previa */}
      {previewing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl border border-yellow-400/40 bg-yellow-500/20 p-4 backdrop-blur-xl"
        >
          <Monitor className="h-5 w-5 text-yellow-300" />
          <div>
            <p className="text-sm font-semibold text-yellow-200">Vista Previa Activa</p>
            <p className="text-xs text-yellow-300/80">
              Los cambios se aplicarán temporalmente. Haz clic en &ldquo;Guardar Cambios&rdquo; para hacerlos permanentes.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
