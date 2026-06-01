// Ancla el hash SHA-256 del presupuesto SIPP en Stellar Testnet
// usando @stellar/stellar-sdk directamente, sin dependencias de Crossmint SDK.

require('dotenv').config();

const StellarSdk = require('@stellar/stellar-sdk');
const {
  Keypair,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  Memo,
  BASE_FEE,
} = StellarSdk;

const { hashPresupuesto } = require('./hashPresupuesto');

const HORIZON_URL   = 'https://horizon-testnet.stellar.org';
const EXPLORER_BASE = 'https://stellar.expert/explorer/testnet/tx';
const server        = new StellarSdk.Horizon.Server(HORIZON_URL);

// ---------------------------------------------------------------------------
// Función principal exportada
// ---------------------------------------------------------------------------

/**
 * Ancla un hash SHA-256 en Stellar Testnet firmando con STELLAR_SECRET_KEY.
 *
 * @param {string} hash - SHA-256 hex de 64 caracteres
 * @returns {{ transaction_hash, stellar_explorer_url, memo, timestamp }}
 */
async function anclarEnStellar(hash) {
  if (!hash || hash.length !== 64) {
    throw new Error('[anclarEnStellar] Hash inválido — debe ser SHA-256 hex de 64 caracteres');
  }

  // 1. Cargar keypair desde variable de entorno
  const secretKey = process.env.STELLAR_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      '[anclarEnStellar] STELLAR_SECRET_KEY no definida en .env\n' +
      '  Genera una cuenta testnet en: https://stellar.org/laboratory/#account-creator?network=testnet'
    );
  }

  console.log('[anclarEnStellar] Cargando keypair...');
  const keypair = Keypair.fromSecret(secretKey);
  console.log('[anclarEnStellar] Public key:', keypair.publicKey());

  // Memo: 18 chars fijos + 8 del hash = 26 chars (< límite de 28 de Stellar)
  const memo = 'TRACKIFY-MCR-2025-' + hash.slice(0, 8).toUpperCase();
  console.log('[anclarEnStellar] Memo:', memo, `(${memo.length} chars)`);

  // 2. Obtener account details desde Horizon Testnet
  console.log('[anclarEnStellar] Cargando account desde Horizon:', keypair.publicKey());
  const account = await server.loadAccount(keypair.publicKey());
  console.log('[anclarEnStellar] Sequence número:', account.sequenceNumber());

  // 3. Construir la transacción
  console.log('[anclarEnStellar] Construyendo transacción...');
  const tx = new TransactionBuilder(account, {
    fee:               BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    // Pago mínimo a sí mismo — necesario para que la tx sea válida en Stellar
    .addOperation(
      Operation.payment({
        destination: keypair.publicKey(),
        asset:       Asset.native(),
        amount:      '0.0000001',            // 1 stroopa — el mínimo posible
      })
    )
    .addMemo(Memo.text(memo))
    .setTimeout(30)
    .build();

  // 4. Firmar con la clave secreta
  console.log('[anclarEnStellar] Firmando transacción...');
  tx.sign(keypair);

  // 5. Enviar a Stellar Testnet
  console.log('[anclarEnStellar] Enviando a Stellar Testnet...');
  const response = await server.submitTransaction(tx);
  console.log('[anclarEnStellar] Respuesta Horizon:', JSON.stringify({
    successful: response.successful,
    hash:       response.hash,
    ledger:     response.ledger,
  }, null, 2));

  if (!response.successful) {
    throw new Error(
      '[anclarEnStellar] La transacción fue rechazada por Stellar\n' +
      `  ${JSON.stringify(response.extras?.result_codes)}`
    );
  }

  const transaction_hash     = response.hash;
  const stellar_explorer_url = `${EXPLORER_BASE}/${transaction_hash}`;
  const timestamp            = new Date().toISOString();

  const resultado = { transaction_hash, stellar_explorer_url, memo, timestamp };
  console.log('[anclarEnStellar] Resultado final:', JSON.stringify(resultado, null, 2));
  return resultado;
}

module.exports = { anclarEnStellar };

// ---------------------------------------------------------------------------
if (require.main === module) {
  (async () => {
    console.log('=== ANCLAR EN STELLAR TESTNET ===\n');

    const { hash } = hashPresupuesto();
    console.log('[main] Hash a anclar:', hash);

    const resultado = await anclarEnStellar(hash);

    console.log('\n=== RESULTADO FINAL ===');
    console.log('Memo             :', resultado.memo);
    console.log('Transaction Hash :', resultado.transaction_hash);
    console.log('Timestamp        :', resultado.timestamp);
    console.log('\n🔗 Stellar Explorer:');
    console.log('   ', resultado.stellar_explorer_url);
  })().catch(err => {
    console.error('\n[ERROR]', err.message);
    process.exit(1);
  });
}
