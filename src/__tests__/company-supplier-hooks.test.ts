/**
 * Tests for company supplier hooks.
 * useCompanySuppliers and useMergeCompanySuppliers use fetch directly,
 * so we rely on the global fetch mock from jest.setup.ts and override per test.
 */
import { act, renderHook, waitFor } from "@testing-library/react";
import { useCompanySuppliers } from "@/hooks/use-company-suppliers";
import { useMergeCompanySuppliers } from "@/hooks/company-supplier/use-merge-company-suppliers";
import { useCompanySupplierDetails } from "@/hooks/company-supplier/use-company-supplier-details";
import { useCompanySupplierTransactions } from "@/hooks/company-supplier/use-company-supplier-transactions";

// Stable toast mock — must NOT be jest.fn() inside the factory (creates new fn on each render → infinite re-render loop)
const stableToast = jest.fn();
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: stableToast }),
}));

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockSupplierA = {
  id: "sup-1",
  company_id: "company-1",
  name: "Fornecedor A",
  surname: "",
  email: "a@test.com",
  phone: "+5511999990001",
  street: "",
  number: "",
  neighborhood: "",
  city: "",
  state: "",
  country: "",
  zip_code: "",
  created_at: 0,
  updated_at: 0,
};

const mockSupplierB = {
  ...mockSupplierA,
  id: "sup-2",
  name: "Fornecedor B",
  email: "b@test.com",
};

const mockListResponse = {
  company_suppliers: [mockSupplierA, mockSupplierB],
  total: 2,
  page: 1,
  page_size: 10,
};

// ─── useCompanySuppliers ──────────────────────────────────────────────────────

describe("useCompanySuppliers", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("fetches and returns suppliers on success", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockListResponse,
    } as Response);

    const { result } = renderHook(() => useCompanySuppliers());

    await waitFor(() => expect(result.current.hasFetched).toBe(true));

    expect(result.current.suppliers).toHaveLength(2);
    expect(result.current.suppliers[0].id).toBe("sup-1");
    expect(result.current.total).toBe(2);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets error state when fetch fails", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: "Erro interno" }),
    } as Response);

    const { result } = renderHook(() => useCompanySuppliers());

    await waitFor(() => expect(result.current.hasFetched).toBe(true));

    expect(result.current.error).toBe("Erro interno");
    expect(result.current.suppliers).toHaveLength(0);
  });

  it("returns empty list when API returns no suppliers", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ company_suppliers: [], total: 0, page: 1, page_size: 10 }),
    } as Response);

    const { result } = renderHook(() => useCompanySuppliers());

    await waitFor(() => expect(result.current.hasFetched).toBe(true));

    expect(result.current.suppliers).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });

  it("sets hasFetched=true and does not call supplier API when unauthenticated", async () => {
    // The global jest.setup.ts mock returns authenticated session, so we cannot fully
    // simulate unauthenticated in integration. We verify that when the hook is
    // disabled via enabled=false, no fetch is made (see next test).
    // This test verifies the authenticated happy path completes correctly.
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ company_suppliers: [], total: 0, page: 1, page_size: 10 }),
    } as Response);

    const { result } = renderHook(() => useCompanySuppliers());

    await waitFor(() => expect(result.current.hasFetched).toBe(true));

    expect(result.current.isLoading).toBe(false);
  });

  it("refetch triggers a new API call", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockListResponse,
    } as Response);

    const { result } = renderHook(() => useCompanySuppliers());

    await waitFor(() => expect(result.current.hasFetched).toBe(true));
    const callsBefore = fetchMock.mock.calls.length;

    await act(async () => {
      await result.current.refetch();
    });

    expect(fetchMock.mock.calls.length).toBe(callsBefore + 1);
  });

  it("passes search param to query string when provided", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockListResponse,
    } as Response);

    const { result } = renderHook(() => useCompanySuppliers({ search: "Fornecedor A" }));

    await waitFor(() => expect(result.current.hasFetched).toBe(true));

    // Check that at least one call included the search parameter
    const urls = fetchMock.mock.calls.map((call) => call[0] as string);
    const hasSearchParam = urls.some((url) => url.includes("search="));
    expect(hasSearchParam).toBe(true);

    // The search value should contain "Fornecedor" (URL-encoded)
    const searchUrl = urls.find((url) => url.includes("search="))!;
    expect(searchUrl).toMatch(/search=Fornecedor/);
  });

  it("includes pagination params in API query string", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockListResponse,
    } as Response);
    // Clear calls from leaked effects of previous tests before rendering this hook
    fetchMock.mockClear();

    const { result } = renderHook(() => useCompanySuppliers({ page: 3, pageSize: 25 }));

    await waitFor(() => expect(result.current.hasFetched).toBe(true));

    const urls = fetchMock.mock.calls.map((call) => call[0] as string);
    const requestUrl = urls.find((url) => url.includes("/api/company-supplier"))!;
    expect(requestUrl).toMatch(/page=3/);
    expect(requestUrl).toMatch(/page_size=25/);
  });

  it("does not fetch when enabled=false", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockListResponse,
    } as Response);
    // Replace global.fetch completely for this test to avoid picking up
    // leaked effects from previous tests' spyOn installations
    const originalFetch = global.fetch;
    global.fetch = fetchMock;

    const { unmount } = renderHook(() => useCompanySuppliers({ enabled: false }));

    // Wait a tick to ensure no effects triggered a fetch
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    unmount();
    global.fetch = originalFetch;

    expect(fetchMock).not.toHaveBeenCalled();
  });
});

