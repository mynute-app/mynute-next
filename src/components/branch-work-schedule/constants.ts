// Constantes compartilhadas entre componentes

export type DiaSemana = {
  weekday: number;
  label: string;
  shortLabel: string;
};

export const DIAS_SEMANA: readonly DiaSemana[] = [
  { weekday: 1, label: "Segunda-feira", shortLabel: "SEG" },
  { weekday: 2, label: "Terça-feira", shortLabel: "TER" },
  { weekday: 3, label: "Quarta-feira", shortLabel: "QUA" },
  { weekday: 4, label: "Quinta-feira", shortLabel: "QUI" },
  { weekday: 5, label: "Sexta-feira", shortLabel: "SEX" },
  { weekday: 6, label: "Sábado", shortLabel: "SAB" },
  { weekday: 0, label: "Domingo", shortLabel: "DOM" },
];

export const DIAS_SEMANA_MAP: Record<number, string> = {
  0: "Domingo",
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
};

export const DIAS_SEMANA_SHORT: Record<number, string> = {
  0: "DOM",
  1: "SEG",
  2: "TER",
  3: "QUA",
  4: "QUI",
  5: "SEX",
  6: "SAB",
};

export const HORARIOS = Array.from({ length: 96 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  return `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
});

export const TIMEZONES = [
  { value: "America/Sao_Paulo", label: "América/São Paulo (GMT-3)" },
  { value: "America/New_York", label: "América/Nova York (GMT-5)" },
  { value: "Europe/London", label: "Europa/Londres (GMT+0)" },
] as const;

export const ALL_WEEKDAYS = [1, 2, 3, 4, 5, 6, 0] as const;
