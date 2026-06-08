export interface Partida {
  codigo: string;
  nombre: string;
  aprobado: number;
  inconsistente: boolean;
}

export const PARTIDAS: Partida[] = [
  { codigo: "1.04.01", nombre: "Alquiler de maquinaria",  aprobado:  48_500_000, inconsistente: false },
  { codigo: "1.04.02", nombre: "Servicios médicos",        aprobado: 112_000_000, inconsistente: false },
  { codigo: "1.04.03", nombre: "Servicios de ingeniería",  aprobado:  87_300_000, inconsistente: false },
  { codigo: "1.04.04", nombre: "Servicios económicos",     aprobado:  63_200_000, inconsistente: false },
  { codigo: "1.04.05", nombre: "Gestión y apoyo",          aprobado:  34_800_000, inconsistente: true  },
  { codigo: "1.04.06", nombre: "Servicios generales",      aprobado:  55_000_000, inconsistente: false },
  { codigo: "1.05.01", nombre: "Herramientas y equipo",    aprobado:  29_400_000, inconsistente: true  },
  { codigo: "1.05.02", nombre: "Útiles y materiales",      aprobado:  18_900_000, inconsistente: true  },
];

export const PARTIDAS_INCONSISTENTES = PARTIDAS.filter((p) => p.inconsistente);
export const PARTIDAS_NORMALES       = PARTIDAS.filter((p) => !p.inconsistente);

// CD aparece tres veces para que sea más frecuente
export const TIPOS_PROCEDIMIENTO = ["CD", "CD", "CD", "LA", "LN"] as const;

export const UNIDAD_COMPRADORA = "MCAR";
