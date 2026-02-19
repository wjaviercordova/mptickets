import React from "react";

/**
 * Componentes de Loading Reutilizables
 * Para usar en Suspense boundaries
 */

export function CardSkeleton() {
  return (
    <div className="glass-card animate-pulse border border-blue-500/20 bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/80 p-6 backdrop-blur-xl">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 rounded bg-blue-500/20" />
          <div className="h-10 w-10 rounded-xl bg-blue-500/20" />
        </div>
        <div className="h-8 w-32 rounded bg-blue-500/20" />
        <div className="h-3 w-20 rounded bg-blue-500/20" />
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-6 w-48 rounded bg-blue-500/20" />
      
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-32 rounded bg-blue-500/20" />
            <div className="h-12 w-full rounded-2xl bg-blue-500/20" />
          </div>
        ))}
      </div>

      <div className="h-12 w-48 rounded-2xl bg-cyan-500/20" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {/* Header */}
      <div className="grid grid-cols-4 gap-4 rounded-2xl border border-blue-500/20 bg-[#1e293b]/40 p-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 rounded bg-blue-500/20" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-4 gap-4 rounded-2xl border border-blue-500/10 bg-[#0a0e27]/40 p-4"
        >
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="h-4 rounded bg-blue-500/10" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="glass-card animate-pulse border border-blue-500/20 bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/80 p-6 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-blue-500/20" />
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-blue-500/20" />
          <div className="h-6 w-48 rounded bg-blue-500/20" />
        </div>
      </div>
    </div>
  );
}

export function TabsSkeleton() {
  return (
    <div className="flex gap-2 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-12 w-32 rounded-2xl bg-blue-500/20" />
      ))}
    </div>
  );
}

export function GridSkeleton({ cols = 2, items = 6 }: { cols?: number; items?: number }) {
  return (
    <div className={`grid gap-4 animate-pulse ${cols === 2 ? 'md:grid-cols-2' : `md:grid-cols-${cols}`}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-[#1e293b]/60 to-[#0a0e27]/80 p-5"
        >
          <div className="space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-cyan-500/20" />
            <div className="h-5 w-3/4 rounded bg-blue-500/20" />
            <div className="h-4 w-1/2 rounded bg-blue-500/20" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * HOC para envolver páginas con loading automático
 * @example
 * ```tsx
 * export default withLoadingBoundary(MyPage, <FormSkeleton />)
 * ```
 */
export function withLoadingBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback: React.ReactNode
) {
  return function WithLoadingBoundary(props: P) {
    return (
      <React.Suspense fallback={fallback}>
        <Component {...props} />
      </React.Suspense>
    );
  };
}
