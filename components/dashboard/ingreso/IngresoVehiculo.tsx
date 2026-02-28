"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CreditCard, Car, PlusCircle, Scan, CheckCircle2, AlertCircle } from "lucide-react";
import type { Parametro, UltimoIngreso } from "@/types/ingreso";
import { motionButtonProps } from "@/lib/button-styles";
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { useImpresionConfig } from "@/contexts/ImpresionConfigContext";
import { TarjetaSelector } from "./TarjetaSelector";
import { TipoVehiculoCards } from "./TipoVehiculoCards";
import { IngresoResumen } from "./IngresoResumen";
import {
  imprimirTicketEntrada,
  formatearFechaHora,
  type DatosTicketEntrada,
} from "@/lib/impresion";

interface IngresoVehiculoProps {
  parametros: Parametro[];
  negocioId: string;
  usuarioId: string;
  ultimoIngresoInicial: UltimoIngreso | null;
}

export function IngresoVehiculo({
  parametros,
  negocioId,
  usuarioId,
  ultimoIngresoInicial,
}: IngresoVehiculoProps) {
  const [codigoBarras, setCodigoBarras] = useState("");
  const [tarjetaId, setTarjetaId] = useState("");
  const [parametroSeleccionado, setParametroSeleccionado] = useState<Parametro | null>(
    parametros.find((p) => p.prioridad === 1) || parametros[0] || null
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [ultimoIngreso, setUltimoIngreso] = useState<UltimoIngreso | null>(
    ultimoIngresoInicial
  );
  const [mostrarSelectorTarjetas, setMostrarSelectorTarjetas] = useState(false);
  const { setHeaderInfo } = usePageHeader();
  const { negocio, configImpresion, horariosAtencion } = useImpresionConfig();
  const inputCodigoRef = useRef<HTMLInputElement>(null);

  // Setear información del header al montar el componente
  useEffect(() => {
    setHeaderInfo({
      icon: Car,
      title: "Ingreso de Vehículo",
      subtitle: "Registra nuevos ingresos al parqueadero",
    });
    
    // Enfocar el input al montar el componente
    inputCodigoRef.current?.focus();
    
    // Limpiar al desmontar
    return () => setHeaderInfo(null);
  }, [setHeaderInfo]);

  // Función para reproducir sonido de error
  const reproducirSonidoError = () => {
    try {
      const audio = new Audio("/sounds/error.wav");
      audio.play().catch(err => console.warn("No se pudo reproducir el sonido:", err));
    } catch (error) {
      console.warn("Error al reproducir sonido:", error);
    }
  };

  // Función para imprimir ticket si está habilitado (OPTIMIZADA - usa Context, sin queries)
  const imprimirTicketSiEstaHabilitado = async (ingreso: UltimoIngreso) => {
    try {
      console.log("🖨️ [IMPRESION] Verificando configuración de impresión...");
      
      // 1. Validar que tenemos configuración de impresión (desde Context, no DB)
      if (!configImpresion) {
        console.log("⚠️ [IMPRESION] No hay configuración de impresión");
        return;
      }
      
      console.log("📋 [IMPRESION] Configuración obtenida (desde caché):", {
        habilitada: configImpresion.habilitada,
        imprimir_en_ingreso: configImpresion.imprimir_en_ingreso,
        cola_impresion: configImpresion.cola_impresion,
      });
      
      // 2. Validar que ambos toggles estén activos
      if (!configImpresion.habilitada) {
        console.log("ℹ️ [IMPRESION] Impresión deshabilitada (toggle principal)");
        return;
      }
      
      if (!configImpresion.imprimir_en_ingreso) {
        console.log("ℹ️ [IMPRESION] Impresión en ingreso deshabilitada");
        return;
      }
      
      // 3. Validar que tenemos datos del negocio (desde Context, no DB)
      if (!negocio) {
        console.error("❌ [IMPRESION] No hay datos del negocio en caché");
        return;
      }
      
      console.log("✅ [IMPRESION] Impresión habilitada, usando datos en caché...");
      console.log("✅ [IMPRESION] Datos del negocio:", negocio.nombre);
      
      // 4. Formatear fecha y hora
      const { fecha, hora, dia } = formatearFechaHora(ingreso.horaEntrada);
      
      // 5. Obtener horario del día actual
      let horarioAtencion = "24 Horas";
      
      if (horariosAtencion) {
        // Mapear el día de la semana al nombre en español
        const diasSemana = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
        const diasSemanaCapitalizados = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const diaActual = new Date().getDay(); // 0 = domingo, 1 = lunes, etc.
        const nombreDia = diasSemana[diaActual] as keyof typeof horariosAtencion;
        const nombreDiaCapitalizado = diasSemanaCapitalizados[diaActual];
        
        const horarioDia = horariosAtencion[nombreDia];
        
        if (horarioDia) {
          if (!horarioDia.open) {
            horarioAtencion = `${nombreDiaCapitalizado}: Cerrado`;
          } else if (horarioDia["24h"]) {
            horarioAtencion = `${nombreDiaCapitalizado}: Abierto 24 horas`;
          } else {
            horarioAtencion = `${nombreDiaCapitalizado}: ${horarioDia.from}-${horarioDia.to}`;
          }
        }
      }
      
      console.log("📅 [IMPRESION] Fecha y hora formateadas:", { fecha, hora, dia });
      console.log("🕐 [IMPRESION] Horario del día:", horarioAtencion);
      console.log("🏢 [IMPRESION] Datos del negocio desde caché:", {
        nombre: negocio.nombre,
        direccion: negocio.direccion,
        telefono: negocio.telefono
      });
      
      // 6. Preparar datos del ticket (TODO desde caché, 0 queries)
      const datosTicket: DatosTicketEntrada = {
        nombre_negocio: negocio.nombre,
        direccion: negocio.direccion || "N/A",
        telefono: negocio.telefono || "N/A",
        fecha_ingreso: fecha,
        hora_ingreso: hora,
        numero_tarjeta: ingreso.numeroTarjeta,
        tipo_vehiculo: parametroSeleccionado?.tipo_vehiculo || "N/A",
        horario: horarioAtencion,
        tarifa_vehiculo: `$${parametroSeleccionado?.tarifa_2_valor || 0}`,
      };
      
      console.log("📝 [IMPRESION] Datos del ticket preparados:", datosTicket);
      console.log("📝 [IMPRESION] JSON completo:", JSON.stringify(datosTicket, null, 2));
      
      // 7. Imprimir
      const resultado = await imprimirTicketEntrada(datosTicket, configImpresion);
      
      if (resultado) {
        console.log("✅ [IMPRESION] Ticket impreso correctamente");
      } else {
        console.warn("⚠️ [IMPRESION] No se pudo imprimir el ticket");
      }
    } catch (error) {
      console.error("❌ [IMPRESION] Error al imprimir ticket:", error);
      // No lanzar error para no interrumpir el flujo principal
    }
  };

  const handleRegistrarIngreso = async () => {
    if (!codigoBarras || !parametroSeleccionado) {
      reproducirSonidoError();
      setMessage({
        type: "error",
        text: "Por favor completa todos los campos requeridos",
      });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    setLoading(true);
    setMessage(null); // Limpiar mensaje anterior
    
    try {
      // Si no tenemos tarjetaId, buscarlo por código de barras
      let idTarjeta = tarjetaId;
      if (!idTarjeta) {
        console.log("🔍 [INGRESO] Buscando tarjeta por código de barras:", codigoBarras);
        const responseBuscar = await fetch(
          `/api/tarjetas/buscar-disponible?negocio_id=${negocioId}&codigo_barras=${codigoBarras}`
        );
        const dataBuscar = await responseBuscar.json();
        
        if (!responseBuscar.ok || !dataBuscar.tarjeta) {
          reproducirSonidoError();
          setMessage({
            type: "error",
            text: dataBuscar.error || "Tarjeta no encontrada o no está disponible",
          });
          setTimeout(() => setMessage(null), 5000);
          setLoading(false);
          
          // Enfocar el input después del error
          setTimeout(() => inputCodigoRef.current?.focus(), 100);
          return;
        }
        
        idTarjeta = dataBuscar.tarjeta.id;
        setTarjetaId(idTarjeta);
        console.log("✅ [INGRESO] Tarjeta encontrada:", dataBuscar.tarjeta);
      }
      
      console.log("📤 [INGRESO] Enviando datos:", {
        codigoBarras,
        parametroId: parametroSeleccionado.id,
        tipoVehiculo: parametroSeleccionado.tipo_vehiculo,
        tarjetaId: idTarjeta,
        negocioId,
        usuarioId
      });
      
      const response = await fetch("/api/ingreso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigoBarras,
          parametroId: parametroSeleccionado.id,
          tipoVehiculo: parametroSeleccionado.tipo_vehiculo,
          tarjetaId: idTarjeta,
          negocioId,
          usuarioId,
        }),
      });

      const data = await response.json();
      console.log("📥 [INGRESO] Respuesta status:", response.status);
      console.log("📥 [INGRESO] Respuesta data:", data);

      if (response.ok) {
        // Actualizar último ingreso
        setUltimoIngreso(data.ingreso);
        
        // Limpiar formulario
        setCodigoBarras("");
        setTarjetaId("");
        setParametroSeleccionado(parametros.find((p) => p.prioridad === 1) || parametros[0] || null);
        
        // === IMPRESIÓN AUTOMÁTICA ===
        imprimirTicketSiEstaHabilitado(data.ingreso).catch((error) => {
          console.error("❌ [IMPRESION] Error al imprimir ticket:", error);
          // No interrumpir el flujo, solo loggear el error
        });
        // === FIN IMPRESIÓN ===
        
        // Mostrar mensaje de éxito
        setMessage({
          type: "success",
          text: `✅ Ingreso registrado exitosamente - Tarjeta: ${data.ingreso.numeroTarjeta}`,
        });
        
        console.log("✅ [INGRESO] Ingreso registrado exitosamente");
        
        // Ocultar mensaje después de 5 segundos
        setTimeout(() => setMessage(null), 5000);
        
        // Enfocar el input después de registrar exitosamente
        setTimeout(() => inputCodigoRef.current?.focus(), 100);
      } else {
        console.error("❌ [INGRESO] Error en respuesta:", data);
        reproducirSonidoError();
        setMessage({
          type: "error",
          text: data.error || "Error al registrar el ingreso",
        });
        setTimeout(() => setMessage(null), 5000);
        
        // Enfocar el input después del error
        setTimeout(() => inputCodigoRef.current?.focus(), 100);
      }
    } catch (error) {
      console.error("❌❌❌ [INGRESO] Error de conexión:", error);
      reproducirSonidoError();
      setMessage({
        type: "error",
        text: "Error de conexión. Por favor intenta nuevamente",
      });
      setTimeout(() => setMessage(null), 5000);
      
      // Enfocar el input después del error
      setTimeout(() => inputCodigoRef.current?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarTarjeta = (codigoBarras: string, id: string) => {
    console.log("🎯 [INGRESO] Tarjeta seleccionada:", { codigoBarras, id });
    setCodigoBarras(codigoBarras);
    setTarjetaId(id);
    setMostrarSelectorTarjetas(false);
  };

  return (
    <div className="space-y-6">
      {/* Mensaje de estado */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`flex items-center gap-3 rounded-2xl border p-4 backdrop-blur-xl shadow-lg ${
            message.type === "success"
              ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-200"
              : "border-red-400/40 bg-red-500/20 text-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span className="font-medium">{message.text}</span>
        </motion.div>
      )}

      {/* Fila 1: Código de Tarjeta + Último Ingreso */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Card 1: Campo Código de Tarjeta */}
        <div className="glass-card space-y-4 border border-blue-500/20 bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/80 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-purple-400" />
            <h3 className="font-heading text-lg text-white">Código de Barras</h3>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                ref={inputCodigoRef}
                type="text"
                value={codigoBarras}
                onChange={(e) => setCodigoBarras(e.target.value)}
                onFocus={(e) => e.target.select()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading && codigoBarras && parametroSeleccionado) {
                    e.preventDefault();
                    handleRegistrarIngreso();
                  }
                }}
                placeholder="Escanea o ingresa el código de barras..."
                maxLength={20}
                className="glass-input w-full rounded-xl border border-blue-500/30 bg-[#0f172a]/40 px-4 py-3 pr-12 font-mono text-white placeholder-blue-200/40 transition focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
              />
              <Scan className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-400/60" />
            </div>

            <motion.button
              {...motionButtonProps}
              onClick={() => setMostrarSelectorTarjetas(true)}
              className="flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 px-5 py-3 font-semibold text-cyan-300 backdrop-blur-xl transition hover:from-cyan-500/30 hover:to-blue-600/30 whitespace-nowrap"
            >
              <CreditCard className="h-5 w-5" />
              Seleccionar
            </motion.button>
          </div>

          <p className="text-xs text-blue-200/60">
            💡 Escanea el código de barras, ingrésalo manualmente o selecciona una tarjeta disponible
          </p>
        </div>

        {/* Card 2: Último Ingreso */}
        <IngresoResumen ultimoIngreso={ultimoIngreso} />
      </div>

      {/* Fila 2: Tipo de Vehículo - Ocupa todo el ancho */}
      <TipoVehiculoCards
        parametros={parametros}
        seleccionado={parametroSeleccionado}
        onSeleccionar={setParametroSeleccionado}
      />

      {/* Botón Registrar Ingreso */}
      <motion.button
        {...motionButtonProps}
        onClick={handleRegistrarIngreso}
        disabled={loading || !codigoBarras || !parametroSeleccionado}
        className="glass-button flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 px-6 py-4 font-semibold backdrop-blur-xl transition hover:from-cyan-500/50 hover:to-blue-600/50 hover:shadow-xl hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ color: '#ffffff' }}
      >
        <PlusCircle className="h-5 w-5" />
        {loading ? "Registrando..." : "Registrar Ingreso"}
      </motion.button>

      {/* Modal Selector de Tarjetas */}
      {mostrarSelectorTarjetas && (
        <TarjetaSelector
          negocioId={negocioId}
          onSeleccionar={handleSeleccionarTarjeta}
          onCerrar={() => setMostrarSelectorTarjetas(false)}
        />
      )}
    </div>
  );
}
