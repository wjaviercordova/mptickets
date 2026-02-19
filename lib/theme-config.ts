/**
 * Configuración de Temas del Sistema
 * MP Tickets - Parking System
 */

export type ThemeMode = "dark" | "light";
export type ThemePreset = "glassmorphism-dark" | "minimal-dark" | "vibrant-dark";

export interface ThemeColors {
  // Backgrounds
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgGradient: string; // Gradiente para el fondo principal
  
  // Glass effects
  glassBase: string;
  glassOverlay: string;
  
  // Borders
  borderPrimary: string;
  borderSecondary: string;
  
  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  
  // Accent colors
  accentCyan: string;
  accentPurple: string;
  accentEmerald: string;
  accentRed: string;
  accentYellow: string;
  
  // Shadows
  shadowColor: string;
}

export interface ThemeConfig {
  mode: ThemeMode;
  preset: ThemePreset;
  colors: ThemeColors;
  
  // Effects
  blurIntensity: "low" | "medium" | "high";
  glassOpacity: number; // 0-100
  borderRadius: "small" | "medium" | "large";
  shadowIntensity: "none" | "low" | "medium" | "high";
  
  // Animations
  animationSpeed: "slow" | "normal" | "fast" | "none";
  
  // UI Preferences
  sidebarCollapsed: boolean;
  uiDensity: "compact" | "normal" | "comfortable";
  
  // Branding
  logoUrl?: string;
  faviconUrl?: string;
}

// =====================================================
// PRESET: Glassmorphism Dark (Actual)
// =====================================================
export const glassmorphismDark: ThemeColors = {
  bgPrimary: "#0a0e27",
  bgSecondary: "#1e293b",
  bgTertiary: "#0f172a",
  bgGradient: "linear-gradient(to bottom right, #0a0e27, #16213e, #0f1729)",
  
  glassBase: "rgba(30, 41, 59, 0.6)",
  glassOverlay: "rgba(15, 23, 42, 0.8)",
  
  borderPrimary: "rgba(59, 130, 246, 0.2)",
  borderSecondary: "rgba(34, 211, 238, 0.3)",
  
  textPrimary: "#ffffff",
  textSecondary: "rgba(191, 219, 254, 0.8)",
  textTertiary: "rgba(191, 219, 254, 0.6)",
  
  accentCyan: "#22d3ee",
  accentPurple: "#a855f7",
  accentEmerald: "#10b981",
  accentRed: "#ef4444",
  accentYellow: "#f59e0b",
  
  shadowColor: "rgba(34, 211, 238, 0.2)",
};

// =====================================================
// PRESET: Glassmorphism Light (DESHABILITADO)
// =====================================================
// export const glassmorphismLight: ThemeColors = {
//   bgPrimary: "#f8fafc",
//   bgSecondary: "#ffffff",
//   bgTertiary: "#f1f5f9",
//   bgGradient: "linear-gradient(to bottom right, #f0f9ff, #e0f2fe, #f8fafc)",
//   
//   glassBase: "rgba(255, 255, 255, 0.7)",
//   glassOverlay: "rgba(248, 250, 252, 0.9)",
//   
//   borderPrimary: "rgba(148, 163, 184, 0.3)",
//   borderSecondary: "rgba(6, 182, 212, 0.3)",
//   
//   textPrimary: "#0f172a",
//   textSecondary: "rgba(51, 65, 85, 0.9)",
//   textTertiary: "rgba(100, 116, 139, 0.8)",
//   
//   accentCyan: "#0891b2",
//   accentPurple: "#9333ea",
//   accentEmerald: "#059669",
//   accentRed: "#dc2626",
//   accentYellow: "#d97706",
//   
//   shadowColor: "rgba(0, 0, 0, 0.1)",
// };

