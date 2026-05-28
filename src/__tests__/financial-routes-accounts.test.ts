/**
 * @jest-environment node
 *
 * Tests for financial accounts API routes.
 * Covers: GET/POST /api/financial/accounts
 *         GET/PATCH/DELETE /api/financial/accounts/[id]
 */

jest.mock("../../auth", () => ({
  auth: jest.fn().mockImplementation((handler: unknown) => handler),
}));

jest.mock("@/lib/api/fetch-from-backend", () => ({
  fetchFromBackend: jest.fn(),
  BackendHttpError: class BackendHttpError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
      this.name = "BackendHttpError";
    }
  },
  BackendUnauthorizedError: class BackendUnauthorizedError extends Error {
    constructor(message?: string) {
      super(message);
      this.name = "BackendUnauthorizedError";
    }
  },
}));

jest.mock("@/utils/decode-jwt", () => ({
  getAuthDataFromRequest: jest.fn().mockReturnValue({ isValid: true, token: "mock-token" }),
}));

import { GET as listGET, POST } from "@/app/api/financial/accounts/route";
import { DELETE, GET as idGET, PATCH } from "@/app/api/financial/accounts/[id]/route";
import { fetchFromBackend, BackendHttpError } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

const BASE_URL = "http://localhost:3000/api/financial/accounts";

describe("GET /api/financial/accounts", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with accounts list", async () => {
    const mockAccounts = [{ id: "acc-1", name: "Caixa", balance: 100000 }];
    (fetchFromBackend as jest.Mock).mockResolvedValue(mockAccounts);

    const res = await listGET(new Request(BASE_URL));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(mockAccounts);
  });

  it("returns 401 when auth is invalid", async () => {
    (getAuthDataFromRequest as jest.Mock).mockReturnValueOnce({ isValid: false, error: "Token inválido" });

    const res = await listGET(new Request(BASE_URL));

    expect(res.status).toBe(401);
  });

  it("returns 500 when backend throws generic error", async () => {
    (fetchFromBackend as jest.Mock).mockRejectedValue(new Error("Erro interno"));

    const res = await listGET(new Request(BASE_URL));

    expect(res.status).toBe(500);
  });

  it("returns backend status when BackendHttpError is thrown", async () => {
    (fetchFromBackend as jest.Mock).mockRejectedValue(
      new (BackendHttpError as never)(422, "Dados inválidos"),
    );

    const res = await listGET(new Request(BASE_URL));

    expect(res.status).toBe(422);
  });
});

describe("POST /api/financial/accounts", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 201 with created account", async () => {
    const created = { id: "acc-2", name: "Banco", balance: 0 };
    (fetchFromBackend as jest.Mock).mockResolvedValue(created);

    const req = new Request(BASE_URL, {
      method: "POST",
      body: JSON.stringify({ name: "Banco" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual(created);
  });

  it("returns 401 when auth is invalid", async () => {
    (getAuthDataFromRequest as jest.Mock).mockReturnValueOnce({ isValid: false });

    const req = new Request(BASE_URL, { method: "POST", body: JSON.stringify({}) });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });
});

describe("GET /api/financial/accounts/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with single account", async () => {
    const mockAccount = { id: "acc-1", name: "Caixa", balance: 100000 };
    (fetchFromBackend as jest.Mock).mockResolvedValue(mockAccount);

    const res = await idGET(new Request(`${BASE_URL}/acc-1`), { params: { id: "acc-1" } });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe("acc-1");
  });

  it("returns 401 when auth is invalid", async () => {
    (getAuthDataFromRequest as jest.Mock).mockReturnValueOnce({ isValid: false });

    const res = await idGET(new Request(`${BASE_URL}/acc-1`), { params: { id: "acc-1" } });

    expect(res.status).toBe(401);
  });

  it("returns 404 when account is not found", async () => {
    (fetchFromBackend as jest.Mock).mockRejectedValue(
      new (BackendHttpError as never)(404, "Não encontrado"),
    );

    const res = await idGET(new Request(`${BASE_URL}/missing`), { params: { id: "missing" } });

    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/financial/accounts/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with updated account", async () => {
    const updated = { id: "acc-1", name: "Caixa Atualizado" };
    (fetchFromBackend as jest.Mock).mockResolvedValue(updated);

    const req = new Request(`${BASE_URL}/acc-1`, {
      method: "PATCH",
      body: JSON.stringify({ name: "Caixa Atualizado" }),
    });
    const res = await PATCH(req, { params: { id: "acc-1" } });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Caixa Atualizado");
  });

  it("returns 401 when auth is invalid", async () => {
    (getAuthDataFromRequest as jest.Mock).mockReturnValueOnce({ isValid: false });

    const req = new Request(`${BASE_URL}/acc-1`, { method: "PATCH", body: JSON.stringify({}) });
    const res = await PATCH(req, { params: { id: "acc-1" } });

    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/financial/accounts/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 204 no content when account is deleted", async () => {
    (fetchFromBackend as jest.Mock).mockResolvedValue(undefined);

    const res = await DELETE(new Request(`${BASE_URL}/acc-1`), { params: { id: "acc-1" } });

    expect(res.status).toBe(204);
    expect(res.body).toBeNull();
  });

  it("returns 401 when auth is invalid", async () => {
    (getAuthDataFromRequest as jest.Mock).mockReturnValueOnce({ isValid: false });

    const res = await DELETE(new Request(`${BASE_URL}/acc-1`), { params: { id: "acc-1" } });

    expect(res.status).toBe(401);
  });
});