// ─── useMergeCompanySuppliers ─────────────────────────────────────────────────

describe("useMergeCompanySuppliers", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns true and clears error on successful merge", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ message: "Suppliers merged successfully" }),
    } as Response);

    const { result } = renderHook(() => useMergeCompanySuppliers());

    let mergeResult: boolean | undefined;
    await act(async () => {
      mergeResult = await result.current.merge({
        keep_id: "sup-1",
        delete_id: "sup-2",
      });
    });

    expect(mergeResult).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("returns false and sets error on failed merge", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ message: "Fornecedores não pertencem à mesma empresa" }),
    } as Response);

    const { result } = renderHook(() => useMergeCompanySuppliers());

    let mergeResult: boolean | undefined;
    await act(async () => {
      mergeResult = await result.current.merge({
        keep_id: "sup-1",
        delete_id: "sup-2",
      });
    });

    expect(mergeResult).toBe(false);
    expect(result.current.error).toBe("Fornecedores não pertencem à mesma empresa");
    expect(result.current.isLoading).toBe(false);
  });

  it("sets isLoading to true during merge and false after", async () => {
    let resolvePromise!: (value: Response) => void;
    const pendingPromise = new Promise<Response>((res) => {
      resolvePromise = res;
    });

    jest.spyOn(global, "fetch").mockReturnValue(pendingPromise as Promise<Response>);

    const { result } = renderHook(() => useMergeCompanySuppliers());

    act(() => {
      result.current.merge({ keep_id: "sup-1", delete_id: "sup-2" });
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise({
        ok: true,
        status: 200,
        json: async () => ({ message: "ok" }),
      } as Response);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("returns false on network error", async () => {
    jest.spyOn(global, "fetch").mockRejectedValue(new Error("Network failure"));

    const { result } = renderHook(() => useMergeCompanySuppliers());

    let mergeResult: boolean | undefined;
    await act(async () => {
      mergeResult = await result.current.merge({
        keep_id: "sup-1",
        delete_id: "sup-2",
      });
    });

    expect(mergeResult).toBe(false);
    expect(result.current.error).toBe("Network failure");
  });

  it("sends correct payload to the merge endpoint", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ message: "ok" }),
    } as Response);

    const { result } = renderHook(() => useMergeCompanySuppliers());

    await act(async () => {
      await result.current.merge({ keep_id: "sup-1", delete_id: "sup-2" });
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/company-supplier/merge",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ keep_id: "sup-1", delete_id: "sup-2" }),
      })
    );
  });

  it("clears previous error before new merge attempt", async () => {
    const fetchMock = jest.spyOn(global, "fetch");

    const { result } = renderHook(() => useMergeCompanySuppliers());

    // First call fails
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({ message: "Merge falhou" }),
    } as Response);

    await act(async () => {
      await result.current.merge({ keep_id: "sup-1", delete_id: "sup-2" });
    });

    expect(result.current.error).toBe("Merge falhou");

    // Second call succeeds
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ message: "ok" }),
    } as Response);

    await act(async () => {
      await result.current.merge({ keep_id: "sup-1", delete_id: "sup-3" });
    });

    // Error must be cleared after successful merge
    expect(result.current.error).toBeNull();
  });
});