// =====================================================
// PRESET: Minimal Dark
// =====================================================
export const minimalDark: ThemeColors = {
  bgPrimary: "#121212",
  bgSecondary: "#1e1e1e",
  bgTertiary: "#181818",
  bgGradient: "linear-gradient(to bottom right, #0d0d0d, #1a1a1a, #121212)",
  
  glassBase: "rgba(30, 30, 30, 0.5)",
  glassOverlay: "rgba(24, 24, 24, 0.7)",
  
  borderPrimary: "rgba(255, 255, 255, 0.1)",
  borderSecondary: "rgba(255, 255, 255, 0.15)",
  
  textPrimary: "#ffffff",
  textSecondary: "rgba(255, 255, 255, 0.8)",
  textTertiary: "rgba(255, 255, 255, 0.5)",
  
  accentCyan: "#00bcd4",
  accentPurple: "#9c27b0",
  accentEmerald: "#4caf50",
  accentRed: "#f44336",
  accentYellow: "#ff9800",
  
  shadowColor: "rgba(0, 0, 0, 0.3)",
};

// =====================================================
// PRESET: Minimal Light (DESHABILITADO)
// =====================================================
// export const minimalLight: ThemeColors = {
//   bgPrimary: "#ffffff",
//   bgSecondary: "#fafafa",
//   bgTertiary: "#f5f5f5",
//   bgGradient: "linear-gradient(to bottom right, #ffffff, #fafafa, #f5f5f5)",
//   
//   glassBase: "rgba(255, 255, 255, 0.6)",
//   glassOverlay: "rgba(250, 250, 250, 0.8)",
//   
//   borderPrimary: "rgba(0, 0, 0, 0.12)",
//   borderSecondary: "rgba(0, 0, 0, 0.18)",
//   
//   textPrimary: "#212121",
//   textSecondary: "rgba(0, 0, 0, 0.7)",
//   textTertiary: "rgba(0, 0, 0, 0.5)",
//   
//   accentCyan: "#0097a7",
//   accentPurple: "#7b1fa2",
//   accentEmerald: "#388e3c",
//   accentRed: "#d32f2f",
//   accentYellow: "#f57c00",
//   
//   shadowColor: "rgba(0, 0, 0, 0.08)",
// };

// =====================================================
// PRESET: Vibrant Dark
// =====================================================
export const vibrantDark: ThemeColors = {
  bgPrimary: "#0d1117",
  bgSecondary: "#161b22",
  bgTertiary: "#0d1117",
  bgGradient: "linear-gradient(to bottom right, #0d1117, #1c1f26, #13171d)",
  
  glassBase: "rgba(22, 27, 34, 0.6)",
  glassOverlay: "rgba(13, 17, 23, 0.85)",
  
  borderPrimary: "rgba(88, 166, 255, 0.3)",
  borderSecondary: "rgba(163, 113, 247, 0.3)",
  
  textPrimary: "#ffffff",
  textSecondary: "rgba(201, 209, 217, 0.9)",
  textTertiary: "rgba(139, 148, 158, 0.8)",
  
  accentCyan: "#58a6ff",
  accentPurple: "#a371f7",
  accentEmerald: "#3fb950",
  accentRed: "#ff7b72",
  accentYellow: "#d29922",
  
  shadowColor: "rgba(88, 166, 255, 0.3)",
};

// =====================================================
// PRESET: Vibrant Light (DESHABILITADO)
// =====================================================
// export const vibrantLight: ThemeColors = {
//   bgPrimary: "#ffffff",
//   bgSecondary: "#f6f8fa",
//   bgTertiary: "#ffffff",
//   bgGradient: "linear-gradient(to bottom right, #fdfeff, #f6f8fa, #ffffff)",
//   
//   glassBase: "rgba(255, 255, 255, 0.75)",
//   glassOverlay: "rgba(246, 248, 250, 0.95)",
//   
//   borderPrimary: "rgba(27, 31, 36, 0.15)",
//   borderSecondary: "rgba(84, 174, 255, 0.3)",
//   
//   textPrimary: "#24292f",
//   textSecondary: "rgba(36, 41, 47, 0.85)",
//   textTertiary: "rgba(87, 96, 106, 0.8)",
//   
//   accentCyan: "#0969da",
//   accentPurple: "#8250df",
//   accentEmerald: "#1a7f37",
//   accentRed: "#cf222e",
//   accentYellow: "#bf8700",
//   
//   shadowColor: "rgba(31, 35, 40, 0.12)",
// };

