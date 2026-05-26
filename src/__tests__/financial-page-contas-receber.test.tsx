/**
 * @jest-environment jsdom
 *
 * Tests for the ContasAReceberPage component.
 * Verifies that a pending income transaction shows an "Excluir" button
 * that calls useCancelFinancialTransaction and refetches the list.
 */

// URL.revokeObjectURL polyfill
if (typeof URL.revokeObjectURL === "undefined") {
  Object.defineProperty(URL, "revokeObjectURL", { value: () => {} });
}

// ── Mock hooks ────────────────────────────────────────────────────────────────

const mockRefetch = jest.fn();
const mockCancelMutate = jest.fn().mockResolvedValue(undefined);
const mockPayMutate = jest.fn().mockResolvedValue({});
const mockCreateMutate = jest.fn().mockResolvedValue({});
const mockUseFinancialTransactions = jest.fn();

jest.mock("@/hooks/financial/use-financial-transactions", () => ({
  useFinancialTransactions: (...args: unknown[]) => mockUseFinancialTransactions(...args),
  useCreateFinancialTransaction: () => ({ mutate: mockCreateMutate, isLoading: false, error: null }),
  usePayFinancialTransaction: () => ({ mutate: mockPayMutate, isLoading: false, error: null }),
  useCancelFinancialTransaction: () => ({ mutate: mockCancelMutate, isLoading: false, error: null }),
}));

jest.mock("@/lib/financial-display", () => ({
  getStatusBadgeVariant: () => "secondary",
  getTransactionStatusLabel: (s: string) => s,
}));

jest.mock("@/lib/financial-utils", () => ({
  formatFinancialCurrency: (n: number) => String(n),
  normalizeDateStr: (d: string) => d,
}));

jest.mock("@/app/dashboard/financeiro/_components/date-range-filter", () => ({
  DateRangeFilter: () => <div data-testid="date-range-filter" />,
}));

jest.mock("@/app/dashboard/financeiro/_components/transaction-action-dialog", () => ({
  TransactionActionDialog: () => null,
}));

// ── Tests ─────────────────────────────────────────────────────────────────────

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ContasAReceberPage from "@/app/dashboard/financeiro/contas-a-receber/page";

beforeEach(() => {
  jest.clearAllMocks();
  // Default: empty list
  mockUseFinancialTransactions.mockReturnValue({
    data: [],
    isLoading: false,
    error: null,
    refetch: mockRefetch,
  });
});

describe("ContasAReceberPage — delete button", () => {
  it("shows 'Excluir' button for a pending income transaction", () => {
    mockUseFinancialTransactions.mockReturnValueOnce({
      data: [{ id: "t1", description: "Mensalidade", amount: 300, status: "pending", due_date: "2025-06-01", transaction_type: "income" }],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<ContasAReceberPage />);

    expect(screen.getByText("Excluir")).toBeInTheDocument();
  });

  it("calls cancelMutate with transaction id and refetches when clicking Excluir", async () => {
    mockUseFinancialTransactions.mockReturnValueOnce({
      data: [{ id: "t2", description: "Serviço XYZ", amount: 500, status: "pending", due_date: "2025-06-15", transaction_type: "income" }],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<ContasAReceberPage />);

    fireEvent.click(screen.getByText("Excluir"));

    await waitFor(() => {
      expect(mockCancelMutate).toHaveBeenCalledWith("t2");
    });

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it("does not show 'Excluir' for a paid transaction", () => {
    mockUseFinancialTransactions.mockReturnValueOnce({
      data: [{ id: "t3", description: "Pago", amount: 200, status: "paid", due_date: "2025-05-01", transaction_type: "income" }],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<ContasAReceberPage />);

    expect(screen.queryByText("Excluir")).not.toBeInTheDocument();
  });
});
