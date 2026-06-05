// Verifica criptográficamente que el análisis guardado en resultado_demo.json
// no fue modificado después de ser anclado en Stellar Testnet.
//
// No requiere variables de entorno — es solo lectura.
// Cualquier auditor puede correrlo: node scripts/verificar.js

const crypto = require('crypto');
const fs     = require('fs');
const path   = require('path');

const RUTA_RESULTADO = path.join(__dirname, '..', 'src', 'data', 'resultado_demo.json');
const HORIZON_URL    = 'https://horizon-testnet.stellar.org';

// ---------------------------------------------------------------------------

function sortKeysRecursive(value) {
  if (Array.isArray(value)) return value.map(sortKeysRecursive);
  if (value !== null && typeof value === 'object') {
    return Object.keys(value).sort().reduce((acc, key) => {
      acc[key] = sortKeysRecursive(value[key]);
      return acc;
    }, {});
  }
  return value;
}

function calcularHash(data) {
  const canonico = JSON.stringify(sortKeysRecursive(data));
  return crypto.createHash('sha256').update(canonico, 'utf-8').digest('hex');
}

function ok(msg)   { console.log('      → ✅', msg); }
function fail(msg) { console.log('      → ❌', msg); }
function sep()     { console.log(''); }

// ---------------------------------------------------------------------------

(async () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║     TRACKIFY — Verificación de Integridad  ║');
  console.log('╚══════════════════════════════════════════╝\n');

  let pasos = 0;
  let errores = 0;

  // ── [1/3] Recalcular el hash del análisis desde el JSON local ─────────────
  console.log('[1/3] Recalculando hash del análisis...');

  if (!fs.existsSync(RUTA_RESULTADO)) {
    console.error('      ❌ No se encontró src/data/resultado_demo.json');
    console.error('         Corre primero: node scripts/runDemo.js');
    process.exit(1);
  }

  const resultado = JSON.parse(fs.readFileSync(RUTA_RESULTADO, 'utf-8'));
  const { hash_sipp, hash_cruce, transaction_hash, memo, resumen, partidas } = resultado;

  const hashRecalculado = calcularHash({ resumen, partidas });

  console.log('      → Hash calculado: ', hashRecalculado);
  console.log('      → Hash en archivo:', hash_cruce);

  if (hashRecalculado === hash_cruce) {
    ok('Los datos del análisis coinciden con el hash guardado');
    pasos++;
  } else {
    fail('DISCREPANCIA — el análisis fue modificado después de ser anclado');
    errores++;
  }

  sep();

  // ── [2/3] Verificar que el memo coincide con los primeros 8 chars del hash ─
  console.log('[2/3] Verificando memo contra hash del cruce...');

  const memoEsperado = 'TRACKIFY-MCR-2025-' + hash_cruce.slice(0, 8).toUpperCase();
  console.log('      → Memo esperado: ', memoEsperado);
  console.log('      → Memo en archivo:', memo);

  if (memo === memoEsperado) {
    ok('El memo es consistente con el hash del cruce');
    pasos++;
  } else {
    fail('El memo no corresponde al hash del cruce');
    errores++;
  }

  sep();

  // ── [3/3] Consultar Stellar Testnet y verificar el memo on-chain ───────────
  console.log('[3/3] Consultando Stellar Testnet...');
  console.log('      → Transaction:', transaction_hash);

  try {
    const url = `${HORIZON_URL}/transactions/${transaction_hash}`;
    const res  = await fetch(url);

    if (!res.ok) {
      throw new Error(`Horizon respondió HTTP ${res.status}`);
    }

    const txOnChain = await res.json();
    const memoOnChain = txOnChain.memo ?? '(sin memo)';
    const ledger      = txOnChain.ledger;
    const fecha       = new Date(txOnChain.created_at).toLocaleString('es-CR', {
      timeZone: 'America/Costa_Rica',
      dateStyle: 'long',
      timeStyle: 'medium',
    });

    console.log('      → Memo on-chain: ', memoOnChain);
    console.log('      → Ledger:        ', ledger);
    console.log('      → Fecha:         ', fecha);

    if (memoOnChain === memo) {
      ok('El memo on-chain coincide con el archivo local');
      pasos++;
    } else {
      fail(`Memo on-chain "${memoOnChain}" ≠ memo local "${memo}"`);
      errores++;
    }

  } catch (err) {
    fail('No se pudo consultar Stellar Testnet: ' + err.message);
    errores++;
  }

  // ── Veredicto final ────────────────────────────────────────────────────────
  sep();
  console.log('═══════════════════════════════════════════');

  if (errores === 0) {
    console.log('✅  INTEGRIDAD VERIFICADA');
    console.log('    Los ' + pasos + '/3 controles pasaron.');
    console.log('    El análisis no fue alterado desde que fue anclado en Stellar.');
  } else {
    console.log('❌  VERIFICACIÓN FALLIDA');
    console.log('    ' + errores + ' de 3 controles fallaron.');
    console.log('    Los datos pueden haber sido modificados después del ancla.');
  }

  console.log('═══════════════════════════════════════════\n');
  process.exit(errores > 0 ? 1 : 0);

})();