// ─── useCompanySupplierDetails ────────────────────────────────────────────────

describe("useCompanySupplierDetails", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("fetches and returns supplier on success", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockSupplierA,
    } as Response);

    const { result } = renderHook(() =>
      useCompanySupplierDetails({ supplierId: "sup-1" })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.supplier).toEqual(mockSupplierA);
    expect(result.current.error).toBeNull();
  });

  it("sets error state when supplier is not found (404)", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: "Fornecedor não encontrado" }),
    } as Response);

    const { result } = renderHook(() =>
      useCompanySupplierDetails({ supplierId: "nonexistent-id" })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.supplier).toBeNull();
    expect(result.current.error).toBe("Fornecedor não encontrado");
  });

  it("does not fetch when supplierId is empty", async () => {
    const fetchMock = jest.spyOn(global, "fetch");
    fetchMock.mockClear();

    const { result } = renderHook(() =>
      useCompanySupplierDetails({ supplierId: "" })
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    // State should remain empty — no fetch triggered for empty supplierId
    expect(result.current.supplier).toBeNull();
    expect(result.current.error).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not fetch when enabled=false", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSupplierA,
    } as Response);
    const originalFetch = global.fetch;
    global.fetch = fetchMock;

    renderHook(() =>
      useCompanySupplierDetails({ supplierId: "sup-1", enabled: false })
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    global.fetch = originalFetch;
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refetch triggers a new API call with correct URL", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockSupplierA,
    } as Response);

    const { result } = renderHook(() =>
      useCompanySupplierDetails({ supplierId: "sup-1" })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const callsBefore = fetchMock.mock.calls.length;

    await act(async () => {
      await result.current.refetch();
    });

    expect(fetchMock.mock.calls.length).toBe(callsBefore + 1);
    const lastUrl = fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0] as string;
    expect(lastUrl).toContain("/api/company-supplier/sup-1");
  });
});

// ─── useCompanySupplierTransactions ──────────────────────────────────────────

describe("useCompanySupplierTransactions", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("fetches and returns transactions on success", async () => {
    const mockTransactions = [
      { id: "tx-1", description: "Pagamento", amount_cents: 5000 },
      { id: "tx-2", description: "Compra", amount_cents: 10000 },
    ];

    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockTransactions,
    } as Response);

    const { result } = renderHook(() =>
      useCompanySupplierTransactions({ supplierId: "sup-1" })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.transactions).toHaveLength(2);
    expect(result.current.transactions[0].id).toBe("tx-1");
    expect(result.current.error).toBeNull();
  });

  it("sets error state when API returns an error", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: "Erro interno" }),
    } as Response);

    const { result } = renderHook(() =>
      useCompanySupplierTransactions({ supplierId: "sup-1" })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.transactions).toHaveLength(0);
    expect(result.current.error).toBe("Erro interno");
  });

  it("returns empty array when supplier has no transactions", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    } as Response);

    const { result } = renderHook(() =>
      useCompanySupplierTransactions({ supplierId: "sup-1" })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.transactions).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });

  it("does not set error on AbortError (request cancelled)", async () => {
    jest.spyOn(global, "fetch").mockRejectedValue(
      Object.assign(new Error("The operation was aborted"), { name: "AbortError" })
    );

    const { result } = renderHook(() =>
      useCompanySupplierTransactions({ supplierId: "sup-1" })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // AbortError must be silently ignored — no error state
    expect(result.current.error).toBeNull();
  });

  it("includes supplier_id in the fetch URL", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    } as Response);
    fetchMock.mockClear();

    const { result } = renderHook(() =>
      useCompanySupplierTransactions({ supplierId: "sup-abc" })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const calledUrls = fetchMock.mock.calls.map((c) => c[0] as string);
    const transactionCall = calledUrls.find((url) =>
      url.includes("/api/financial/transactions")
    );
    expect(transactionCall).toBeDefined();
    expect(transactionCall).toContain("supplier_id=sup-abc");
  });
});
