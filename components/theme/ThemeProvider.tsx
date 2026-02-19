"use client";

import { useEffect } from "react";
import { ThemeConfig, defaultThemeConfig, generateThemeCSS } from "@/lib/theme-config";

interface ThemeProviderProps {
  themeConfig: ThemeConfig;
  children: React.ReactNode;
}

export function ThemeProvider({ themeConfig, children }: ThemeProviderProps) {
  useEffect(() => {
    // Generar y aplicar CSS del tema
    const cssVariables = generateThemeCSS(themeConfig);
    
    // Buscar o crear el elemento style para el tema
    let styleElement = document.getElementById("theme-variables") as HTMLStyleElement | null;
    
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "theme-variables";
      document.head.appendChild(styleElement);
    }
    
    // Actualizar las variables CSS
    styleElement.textContent = cssVariables;
    
    // Limpiar al desmontar
    return () => {
      const element = document.getElementById("theme-variables");
      if (element) {
        element.remove();
      }
    };
  }, [themeConfig]);

  return <>{children}</>;
}
