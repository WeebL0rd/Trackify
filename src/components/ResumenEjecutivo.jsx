import React from 'react';

const fmt = n => new Intl.NumberFormat('es-CR').format(n);

function Card({ label, value, sub, accent }) {
  const colors = accent === 'red'
    ? { border: 'border-red-200',   label: 'text-red-600',  value: 'text-red-700'  }
    : { border: 'border-blue-200',  label: 'text-blue-600', value: 'text-blue-700' };

  return (
    <div className={`bg-white rounded-xl border ${colors.border} shadow-sm p-5 flex flex-col gap-1`}>
      <span className={`text-xs font-semibold uppercase tracking-wide ${colors.label}`}>
        {label}
      </span>
      <span className={`text-2xl font-bold ${colors.value} leading-tight`}>
        {value}
      </span>
      {sub && <span className="text-xs text-gray-400 mt-0.5">{sub}</span>}
    </div>
  );
}

export default function ResumenEjecutivo({ resumen }) {
  const {
    total_presupuestado,
    total_contratado,
    inconsistencias,
    monto_total_inconsistencias,
    fuente_sipp,
    fuente_sicop,
  } = resumen;

  return (
    <section>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Resumen ejecutivo
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          label="Total presupuestado"
          value={`₡${fmt(total_presupuestado)}`}
          sub={fuente_sipp}
          accent="blue"
        />
        <Card
          label="Total contratado SICOP"
          value={`₡${fmt(total_contratado)}`}
          sub={fuente_sicop}
          accent="blue"
        />
        <Card
          label="Inconsistencias"
          value={`${inconsistencias} partidas`}
          sub="Exceden presupuesto aprobado"
          accent="red"
        />
        <Card
          label="Monto en exceso"
          value={`₡${fmt(monto_total_inconsistencias)}`}
          sub="Suma de diferencias negativas"
          accent="red"
        />
      </div>
    </section>
  );
}
