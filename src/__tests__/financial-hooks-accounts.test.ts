/**
 * Tests for financial account hooks.
 */
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  useCreateFinancialAccount,
  useDeleteFinancialAccount,
  useFinancialAccounts,
} from "@/hooks/financial/use-financial-accounts";
import type { FinancialAccount } from "@/types/financial";

jest.mock("@/hooks/financial/use-financial-api", () => ({
  fetchFinancialAccounts: jest.fn(),
  createFinancialAccount: jest.fn(),
  deleteFinancialAccount: jest.fn(),
}));

import * as api from "@/hooks/financial/use-financial-api";

const mockAccount: FinancialAccount = {
  id: "acc-1",
  name: "Conta Corrente",
  balance: 100000,
  created_at: 1748000000,
  updated_at: 1748000000,
};

describe("useFinancialAccounts", () => {
  beforeEach(() => jest.clearAllMocks());

  it("starts loading then returns accounts on success", async () => {
    (api.fetchFinancialAccounts as jest.Mock).mockResolvedValue([mockAccount]);

    const { result } = renderHook(() => useFinancialAccounts());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual([mockAccount]);
    expect(result.current.error).toBeNull();
  });

  it("sets error when fetch fails", async () => {
    (api.fetchFinancialAccounts as jest.Mock).mockRejectedValue(
      new Error("Servidor offline"),
    );

    const { result } = renderHook(() => useFinancialAccounts());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Servidor offline");
    expect(result.current.data).toEqual([]);
  });

  it("uses generic error message for non-Error throws", async () => {
    (api.fetchFinancialAccounts as jest.Mock).mockRejectedValue("oops");

    const { result } = renderHook(() => useFinancialAccounts());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Erro ao buscar contas");
  });

  it("does not re-fetch when params reference changes but values are identical", async () => {
    (api.fetchFinancialAccounts as jest.Mock).mockResolvedValue([]);

    const { rerender } = renderHook(
      ({ p }) => useFinancialAccounts(p),
      { initialProps: { p: { status: "active" } } },
    );

    await waitFor(() =>
      expect(api.fetchFinancialAccounts).toHaveBeenCalledTimes(1),
    );

    rerender({ p: { status: "active" } });

    expect(api.fetchFinancialAccounts).toHaveBeenCalledTimes(1);
  });

  it("exposes a refetch function that re-fetches data", async () => {
    (api.fetchFinancialAccounts as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useFinancialAccounts());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(api.fetchFinancialAccounts).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(api.fetchFinancialAccounts).toHaveBeenCalledTimes(2);
  });
});

describe("useCreateFinancialAccount", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls createFinancialAccount and resets loading on success", async () => {
    (api.createFinancialAccount as jest.Mock).mockResolvedValue(mockAccount);

    const { result } = renderHook(() => useCreateFinancialAccount());

    await act(async () => {
      await result.current.mutate({ name: "Nova conta", balance: 0 });
    });

    expect(api.createFinancialAccount).toHaveBeenCalledWith({ name: "Nova conta", balance: 0 });
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("sets error and re-throws when create fails", async () => {
    (api.createFinancialAccount as jest.Mock).mockRejectedValue(
      new Error("Nome duplicado"),
    );

    const { result } = renderHook(() => useCreateFinancialAccount());

    let caughtError: Error | null = null;
    await act(async () => {
      try {
        await result.current.mutate({ name: "Duplicada", balance: 0 });
      } catch (e) {
        caughtError = e as Error;
      }
    });

    expect(caughtError?.message).toBe("Nome duplicado");
    expect(result.current.error).toBe("Nome duplicado");
  });
});

describe("useDeleteFinancialAccount", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls deleteFinancialAccount with correct id on success", async () => {
    (api.deleteFinancialAccount as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteFinancialAccount());

    await act(async () => {
      await result.current.mutate("acc-1");
    });

    expect(api.deleteFinancialAccount).toHaveBeenCalledWith("acc-1");
    expect(result.current.error).toBeNull();
  });

  it("sets error and re-throws when delete fails", async () => {
    (api.deleteFinancialAccount as jest.Mock).mockRejectedValue(
      new Error("Conta tem movimentações"),
    );

    const { result } = renderHook(() => useDeleteFinancialAccount());

    let caughtError: Error | null = null;
    await act(async () => {
      try {
        await result.current.mutate("acc-1");
      } catch (e) {
        caughtError = e as Error;
      }
    });

    expect(caughtError?.message).toBe("Conta tem movimentações");
    expect(result.current.error).toBe("Conta tem movimentações");
  });
});
