export interface RegistroIngesta {
  partida: string;
  monto: number;
  licitacion: string;
}

export interface ResultadoValidacion {
  valido: boolean;
  errores: string[];
}

const PARTIDAS_VALIDAS = new Set([
  "1.04.01",
  "1.04.02",
  "1.04.03",
  "1.04.04",
  "1.04.05",
  "1.04.06",
  "1.05.01",
  "1.05.02",
]);

// Formato esperado: 2024LN-000001-UGPME o similar (2024|2025 + tipo + guion + número + guion + unidad)
const REGEX_LICITACION = /^\d{4}[A-Z]{2,6}-\d{6}-[A-Z0-9]+$/;

export function validarRegistro(registro: unknown): ResultadoValidacion {
  const errores: string[] = [];

  if (typeof registro !== "object" || registro === null) {
    return { valido: false, errores: ["El cuerpo debe ser un objeto JSON"] };
  }

  const r = registro as Record<string, unknown>;

  // Validar partida
  if (typeof r.partida !== "string" || r.partida.trim() === "") {
    errores.push("partida: requerida y debe ser string");
  } else if (!PARTIDAS_VALIDAS.has(r.partida.trim())) {
    errores.push(
      `partida: "${r.partida}" no es válida. Válidas: ${[...PARTIDAS_VALIDAS].join(", ")}`
    );
  }

  // Validar monto
  if (r.monto === undefined || r.monto === null) {
    errores.push("monto: requerido");
  } else if (typeof r.monto !== "number" || !isFinite(r.monto)) {
    errores.push("monto: debe ser un número finito");
  } else if (r.monto <= 0) {
    errores.push("monto: debe ser mayor que 0");
  }

  // Validar licitacion
  if (typeof r.licitacion !== "string" || r.licitacion.trim() === "") {
    errores.push("licitacion: requerida y debe ser string");
  } else if (!REGEX_LICITACION.test(r.licitacion.trim())) {
    errores.push(
      `licitacion: "${r.licitacion}" no cumple el formato esperado (ej. 2024LN-000001-UGPME)`
    );
  }

  return { valido: errores.length === 0, errores };
}
