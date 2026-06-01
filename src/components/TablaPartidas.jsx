import React, { useState } from 'react';

const fmt = n => new Intl.NumberFormat('es-CR').format(n);

const ESTADO_CONFIG = {
  ok: {
    dot:  'bg-green-500',
    text: 'text-green-700',
    bg:   '',
    label: 'ok',
  },
  limite: {
    dot:  'bg-yellow-400',
    text: 'text-yellow-700',
    bg:   '',
    label: 'límite',
  },
  inconsistencia: {
    dot:  'bg-red-500',
    text: 'text-red-700',
    bg:   'bg-red-50',
    label: 'inconsistencia',
  },
};

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.ok;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${cfg.text}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot} flex-shrink-0`} />
      {cfg.label}
    </span>
  );
}

function MontoCell({ value }) {
  if (value == null) return <span className="text-gray-400">—</span>;
  return <span>₡{fmt(value)}</span>;
}

function DiferenciaCell({ value }) {
  if (value == null) return <span className="text-gray-400">—</span>;
  const positive = value > 0;
  return (
    <span className={positive ? 'text-red-600 font-semibold' : 'text-gray-500'}>
      {positive ? '+' : ''}₡{fmt(value)}
    </span>
  );
}

export default function TablaPartidas({ partidas }) {
  const [filtro, setFiltro] = useState('todas');

  const visibles = filtro === 'inconsistencias'
    ? partidas.filter(p => p.estado === 'inconsistencia')
    : partidas;

  const total = partidas.length;
  const totalInconsistencias = partidas.filter(p => p.estado === 'inconsistencia').length;

  return (
    <section>
      {/* Cabecera con filtros */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Partidas presupuestarias
        </h2>
        <div className="flex gap-2">
          {[
            { key: 'todas',           label: `Todas (${total})` },
            { key: 'inconsistencias', label: `Solo inconsistencias (${totalInconsistencias})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFiltro(key)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors
                ${filtro === key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-8">#</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Partida</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">
                  Categoría
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Presupuestado</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Contratado SICOP</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Diferencia</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibles.map((p, i) => {
                const cfg = ESTADO_CONFIG[p.estado] ?? {};
                return (
                  <tr
                    key={p.partida}
                    className={`hover:bg-gray-50 transition-colors ${cfg.bg}`}
                  >
                    <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-xs">
                      <span className="block truncate" title={p.partida}>
                        {p.partida}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      <span className="inline-block px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                        {p.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                      <MontoCell value={p.monto_aprobado} />
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                      <MontoCell value={p.monto_contratado} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <DiferenciaCell value={p.diferencia} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <EstadoBadge estado={p.estado} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
