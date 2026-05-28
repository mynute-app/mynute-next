export function formatFinancialCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

/**
 * Normalizes an ISO date string (RFC3339 or YYYY-MM-DD) to YYYY-MM-DD for
 * safe lexicographic comparison against user-picked date strings.
 *
 * "2026-05-01T00:00:00Z".slice(0, 10) === "2026-05-01"
 */
export function normalizeDateStr(dateStr: string): string {
  return dateStr.slice(0, 10);
}
