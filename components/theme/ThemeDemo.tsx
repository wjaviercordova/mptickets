"use client";

import { useState } from "react";

/**
 * Componente de demo para verificar que las variables CSS del tema se estén aplicando
 * Muestra los colores actuales del tema en tiempo real
 */
export function ThemeDemo() {
  const [showTechnical, setShowTechnical] = useState(false);

  return (
    <div className="space-y-6 p-6" style={{ color: "var(--text-primary)" }}>
      <div>
        <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          🎨 Demo del Sistema de Temas
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Vista en tiempo real de las variables CSS activas
        </p>
      </div>
      
      {/* Backgrounds */}
      <div>
        <h3 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          Fondos (Backgrounds)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div 
              className="h-24 rounded-lg border-2 flex items-center justify-center font-semibold"
              style={{ 
                backgroundColor: "var(--bg-primary)",
                borderColor: "var(--border-primary)",
                color: "var(--text-primary)"
              }}
            >
              Primary
            </div>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              --bg-primary
            </p>
          </div>
          
          <div className="space-y-2">
            <div 
              className="h-24 rounded-lg border-2 flex items-center justify-center font-semibold"
              style={{ 
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-primary)",
                color: "var(--text-primary)"
              }}
            >
              Secondary
            </div>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              --bg-secondary
            </p>
          </div>
          
          <div className="space-y-2">
            <div 
              className="h-24 rounded-lg border-2 flex items-center justify-center font-semibold"
              style={{ 
                backgroundColor: "var(--bg-tertiary)",
                borderColor: "var(--border-primary)",
                color: "var(--text-primary)"
              }}
            >
              Tertiary
            </div>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              --bg-tertiary
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          <div 
            className="h-32 rounded-lg border-2 flex items-center justify-center text-xl font-bold"
            style={{ 
              background: "var(--bg-gradient)",
              borderColor: "var(--border-primary)",
              color: "var(--text-primary)"
            }}
          >
            Gradiente Principal (--bg-gradient)
          </div>
          <p className="text-sm mt-2" style={{ color: "var(--text-tertiary)" }}>
            Este es el fondo del dashboard completo
          </p>
        </div>
      </div>

      {/* Accents */}
      <div>
        <h3 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          Colores de Acento
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <div 
              className="h-20 rounded-lg flex items-center justify-center font-semibold text-white"
              style={{ backgroundColor: "var(--accent-cyan)" }}
            >
              Cyan
            </div>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              --accent-cyan
            </p>
          </div>
          
          <div className="space-y-2">
            <div 
              className="h-20 rounded-lg flex items-center justify-center font-semibold text-white"
              style={{ backgroundColor: "var(--accent-purple)" }}
            >
              Purple
            </div>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              --accent-purple
            </p>
          </div>
          
          <div className="space-y-2">
            <div 
              className="h-20 rounded-lg flex items-center justify-center font-semibold text-white"
              style={{ backgroundColor: "var(--accent-emerald)" }}
            >
              Emerald
            </div>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              --accent-emerald
            </p>
          </div>
          
          <div className="space-y-2">
            <div 
              className="h-20 rounded-lg flex items-center justify-center font-semibold text-white"
              style={{ backgroundColor: "var(--accent-red)" }}
            >
              Red
            </div>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              --accent-red
            </p>
          </div>
          
          <div className="space-y-2">
            <div 
              className="h-20 rounded-lg flex items-center justify-center font-semibold text-white"
              style={{ backgroundColor: "var(--accent-yellow)" }}
            >
              Yellow
            </div>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              --accent-yellow
            </p>
          </div>
        </div>
      </div>

      {/* Text Colors */}
      <div>
        <h3 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          Colores de Texto
        </h3>
        <div className="space-y-2 p-4 rounded-lg" style={{ backgroundColor: "var(--bg-secondary)" }}>
          <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Texto Primario (--text-primary) - Para títulos y contenido principal
          </p>
          <p className="text-base" style={{ color: "var(--text-secondary)" }}>
            Texto Secundario (--text-secondary) - Para descripciones y subtítulos
          </p>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            Texto Terciario (--text-tertiary) - Para hints, metadatos y textos menos importantes
          </p>
        </div>
      </div>

      {/* Glass Components */}
      <div>
        <h3 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          Componentes de Vidrio (Glassmorphism)
        </h3>
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h4 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Card con clase .glass-card
            </h4>
            <p style={{ color: "var(--text-secondary)" }}>
              Este card usa las variables CSS del tema: blur, opacidad, bordes y sombras.
            </p>
          </div>

          <input 
            type="text" 
            placeholder="Input con clase .glass-input"
            className="glass-input"
          />

          <button className="glass-button">
            Botón con clase .glass-button
          </button>
        </div>
      </div>

      {/* Technical Info */}
      <div>
        <button
          onClick={() => setShowTechnical(!showTechnical)}
          className="text-sm font-semibold underline"
          style={{ color: "var(--accent-cyan)" }}
        >
          {showTechnical ? "Ocultar" : "Mostrar"} información técnica
        </button>
        
        {showTechnical && (
          <div className="mt-4 p-4 rounded-lg font-mono text-xs" style={{ 
            backgroundColor: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
            borderLeft: "4px solid var(--accent-cyan)"
          }}>
            <p className="mb-2 font-bold" style={{ color: "var(--text-primary)" }}>Variables CSS Activas:</p>
            <div className="space-y-1">
              <p>--bg-primary: {getComputedStyle(document.documentElement).getPropertyValue('--bg-primary')}</p>
              <p>--bg-gradient: {getComputedStyle(document.documentElement).getPropertyValue('--bg-gradient')}</p>
              <p>--text-primary: {getComputedStyle(document.documentElement).getPropertyValue('--text-primary')}</p>
              <p>--text-secondary: {getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')}</p>
              <p>--accent-cyan: {getComputedStyle(document.documentElement).getPropertyValue('--accent-cyan')}</p>
              <p>--border-radius: {getComputedStyle(document.documentElement).getPropertyValue('--border-radius')}</p>
              <p>--blur-intensity: {getComputedStyle(document.documentElement).getPropertyValue('--blur-intensity')}</p>
              <p>--animation-speed: {getComputedStyle(document.documentElement).getPropertyValue('--animation-speed')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 rounded-lg" style={{ 
        backgroundColor: "var(--glass-base)",
        borderLeft: "4px solid var(--accent-emerald)"
      }}>
        <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
          💡 Cómo usar este demo:
        </p>
        <ol className="list-decimal list-inside space-y-1" style={{ color: "var(--text-secondary)" }}>
          <li>Ve a Configuración → Sistema → Apariencia</li>
          <li>Cambia entre los 6 temas disponibles</li>
          <li>Observa cómo este demo refleja los colores en tiempo real</li>
          <li>Comprueba el contraste en temas claros vs oscuros</li>
        </ol>
      </div>
    </div>
  );
}

