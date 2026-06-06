import {
  Contract,
  Networks,
  rpc,
  TransactionBuilder,
  BASE_FEE,
  scValToNative,
} from "@stellar/stellar-sdk";

const RPC_URL: string =
  (import.meta as any).env.VITE_RPC_URL ?? "https://soroban-testnet.stellar.org";
const CONTRACT_ID: string = (import.meta as any).env.VITE_CONTRACT_ID ?? "";
const SIM_ACCOUNT: string = (import.meta as any).env.VITE_STELLAR_SIM_ACCOUNT ?? "";

export interface EstadoContrato {
  partidas: Record<string, number>;
  timestamp_consulta: string;
}

export async function leerEstadoContrato(contractIdOverride?: string): Promise<EstadoContrato | null> {
  const contractId = contractIdOverride || CONTRACT_ID;
  if (!contractId || !SIM_ACCOUNT) {
    console.warn("[soroban] VITE_CONTRACT_ID o VITE_STELLAR_SIM_ACCOUNT no configurados");
    return null;
  }

  const server = new rpc.Server(RPC_URL, { allowHttp: false });
  const contract = new Contract(contractId);

  try {
    const account = await server.getAccount(SIM_ACCOUNT);

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(contract.call("get_estado"))
      .setTimeout(30)
      .build();

    const sim = await server.simulateTransaction(tx);

    if (rpc.Api.isSimulationError(sim)) {
      console.warn("[soroban] simulación error:", (sim as rpc.Api.SimulateTransactionErrorResponse).error);
      return null;
    }

    const simOk = sim as rpc.Api.SimulateTransactionSuccessResponse;
    if (!simOk.result) return null;

    // get_estado devuelve Estado { presupuesto: Map<String,i128>, ejecutado: Map<String,i128> }
    const raw = scValToNative(simOk.result.retval) as {
      ejecutado: Record<string, bigint>;
    };
    const partidas: Record<string, number> = {};

    if (raw?.ejecutado && typeof raw.ejecutado === "object") {
      for (const [k, v] of Object.entries(raw.ejecutado)) {
        partidas[k] = Number(v);
      }
    }

    return { partidas, timestamp_consulta: new Date().toISOString() };
  } catch (err) {
    console.warn("[soroban] error al consultar contrato:", err);
    return null;
  }
}
