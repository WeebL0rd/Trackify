import "dotenv/config";
import { generarRegistro } from "./generador";

const INGESTA_URL        = process.env.INGESTA_URL        ?? "http://localhost:3001/registrar";
const INTERVALO_MS       = parseInt(process.env.INTERVALO_MS       ?? "4000", 10);
const PROB_INCONSISTENCIA = parseFloat(process.env.PROB_INCONSISTENCIA ?? "0.35");

async function emitirRegistro(): Promise<void> {
  const registro = generarRegistro(PROB_INCONSISTENCIA);

  try {
    const res = await fetch(INGESTA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registro),
    });

    const body = (await res.json()) as Record<string, unknown>;

    if (res.ok) {
      console.log(
        `[OK ] ${registro.licitacion}  ${registro.partida}  ₡${registro.monto.toLocaleString("es-CR")}  → ${body["txHash"] ?? "?"}`
      );
    } else {
      console.error(`[ERR] ${registro.licitacion}`, body);
    }
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : String(err);
    console.error(`[!!!] ingesta no disponible: ${mensaje}`);
  }
}

console.log(`[generador] goteo cada ${INTERVALO_MS}ms → ${INGESTA_URL}`);
console.log(`[generador] prob. inconsistencia: ${(PROB_INCONSISTENCIA * 100).toFixed(0)}%`);

// Primer registro de inmediato, luego cada INTERVALO_MS
void emitirRegistro();
setInterval(() => { void emitirRegistro(); }, INTERVALO_MS);
