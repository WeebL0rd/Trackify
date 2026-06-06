import React from 'react';

function formatTime(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString('es-CR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZone: 'America/Costa_Rica',
  });
}

export default function Header({ rpcOnline, ultimoPoll, onReset, resetting }) {
  const contractId = import.meta.env.VITE_CONTRACT_ID;
  const explorerUrl = contractId
    ? `https://stellar.expert/explorer/testnet/contract/${contractId}`
    : 'https://stellar.expert/explorer/testnet';

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo + identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-xs tracking-tight">T</span>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="font-semibold text-zinc-100 text-sm">Trackify</span>
            <span className="text-zinc-600 text-xs hidden sm:inline">·</span>
            <span className="text-zinc-500 text-xs hidden sm:inline">
              Asamblea Legislativa
            </span>
            <span className="text-zinc-700 text-xs hidden md:inline">·</span>
            <span className="text-zinc-600 text-xs hidden md:inline">
              SERVICIOS 2026
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {ultimoPoll && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-600">
              <span>Sincronizado</span>
              <span className="font-mono text-zinc-500 tabular-nums">{formatTime(ultimoPoll)}</span>
            </div>
          )}

          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors
            ${rpcOnline === null
              ? 'bg-zinc-800/60 border-zinc-700 text-zinc-500'
              : rpcOnline
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
              : 'bg-red-950/60 border-red-800 text-red-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full inline-block shrink-0
              ${rpcOnline === null ? 'bg-zinc-500 animate-pulse'
                : rpcOnline ? 'bg-emerald-500'
                : 'bg-red-500'}`} />
            <span>
              {rpcOnline === null ? 'Conectando' : rpcOnline ? 'Testnet en vivo' : 'Sin conexión'}
            </span>
          </div>

          <button
            onClick={onReset}
            disabled={resetting}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                        border text-xs font-medium transition-colors
                        ${resetting
                          ? 'border-zinc-700 text-zinc-600 cursor-not-allowed'
                          : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'}`}
          >
            {resetting ? (
              <>
                <span className="w-3 h-3 rounded-full border-2 border-zinc-600 border-t-zinc-400 animate-spin inline-block" />
                Reiniciando...
              </>
            ) : (
              <>↺ Reiniciar</>
            )}
          </button>

          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-xs text-zinc-500
                       hover:text-zinc-300 transition-colors"
          >
            Explorer ↗
          </a>
        </div>
      </div>
    </header>
  );
}
