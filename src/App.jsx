import React from 'react';
import resultado from './data/resultado_demo.json';
import Header           from './components/Header';
import ResumenEjecutivo from './components/ResumenEjecutivo';
import TablaPartidas    from './components/TablaPartidas';
import PanelBlockchain  from './components/PanelBlockchain';

export default function App() {
  const {
    hash_sipp,
    hash_cruce,
    transaction_hash,
    stellar_explorer_url,
    memo,
    timestamp_ancla,
    resumen,
    partidas,
  } = resultado;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        municipalidad={resumen.municipalidad}
        periodo={resumen.periodo}
        stellar_explorer_url={stellar_explorer_url}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <ResumenEjecutivo resumen={resumen} />
        <TablaPartidas partidas={partidas} />
        <PanelBlockchain
          hash_sipp={hash_sipp}
          hash_cruce={hash_cruce}
          transaction_hash={transaction_hash}
          stellar_explorer_url={stellar_explorer_url}
          memo={memo}
          timestamp_ancla={timestamp_ancla}
        />
      </main>
    </div>
  );
}
