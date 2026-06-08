import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { execSync } from "child_process";
import path from "path";
import { validarRegistro } from "./validador";
import { invocarRegistrar } from "./soroban";

const app = express();
app.use(express.json());

const PORT = parseInt(process.env.PORT ?? "3001", 10);

// CONTRACT_ID mutable — se actualiza después de cada reset
let currentContractId = process.env.CONTRACT_ID ?? "";

// En Windows la ingesta corre fuera de WSL — stellar solo existe dentro de WSL.
// Usamos "wsl stellar" y convertimos el path Windows → WSL para que funcione en ambos entornos.
const IS_WINDOWS = process.platform === "win32";

function toWslPath(p: string): string {
  return p.replace(/\\/g, "/").replace(/^([A-Za-z]):/, (_, d) => `/mnt/${d.toLowerCase()}`);
}

const STELLAR = IS_WINDOWS ? "wsl stellar" : "stellar";

const WASM_PATH_RAW = path.resolve(
  process.cwd(),
  "../contrato/target/wasm32v1-none/release/trackify_contrato.wasm"
);
const WASM_PATH = IS_WINDOWS ? toWslPath(WASM_PATH_RAW) : WASM_PATH_RAW;

const SIPP_PARTIDAS = JSON.stringify({
  "1.04.01": "48500000",
  "1.04.02": "112000000",
  "1.04.03": "87300000",
  "1.04.04": "63200000",
  "1.04.05": "34800000",
  "1.04.06": "55000000",
  "1.05.01": "29400000",
  "1.05.02": "18900000",
});

// ── Estado en memoria ────────────────────────────────────────────
interface EntradaEstado {
  partida: string;
  monto: number;
  licitacion: string;
  txHash: string;
  explorerUrl: string;
  timestamp: string;
}
const registros: EntradaEstado[] = [];

// ── GET /config ──────────────────────────────────────────────────
app.get("/config", (_req: Request, res: Response) => {
  res.json({ contractId: currentContractId });
});

// ── POST /reset ──────────────────────────────────────────────────
app.post("/reset", (_req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("[ingesta] reset — desplegando nuevo contrato...");

    // --network-passphrase requerido porque STELLAR_RPC_URL en el entorno hace que el CLI
    // exija el passphrase explícitamente (no lo infiere solo de --network testnet).
    const PASSPHRASE = "Test SDF Network ; September 2015";
    const execOpts = { encoding: "utf-8" as const, timeout: 120_000 };

    const deployOut = execSync(
      `${STELLAR} contract deploy --wasm "${WASM_PATH}" --source signer-servicio --network testnet --network-passphrase "${PASSPHRASE}"`,
      execOpts
    );

    const match = deployOut.match(/^C[A-Z2-7]{55}$/m);
    if (!match) throw new Error("No se pudo extraer el Contract ID del output");
    const newId = match[0];

    console.log(`[ingesta] nuevo contrato: ${newId} — inicializando...`);

    execSync(
      `${STELLAR} contract invoke --id ${newId} --source signer-servicio --network testnet --network-passphrase "${PASSPHRASE}" -- init --partidas '${SIPP_PARTIDAS}'`,
      execOpts
    );

    currentContractId = newId;
    registros.length = 0;

    console.log(`[ingesta] reset completo → ${newId}`);
    res.json({ ok: true, contractId: newId });
  } catch (err) {
    next(err);
  }
});

// ── POST /registrar ──────────────────────────────────────────────
app.post("/registrar", async (req: Request, res: Response, next: NextFunction) => {
  const validacion = validarRegistro(req.body);

  if (!validacion.valido) {
    res.status(400).json({ ok: false, errores: validacion.errores });
    return;
  }

  try {
    const resultado = await invocarRegistrar(req.body, currentContractId);

    registros.push({
      partida:     req.body.partida,
      monto:       req.body.monto,
      licitacion:  req.body.licitacion,
      txHash:      resultado.txHash,
      explorerUrl: resultado.explorerUrl,
      timestamp:   new Date().toISOString(),
    });

    res.status(201).json({
      ok: true,
      txHash:      resultado.txHash,
      explorerUrl: resultado.explorerUrl,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /estado ──────────────────────────────────────────────────
app.get("/estado", (_req: Request, res: Response) => {
  res.json({ ok: true, total: registros.length, registros });
});

// ── Manejo de errores ────────────────────────────────────────────
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const mensaje = err instanceof Error ? err.message : "Error interno";
  console.error("[ingesta] error:", mensaje);
  res.status(500).json({ ok: false, error: mensaje });
});

app.listen(PORT, () => {
  console.log(`[ingesta] servidor escuchando en http://localhost:${PORT}`);
  console.log(`[ingesta] contrato: ${currentContractId || "(no configurado)"}`);
  console.log(`[ingesta] red: ${process.env.STELLAR_RPC_URL ?? "https://soroban-testnet.stellar.org"}`);
  console.log(`[ingesta] stellar cmd: ${STELLAR} ${IS_WINDOWS ? "(modo WSL)" : "(nativo)"}`);
});
