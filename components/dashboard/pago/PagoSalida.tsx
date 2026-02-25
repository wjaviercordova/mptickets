"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CreditCard, Scan, CheckCircle2, AlertCircle, Search, DollarSign, FileText } from "lucide-react";
import { Calculator } from "lucide-react";
import type { Parametro } from "@/types/ingreso";
import type { TarjetaPendiente, InformacionVehicular, DatosRecibo } from "@/types/pago";
import { motionButtonProps } from "@/lib/button-styles";
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { TarjetaPendienteSelector } from "./TarjetaPendienteSelector";
import { InformacionVehicularCard } from "./InformacionVehicularCard";
import { TotalAPagarCard } from "./TotalAPagarCard";
import { ReciboModal } from "./ReciboModal";
import { calcularTarifa, formatearTiempoTranscurrido } from "@/lib/calcular-tarifa";

interface PagoSalidaProps {
  parametros: Parametro[];
  negocioId: string;
  usuarioId: string;
}

export function PagoSalida({
  parametros,
  negocioId,
  usuarioId,
}: PagoSalidaProps) {
  const [codigoTarjeta, setCodigoTarjeta] = useState("");
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState<TarjetaPendiente | null>(null);
  const [informacionVehicular, setInformacionVehicular] = useState<InformacionVehicular | null>(null);
  const [totalAPagar, setTotalAPagar] = useState(0);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState("00:00:00");
  const [descuento, setDescuento] = useState(0);
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(false);
  const [consultando, setConsultando] = useState(false);
  const [tarjetaConsultada, setTarjetaConsultada] = useState(false);
  const [pagoProcesado, setPagoProcesado] = useState(false);
  const [datosRecibo, setDatosRecibo] = useState<DatosRecibo | null>(null);
  const [mostrarRecibo, setMostrarRecibo] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [mostrarSelectorTarjetas, setMostrarSelectorTarjetas] = useState(false);
  const { setHeaderInfo } = usePageHeader();
  const inputCodigoRef = useRef<HTMLInputElement>(null);

  // Setear información del header al montar el componente
  useEffect(() => {
    setHeaderInfo({
      icon: Calculator,
      title: "Pago y Salida",
      subtitle: "Procesa pagos y registra salidas de vehículos",
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

  const handleConsultarTarjeta = async () => {
    if (!codigoTarjeta) {
      reproducirSonidoError();
      setMessage({
        type: "error",
        text: "Por favor ingresa el código de barras de la tarjeta",
      });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    setConsultando(true);
    setMessage(null);

    try {
      // Si ya tenemos una tarjeta consultada con el mismo código, solo recalcular
      if (tarjetaSeleccionada && 
          (tarjetaSeleccionada.codigo_barras === codigoTarjeta || 
           tarjetaSeleccionada.codigo === codigoTarjeta)) {
        console.log("📊 [PAGO] Recalculando tarjeta ya consultada con nueva hora de salida");
        procesarTarjetaConsultada(tarjetaSeleccionada);
        setMessage({
          type: "success",
          text: `✅ Monto actualizado - Tarjeta ${tarjetaSeleccionada.codigo} (${tarjetaSeleccionada.codigo_barras})`,
        });
        setTimeout(() => setMessage(null), 5000);
        return; // No hacer fetch al API
      }

      // Si es una tarjeta nueva, hacer fetch al API
      const response = await fetch(
        `/api/tarjetas/buscar-pendiente?negocio_id=${negocioId}&codigo_barras=${codigoTarjeta}`
      );
      const data = await response.json();

      if (response.ok && data.tarjeta) {
        procesarTarjetaConsultada(data.tarjeta);
        setTarjetaConsultada(true);
        setMessage({
          type: "success",
          text: `✅ Tarjeta ${data.tarjeta.codigo} (${data.tarjeta.codigo_barras}) consultada correctamente`,
        });
        setTimeout(() => setMessage(null), 5000);
        
        // Enfocar el input después de consultar
        setTimeout(() => inputCodigoRef.current?.focus(), 100);
      } else {
        reproducirSonidoError();
        setMessage({
          type: "error",
          text: data.error || "Tarjeta no encontrada o ya fue pagada",
        });
        setTimeout(() => setMessage(null), 5000);
        
        // Enfocar el input después del error
        setTimeout(() => inputCodigoRef.current?.focus(), 100);
      }
    } catch (error) {
      console.error("Error al consultar tarjeta:", error);
      reproducirSonidoError();
      setMessage({
        type: "error",
        text: "Error de conexión. Por favor intenta nuevamente",
      });
      setTimeout(() => setMessage(null), 5000);
      
      // Enfocar el input después del error
      setTimeout(() => inputCodigoRef.current?.focus(), 100);
    } finally {
      setConsultando(false);
    }
  };

  const procesarTarjetaConsultada = (tarjeta: TarjetaPendiente) => {
    console.log("🔄 [PAGO] Procesando tarjeta:", tarjeta.codigo, "con hora de salida actual");
    setTarjetaSeleccionada(tarjeta);
    // Usar codigo_barras como identificador principal en el input
    setCodigoTarjeta(tarjeta.codigo_barras || tarjeta.codigo);

    // Buscar el parámetro correspondiente al tipo de vehículo
    const parametroVehiculo = parametros.find(
      (p) => p.tipo_vehiculo === tarjeta.tipo_vehiculo && p.estado === "activo"
    );

    if (!parametroVehiculo) {
      reproducirSonidoError();
      setMessage({
        type: "error",
        text: `No se encontró configuración de tarifas para ${tarjeta.tipo_vehiculo}`,
      });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    // Calcular el total a pagar CON LA HORA ACTUAL (hora de salida del momento)
    const horaSalida = new Date().toISOString();
    console.log("⏰ [PAGO] Hora entrada:", tarjeta.hora_entrada);
    console.log("⏰ [PAGO] Hora salida (AHORA):", horaSalida);
    
    const calculo = calcularTarifa(
      tarjeta.hora_entrada,
      horaSalida,
      parametroVehiculo
    );

    console.log("💰 [PAGO] Total calculado:", calculo.totalAPagar);
    console.log("⏱️ [PAGO] Tiempo transcurrido:", calculo.tiempoTotal);

    setTotalAPagar(calculo.totalAPagar);
    setTiempoTranscurrido(formatearTiempoTranscurrido(calculo.tiempoTotal));

    // Preparar información vehicular
    const fechaEntrada = new Date(tarjeta.hora_entrada);
    setInformacionVehicular({
      tipoVehiculo: tarjeta.tipo_vehiculo,
      placa: tarjeta.placa || "N/A",
      color: tarjeta.color || "",
      marca: tarjeta.marca || "",
      modelo: tarjeta.modelo || "",
      horaEntrada: new Intl.DateTimeFormat("es-EC", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(fechaEntrada),
      fechaEntrada: new Intl.DateTimeFormat("es-EC", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(fechaEntrada),
    });
  };

  const handleSeleccionarTarjeta = (tarjeta: TarjetaPendiente) => {
    procesarTarjetaConsultada(tarjeta);
    setTarjetaConsultada(true);
    setMostrarSelectorTarjetas(false);
  };

  const handleProcesarPago = async () => {
    if (!tarjetaSeleccionada || !tarjetaConsultada) {
      reproducirSonidoError();
      setMessage({
        type: "error",
        text: "Por favor consulta una tarjeta primero",
      });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    if (totalAPagar === 0) {
      reproducirSonidoError();
      setMessage({
        type: "error",
        text: "El total a pagar no puede ser $0.00",
      });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    setLoading(true);
    setMessage(null);
    
    try {
      // Calcular total final con descuento
      const totalFinal = Math.max(0, totalAPagar - descuento);

      const payloadData = {
        ingresoId: tarjetaSeleccionada.ingreso_id,
        tarjetaId: tarjetaSeleccionada.id,
        codigoTarjeta: tarjetaSeleccionada.codigo_barras || tarjetaSeleccionada.codigo,
        totalAPagar: totalFinal,
        descuento,
        metodoPago,
        observaciones,
        negocioId,
        usuarioId,
      };
      
      console.log("📤 [PAGO SALIDA] Enviando datos al API:", payloadData);

      const response = await fetch("/api/pago/procesar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadData),
      });
      
      console.log("📥 [PAGO SALIDA] Respuesta status:", response.status);

      const data = await response.json();
      console.log("📥 [PAGO SALIDA] Respuesta data:", data);

      if (response.ok) {
        setPagoProcesado(true);
        
        // Preparar datos del recibo
        const fechaActual = new Date();
        setDatosRecibo({
          fecha: new Intl.DateTimeFormat("es-EC", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }).format(fechaActual),
          horaEntrada: informacionVehicular?.horaEntrada || "",
          horaSalida: new Intl.DateTimeFormat("es-EC", {
            hour: "2-digit",
            minute: "2-digit",
          }).format(fechaActual),
          numeroTarjeta: tarjetaSeleccionada.codigo,
          tiempoTotal: tiempoTranscurrido,
          costoTotal: totalFinal,
          metodoPago,
          descuento,
        });
        
        // Mostrar mensaje de éxito
        setMessage({
          type: "success",
          text: `✅ Pago procesado exitosamente - Tarjeta ${tarjetaSeleccionada.codigo} - Total: $${totalFinal.toFixed(2)}`,
        });
        
        // Auto-limpiar después de 3 segundos
        setTimeout(() => {
          handleLimpiarFormulario();
          inputCodigoRef.current?.focus();
        }, 3000);
      } else {
        reproducirSonidoError();
        setMessage({
          type: "error",
          text: data.error || "Error al procesar el pago. Verifica que la tarjeta no haya sido procesada anteriormente.",
        });
        
        // Limpiar mensaje de error después de 8 segundos
        setTimeout(() => setMessage(null), 8000);
        
        // Enfocar el input después del error
        setTimeout(() => inputCodigoRef.current?.focus(), 100);
      }
    } catch (error) {
      console.error("Error al procesar pago:", error);
      reproducirSonidoError();
      setMessage({
        type: "error",
        text: "❌ Error de conexión con el servidor. Por favor verifica tu conexión e intenta nuevamente.",
      });
      setTimeout(() => setMessage(null), 8000);
      
      // Enfocar el input después del error
      setTimeout(() => inputCodigoRef.current?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = () => {
    if (!datosRecibo) {
      reproducirSonidoError();
      setMessage({
        type: "error",
        text: "No hay datos de pago para mostrar",
      });
      setTimeout(() => setMessage(null), 5000);
      return;
    }
    setMostrarRecibo(true);
  };

  const handleLimpiarFormulario = () => {
    setCodigoTarjeta("");
    setTarjetaSeleccionada(null);
    setInformacionVehicular(null);
    setTotalAPagar(0);
    setTiempoTranscurrido("00:00:00");
    setDescuento(0);
    setMetodoPago("EFECTIVO");
    setObservaciones("");
    setTarjetaConsultada(false);
    setPagoProcesado(false);
    setDatosRecibo(null);
    setMessage(null);
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

      {/* Fila 1: Código de Tarjeta + Total a Pagar */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Card 1: Campo Código de Tarjeta */}
        <div className="glass-card space-y-4 border border-amber-500/20 bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/80 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-amber-400" />
            <h3 className="font-heading text-lg text-white">Código de Barras</h3>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                ref={inputCodigoRef}
                type="text"
                value={codigoTarjeta}
                onChange={(e) => setCodigoTarjeta(e.target.value)}
                onFocus={(e) => e.target.select()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !consultando && !pagoProcesado && codigoTarjeta) {
                    e.preventDefault();
                    handleConsultarTarjeta();
                  }
                }}
                placeholder="Escanea o ingresa el código de barras..."
                maxLength={20}
                disabled={pagoProcesado}
                className="glass-input w-full rounded-xl border border-amber-500/30 bg-[#0f172a]/40 px-4 py-3 pr-12 font-mono text-white placeholder-amber-200/40 transition focus:border-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20 disabled:opacity-50"
                autoFocus
              />
              <Scan className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-amber-400/60" />
            </div>

            <motion.button
              {...motionButtonProps}
              onClick={() => setMostrarSelectorTarjetas(true)}
              disabled={pagoProcesado}
              className="flex items-center gap-2 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500/20 to-orange-600/20 px-5 py-3 font-semibold text-amber-300 backdrop-blur-xl transition hover:from-amber-500/30 hover:to-orange-600/30 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard className="h-5 w-5" />
              Seleccionar
            </motion.button>
          </div>

          <p className="text-xs text-amber-200/60">
            💡 Escanea el código de barras de la tarjeta, ingrésalo manualmente o selecciona de la lista
          </p>
        </div>

        {/* Card 2: Total a Pagar */}
        <TotalAPagarCard total={totalAPagar - descuento} tiempoTranscurrido={tiempoTranscurrido} />
      </div>

      {/* Fila 2: Información Vehicular */}
      <InformacionVehicularCard informacion={informacionVehicular} />

      {/* Fila 3: Campos Adicionales (Descuento, Método Pago, Observaciones) */}
      {tarjetaConsultada && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card grid gap-4 border border-blue-500/20 bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/80 p-6 shadow-xl backdrop-blur-xl sm:grid-cols-3"
        >
          {/* Descuento */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-200">Descuento ($)</label>
            <input
              type="number"
              value={descuento}
              onChange={(e) => setDescuento(Math.max(0, parseFloat(e.target.value) || 0))}
              min="0"
              step="0.01"
              disabled={pagoProcesado}
              className="glass-input w-full rounded-xl border border-blue-500/30 bg-[#0f172a]/40 px-4 py-3 font-mono text-white placeholder-blue-200/40 transition focus:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/20 disabled:opacity-50"
              placeholder="0.00"
            />
          </div>

          {/* Método de Pago */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-200">Método de Pago</label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              disabled={pagoProcesado}
              className="glass-input w-full rounded-xl border border-blue-500/30 bg-[#0f172a]/40 px-4 py-3 text-white transition focus:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/20 disabled:opacity-50"
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </div>

          {/* Observaciones */}
          <div className="space-y-2 sm:col-span-3">
            <label className="text-sm font-medium text-blue-200">Observaciones</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              disabled={pagoProcesado}
              rows={2}
              className="glass-input w-full rounded-xl border border-blue-500/30 bg-[#0f172a]/40 px-4 py-3 text-white placeholder-blue-200/40 transition focus:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/20 disabled:opacity-50"
              placeholder="Notas adicionales (opcional)..."
            />
          </div>
        </motion.div>
      )}

      {/* Botones de Acción */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Botón Consultar */}
        <motion.button
          {...motionButtonProps}
          onClick={handleConsultarTarjeta}
          disabled={consultando || pagoProcesado || !codigoTarjeta}
          className="glass-button flex items-center justify-center gap-2 rounded-2xl border border-blue-400/40 bg-gradient-to-r from-blue-500/30 to-cyan-600/30 px-6 py-4 font-semibold backdrop-blur-xl transition hover:from-blue-500/50 hover:to-cyan-600/50 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ color: '#ffffff' }}
        >
          <Search className="h-5 w-5" />
          {consultando ? "Consultando..." : "Consultar"}
        </motion.button>

        {/* Botón Pagar */}
        <motion.button
          {...motionButtonProps}
          onClick={handleProcesarPago}
          disabled={loading || !tarjetaConsultada || pagoProcesado || totalAPagar === 0}
          className="glass-button flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/30 to-green-600/30 px-6 py-4 font-semibold backdrop-blur-xl transition hover:from-emerald-500/50 hover:to-green-600/50 hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ color: '#ffffff' }}
        >
          <DollarSign className="h-5 w-5" />
          {loading ? "Procesando..." : "Pagar"}
        </motion.button>

        {/* Botón Ver Detalle */}
        <motion.button
          {...motionButtonProps}
          onClick={handleVerDetalle}
          disabled={!pagoProcesado}
          className="glass-button flex items-center justify-center gap-2 rounded-2xl border border-violet-400/40 bg-gradient-to-r from-violet-500/30 to-purple-600/30 px-6 py-4 font-semibold backdrop-blur-xl transition hover:from-violet-500/50 hover:to-purple-600/50 hover:shadow-xl hover:shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ color: '#ffffff' }}
        >
          <FileText className="h-5 w-5" />
          Ver Detalle
        </motion.button>
      </div>

      {/* Botón Nuevo Pago (solo visible después de procesar) */}
      {pagoProcesado && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          {...motionButtonProps}
          onClick={handleLimpiarFormulario}
          className="glass-button flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 px-6 py-4 font-semibold backdrop-blur-xl transition hover:from-cyan-500/50 hover:to-blue-600/50 hover:shadow-xl hover:shadow-cyan-500/30"
          style={{ color: '#ffffff' }}
        >
          <CreditCard className="h-5 w-5" />
          Nuevo Pago
        </motion.button>
      )}

      {/* Modal Selector de Tarjetas Pendientes */}
      {mostrarSelectorTarjetas && (
        <TarjetaPendienteSelector
          negocioId={negocioId}
          onSeleccionar={handleSeleccionarTarjeta}
          onCerrar={() => setMostrarSelectorTarjetas(false)}
        />
      )}

      {/* Modal de Recibo */}
      {mostrarRecibo && datosRecibo && (
        <ReciboModal
          datos={datosRecibo}
          onCerrar={() => setMostrarRecibo(false)}
        />
      )}
    </div>
  );
}
