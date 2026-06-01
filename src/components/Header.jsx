import React from 'react';

export default function Header({ municipalidad, periodo, stellar_explorer_url }) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">

        {/* Logo + títulos */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow">
            <span className="text-white font-bold text-base leading-none">T</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">Trackify</h1>
            <p className="text-xs text-gray-500 leading-tight">
              {municipalidad} · Presupuesto {periodo}
            </p>
          </div>
        </div>

        {/* Badge blockchain */}
        <a
          href={stellar_explorer_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                     bg-emerald-50 border border-emerald-200 text-emerald-700
                     text-xs font-semibold hover:bg-emerald-100 transition-colors"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          Presupuesto anclado en Stellar ✓
        </a>
      </div>
    </header>
  );
}
