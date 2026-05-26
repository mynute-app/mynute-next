"use client";

import type {
  AppointmentsRevenueReport,
  CashFlowReport,
  ClientQuote,
  CreateClientQuotePayload,
  CreateFinancialAccountPayload,
  CreateFinancialBudgetPayload,
  CreateFinancialCategoryPayload,
  CreateFinancialTransactionPayload,
  DREReport,
  FinancialAccount,
  FinancialBudget,
  FinancialCategory,
  FinancialTransaction,
  PayablesReport,
  PayFinancialTransactionPayload,
  ReceivablesReport,
} from "@/types/financial";

export class FinancialApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "FinancialApiError";
  }
}

function buildQuery(params?: Record<string, string | number | boolean | undefined>) {
  if (!params) return "";
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.set(key, String(value));
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");

    let parsedMessage = "";
    if (text) {
      try {
        const parsed = JSON.parse(text) as {
          message?: string;
          pt_message?: string;
          error?: string;
        };
        parsedMessage = parsed.pt_message || parsed.message || parsed.error || "";
      } catch {
        parsedMessage = text;
      }
    }

    const normalizedMessage = parsedMessage.trim();
    throw new FinancialApiError(res.status, normalizedMessage || `Erro ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

// Accounts
export function fetchFinancialAccounts(params?: Record<string, string | number | boolean | undefined>) {
  return apiFetch<FinancialAccount[]>(`/api/financial/accounts${buildQuery(params)}`);
}

export function createFinancialAccount(payload: CreateFinancialAccountPayload) {
  return apiFetch<FinancialAccount>("/api/financial/accounts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteFinancialAccount(id: string) {
  return apiFetch<void>(`/api/financial/accounts/${id}`, { method: "DELETE" });
}

// Categories
export function fetchFinancialCategories(params?: Record<string, string | number | boolean | undefined>) {
  return apiFetch<FinancialCategory[]>(`/api/financial/categories${buildQuery(params)}`);
}

export function createFinancialCategory(payload: CreateFinancialCategoryPayload) {
  return apiFetch<FinancialCategory>("/api/financial/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Transactions
export function fetchFinancialTransactions(params?: Record<string, string | number | boolean | undefined>) {
  return apiFetch<FinancialTransaction[]>(`/api/financial/transactions${buildQuery(params)}`);
}

export function createFinancialTransaction(payload: CreateFinancialTransactionPayload) {
  return apiFetch<FinancialTransaction>("/api/financial/transactions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function payFinancialTransaction(id: string, payload: PayFinancialTransactionPayload) {
  return apiFetch<FinancialTransaction>(`/api/financial/transactions/${id}/pay`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function cancelFinancialTransaction(id: string) {
  return apiFetch<void>(`/api/financial/transactions/${id}`, {
    method: "DELETE",
  });
}

// Budgets
export function fetchFinancialBudgets() {
  return apiFetch<FinancialBudget[]>("/api/financial/budgets");
}

export function createFinancialBudget(payload: CreateFinancialBudgetPayload) {
  return apiFetch<FinancialBudget>("/api/financial/budgets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Quotes
export function fetchClientQuotes(params?: Record<string, string | number | boolean | undefined>) {
  return apiFetch<ClientQuote[]>(`/api/financial/quotes${buildQuery(params)}`);
}

export function createClientQuote(payload: CreateClientQuotePayload) {
  return apiFetch<ClientQuote>("/api/financial/quotes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateClientQuoteStatus(id: string, status: string) {
  return apiFetch<ClientQuote>(`/api/financial/quotes/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// Reports
export function fetchCashFlowReport(params?: Record<string, string | number | boolean | undefined>) {
  return apiFetch<CashFlowReport>(`/api/financial/reports/cashflow${buildQuery(params)}`);
}

export function fetchDREReport(params?: Record<string, string | number | boolean | undefined>) {
  return apiFetch<DREReport>(`/api/financial/reports/dre${buildQuery(params)}`);
}

export function fetchReceivablesReport(params?: Record<string, string | number | boolean | undefined>) {
  return apiFetch<ReceivablesReport>(`/api/financial/reports/receivables${buildQuery(params)}`);
}

export function fetchPayablesReport(params?: Record<string, string | number | boolean | undefined>) {
  return apiFetch<PayablesReport>(`/api/financial/reports/payables${buildQuery(params)}`);
}

export function fetchAppointmentsRevenueReport(params?: Record<string, string | number | boolean | undefined>) {
  return apiFetch<AppointmentsRevenueReport>(
    `/api/financial/reports/appointments-revenue${buildQuery(params)}`,
  );
}
