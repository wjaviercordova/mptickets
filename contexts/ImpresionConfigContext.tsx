"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { ConfigImpresion } from "@/lib/impresion";

interface DatosNegocio {
  nombre: string;
  direccion: string;
  telefono: string;
}

interface HorarioDia {
  open: boolean;
  "24h": boolean;
  from: string;
  to: string;
}

interface HorariosAtencion {
  lunes: HorarioDia;
  martes: HorarioDia;
  miercoles: HorarioDia;
  jueves: HorarioDia;
  viernes: HorarioDia;
  sabado: HorarioDia;
  domingo: HorarioDia;
}

interface ImpresionConfigContextType {
  // Datos en caché
  negocio: DatosNegocio | null;
  configImpresion: ConfigImpresion | null;
  diasAtencion: string;
  horariosAtencion: HorariosAtencion | null;
  
  // Estados
  loading: boolean;
  error: string | null;
  
  // Método para refrescar datos
  refrescar: () => Promise<void>;
}

const ImpresionConfigContext = createContext<ImpresionConfigContextType | undefined>(undefined);

interface ImpresionConfigProviderProps {
  children: ReactNode;
  negocioId: string;
  initialNegocio?: DatosNegocio | null;
  initialConfigImpresion?: ConfigImpresion | null;
  initialDiasAtencion?: string;
  initialHorariosAtencion?: HorariosAtencion | null;
}

export function ImpresionConfigProvider({ 
  children, 
  negocioId,
  initialNegocio = null,
  initialConfigImpresion = null,
  initialDiasAtencion = "Lun-Dom",
  initialHorariosAtencion = null
}: ImpresionConfigProviderProps) {
  const [negocio] = useState<DatosNegocio | null>(initialNegocio);
  const [configImpresion, setConfigImpresion] = useState<ConfigImpresion | null>(initialConfigImpresion);
  const [diasAtencion] = useState<string>(initialDiasAtencion);
  const [horariosAtencion] = useState<HorariosAtencion | null>(initialHorariosAtencion);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Obtener configuración de impresión (desde API)
      const configResponse = await fetch(
        `/api/configuracion/impresion?negocio_id=${negocioId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      if (configResponse.ok) {
        const configData = await configResponse.json();
        setConfigImpresion(configData);
      }

      // 2. Re-cargar datos del negocio si es necesario
      // (Solo si estamos refrescando y queremos actualizar todo)
      // Por ahora, confiamos en los datos iniciales del servidor

    } catch (err) {
      console.error("Error cargando configuración de impresión:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [negocioId]);

  // NO cargar automáticamente al montar si ya tenemos datos iniciales
  useEffect(() => {
    // Solo cargar si no tenemos configImpresion inicial
    if (!initialConfigImpresion) {
      cargarDatos();
    }
  }, [initialConfigImpresion, cargarDatos]);

  const refrescar = useCallback(async () => {
    await cargarDatos();
  }, [cargarDatos]);

  return (
    <ImpresionConfigContext.Provider
      value={{
        negocio,
        configImpresion,
        diasAtencion,
        horariosAtencion,
        loading,
        error,
        refrescar,
      }}
    >
      {children}
    </ImpresionConfigContext.Provider>
  );
}

export function useImpresionConfig() {
  const context = useContext(ImpresionConfigContext);
  if (context === undefined) {
    throw new Error("useImpresionConfig must be used within an ImpresionConfigProvider");
  }
  return context;
}
