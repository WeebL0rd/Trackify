import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { validarRegistro } from "./validador";
import { invocarRegistrar } from "./soroban";

const app = express();
app.use(express.json());

const PORT = parseInt(process.env.PORT ?? "3001", 10);

// ── Estado en memoria (reemplazable por DB en fases posteriores) ──
interface EntradaEstado {
  partida: string;
  monto: number;
  licitacion: string;
  txHash: string;
  explorerUrl: string;
  timestamp: string;
}
const registros: EntradaEstado[] = [];

// ── POST /registrar ──────────────────────────────────────────────
app.post("/registrar", async (req: Request, res: Response, next: NextFunction) => {
  const validacion = validarRegistro(req.body);

  if (!validacion.valido) {
    res.status(400).json({ ok: false, errores: validacion.errores });
    return;
  }

  try {
    const resultado = await invocarRegistrar(req.body);

    const entrada: EntradaEstado = {
      partida: req.body.partida,
      monto: req.body.monto,
      licitacion: req.body.licitacion,
      txHash: resultado.txHash,
      explorerUrl: resultado.explorerUrl,
      timestamp: new Date().toISOString(),
    };
    registros.push(entrada);

    res.status(201).json({
      ok: true,
      txHash: resultado.txHash,
      explorerUrl: resultado.explorerUrl,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /estado ──────────────────────────────────────────────────
app.get("/estado", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    total: registros.length,
    registros,
  });
});

// ── Manejo de errores ────────────────────────────────────────────
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const mensaje = err instanceof Error ? err.message : "Error interno";
  console.error("[ingesta] error:", mensaje);
  res.status(500).json({ ok: false, error: mensaje });
});

app.listen(PORT, () => {
  console.log(`[ingesta] servidor escuchando en http://localhost:${PORT}`);
  console.log(`[ingesta] contrato: ${process.env.CONTRACT_ID ?? "(no configurado)"}`);
  console.log(`[ingesta] red: ${process.env.STELLAR_RPC_URL ?? "https://soroban-testnet.stellar.org"}`);
});
