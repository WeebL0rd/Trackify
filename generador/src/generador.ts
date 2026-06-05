import {
  PARTIDAS_INCONSISTENTES,
  PARTIDAS_NORMALES,
  TIPOS_PROCEDIMIENTO,
  UNIDAD_COMPRADORA,
  type Partida,
} from "./datos";

export interface Registro {
  partida: string;
  monto: number;
  licitacion: string;
}

let secuencia = 1;

function enteroAleatorio(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function eleAleatorio<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatearSecuencia(n: number): string {
  return n.toString().padStart(6, "0");
}

export function generarRegistro(probInconsistencia: number): Registro {
  const esInconsistente = Math.random() < probInconsistencia;
  const pool: Partida[] = esInconsistente ? PARTIDAS_INCONSISTENTES : PARTIDAS_NORMALES;
  const partida = eleAleatorio(pool);

  const monto = esInconsistente
    ? enteroAleatorio(8_000_000, 22_000_000)
    : enteroAleatorio(800_000, 12_000_000);

  const tipo = eleAleatorio(TIPOS_PROCEDIMIENTO);
  const licitacion = `2026${tipo}-${formatearSecuencia(secuencia++)}-${UNIDAD_COMPRADORA}`;

  return { partida: partida.codigo, monto, licitacion };
}
