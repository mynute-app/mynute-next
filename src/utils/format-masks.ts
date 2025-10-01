/**
 * Formata um valor para máscara de tempo em minutos
 * @param value - Valor em string ou número
 * @returns String formatada como "X min"
 */
export function formatTimeMask(value: string | number): string {
  if (!value) return "";

  const numValue =
    typeof value === "string" ? parseInt(value.replace(/\D/g, "")) : value;

  if (isNaN(numValue) || numValue <= 0) return "";

  return `${numValue} min`;
}

/**
 * Formata um valor para máscara de moeda brasileira
 * @param value - Valor em string ou número
 * @returns String formatada como "R$ X,XX"
 */
export function formatCurrencyMask(value: string | number): string {
  if (!value && value !== 0) return "";

  let numValue: number;

  if (typeof value === "string") {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    numValue = parseInt(digits) / 100; // Divide por 100 para considerar centavos
  } else {
    numValue = value;
  }

  if (isNaN(numValue)) return "";

  if (numValue === 0) return "Gratuito";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numValue);
}

/**
 * Remove máscara de tempo e retorna apenas o número
 * @param value - Valor com máscara
 * @returns Número sem máscara
 */
export function unmaskTime(value: string): number {
  if (!value) return 0;
  const digits = value.replace(/\D/g, "");
  return parseInt(digits) || 0;
}

/**
 * Remove máscara de moeda e retorna apenas o número
 * @param value - Valor com máscara
 * @returns Número sem máscara
 */
export function unmaskCurrency(value: string): number {
  if (!value || value === "Gratuito") return 0;

  // Remove símbolos da moeda e converte vírgula para ponto
  const cleanValue = value
    .replace(/R\$\s?/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".");

  return parseFloat(cleanValue) || 0;
}

/**
 * Aplica máscara de tempo durante a digitação
 * @param value - Valor sendo digitado
 * @returns Apenas os números sem o "min"
 */
export function applyTimeMask(value: string): string {
  // Remove tudo que não é dígito
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";

  // Limita a 3 dígitos (999 minutos máximo)
  const limitedDigits = digits.slice(0, 3);
  const numValue = parseInt(limitedDigits);

  if (isNaN(numValue) || numValue === 0) return "";

  return limitedDigits;
}

/**
 * Aplica máscara de moeda durante a digitação
 * @param value - Valor sendo digitado
 * @returns Valor com máscara aplicada
 */
export function applyCurrencyMask(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";

  const numValue = parseInt(digits) / 100;
  return formatCurrencyMask(numValue);
}
