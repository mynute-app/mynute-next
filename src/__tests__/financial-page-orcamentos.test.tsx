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
// mockUseClientQuotes is a jest.fn() that can be overridden per test with mockReturnValueOnce
const mockUseClientQuotes = jest.fn();

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
  // Forward calls to mockUseClientQuotes so tests can override via mockReturnValueOnce
  useClientQuotes: (...args: unknown[]) => mockUseClientQuotes(...args),
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
  // Default: useClientQuotes returns empty list (for refetch tests that don't need quote data)
  mockUseClientQuotes.mockReturnValue({
    data: [],
    isLoading: false,
    error: null,
    refetch: mockQuoteRefetch,
  });
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

// ── Status flow tests ─────────────────────────────────────────────────────────

describe("OrcamentosPage — quote status flow", () => {
  it("shows 'Enviar' button (not 'Aprovar') for a draft quote", () => {
    mockUseClientQuotes.mockReturnValueOnce({
      data: [{ id: "q1", status: "draft", client_name: "Cliente A", total_amount: 5000, items: [], valid_until: null }],
      isLoading: false,
      error: null,
      refetch: mockQuoteRefetch,
    });

    render(<OrcamentosPage />);

    // Draft quotes should show "Enviar" to advance to "sent" (first step)
    expect(screen.getByText("Enviar")).toBeInTheDocument();
    // Should NOT show "Aprovar" from draft — that skips the "sent" step
    expect(screen.queryByText("Aprovar")).not.toBeInTheDocument();
  });

  it("shows 'Aceitar' and 'Recusar' buttons for a sent quote", () => {
    mockUseClientQuotes.mockReturnValueOnce({
      data: [{ id: "q2", status: "sent", client_name: "Cliente B", total_amount: 8000, items: [], valid_until: null }],
      isLoading: false,
      error: null,
      refetch: mockQuoteRefetch,
    });

    render(<OrcamentosPage />);

    expect(screen.getByText("Aceitar")).toBeInTheDocument();
    expect(screen.getByText("Recusar")).toBeInTheDocument();
  });

  it("calls updateQuoteStatus with 'sent' when clicking Enviar on a draft quote", async () => {
    mockUseClientQuotes.mockReturnValueOnce({
      data: [{ id: "q3", status: "draft", client_name: "Cliente C", total_amount: 3000, items: [], valid_until: null }],
      isLoading: false,
      error: null,
      refetch: mockQuoteRefetch,
    });

    render(<OrcamentosPage />);

    fireEvent.click(screen.getByText("Enviar"));

    await waitFor(() => {
      expect(mockUpdateQuoteStatus).toHaveBeenCalledWith("q3", "sent");
    });
  });

  it("calls updateQuoteStatus with 'rejected' when clicking Recusar on a sent quote", async () => {
    mockUseClientQuotes.mockReturnValueOnce({
      data: [{ id: "q4", status: "sent", client_name: "Cliente D", total_amount: 7000, items: [], valid_until: null }],
      isLoading: false,
      error: null,
      refetch: mockQuoteRefetch,
    });

    render(<OrcamentosPage />);

    fireEvent.click(screen.getByText("Recusar"));

    await waitFor(() => {
      expect(mockUpdateQuoteStatus).toHaveBeenCalledWith("q4", "rejected");
    });
  });
});
