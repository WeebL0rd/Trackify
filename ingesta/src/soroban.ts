import {
  Contract,
  Keypair,
  nativeToScVal,
  Networks,
  SorobanRpc,
  TransactionBuilder,
  BASE_FEE,
  xdr,
} from "@stellar/stellar-sdk";
import type { RegistroIngesta } from "./validador";

const MAX_INTENTOS = 15;
const DELAY_MS = 2000;

function buildExplorerUrl(txHash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${txHash}`;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface ResultadoSoroban {
  txHash: string;
  explorerUrl: string;
}

export async function invocarRegistrar(
  registro: RegistroIngesta
): Promise<ResultadoSoroban> {
  const secretKey = process.env.STELLAR_SECRET_KEY;
  const contractId = process.env.CONTRACT_ID;
  const rpcUrl = process.env.STELLAR_RPC_URL ?? "https://soroban-testnet.stellar.org";

  if (!secretKey) throw new Error("STELLAR_SECRET_KEY no configurada");
  if (!contractId) throw new Error("CONTRACT_ID no configurado");

  const signer = Keypair.fromSecret(secretKey);
  const server = new SorobanRpc.Server(rpcUrl, { allowHttp: false });
  const contract = new Contract(contractId);

  const account = await server.getAccount(signer.publicKey());

  const args: xdr.ScVal[] = [
    nativeToScVal(registro.partida, { type: "string" }),
    nativeToScVal(Math.round(registro.monto * 100), { type: "i128" }),
    nativeToScVal(registro.licitacion, { type: "string" }),
  ];

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call("registrar", ...args))
    .setTimeout(30)
    .build();

  const simResult = await server.simulateTransaction(tx);

  if (SorobanRpc.Api.isSimulationError(simResult)) {
    throw new Error(`Simulación fallida: ${simResult.error}`);
  }

  const txPreparado = SorobanRpc.assembleTransaction(tx, simResult).build();
  txPreparado.sign(signer);

  const envioResult = await server.sendTransaction(txPreparado);

  if (envioResult.status === "ERROR") {
    throw new Error(`Error al enviar tx: ${JSON.stringify(envioResult.errorResult)}`);
  }

  const txHash = envioResult.hash;

  // Esperar confirmación con máximo MAX_INTENTOS
  for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
    await sleep(DELAY_MS);

    const estadoTx = await server.getTransaction(txHash);

    if (estadoTx.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
      return { txHash, explorerUrl: buildExplorerUrl(txHash) };
    }

    if (estadoTx.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
      throw new Error(`Transacción fallida (hash: ${txHash})`);
    }

    // NOT_FOUND o PENDING: seguir esperando
  }

  throw new Error(
    `Timeout: la tx ${txHash} no confirmó tras ${MAX_INTENTOS} intentos`
  );
}
