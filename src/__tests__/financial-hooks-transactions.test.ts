/**
 * Tests for financial transaction hooks.
 * Mocks use-financial-api to isolate hook behavior from HTTP layer.
 */
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  useCancelFinancialTransaction,
  useCreateFinancialTransaction,
  useFinancialTransactions,
  usePayFinancialTransaction,
} from "@/hooks/financial/use-financial-transactions";
import type { FinancialTransaction } from "@/types/financial";

jest.mock("@/hooks/financial/use-financial-api", () => ({
  fetchFinancialTransactions: jest.fn(),
  createFinancialTransaction: jest.fn(),
  payFinancialTransaction: jest.fn(),
  cancelFinancialTransaction: jest.fn(),
}));

// Import after jest.mock so we get the mocked version
import * as api from "@/hooks/financial/use-financial-api";

const mockTransaction: FinancialTransaction = {
  id: "tx-1",
  description: "Consulta",
  amount: 15000,
  transaction_type: "income",
  status: "pending",
  due_date: "2026-06-01T00:00:00Z",
  created_at: 1748000000,
  updated_at: 1748000000,
};

describe("useFinancialTransactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts with loading=true, then returns data on success", async () => {
    (api.fetchFinancialTransactions as jest.Mock).mockResolvedValue([mockTransaction]);

    const { result } = renderHook(() => useFinancialTransactions());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toEqual([]);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual([mockTransaction]);
    expect(result.current.error).toBeNull();
  });

  it("sets error state when fetch fails", async () => {
    (api.fetchFinancialTransactions as jest.Mock).mockRejectedValue(
      new Error("Servidor indisponível"),
    );

    const { result } = renderHook(() => useFinancialTransactions());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Servidor indisponível");
    expect(result.current.data).toEqual([]);
  });

  it("uses generic error message when thrown value is not an Error instance", async () => {
    (api.fetchFinancialTransactions as jest.Mock).mockRejectedValue("string-error");

    const { result } = renderHook(() => useFinancialTransactions());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Erro ao buscar transações");
  });

  it("does NOT re-fetch when params reference changes but values are identical (infinite loop guard)", async () => {
    (api.fetchFinancialTransactions as jest.Mock).mockResolvedValue([]);

    const { rerender } = renderHook(
      ({ params }) => useFinancialTransactions(params),
      { initialProps: { params: { page_size: 10 } } },
    );

    await waitFor(() =>
      expect(api.fetchFinancialTransactions).toHaveBeenCalledTimes(1),
    );

    // New object reference, same values — should NOT trigger a second fetch
    rerender({ params: { page_size: 10 } });

    expect(api.fetchFinancialTransactions).toHaveBeenCalledTimes(1);
  });

  it("re-fetches when params values actually change", async () => {
    (api.fetchFinancialTransactions as jest.Mock).mockResolvedValue([]);

    const { rerender } = renderHook(
      ({ params }) => useFinancialTransactions(params),
      { initialProps: { params: { page_size: 10 } } },
    );

    await waitFor(() =>
      expect(api.fetchFinancialTransactions).toHaveBeenCalledTimes(1),
    );

    rerender({ params: { page_size: 50 } });

    await waitFor(() =>
      expect(api.fetchFinancialTransactions).toHaveBeenCalledTimes(2),
    );
  });
});

describe("useCreateFinancialTransaction", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls createFinancialTransaction with payload and clears error on success", async () => {
    (api.createFinancialTransaction as jest.Mock).mockResolvedValue(mockTransaction);

    const { result } = renderHook(() => useCreateFinancialTransaction());

    await act(async () => {
      await result.current.mutate({
        description: "Consulta",
        amount: 15000,
        transaction_type: "income",
        due_date: "2026-06-01",
      });
    });

    expect(api.createFinancialTransaction).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("sets error state and re-throws when createFinancialTransaction fails", async () => {
    (api.createFinancialTransaction as jest.Mock).mockRejectedValue(
      new Error("Valor inválido"),
    );

    const { result } = renderHook(() => useCreateFinancialTransaction());

    let caughtError: Error | null = null;
    await act(async () => {
      try {
        await result.current.mutate({
          description: "x",
          amount: 0,
          transaction_type: "expense",
          due_date: "2026-06-01",
        });
      } catch (e) {
        caughtError = e as Error;
      }
    });

    expect(caughtError?.message).toBe("Valor inválido");
    expect(result.current.error).toBe("Valor inválido");
    expect(result.current.isLoading).toBe(false);
  });
});

describe("usePayFinancialTransaction", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls payFinancialTransaction with id and payload on success", async () => {
    (api.payFinancialTransaction as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => usePayFinancialTransaction());

    await act(async () => {
      await result.current.mutate("tx-1", { payment_method: "pix", paid_at: "2026-06-01" });
    });

    expect(api.payFinancialTransaction).toHaveBeenCalledWith("tx-1", {
      payment_method: "pix",
      paid_at: "2026-06-01",
    });
    expect(result.current.error).toBeNull();
  });

  it("sets error when pay fails", async () => {
    (api.payFinancialTransaction as jest.Mock).mockRejectedValue(
      new Error("Transação já paga"),
    );

    const { result } = renderHook(() => usePayFinancialTransaction());

    let caughtError: Error | null = null;
    await act(async () => {
      try {
        await result.current.mutate("tx-1", { payment_method: "cash", paid_at: "2026-06-01" });
      } catch (e) {
        caughtError = e as Error;
      }
    });

    expect(caughtError?.message).toBe("Transação já paga");
    expect(result.current.error).toBe("Transação já paga");
  });
});

describe("useCancelFinancialTransaction", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls cancelFinancialTransaction with the correct id on success", async () => {
    (api.cancelFinancialTransaction as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useCancelFinancialTransaction());

    await act(async () => {
      await result.current.mutate("tx-1");
    });

    expect(api.cancelFinancialTransaction).toHaveBeenCalledWith("tx-1");
    expect(result.current.error).toBeNull();
  });

  it("sets error when cancel fails", async () => {
    (api.cancelFinancialTransaction as jest.Mock).mockRejectedValue(
      new Error("Já cancelado"),
    );

    const { result } = renderHook(() => useCancelFinancialTransaction());

    let caughtError: Error | null = null;
    await act(async () => {
      try {
        await result.current.mutate("tx-1");
      } catch (e) {
        caughtError = e as Error;
      }
    });

    expect(caughtError?.message).toBe("Já cancelado");
    expect(result.current.error).toBe("Já cancelado");
  });
});
