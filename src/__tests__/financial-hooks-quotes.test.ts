/**
 * Tests for client quote hooks.
 */
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  useClientQuotes,
  useCreateClientQuote,
  useUpdateClientQuoteStatus,
} from "@/hooks/financial/use-client-quotes";
import type { ClientQuote } from "@/types/financial";

jest.mock("@/hooks/financial/use-financial-api", () => ({
  fetchClientQuotes: jest.fn(),
  createClientQuote: jest.fn(),
  updateClientQuoteStatus: jest.fn(),
}));

import * as api from "@/hooks/financial/use-financial-api";

const mockQuote: ClientQuote = {
  id: "q-1",
  client_name: "João Silva",
  total: 25000,
  status: "pending",
  created_at: 1748000000,
  updated_at: 1748000000,
};

describe("useClientQuotes", () => {
  beforeEach(() => jest.clearAllMocks());

  it("starts loading then returns quotes on success", async () => {
    (api.fetchClientQuotes as jest.Mock).mockResolvedValue([mockQuote]);

    const { result } = renderHook(() => useClientQuotes());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual([mockQuote]);
    expect(result.current.error).toBeNull();
  });

  it("sets error on fetch failure", async () => {
    (api.fetchClientQuotes as jest.Mock).mockRejectedValue(new Error("Falha ao buscar"));

    const { result } = renderHook(() => useClientQuotes());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Falha ao buscar");
    expect(result.current.data).toEqual([]);
  });

  it("uses generic error for non-Error throws", async () => {
    (api.fetchClientQuotes as jest.Mock).mockRejectedValue(null);

    const { result } = renderHook(() => useClientQuotes());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Erro ao buscar orçamentos");
  });

  it("does not re-fetch when params reference changes but values are identical", async () => {
    (api.fetchClientQuotes as jest.Mock).mockResolvedValue([]);

    const { rerender } = renderHook(
      ({ p }) => useClientQuotes(p),
      { initialProps: { p: { status: "pending" } } },
    );

    await waitFor(() =>
      expect(api.fetchClientQuotes).toHaveBeenCalledTimes(1),
    );

    rerender({ p: { status: "pending" } });

    expect(api.fetchClientQuotes).toHaveBeenCalledTimes(1);
  });
});

describe("useCreateClientQuote", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls createClientQuote and returns new quote", async () => {
    (api.createClientQuote as jest.Mock).mockResolvedValue(mockQuote);

    const { result } = renderHook(() => useCreateClientQuote());

    let returned: unknown;
    await act(async () => {
      returned = await result.current.mutate({
        client_name: "João Silva",
        items: [],
      });
    });

    expect(returned).toEqual(mockQuote);
    expect(result.current.error).toBeNull();
  });

  it("sets error and re-throws on create failure", async () => {
    (api.createClientQuote as jest.Mock).mockRejectedValue(new Error("Cliente não encontrado"));

    const { result } = renderHook(() => useCreateClientQuote());

    let caughtError: Error | null = null;
    await act(async () => {
      try {
        await result.current.mutate({ client_name: "", items: [] });
      } catch (e) {
        caughtError = e as Error;
      }
    });

    expect(caughtError?.message).toBe("Cliente não encontrado");
    expect(result.current.error).toBe("Cliente não encontrado");
  });
});

describe("useUpdateClientQuoteStatus", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls updateClientQuoteStatus with id and status", async () => {
    (api.updateClientQuoteStatus as jest.Mock).mockResolvedValue({ ...mockQuote, status: "approved" });

    const { result } = renderHook(() => useUpdateClientQuoteStatus());

    await act(async () => {
      await result.current.mutate("q-1", "approved");
    });

    expect(api.updateClientQuoteStatus).toHaveBeenCalledWith("q-1", "approved");
    expect(result.current.error).toBeNull();
  });

  it("sets error and re-throws when status update fails", async () => {
    (api.updateClientQuoteStatus as jest.Mock).mockRejectedValue(
      new Error("Transição inválida"),
    );

    const { result } = renderHook(() => useUpdateClientQuoteStatus());

    let caughtError: Error | null = null;
    await act(async () => {
      try {
        await result.current.mutate("q-1", "cancelled");
      } catch (e) {
        caughtError = e as Error;
      }
    });

    expect(caughtError?.message).toBe("Transição inválida");
    expect(result.current.error).toBe("Transição inválida");
  });
});
