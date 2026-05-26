/**
 * @jest-environment jsdom
 *
 * Tests for the OrcamentosPage component.
 * Verifies that after mutations, refetch() is called instead of window.location.reload().
 */

// URL.revokeObjectURL polyfill for jsdom
if (typeof URL.revokeObjectURL === "undefined") {
  Object.defineProperty(URL, "revokeObjectURL", { value: () => {} });
}

// Prevent jsdom "Not implemented: navigation" errors from window.location.reload
const mockLocationReload = jest.fn();
Object.defineProperty(window, "location", {
  value: { reload: mockLocationReload, href: "http://localhost/" },
  writable: true,
});

// ── Mock hooks ────────────────────────────────────────────────────────────────

const mockBudgetRefetch = jest.fn();
const mockQuoteRefetch = jest.fn();
const mockCreateBudget = jest.fn().mockResolvedValue({});
const mockCreateQuote = jest.fn().mockResolvedValue({});
const mockUpdateQuoteStatus = jest.fn().mockResolvedValue({});

jest.mock("@/hooks/financial/use-financial-budgets", () => ({
  useFinancialBudgets: () => ({
    data: [],
    isLoading: false,
    error: null,
    refetch: mockBudgetRefetch,
  }),
  useCreateFinancialBudget: () => ({
    mutate: mockCreateBudget,
    isLoading: false,
    error: null,
  }),
}));

jest.mock("@/hooks/financial/use-client-quotes", () => ({
  useClientQuotes: () => ({
    data: [],
    isLoading: false,
    error: null,
    refetch: mockQuoteRefetch,
  }),
  useCreateClientQuote: () => ({
    mutate: mockCreateQuote,
    isLoading: false,
    error: null,
  }),
  useUpdateClientQuoteStatus: () => ({
    mutate: mockUpdateQuoteStatus,
    isLoading: false,
    error: null,
  }),
}));

jest.mock("@/lib/financial-display", () => ({
  getQuoteStatusLabel: (s: string) => s,
}));

jest.mock("@/lib/financial-utils", () => ({
  formatFinancialCurrency: (n: number) => String(n),
}));

// Mock Radix Tabs so all tab panels are always rendered (avoids jsdom lazy-render limitation)
jest.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <button data-value={value}>{children}</button>
  ),
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// ── Tests ─────────────────────────────────────────────────────────────────────

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import OrcamentosPage from "@/app/dashboard/financeiro/orcamentos/page";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("OrcamentosPage — mutations call refetch instead of window.location.reload", () => {
  it("calls quoteRefetch (not window.location.reload) after creating a quote", async () => {
    render(<OrcamentosPage />);

    // Fill the quote creation form (quotes tab is shown by default)
    fireEvent.change(screen.getByPlaceholderText("Cliente"), {
      target: { value: "João Silva" },
    });
    fireEvent.change(screen.getByPlaceholderText("Descricao do item"), {
      target: { value: "Corte de cabelo" },
    });
    fireEvent.change(screen.getByPlaceholderText("Valor do item"), {
      target: { value: "50" },
    });

    const createButton = screen.getByText("Criar orçamento");
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockCreateQuote).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockQuoteRefetch).toHaveBeenCalled();
    });

    // Must NOT call window.location.reload (full-page reload is a UX anti-pattern)
    expect(mockLocationReload).not.toHaveBeenCalled();
  });

  it("calls budgetRefetch (not window.location.reload) after creating a budget", async () => {
    render(<OrcamentosPage />);

    // With Radix Tabs mocked, all tab panels render simultaneously
    fireEvent.change(screen.getByPlaceholderText("Nome do budget"), {
      target: { value: "Budget Q2" },
    });
    fireEvent.change(screen.getByPlaceholderText("Valor orcado"), {
      target: { value: "1000" },
    });

    const createButton = screen.getByText("Criar budget");
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockCreateBudget).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockBudgetRefetch).toHaveBeenCalled();
    });

    expect(mockLocationReload).not.toHaveBeenCalled();
  });
});
