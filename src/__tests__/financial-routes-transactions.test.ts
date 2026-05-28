/**
 * @jest-environment node
 *
 * Tests for financial transaction API routes.
 * Covers: GET /api/financial/transactions, POST /api/financial/transactions,
 *         GET /api/financial/transactions/[id], PATCH /api/financial/transactions/[id],
 *         DELETE /api/financial/transactions/[id]
 *
 * Mock strategy:
 * - auth() from NextAuth is mocked as a pass-through (handler => handler)
 * - fetchFromBackend is mocked to control backend responses
 * - getAuthDataFromRequest is mocked to control auth state
 */

// Auth wrapper is mocked as a pass-through so the handler receives req directly
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

import { GET as listGET, POST } from "@/app/api/financial/transactions/route";
import { DELETE, GET as idGET, PATCH } from "@/app/api/financial/transactions/[id]/route";
import { fetchFromBackend, BackendHttpError } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

const BASE_URL = "http://localhost:3000/api/financial/transactions";

describe("GET /api/financial/transactions", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with transactions list", async () => {
    const mockTx = [{ id: "tx-1", description: "Consulta", amount: 15000 }];
    (fetchFromBackend as jest.Mock).mockResolvedValue(mockTx);

    const req = new Request(BASE_URL);
    const res = await listGET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(mockTx);
  });

  it("returns 401 when auth is invalid", async () => {
    (getAuthDataFromRequest as jest.Mock).mockReturnValueOnce({
      isValid: false,
      error: "Token inválido",
    });

    const req = new Request(BASE_URL);
    const res = await listGET(req);

    expect(res.status).toBe(401);
  });

  it("returns 500 when backend throws a generic error", async () => {
    (fetchFromBackend as jest.Mock).mockRejectedValue(new Error("Internal server error"));

    const req = new Request(BASE_URL);
    const res = await listGET(req);

    expect(res.status).toBe(500);
  });

  it("returns backend status when BackendHttpError is thrown", async () => {
    (fetchFromBackend as jest.Mock).mockRejectedValue(
      new (BackendHttpError as never)(422, "Parâmetros inválidos"),
    );

    const req = new Request(BASE_URL);
    const res = await listGET(req);

    expect(res.status).toBe(422);
  });
});

describe("POST /api/financial/transactions", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 201 with created transaction", async () => {
    const created = { id: "tx-2", description: "Nova consulta", amount: 20000 };
    (fetchFromBackend as jest.Mock).mockResolvedValue(created);

    const req = new Request(BASE_URL, {
      method: "POST",
      body: JSON.stringify({ description: "Nova consulta", amount: 20000 }),
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual(created);
  });

  it("returns 401 when auth is invalid", async () => {
    (getAuthDataFromRequest as jest.Mock).mockReturnValueOnce({ isValid: false });

    const req = new Request(BASE_URL, {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });
});

describe("GET /api/financial/transactions/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with single transaction", async () => {
    const mockTx = { id: "tx-1", description: "Consulta", amount: 15000 };
    (fetchFromBackend as jest.Mock).mockResolvedValue(mockTx);

    const req = new Request(`${BASE_URL}/tx-1`);
    const ctx = { params: { id: "tx-1" } };
    const res = await idGET(req, ctx);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe("tx-1");
  });

  it("returns 401 when auth is invalid", async () => {
    (getAuthDataFromRequest as jest.Mock).mockReturnValueOnce({ isValid: false });

    const req = new Request(`${BASE_URL}/tx-1`);
    const res = await idGET(req, { params: { id: "tx-1" } });

    expect(res.status).toBe(401);
  });

  it("returns 404 when transaction is not found", async () => {
    (fetchFromBackend as jest.Mock).mockRejectedValue(
      new (BackendHttpError as never)(404, "Não encontrado"),
    );

    const req = new Request(`${BASE_URL}/nonexistent`);
    const res = await idGET(req, { params: { id: "nonexistent" } });

    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/financial/transactions/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with updated transaction", async () => {
    const updated = { id: "tx-1", status: "paid" };
    (fetchFromBackend as jest.Mock).mockResolvedValue(updated);

    const req = new Request(`${BASE_URL}/tx-1`, {
      method: "PATCH",
      body: JSON.stringify({ status: "paid" }),
    });
    const res = await PATCH(req, { params: { id: "tx-1" } });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("paid");
  });

  it("returns 401 when auth is invalid", async () => {
    (getAuthDataFromRequest as jest.Mock).mockReturnValueOnce({ isValid: false });

    const req = new Request(`${BASE_URL}/tx-1`, {
      method: "PATCH",
      body: JSON.stringify({}),
    });
    const res = await PATCH(req, { params: { id: "tx-1" } });

    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/financial/transactions/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 204 no content when transaction is deleted", async () => {
    (fetchFromBackend as jest.Mock).mockResolvedValue(undefined);

    const req = new Request(`${BASE_URL}/tx-1`, { method: "DELETE" });
    const res = await DELETE(req, { params: { id: "tx-1" } });

    expect(res.status).toBe(204);
    expect(res.body).toBeNull();
  });

  it("returns 401 when auth is invalid", async () => {
    (getAuthDataFromRequest as jest.Mock).mockReturnValueOnce({ isValid: false });

    const req = new Request(`${BASE_URL}/tx-1`, { method: "DELETE" });
    const res = await DELETE(req, { params: { id: "tx-1" } });

    expect(res.status).toBe(401);
  });
});
