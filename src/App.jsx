import React, { useState, useEffect, useMemo, useRef } from 'react';
import { leerEstadoContrato } from './soroban';
import Header           from './components/Header';
import ResumenEjecutivo from './components/ResumenEjecutivo';
import TablaPartidas    from './components/TablaPartidas';
import PanelBlockchain  from './components/PanelBlockchain';

const PRESUPUESTO = {
  "1.04.01": { nombre: "Alquileres y Cánones",                aprobado: 48_500_000  },
  "1.04.02": { nombre: "Servicios Básicos",                   aprobado: 112_000_000 },
  "1.04.03": { nombre: "Servicios Comerciales y Financieros", aprobado: 87_300_000  },
  "1.04.04": { nombre: "Servicios de Gestión y Apoyo",        aprobado: 63_200_000  },
  "1.04.05": { nombre: "Gastos de Viaje y Transporte",        aprobado: 34_800_000  },
  "1.04.06": { nombre: "Seguros y Reaseguros",                aprobado: 55_000_000  },
  "1.05.01": { nombre: "Capacitación y Protocolo",            aprobado: 29_400_000  },
  "1.05.02": { nombre: "Mantenimiento y Reparación",          aprobado: 18_900_000  },
};

function semaforo(aprobado, contratado) {
  if (!contratado) return "ok";
  const pct = (contratado / aprobado) * 100;
  if (pct > 100) return "exceso";
  if (pct >= 80)  return "limite";
  return "ok";
}

function buildPartidas(estadoContrato) {
  return Object.entries(PRESUPUESTO).map(([codigo, { nombre, aprobado }]) => {
    const contratado = estadoContrato?.partidas[codigo] ?? 0;
    const pct = aprobado > 0 ? (contratado / aprobado) * 100 : 0;
    return {
      partida: codigo,
      nombre,
      monto_aprobado:    aprobado,
      monto_contratado:  contratado,
      disponible:        aprobado - contratado,
      porcentaje_ejecucion: Math.round(pct * 10) / 10,
      estado: semaforo(aprobado, contratado),
    };
  });
}

function buildResumen(partidas) {
  const total_presupuestado = partidas.reduce((s, p) => s + p.monto_aprobado, 0);
  const total_contratado    = partidas.reduce((s, p) => s + p.monto_contratado, 0);
  const pct_global          = total_presupuestado > 0
    ? (total_contratado / total_presupuestado) * 100 : 0;
  const inconsistencias     = partidas.filter(p => p.estado === "exceso").length;
  const en_limite           = partidas.filter(p => p.estado === "limite").length;
  return { total_presupuestado, total_contratado, pct_global, inconsistencias, en_limite };
}

export default function App() {
  const [estadoContrato, setEstadoContrato] = useState(null);
  const [rpcOnline,      setRpcOnline]      = useState(null);
  const [ultimoPoll,     setUltimoPoll]     = useState(null);
  const [actividad,      setActividad]      = useState([]);
  const [contractId,     setContractId]     = useState(import.meta.env.VITE_CONTRACT_ID ?? "");
  const [resetting,      setResetting]      = useState(false);
  const prevRef = useRef(null);

  // Sincroniza el contractId con la ingesta al arrancar
  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(d => { if (d.contractId) setContractId(d.contractId); })
      .catch(() => {});
  }, []);

  async function handleReset() {
    setResetting(true);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const data = await res.json();
      if (data.ok && data.contractId) {
        setContractId(data.contractId);
        setEstadoContrato(null);
        setActividad([]);
        prevRef.current = null;
      }
    } finally {
      setResetting(false);
    }
  }

  useEffect(() => {
    let cancelado = false;

    async function poll() {
      const estado = await leerEstadoContrato(contractId);
      if (cancelado) return;

      if (estado !== null) {
        if (prevRef.current) {
          const nuevos = [];
          for (const [partida, monto] of Object.entries(estado.partidas)) {
            const prev = prevRef.current.partidas[partida] ?? 0;
            if (monto > prev) {
              nuevos.push({
                id:     `${partida}-${Date.now()}`,
                partida,
                nombre: PRESUPUESTO[partida]?.nombre ?? partida,
                delta:  monto - prev,
                ts:     new Date(),
              });
            }
          }
          if (nuevos.length > 0) setActividad(a => [...nuevos, ...a].slice(0, 40));
        }
        prevRef.current = estado;
        setEstadoContrato(estado);
        setRpcOnline(true);
      } else {
        setRpcOnline(false);
      }
      setUltimoPoll(new Date().toISOString());
    }

    poll();
    const id = setInterval(poll, 5_000);
    return () => { cancelado = true; clearInterval(id); };
  }, [contractId]);

  const partidas = useMemo(() => buildPartidas(estadoContrato), [estadoContrato]);
  const resumen  = useMemo(() => buildResumen(partidas),        [partidas]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header rpcOnline={rpcOnline} ultimoPoll={ultimoPoll} onReset={handleReset} resetting={resetting} />
      <main className="max-w-screen-xl mx-auto px-6 py-6 space-y-5">
        <ResumenEjecutivo resumen={resumen} />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2">
            <TablaPartidas partidas={partidas} />
          </div>
          <div>
            <PanelBlockchain
              contractId={contractId}
              rpcUrl={import.meta.env.VITE_RPC_URL ?? ""}
              rpcOnline={rpcOnline}
              ultimoPoll={ultimoPoll}
              actividad={actividad}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
