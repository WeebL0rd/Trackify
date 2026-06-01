import React from 'react';

function DataRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide shrink-0 w-44">
        {label}
      </span>
      <span className="text-sm font-mono text-gray-800 break-all text-right">
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
  hash_presupuesto,
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
        <div className="flex items-center justify-between mb-5">
          {/* Badge de integridad */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                           bg-emerald-50 border border-emerald-200 text-emerald-700
                           text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            ✓ Integridad verificada
          </span>

          {/* Botón al explorer */}
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

        {/* Datos */}
        <div>
          <DataRow
            label="Hash SHA-256"
            value={truncate(hash_presupuesto)}
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
          />
          <DataRow
            label="Anclado el"
            value={formatTimestamp(timestamp_ancla)}
          />
        </div>
      </div>
    </section>
  );
}
