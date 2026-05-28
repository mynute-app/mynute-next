/**
 * Tests for financial budget and category hooks.
 */
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  useCreateFinancialBudget,
  useFinancialBudgets,
} from "@/hooks/financial/use-financial-budgets";
import {
  useCreateFinancialCategory,
  useFinancialCategories,
} from "@/hooks/financial/use-financial-categories";

jest.mock("@/hooks/financial/use-financial-api", () => ({
  fetchFinancialBudgets: jest.fn(),
  createFinancialBudget: jest.fn(),
  fetchFinancialCategories: jest.fn(),
  createFinancialCategory: jest.fn(),
}));

import * as api from "@/hooks/financial/use-financial-api";

describe("useFinancialBudgets", () => {
  beforeEach(() => jest.clearAllMocks());

  it("starts loading, then returns budgets on success", async () => {
    const mockBudgets = [{ id: "b-1", name: "Marketing", amount: 5000 }];
    (api.fetchFinancialBudgets as jest.Mock).mockResolvedValue(mockBudgets);

    const { result } = renderHook(() => useFinancialBudgets());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockBudgets);
    expect(result.current.error).toBeNull();
  });

  it("sets error on fetch failure", async () => {
    (api.fetchFinancialBudgets as jest.Mock).mockRejectedValue(new Error("Falha no servidor"));

    const { result } = renderHook(() => useFinancialBudgets());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Falha no servidor");
    expect(result.current.data).toEqual([]);
  });

  it("uses generic error for non-Error throws", async () => {
    (api.fetchFinancialBudgets as jest.Mock).mockRejectedValue(42);

    const { result } = renderHook(() => useFinancialBudgets());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Erro ao buscar budgets");
  });
});

describe("useCreateFinancialBudget", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls createFinancialBudget on mutate and returns result", async () => {
    const newBudget = { id: "b-2", name: "RH", amount: 10000 };
    (api.createFinancialBudget as jest.Mock).mockResolvedValue(newBudget);

    const { result } = renderHook(() => useCreateFinancialBudget());

    let returned: unknown;
    await act(async () => {
      returned = await result.current.mutate({ name: "RH", amount: 10000, category_id: "c-1" });
    });

    expect(returned).toEqual(newBudget);
    expect(result.current.error).toBeNull();
  });

  it("sets error and re-throws on create failure", async () => {
    (api.createFinancialBudget as jest.Mock).mockRejectedValue(new Error("Limite atingido"));

    const { result } = renderHook(() => useCreateFinancialBudget());

    let caughtError: Error | null = null;
    await act(async () => {
      try {
        await result.current.mutate({ name: "Teste", amount: 0, category_id: "c-1" });
      } catch (e) {
        caughtError = e as Error;
      }
    });

    expect(caughtError?.message).toBe("Limite atingido");
    expect(result.current.error).toBe("Limite atingido");
  });
});

describe("useFinancialCategories", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns categories on success", async () => {
    const mockCategories = [{ id: "cat-1", name: "Aluguel", type: "expense" }];
    (api.fetchFinancialCategories as jest.Mock).mockResolvedValue(mockCategories);

    const { result } = renderHook(() => useFinancialCategories());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockCategories);
    expect(result.current.error).toBeNull();
  });

  it("sets error on fetch failure", async () => {
    (api.fetchFinancialCategories as jest.Mock).mockRejectedValue(new Error("Sem conexão"));

    const { result } = renderHook(() => useFinancialCategories());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Sem conexão");
  });

  it("does not re-fetch when params reference changes but values are the same", async () => {
    (api.fetchFinancialCategories as jest.Mock).mockResolvedValue([]);

    const { rerender } = renderHook(
      ({ p }) => useFinancialCategories(p),
      { initialProps: { p: { type: "expense" } } },
    );

    await waitFor(() =>
      expect(api.fetchFinancialCategories).toHaveBeenCalledTimes(1),
    );

    rerender({ p: { type: "expense" } });

    expect(api.fetchFinancialCategories).toHaveBeenCalledTimes(1);
  });
});

describe("useCreateFinancialCategory", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls createFinancialCategory on mutate", async () => {
    const newCat = { id: "cat-2", name: "Serviços", type: "income" };
    (api.createFinancialCategory as jest.Mock).mockResolvedValue(newCat);

    const { result } = renderHook(() => useCreateFinancialCategory());

    await act(async () => {
      await result.current.mutate({ name: "Serviços", type: "income" });
    });

    expect(api.createFinancialCategory).toHaveBeenCalledWith({ name: "Serviços", type: "income" });
    expect(result.current.error).toBeNull();
  });

  it("sets error and re-throws on create failure", async () => {
    (api.createFinancialCategory as jest.Mock).mockRejectedValue(new Error("Já existe"));

    const { result } = renderHook(() => useCreateFinancialCategory());

    let caughtError: Error | null = null;
    await act(async () => {
      try {
        await result.current.mutate({ name: "Duplicada", type: "expense" });
      } catch (e) {
        caughtError = e as Error;
      }
    });

    expect(caughtError?.message).toBe("Já existe");
    expect(result.current.error).toBe("Já existe");
  });
});
