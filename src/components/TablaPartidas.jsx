import React, { useState } from 'react';

const fmt = n => new Intl.NumberFormat('es-CR', { maximumFractionDigits: 0 }).format(n);

function ProgressBar({ pct }) {
  const capped = Math.min(pct, 100);
  const color = pct > 100
    ? 'bg-red-500'
    : pct >= 80
    ? 'bg-amber-500'
    : pct > 0
    ? 'bg-blue-500'
    : 'bg-zinc-700';
  return (
    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${capped}%` }}
      />
    </div>
  );
}

function StatusBadge({ estado }) {
  const map = {
    ok:     { label: 'Normal',    cls: 'text-zinc-500 bg-zinc-800 border-zinc-700' },
    limite: { label: 'En límite', cls: 'text-amber-400 bg-amber-950/60 border-amber-900' },
    exceso: { label: 'Exceso',    cls: 'text-red-400 bg-red-950/60 border-red-900' },
  };
  const { label, cls } = map[estado] ?? map.ok;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${cls}`}>
      {label}
    </span>
  );
}

const TABS = [
  { key: 'todas',   label: 'Todas'         },
  { key: 'activas', label: 'Con ejecución' },
  { key: 'exceso',  label: 'Exceso'        },
];

export default function TablaPartidas({ partidas }) {
  const [filtro, setFiltro] = useState('todas');

  const counts = {
    todas:   partidas.length,
    activas: partidas.filter(p => p.monto_contratado > 0).length,
    exceso:  partidas.filter(p => p.estado === 'exceso').length,
  };

  const visibles = filtro === 'activas'
    ? partidas.filter(p => p.monto_contratado > 0)
    : filtro === 'exceso'
    ? partidas.filter(p => p.estado === 'exceso')
    : partidas;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">

      {/* Panel header */}
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Partidas presupuestarias</h2>
          <p className="text-xs text-zinc-600 mt-0.5">Asamblea Legislativa · SIPP 2026</p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-zinc-800 rounded-lg">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFiltro(key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors
                ${filtro === key
                  ? 'bg-zinc-700 text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {label}
              <span className={`ml-1.5 text-[10px] ${filtro === key ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider">
                Partida
              </th>
              <th className="text-right px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider">
                Aprobado
              </th>
              <th className="text-right px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider">
                Ejecutado
              </th>
              <th className="px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider w-44">
                Progreso
              </th>
              <th className="text-center px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {visibles.map(p => (
              <tr
                key={p.partida}
                className="hover:bg-zinc-800/30 transition-colors group"
              >
                {/* Partida + nombre */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-zinc-600 shrink-0 w-[50px]">
                      {p.partida}
                    </span>
                    <span
                      className="text-zinc-200 text-sm font-medium truncate max-w-[180px]"
                      title={p.nombre}
                    >
                      {p.nombre}
                    </span>
                  </div>
                </td>

                {/* Aprobado */}
                <td className="px-5 py-4 text-right tabular-nums text-zinc-500 text-sm">
                  ₡{fmt(p.monto_aprobado)}
                </td>

                {/* Ejecutado */}
                <td className="px-5 py-4 text-right tabular-nums text-sm font-medium">
                  {p.monto_contratado > 0
                    ? <span className="text-zinc-100">₡{fmt(p.monto_contratado)}</span>
                    : <span className="text-zinc-700">—</span>}
                </td>

                {/* Progress */}
                <td className="px-5 py-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[11px] text-zinc-500 tabular-nums">
                        {p.porcentaje_ejecucion}%
                      </span>
                      {p.disponible > 0 && (
                        <span className="text-[11px] text-zinc-700 tabular-nums">
                          ₡{fmt(p.disponible)} disp.
                        </span>
                      )}
                    </div>
                    <ProgressBar pct={p.porcentaje_ejecucion} />
                  </div>
                </td>

                {/* Estado */}
                <td className="px-5 py-4 text-center">
                  <StatusBadge estado={p.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-zinc-800 flex items-center justify-between">
        <span className="text-xs text-zinc-600">
          {visibles.length} partida{visibles.length !== 1 ? 's' : ''}
        </span>
        <span className="text-xs text-zinc-700">Polling cada 5s · Soroban RPC</span>
      </div>
    </div>
  );
}
