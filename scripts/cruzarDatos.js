// Cruza los datos de SIPP (presupuesto aprobado) contra SICOP (contrataciones ejecutadas).
// Clasifica cada partida como "ok", "limite" o "inconsistencia" según el porcentaje de ejecución.
// Exporta el resultado a src/data/resultado_demo.json.

const fs = require('fs');
const path = require('path');

const RUTA_SIPP  = path.join(__dirname, '..', 'data', 'sipp_2025.json');
const RUTA_SICOP = path.join(__dirname, '..', 'data', 'sicop_simulado_2025.json');
const RUTA_SALIDA = path.join(__dirname, '..', 'src', 'data', 'resultado_demo.json');

/**
 * Determina el estado de una partida según el porcentaje de ejecución:
 *   "ok"             → contratado <= 90% del aprobado
 *   "limite"         → entre 90% y 100% (inclusive)
 *   "inconsistencia" → contratado > aprobado
 */
function calcularEstado(monto_contratado, monto_aprobado) {
  const ratio = monto_contratado / monto_aprobado;
  if (monto_contratado > monto_aprobado) return 'inconsistencia';
  if (ratio >= 0.90) return 'limite';
  return 'ok';
}

/**
 * Lee SIPP y SICOP, cruza las partidas de Servicios y Materiales,
 * y devuelve el resultado clasificado junto con el resumen ejecutivo.
 *
 * @returns {{ partidas: Array, resumen: Object }}
 */
function cruzarDatos() {
  console.log('[cruzarDatos] Leyendo SIPP:', RUTA_SIPP);
  const sipp  = JSON.parse(fs.readFileSync(RUTA_SIPP,  'utf-8'));

  console.log('[cruzarDatos] Leyendo SICOP:', RUTA_SICOP);
  const sicop = JSON.parse(fs.readFileSync(RUTA_SICOP, 'utf-8'));

  // Índice de contrataciones SICOP por nombre de partida para búsqueda O(1)
  const indiceSicop = {};
  sicop.contrataciones.forEach(c => {
    indiceSicop[c.partida] = c.monto_contratado;
  });
  console.log('[cruzarDatos] Partidas SICOP indexadas:', Object.keys(indiceSicop).length);

  const partidas = [];
  let total_contratado = 0;
  let inconsistencias = 0;
  let monto_total_inconsistencias = 0;

  // Iterar solo las categorías que tienen datos SICOP (Servicios y Materiales)
  sipp.categorias
    .filter(cat => cat.nombre !== 'REMUNERACIONES')
    .forEach(cat => {
      cat.partidas.forEach(p => {
        const monto_aprobado   = p.monto_aprobado;
        const monto_contratado = indiceSicop[p.nombre] ?? null;

        if (monto_contratado === null) {
          console.log('[cruzarDatos] AVISO: sin datos SICOP para partida:', p.nombre);
          return;
        }

        const diferencia          = monto_contratado - monto_aprobado;
        const porcentaje_ejecucion = (monto_contratado / monto_aprobado * 100).toFixed(1);
        const estado              = calcularEstado(monto_contratado, monto_aprobado);

        if (estado === 'inconsistencia') {
          inconsistencias++;
          monto_total_inconsistencias += diferencia;
          console.log('[cruzarDatos] Inconsistencia detectada:', p.nombre,
            '| exceso:', diferencia.toLocaleString('es-CR'));
        }

        total_contratado += monto_contratado;

        partidas.push({
          categoria:            cat.nombre,
          partida:              p.nombre,
          monto_aprobado,
          monto_contratado,
          diferencia,
          porcentaje_ejecucion: Number(porcentaje_ejecucion),
          estado,
        });
      });
    });

  const resumen = {
    municipalidad:               sipp.municipalidad,
    periodo:                     sipp.periodo,
    fuente_sipp:                 sipp.fuente,
    fuente_sicop:                sicop.fuente,
    fecha_extraccion_sicop:      sicop.fecha_extraccion,
    total_presupuestado:         sipp.total_presupuestado,
    total_contratado,
    inconsistencias,
    monto_total_inconsistencias,
  };

  const resultado = { resumen, partidas };

  // Persistir resultado para que el dashboard React lo consuma
  fs.writeFileSync(RUTA_SALIDA, JSON.stringify(resultado, null, 2), 'utf-8');
  console.log('[cruzarDatos] Resultado guardado en:', RUTA_SALIDA);

  return resultado;
}

module.exports = { cruzarDatos };

// ---------------------------------------------------------------------------
if (require.main === module) {
  console.log('=== CRUCE SIPP vs SICOP 2025 ===\n');

  const { resumen, partidas } = cruzarDatos();

  const fmt = n => new Intl.NumberFormat('es-CR').format(n);

  console.log('\n--- RESUMEN EJECUTIVO ---');
  console.log('Municipalidad      :', resumen.municipalidad);
  console.log('Período            :', resumen.periodo);
  console.log('Total presupuestado: ₡' + fmt(resumen.total_presupuestado));
  console.log('Total contratado   : ₡' + fmt(resumen.total_contratado));
  console.log('Inconsistencias    :', resumen.inconsistencias);
  console.log('Monto en exceso    : ₡' + fmt(resumen.monto_total_inconsistencias));

  console.log('\n--- INCONSISTENCIAS DETECTADAS ---');
  partidas
    .filter(p => p.estado === 'inconsistencia')
    .forEach(p => {
      console.log('\n  Partida  :', p.partida);
      console.log('  Aprobado : ₡' + fmt(p.monto_aprobado));
      console.log('  Contratado: ₡' + fmt(p.monto_contratado));
      console.log('  Exceso   : ₡' + fmt(p.diferencia) + ' (' + p.porcentaje_ejecucion + '%)');
    });

  console.log('\n--- DISTRIBUCIÓN DE ESTADOS ---');
  ['ok', 'limite', 'inconsistencia'].forEach(estado => {
    const count = partidas.filter(p => p.estado === estado).length;
    console.log(' ', estado.padEnd(14), ':', count, 'partida(s)');
  });
}
