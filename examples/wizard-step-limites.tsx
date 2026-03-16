/**
 * EJEMPLO PRÁCTICO: Implementación de Límites en Wizard Step 4
 * =============================================================
 * 
 * Este archivo muestra cómo integrar el sistema de límites
 * en el componente StepParametros del wizard de creación de negocios
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Car, Edit2, Info, Plus, AlertCircle } from 'lucide-react';
import { useLimitesLocal } from '@/hooks/useLimites';
import { AlertaLimite, ModalLimiteAlcanzado } from '@/components/limites/AlertaLimite';

interface ParametroItem {
  tipo_vehiculo: string;
  nombre: string;
  descripcion: string;
  prioridad: number;
  tarifa_1_nombre: string;
  tarifa_1_valor: number;
  // ... resto de campos
}

interface StepParametrosProps {
  data: ParametroItem[];
  onChange: (data: ParametroItem[]) => void;
  planSeleccionado: 'demo' | 'premium'; // Del Step 1
}

/**
 * EJEMPLO COMPLETO CON VALIDACIÓN DE LÍMITES
 */
export default function StepParametrosConLimites({ 
  data, 
  onChange, 
  planSeleccionado 
}: StepParametrosProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  // ============================================================================
  // HOOK DE LÍMITES
  // ============================================================================
  const { validarParametros, planConfig } = useLimitesLocal(planSeleccionado);
  
  // Validar estado actual
  const validacion = validarParametros(data.length);

  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const handleAgregarParametro = () => {
    // VALIDACIÓN: Verificar si puede agregar
    if (!validacion.permitido) {
      setShowModal(true);
      return;
    }

    // Crear nuevo parámetro con valores por defecto
    const nuevoParametro: ParametroItem = {
      tipo_vehiculo: 'CAMIONETA',
      nombre: 'Tarifa para Camionetas',
      descripcion: '',
      prioridad: data.length,
      tarifa_1_nombre: '1-2',
      tarifa_1_valor: 1.5,
      // ... resto de campos con valores por defecto
    };

    onChange([...data, nuevoParametro]);
  };

  const handleEliminarParametro = (index: number) => {
    // VALIDACIÓN: Verificar si puede eliminar (mínimo requerido)
    if (data.length <= (planConfig?.parametros_minimo || 1)) {
      alert(`Debes mantener al menos ${planConfig?.parametros_minimo || 1} tipo(s) de tarifa`);
      return;
    }

    onChange(data.filter((_, i) => i !== index));
  };

  const updateParametro = (index: number, field: string, value: string | number) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* ===== HEADER ===== */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
          <DollarSign className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">Parámetros de Tarifas</h2>
          <p className="text-blue-200/60">
            Plan {planSeleccionado.toUpperCase()}: {data.length} / {planConfig?.parametros_maximo} tipos configurados
          </p>
        </div>

        {/* Badge de estado */}
        <div className={`
          px-4 py-2 rounded-lg border text-sm font-medium
          ${validacion.nivel === 'error' 
            ? 'bg-red-500/20 border-red-400/30 text-red-400'
            : validacion.cerca_limite
            ? 'bg-orange-500/20 border-orange-400/30 text-orange-400'
            : 'bg-green-500/20 border-green-400/30 text-green-400'}
        `}>
          {data.length} / {planConfig?.parametros_maximo}
        </div>
      </div>

      {/* ===== ALERTA DE LÍMITE ===== */}
      {(validacion.cerca_limite || !validacion.permitido) && (
        <AlertaLimite 
          validacion={validacion}
          onActualizarPlan={() => {
            alert('Regresa al Paso 1 para seleccionar el Plan Premium');
          }}
        />
      )}

      {/* ===== INFO BANNER ===== */}
      <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-4">
        <p className="text-sm text-blue-200/80 flex items-start gap-2">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>
            Se configurarán automáticamente los tipos de tarifas seleccionados. 
            En plan <strong>{planSeleccionado.toUpperCase()}</strong> puedes tener hasta{' '}
            <strong>{planConfig?.parametros_maximo}</strong> tipo(s) de vehículos.
          </span>
        </p>
      </div>

      {/* ===== GRID DE TARJETAS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((param, index) => (
          <div 
            key={index} 
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
          >
            {/* Header */}
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
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    {editingIndex === index ? "Cerrar" : "Editar"}
                  </button>

                  {/* Botón eliminar (solo si hay más del mínimo) */}
                  {data.length > (planConfig?.parametros_minimo || 1) && (
                    <button
                      onClick={() => handleEliminarParametro(index)}
                      className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-400 rounded-lg text-sm transition-colors"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Vista colapsada: Resumen de tarifas */}
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

            {/* Formulario expandido (tu código existente) */}
            {editingIndex === index && (
              <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                {/* ... tu código de formulario existente ... */}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ===== BOTÓN AGREGAR ===== */}
      <div className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-white/10 rounded-2xl">
        <button
          onClick={handleAgregarParametro}
          disabled={!validacion.permitido}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm
            transition-all duration-200
            ${validacion.permitido
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/20'
              : 'bg-gray-500/20 border border-gray-500/30 text-gray-500 cursor-not-allowed opacity-50'}
          `}
        >
          <Plus className="w-5 h-5" />
          Agregar Tipo de Tarifa
        </button>

        {/* Mensaje explicativo */}
        {!validacion.permitido ? (
          <div className="flex items-start gap-2 text-sm text-red-400 max-w-md text-center">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{validacion.mensaje}</p>
          </div>
        ) : validacion.cerca_limite ? (
          <p className="text-sm text-orange-400">
            ⚠️ Puedes agregar {validacion.restante} tipo(s) más
          </p>
        ) : (
          <p className="text-sm text-blue-200/60">
            Puedes agregar hasta {validacion.restante} tipo(s) más de tarifas
          </p>
        )}
      </div>

      {/* ===== MODAL DE LÍMITE ALCANZADO ===== */}
      <ModalLimiteAlcanzado
        open={showModal}
        onClose={() => setShowModal(false)}
        tipoRecurso="tarifas"
        planActual={planSeleccionado}
        limiteActual={planConfig?.parametros_maximo || 0}
        onContactar={() => {
          // Redirigir a contacto o cambiar plan
          alert('Funcionalidad de contacto / upgrade de plan');
          // router.push('/contacto?plan=premium');
        }}
      />
    </motion.div>
  );
}

// ============================================================================
// EJEMPLO DE USO EN EL WIZARD PRINCIPAL
// ============================================================================

/*
// En app/admin/negocios/nuevo/page.tsx

export default function NuevoNegocioWizard() {
  const [paso, setPaso] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    plan: 'demo' as 'demo' | 'premium',
    // ... otros campos
    
    // Step 4
    parametros: [
      // MOTO por defecto
      { tipo_vehiculo: 'MOTO', ... },
      // AUTO por defecto
      { tipo_vehiculo: 'AUTO', ... }
    ]
  });

  return (
    <div>
      {paso === 4 && (
        <StepParametrosConLimites
          data={formData.parametros}
          onChange={(parametros) => setFormData({ ...formData, parametros })}
          planSeleccionado={formData.plan}
        />
      )}
    </div>
  );
}
*/
