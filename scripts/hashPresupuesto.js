// Genera un hash SHA-256 del presupuesto SIPP para garantizar integridad
// antes de anclarlo en Stellar Testnet.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Ordena las keys de un objeto recursivamente de forma alfabética.
 * Garantiza que el JSON canónico sea siempre idéntico sin importar
 * el orden de inserción de las keys en el objeto original.
 */
function sortKeysRecursive(value) {
  if (Array.isArray(value)) {
    return value.map(sortKeysRecursive);
  }
  if (value !== null && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortKeysRecursive(value[key]);
        return acc;
      }, {});
  }
  return value;
}

/**
 * Lee el sipp_2025.json, genera su representación canónica (keys ordenadas
 * alfabéticamente, sin espacios) y calcula el SHA-256 del string resultante.
 *
 * @param {string} [rutaJson] - Ruta al archivo JSON (por defecto usa sipp_2025.json)
 * @returns {{ hash: string, canonico: string }} hash hex y el JSON canónico usado
 */
function hashPresupuesto(rutaJson) {
  const ruta = rutaJson || path.join(__dirname, '..', 'data', 'sipp_2025.json');

  console.log('[hashPresupuesto] Leyendo archivo:', ruta);
  const raw = fs.readFileSync(ruta, 'utf-8');
  const data = JSON.parse(raw);

  const ordenado = sortKeysRecursive(data);
  const canonico = JSON.stringify(ordenado);

  console.log('[hashPresupuesto] Bytes en JSON canónico:', Buffer.byteLength(canonico, 'utf-8'));

  const hash = crypto.createHash('sha256').update(canonico, 'utf-8').digest('hex');

  console.log('[hashPresupuesto] SHA-256:', hash);
  return { hash, canonico };
}

module.exports = { hashPresupuesto };

// ---------------------------------------------------------------------------
// Bloque de prueba — solo corre cuando se ejecuta directamente con node
// ---------------------------------------------------------------------------
if (require.main === module) {
  console.log('=== TEST hashPresupuesto ===\n');

  // 1. Hash del JSON real
  const { hash: hashOriginal, canonico } = hashPresupuesto();
  console.log('\n[TEST] Hash original:', hashOriginal);

  // 2. Modificar un carácter y recalcular el hash
  const tampered = canonico.slice(0, 50) + 'X' + canonico.slice(51);
  const hashTampered = crypto.createHash('sha256').update(tampered, 'utf-8').digest('hex');
  console.log('[TEST] Hash alterado: ', hashTampered);

  // 3. Verificar que los hashes son distintos
  const sonDiferentes = hashOriginal !== hashTampered;
  console.log('\n[TEST] ¿Hashes diferentes?', sonDiferentes ? 'PASS ✓' : 'FAIL ✗');

  // 4. Verificar que el hash del mismo input es determinístico
  const { hash: hashRepetido } = hashPresupuesto();
  const esDeterministico = hashOriginal === hashRepetido;
  console.log('[TEST] ¿Hash determinístico?', esDeterministico ? 'PASS ✓' : 'FAIL ✗');
}