// =====================================================
// MAPEO DE PRESETS
// =====================================================
export const themePresets: Record<ThemePreset, ThemeColors> = {
  "glassmorphism-dark": glassmorphismDark,
  "minimal-dark": minimalDark,
  "vibrant-dark": vibrantDark,
};

// =====================================================
// CONFIGURACIÓN POR DEFECTO
// =====================================================
export const defaultThemeConfig: ThemeConfig = {
  mode: "dark",
  preset: "glassmorphism-dark",
  colors: glassmorphismDark,
  blurIntensity: "medium",
  glassOpacity: 60,
  borderRadius: "large",
  shadowIntensity: "medium",
  animationSpeed: "normal",
  sidebarCollapsed: false,
  uiDensity: "normal",
};

// =====================================================
// UTILIDADES
// =====================================================

/**
 * Genera las variables CSS del tema
 */
export function generateThemeCSS(config: ThemeConfig): string {
  const { colors } = config;
  
  return `
    :root {
      /* Backgrounds */
      --bg-primary: ${colors.bgPrimary};
      --bg-secondary: ${colors.bgSecondary};
      --bg-tertiary: ${colors.bgTertiary};
      --bg-gradient: ${colors.bgGradient};
      
      /* Glass */
      --glass-base: ${colors.glassBase};
      --glass-overlay: ${colors.glassOverlay};
      
      /* Borders */
      --border-primary: ${colors.borderPrimary};
      --border-secondary: ${colors.borderSecondary};
      
      /* Text */
      --text-primary: ${colors.textPrimary};
      --text-secondary: ${colors.textSecondary};
      --text-tertiary: ${colors.textTertiary};
      
      /* Accents */
      --accent-cyan: ${colors.accentCyan};
      --accent-purple: ${colors.accentPurple};
      --accent-emerald: ${colors.accentEmerald};
      --accent-red: ${colors.accentRed};
      --accent-yellow: ${colors.accentYellow};
      
      /* Shadows */
      --shadow-color: ${colors.shadowColor};
      
      /* Effects */
      --blur-intensity: ${config.blurIntensity === "low" ? "8px" : config.blurIntensity === "medium" ? "16px" : "24px"};
      --glass-opacity: ${config.glassOpacity / 100};
      --border-radius: ${config.borderRadius === "small" ? "0.5rem" : config.borderRadius === "medium" ? "1rem" : "1.5rem"};
      --shadow-intensity: ${config.shadowIntensity === "none" ? "0" : config.shadowIntensity === "low" ? "0.3" : config.shadowIntensity === "medium" ? "0.5" : "0.7"};
      --animation-speed: ${config.animationSpeed === "slow" ? "0.5s" : config.animationSpeed === "normal" ? "0.3s" : config.animationSpeed === "fast" ? "0.15s" : "0s"};
    }
  `;
}

/**
 * Obtiene el modo del preset
 */
export function getModeFromPreset(preset: ThemePreset): ThemeMode {
  return preset.includes("dark") ? "dark" : "light";
}

/**
 * Metadata de presets para UI
 */
export const presetMetadata: Record<ThemePreset, { name: string; description: string; mode: ThemeMode }> = {
  "glassmorphism-dark": {
    name: "Glassmorphism Oscuro",
    description: "Tema actual con efectos de vidrio y neón",
    mode: "dark",
  },
  "minimal-dark": {
    name: "Minimalista Oscuro",
    description: "Diseño limpio y enfocado",
    mode: "dark",
  },
  "vibrant-dark": {
    name: "Vibrante Oscuro",
    description: "Colores intensos sobre fondo oscuro",
    mode: "dark",
  },
};
