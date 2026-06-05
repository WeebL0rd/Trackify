// Orquesta la demo completa end-to-end:
// 1. Hashea el presupuesto SIPP (integridad del origen).
// 2. Cruza SIPP vs SICOP y detecta inconsistencias.
// 3. Hashea el resultado del cruce (integridad del análisis).
// 4. Ancla el hash del cruce en Stellar Testnet — lo que queda inmutable es la evidencia.
// 5. Persiste resultado_demo.json con todo el contexto blockchain.

require('dotenv').config();

const fs   = require('fs');
const path = require('path');

const { hashPresupuesto, hashObjeto } = require('./hashPresupuesto');
const { anclarEnStellar }             = require('./anclarEnStellar');
const { cruzarDatos }                 = require('./cruzarDatos');

const RUTA_RESULTADO = path.join(__dirname, '..', 'src', 'data', 'resultado_demo.json');

const fmt = n => '₡' + new Intl.NumberFormat('es-CR').format(n);

function banner() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║         TRACKIFY — Demo Runner           ║');
  console.log('╚══════════════════════════════════════════╝\n');
}

// ---------------------------------------------------------------------------

(async () => {
  banner();

  // ── [1/5] Hash del presupuesto SIPP (integridad del origen) ──────────────
  console.log('[1/5] Hasheando presupuesto SIPP...');
  const { hash: hashSipp } = hashPresupuesto();
  const sipp = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'data', 'sipp_2025.json'), 'utf-8')
  );
  console.log('      → Hash SIPP:            ', hashSipp.slice(0, 16) + '...');
  console.log('      → Total presupuestado:  ', fmt(sipp.total_presupuestado));

  // ── [2/5] Cruzar SIPP vs SICOP ───────────────────────────────────────────
  console.log('\n[2/5] Cruzando SIPP vs SICOP...');
  const { resumen, partidas } = cruzarDatos();

  const cOk             = partidas.filter(p => p.estado === 'ok').length;
  const cLimite         = partidas.filter(p => p.estado === 'limite').length;
  const cInconsistencia = partidas.filter(p => p.estado === 'inconsistencia').length;

  console.log('      → ' + partidas.length + ' partidas analizadas');
  console.log('      → ✅  ok:             ' + cOk + ' partidas');
  console.log('      → ⚠️   limite:         ' + cLimite + ' partidas');
  console.log('      → 🚨  inconsistencia: ' + cInconsistencia + ' partidas');
  console.log('      → Monto total en exceso:', fmt(resumen.monto_total_inconsistencias));

  // ── [3/5] Hash del resultado del cruce (integridad del análisis) ──────────
  // Lo que se hashea es la evidencia: qué partidas tienen inconsistencia y por cuánto.
  // Esto es lo que después quedará inmutable en Stellar.
  console.log('\n[3/5] Hasheando resultado del cruce...');
  const datosAnclar = { resumen, partidas };
  const { hash: hashCruce } = hashObjeto(datosAnclar, 'cruce SIPP vs SICOP');
  console.log('      → Hash cruce:          ', hashCruce.slice(0, 16) + '...');

  // ── [4/5] Anclar hash del cruce en Stellar Testnet ───────────────────────
  // El memo identifica: proyecto + municipalidad + año + primeros 8 chars del hash del cruce.
  console.log('\n[4/5] Anclando evidencia del cruce en Stellar Testnet...');
  const ancla = await anclarEnStellar(hashCruce);
  console.log('      → Memo:', ancla.memo);
  console.log('      → Transaction hash:', ancla.transaction_hash.slice(0, 16) + '...');
  console.log('      → 🔗', ancla.stellar_explorer_url);

  // ── [5/5] Guardar resultado_demo.json ─────────────────────────────────────
  console.log('\n[5/5] Guardando resultado_demo.json...');

  const resultado = {
    hash_sipp:           hashSipp,           // integridad del presupuesto aprobado
    hash_cruce:          hashCruce,          // integridad del análisis (lo que se ancló)
    transaction_hash:    ancla.transaction_hash,
    stellar_explorer_url: ancla.stellar_explorer_url,
    memo:                ancla.memo,
    timestamp_ancla:     ancla.timestamp,
    resumen,
    partidas,
  };

  fs.writeFileSync(RUTA_RESULTADO, JSON.stringify(resultado, null, 2), 'utf-8');
  console.log('      → ✓ src/data/resultado_demo.json actualizado');
  console.log('      → ✓ Listo. Ejecuta: npm run dev\n');

})().catch(err => {
  console.error('\n[ERROR]', err.message);
  process.exit(1);
});
