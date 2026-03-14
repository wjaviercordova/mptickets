import { Search } from "lucide-react";

export default function ConsultasPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card border-purple-400/20 p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-purple-400/30 bg-gradient-to-br from-emerald-500/20 to-green-600/10">
            <Search className="h-7 w-7 text-emerald-300" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Consultas</h1>
            <p className="mt-2 font-body text-blue-200/60">
              Buscar y consultar información de negocios en el sistema
            </p>
          </div>
        </div>
      </div>

      {/* Formulario de búsqueda */}
      <div className="glass-card border-purple-400/20 p-6">
        <h2 className="mb-6 font-display text-xl font-semibold text-white">
          Buscar Negocios
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-2 block font-body text-sm text-blue-200/80">
              Nombre del Negocio
            </label>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              className="glass-input w-full border-purple-500/20 bg-[#0f172a]/60"
            />
          </div>

          <div>
            <label className="mb-2 block font-body text-sm text-blue-200/80">
              Ciudad
            </label>
            <input
              type="text"
              placeholder="Buscar por ciudad..."
              className="glass-input w-full border-purple-500/20 bg-[#0f172a]/60"
            />
          </div>

          <div>
            <label className="mb-2 block font-body text-sm text-blue-200/80">
              Estado
            </label>
            <select className="glass-input w-full border-purple-500/20 bg-[#0f172a]/60">
              <option value="">Todos</option>
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button className="glass-button border-purple-400/30 bg-gradient-to-r from-purple-500/20 to-pink-600/10 px-6 py-2">
            Buscar
          </button>
          <button className="glass-button border-purple-400/20 bg-purple-500/5 px-6 py-2 text-blue-200/70 hover:text-white">
            Limpiar
          </button>
        </div>
      </div>

      {/* Resultados */}
      <div className="glass-card border-purple-400/20 p-6">
        <h2 className="mb-6 font-display text-xl font-semibold text-white">
          Resultados
        </h2>

        <div className="rounded-xl border border-purple-400/20 bg-purple-500/5 p-12 text-center">
          <Search className="mx-auto h-12 w-12 text-purple-300/40" />
          <p className="mt-4 font-body text-sm text-blue-200/60">
            Utiliza el formulario de búsqueda para encontrar negocios
          </p>
        </div>
      </div>
    </div>
  );
}
