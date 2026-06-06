import React from 'react';

const fmt = n => new Intl.NumberFormat('es-CR', { maximumFractionDigits: 0 }).format(n);

const VARIANTS = {
  default: 'text-zinc-100',
  blue:    'text-blue-400',
  emerald: 'text-emerald-400',
  amber:   'text-amber-400',
  red:     'text-red-400',
};

function KpiCard({ label, value, sub, variant = 'default', pulse = false }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 flex flex-col gap-1.5">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold tabular-nums leading-none ${VARIANTS[variant]}`}>
        {value}
        {pulse && (
          <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse align-middle" />
        )}
      </p>
      {sub && <p className="text-xs text-zinc-600">{sub}</p>}
    </div>
  );
}

export default function ResumenEjecutivo({ resumen }) {
  const {
    total_presupuestado,
    total_contratado,
    pct_global,
    inconsistencias,
    en_limite,
  } = resumen;

  const pctVariant = pct_global > 100 ? 'red' : pct_global >= 80 ? 'amber' : 'emerald';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <KpiCard
        label="Presupuesto total"
        value={`₡${fmt(total_presupuestado)}`}
        sub="SIPP · Categoría SERVICIOS"
        variant="default"
      />
      <KpiCard
        label="Total ejecutado"
        value={`₡${fmt(total_contratado)}`}
        sub="Anclado en Soroban"
        variant="blue"
        pulse={total_contratado > 0}
      />
      <KpiCard
        label="% Ejecución"
        value={`${pct_global.toFixed(1)}%`}
        sub="Del presupuesto aprobado"
        variant={pctVariant}
      />
      <KpiCard
        label="En límite"
        value={en_limite}
        sub="Partidas ≥80% consumido"
        variant={en_limite > 0 ? 'amber' : 'default'}
      />
      <KpiCard
        label="Exceden presupuesto"
        value={inconsistencias}
        sub="Partidas >100% ejecutado"
        variant={inconsistencias > 0 ? 'red' : 'default'}
      />
    </div>
  );
}
