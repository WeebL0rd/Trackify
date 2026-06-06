import React from 'react';

const fmt = n => new Intl.NumberFormat('es-CR', { maximumFractionDigits: 0 }).format(n);

function timeAgo(date) {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60)   return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m`;
  return `${Math.floor(secs / 3600)}h`;
}

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('es-CR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZone: 'America/Costa_Rica',
  });
}

function ActivityItem({ item, isNew }) {
  return (
    <div className={`flex items-start gap-3 py-3 border-b border-zinc-800/50 last:border-0
      ${isNew ? 'bg-blue-950/20' : ''}`}>
      <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center
                      justify-center shrink-0 mt-0.5">
        <span className="font-mono text-[10px] text-zinc-400 font-bold leading-none">
          {item.partida.slice(2, 7)}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-zinc-300 truncate leading-tight">{item.nombre}</p>
        <p className="text-[10px] text-zinc-600 font-mono mt-0.5">{item.partida}</p>
        <p className="text-xs font-semibold text-emerald-400 tabular-nums mt-1">
          +₡{fmt(item.delta)}
        </p>
      </div>
      <span className="text-[10px] text-zinc-700 shrink-0 tabular-nums pt-0.5">
        {timeAgo(item.ts)}
      </span>
    </div>
  );
}

export default function PanelBlockchain({
  contractId, rpcUrl, rpcOnline, ultimoPoll, actividad,
}) {
  const explorerUrl = contractId
    ? `https://stellar.expert/explorer/testnet/contract/${contractId}`
    : 'https://stellar.expert/explorer/testnet';

  const shortId = contractId
    ? `${contractId.slice(0, 8)}…${contractId.slice(-6)}`
    : '—';

  return (
    <div className="space-y-4">

      {/* Activity feed */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3.5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Actividad en cadena</h3>
            <p className="text-[11px] text-zinc-600 mt-0.5">Soroban · Stellar Testnet</p>
          </div>
          <div className="flex items-center gap-2">
            {actividad.length > 0 && (
              <span className="text-[10px] font-mono text-zinc-600">{actividad.length}</span>
            )}
            <span className={`w-2 h-2 rounded-full ${
              actividad.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-700'
            }`} />
          </div>
        </div>

        <div className="px-4 overflow-y-auto" style={{ maxHeight: '300px' }}>
          {actividad.length === 0 ? (
            <div className="py-10 text-center space-y-1">
              <p className="text-xs text-zinc-600">Sin actividad registrada.</p>
              <p className="text-[11px] text-zinc-700">
                Los registros aparecen aquí en tiempo real.
              </p>
            </div>
          ) : (
            actividad.map((item, i) => (
              <ActivityItem key={item.id} item={item} isNew={i === 0} />
            ))
          )}
        </div>
      </div>

      {/* System status */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-100">Estado del sistema</h3>

        {/* RPC status */}
        <div className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs font-medium
          ${rpcOnline === null
            ? 'bg-zinc-800/60 border-zinc-700 text-zinc-400'
            : rpcOnline
            ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-400'
            : 'bg-red-950/40 border-red-900/60 text-red-400'}`}>
          <span className={`w-2 h-2 rounded-full shrink-0
            ${rpcOnline === null ? 'bg-zinc-500 animate-pulse'
              : rpcOnline ? 'bg-emerald-500'
              : 'bg-red-500'}`} />
          {rpcOnline === null ? 'Conectando al RPC...'
            : rpcOnline ? 'RPC sincronizado'
            : 'Sin conexión RPC'}
        </div>

        {/* Details */}
        <div className="space-y-2.5">
          {[
            { label: 'Contrato',     value: shortId,               mono: true  },
            { label: 'Red',          value: 'Stellar Testnet',      mono: false },
            { label: 'Última sync',  value: formatTime(ultimoPoll), mono: true  },
            { label: 'Intervalo',    value: '5 segundos',           mono: false },
          ].map(({ label, value, mono }) => (
            <div key={label} className="flex items-center justify-between gap-2">
              <span className="text-xs text-zinc-600 shrink-0">{label}</span>
              <span className={`text-xs truncate text-right ${mono ? 'font-mono text-zinc-400' : 'text-zinc-400'}`}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Explorer link */}
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg
                     border border-zinc-700 text-zinc-500 hover:text-zinc-200
                     hover:border-zinc-600 text-xs font-medium transition-colors"
        >
          Ver contrato en Stellar Expert ↗
        </a>
      </div>

    </div>
  );
}
