import React from 'react';

function DataRow({ label, value, mono = true, highlight }) {
  return (
    <div className={`flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-0
      ${highlight ? 'bg-blue-50 -mx-6 px-6 rounded' : ''}`}>
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide shrink-0 w-48">
        {label}
      </span>
      <span className={`text-sm break-all text-right ${mono ? 'font-mono text-gray-800' : 'text-gray-700'}`}>
        {value}
      </span>
    </div>
  );
}

function truncate(str, n = 16) {
  return str ? str.slice(0, n) + '...' : '—';
}

function formatTimestamp(iso) {
  return new Date(iso).toLocaleString('es-CR', {
    dateStyle: 'long',
    timeStyle: 'medium',
    timeZone: 'America/Costa_Rica',
  });
}

export default function PanelBlockchain({
  hash_sipp,
  hash_cruce,
  transaction_hash,
  stellar_explorer_url,
  memo,
  timestamp_ancla,
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Registro blockchain
      </h2>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">

        {/* Cabecera */}
        <div className="flex items-center justify-between mb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                           bg-emerald-50 border border-emerald-200 text-emerald-700
                           text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            ✓ Integridad verificada
          </span>

          <a
            href={stellar_explorer_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg
                       bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold
                       transition-colors shadow-sm"
          >
            Verificar en Stellar Expert →
          </a>
        </div>

        {/* Qué se ancló */}
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Lo anclado en Stellar es el{' '}
          <span className="font-semibold text-gray-700">hash del análisis completo</span>
          {' '}— partidas clasificadas, montos en exceso e inconsistencias detectadas.
          Cualquier modificación posterior al análisis produce un hash diferente.
        </p>

        <div>
          <DataRow
            label="Hash del análisis (anclado)"
            value={truncate(hash_cruce)}
            highlight
          />
          <DataRow
            label="Hash del SIPP (origen)"
            value={truncate(hash_sipp)}
          />
          <DataRow
            label="Transaction hash"
            value={truncate(transaction_hash)}
          />
          <DataRow
            label="Memo Stellar"
            value={memo}
          />
          <DataRow
            label="Red"
            value="Stellar Testnet"
            mono={false}
          />
          <DataRow
            label="Anclado el"
            value={formatTimestamp(timestamp_ancla)}
            mono={false}
          />
        </div>
      </div>
    </section>
  );
}
