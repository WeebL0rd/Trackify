// Orquesta la demo completa end-to-end:
// 1. Hashea el presupuesto SIPP con SHA-256.
// 2. Ancla el hash en Stellar Testnet.
// 3. Cruza SIPP vs SICOP y detecta las 3 inconsistencias.
// 4. Persiste resultado_demo.json con todo el contexto blockchain.

require('dotenv').config();

const fs   = require('fs');
const path = require('path');

const { hashPresupuesto } = require('./hashPresupuesto');
const { anclarEnStellar }  = require('./anclarEnStellar');
const { cruzarDatos }      = require('./cruzarDatos');

const RUTA_RESULTADO = path.join(__dirname, '..', 'src', 'data', 'resultado_demo.json');

const fmt = n => '₡' + new Intl.NumberFormat('es-CR').format(n);

// ---------------------------------------------------------------------------

function banner() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║         TRACKIFY — Demo Runner           ║');
  console.log('╚══════════════════════════════════════════╝\n');
}

// ---------------------------------------------------------------------------

(async () => {
  banner();

  // ── [1/4] Hash del presupuesto ────────────────────────────────────────────
  console.log('[1/4] Cargando y hasheando presupuesto SIPP...');
  const { hash } = hashPresupuesto();
  const sipp = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'data', 'sipp_2025.json'), 'utf-8')
  );
  console.log('      → Hash SHA-256:', hash.slice(0, 16) + '...');
  console.log('      → Total presupuestado:', fmt(sipp.total_presupuestado));

  // ── [2/4] Anclar en Stellar ───────────────────────────────────────────────
  console.log('\n[2/4] Anclando en Stellar Testnet...');
  const ancla = await anclarEnStellar(hash);
  console.log('      → Memo:', ancla.memo);
  console.log('      → Transaction hash:', ancla.transaction_hash.slice(0, 16) + '...');
  console.log('      → 🔗', ancla.stellar_explorer_url);

  // ── [3/4] Cruzar SIPP vs SICOP ───────────────────────────────────────────
  console.log('\n[3/4] Cruzando SIPP vs SICOP...');
  const { resumen, partidas } = cruzarDatos();

  const cOk            = partidas.filter(p => p.estado === 'ok').length;
  const cLimite        = partidas.filter(p => p.estado === 'limite').length;
  const cInconsistencia = partidas.filter(p => p.estado === 'inconsistencia').length;

  console.log('      → ' + partidas.length + ' partidas analizadas');
  console.log('      → ✅  ok:             ' + cOk + ' partidas');
  console.log('      → ⚠️   limite:         ' + cLimite + ' partidas');
  console.log('      → 🚨  inconsistencia: ' + cInconsistencia + ' partidas');
  console.log('      → Monto total en exceso:', fmt(resumen.monto_total_inconsistencias));

  // ── [4/4] Guardar resultado_demo.json ────────────────────────────────────
  console.log('\n[4/4] Guardando resultado_demo.json...');

  const resultado = {
    hash_presupuesto:    hash,
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
