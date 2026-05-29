/**
 * Tests for system-admin hooks: useAdminAdmins and useAdminClients (with search).
 */
import { renderHook, waitFor } from "@testing-library/react";
import { useAdminAdmins } from "@/hooks/system-admin/use-admin-admins";
import { useAdminClients } from "@/hooks/system-admin/use-admin-clients";

const stableToast = jest.fn();
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: stableToast }),
}));

// ─── useAdminAdmins ────────────────────────────────────────────────────────────

const mockAdminListResponse = {
  admins: [
    {
      id: "admin-1",
      name: "Super",
      surname: "Admin",
      email: "admin@system.com",
      phone: "+55119999",
      verified: true,
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
    },
  ],
  total: 1,
  page: 1,
  page_size: 10,
};

describe("useAdminAdmins", () => {
  beforeEach(() => jest.clearAllMocks());
  afterEach(() => {
    jest.restoreAllMocks();
    stableToast.mockClear();
  });

  it("fetches and returns admins on success", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockAdminListResponse,
    } as Response);

    const { result } = renderHook(() => useAdminAdmins());

    await waitFor(() => expect(result.current.hasFetched).toBe(true));

    expect(result.current.admins).toHaveLength(1);
    expect(result.current.admins[0].id).toBe("admin-1");
    expect(result.current.admins[0].email).toBe("admin@system.com");
    expect(result.current.total).toBe(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets error state when fetch fails", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: "Erro interno" }),
    } as Response);

    const { result } = renderHook(() => useAdminAdmins());

    await waitFor(() => expect(result.current.hasFetched).toBe(true));

    expect(result.current.admins).toHaveLength(0);
    expect(result.current.total).toBe(0);
    expect(result.current.error).not.toBeNull();
    expect(stableToast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "destructive" }),
    );
  });

  it("calls /api/system-admin/admins with page and page_size", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockAdminListResponse,
    } as Response);

    const { result } = renderHook(() =>
      useAdminAdmins({ page: 2, pageSize: 5 }),
    );

    await waitFor(() => expect(result.current.hasFetched).toBe(true));

    const calledUrl = fetchSpy.mock.calls
      .map(c => c[0] as string)
      .find(u => u.includes("/api/system-admin/admins"));
    expect(calledUrl).toBeDefined();
    expect(calledUrl).toContain("page=2");
    expect(calledUrl).toContain("page_size=5");
  });
});

// ─── useAdminClients with search ─────────────────────────────────────────────

const mockClientListResponse = {
  clients: [
    {
      id: "client-1",
      name: "John",
      surname: "Doe",
      email: "john@test.com",
      phone: "+55119999",
      verified: true,
      created_at: "2026-01-01T00:00:00Z",
    },
  ],
  total: 1,
  page: 1,
  page_size: 10,
};

describe("useAdminClients", () => {
  beforeEach(() => jest.clearAllMocks());
  afterEach(() => {
    jest.restoreAllMocks();
    stableToast.mockClear();
  });

  it("fetches and returns clients on success", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockClientListResponse,
    } as Response);

    const { result } = renderHook(() => useAdminClients());

    await waitFor(() => expect(result.current.hasFetched).toBe(true));

    expect(result.current.clients).toHaveLength(1);
    expect(result.current.clients[0].id).toBe("client-1");
    expect(result.current.clients[0].email).toBe("john@test.com");
    expect(result.current.total).toBe(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets error state when fetch fails", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: "Erro interno" }),
    } as Response);

    const { result } = renderHook(() => useAdminClients());

    await waitFor(() => expect(result.current.hasFetched).toBe(true));

    expect(result.current.clients).toHaveLength(0);
    expect(result.current.total).toBe(0);
    expect(result.current.error).not.toBeNull();
    expect(stableToast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "destructive" }),
    );
  });

  it("includes search param in URL when search is provided", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockClientListResponse,
    } as Response);

    const { result } = renderHook(() =>
      useAdminClients({ search: "john@test.com" }),
    );

    await waitFor(() => expect(result.current.hasFetched).toBe(true));

    const calledUrl = fetchSpy.mock.calls
      .map(c => c[0] as string)
      .find(u => u.includes("/api/system-admin/clients"));
    expect(calledUrl).toBeDefined();
    expect(calledUrl).toContain("search=john%40test.com");
  });

  it("does NOT include search param when search is empty", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockClientListResponse,
    } as Response);

    const { result } = renderHook(() =>
      useAdminClients({ search: "" }),
    );

    await waitFor(() => expect(result.current.hasFetched).toBe(true));

    const calledUrl = fetchSpy.mock.calls
      .map(c => c[0] as string)
      .find(u => u.includes("/api/system-admin/clients"));
    expect(calledUrl).toBeDefined();
    expect(calledUrl).not.toContain("search=");
  });
});
