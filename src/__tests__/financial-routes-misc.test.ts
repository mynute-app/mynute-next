/**
 * @jest-environment node
 *
 * Tests for financial misc API routes: budgets, categories, quotes (route + [id]).
 * Covers: GET/POST /api/financial/budgets
 *         GET/POST /api/financial/categories
 *         GET/POST /api/financial/quotes
 *         GET/PATCH/DELETE /api/financial/quotes/[id]
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

import { GET as budgetsGET, POST as budgetsPOST } from "@/app/api/financial/budgets/route";
import { GET as categoriesGET, POST as categoriesPOST } from "@/app/api/financial/categories/route";
import { GET as quotesListGET, POST as quotesPOST } from "@/app/api/financial/quotes/route";
import {
  GET as quoteIdGET,
  PATCH as quoteIdPATCH,
  DELETE as quoteIdDELETE,
} from "@/app/api/financial/quotes/[id]/route";
import { fetchFromBackend, BackendHttpError } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

// ─── Budgets ────────────────────────────────────────────────────────────────

const BUDGETS_URL = "http://localhost:3000/api/financial/budgets";

describe("GET /api/financial/budgets", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with budgets list", async () => {
    const mockBudgets = [{ id: "bud-1", name: "Q1 2025", amount: 500000 }];
    (fetchFromBackend as jest.Mock).mockResolvedValue(mockBudgets);

    const res = await budgetsGET(new Request(BUDGETS_URL));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(mockBudgets);
  });

  it("returns 401 when auth is invalid", async () => {
    (getAuthDataFromRequest as jest.Mock).mockReturnValueOnce({ isValid: false });

    const res = await budgetsGET(new Request(BUDGETS_URL));

    expect(res.status).toBe(401);
  });

  it("returns 500 when backend throws generic error", async () => {
    (fetchFromBackend as jest.Mock).mockRejectedValue(new Error("Erro interno"));

    const res = await budgetsGET(new Request(BUDGETS_URL));

    expect(res.status).toBe(500);
  });
});

describe("POST /api/financial/budgets", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 201 with created budget", async () => {
    const created = { id: "bud-2", name: "Q2 2025" };
    (fetchFromBackend as jest.Mock).mockResolvedValue(created);

    const req = new Request(BUDGETS_URL, { method: "POST", body: JSON.stringify({ name: "Q2 2025" }) });
    const res = await budgetsPOST(req);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual(created);
  });

  it("returns 401 when auth is invalid", async () => {
    (getAuthDataFromRequest as jest.Mock).mockReturnValueOnce({ isValid: false });

    const req = new Request(BUDGETS_URL, { method: "POST", body: JSON.stringify({}) });
    const res = await budgetsPOST(req);

    expect(res.status).toBe(401);
  });
});

// ─── Categories ─────────────────────────────────────────────────────────────

const CATEGORIES_URL = "http://localhost:3000/api/financial/categories";

describe("GET /api/financial/categories", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with categories list", async () => {
    const mockCategories = [{ id: "cat-1", name: "Consultas", type: "income" }];
    (fetchFromBackend as jest.Mock).mockResolvedValue(mockCategories);

    const res = await categoriesGET(new Request(CATEGORIES_URL));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(mockCategories);
  });

  it("returns 401 when auth is invalid", async () => {
    (getAuthDataFromRequest as jest.Mock).mockReturnValueOnce({ isValid: false });

    const res = await categoriesGET(new Request(CATEGORIES_URL));

    expect(res.status).toBe(401);
  });

  it("returns 500 when backend throws generic error", async () => {
    (fetchFromBackend as jest.Mock).mockRejectedValue(new Error("Erro interno"));

    const res = await categoriesGET(new Request(CATEGORIES_URL));

    expect(res.status).toBe(500);
  });
});

describe("POST /api/financial/categories", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 201 with created category", async () => {
    const created = { id: "cat-2", name: "Medicamentos", type: "expense" };
    (fetchFromBackend as jest.Mock).mockResolvedValue(created);

    const req = new Request(CATEGORIES_URL, {
      method: "POST",
      body: JSON.stringify({ name: "Medicamentos", type: "expense" }),
    });
    const res = await categoriesPOST(req);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual(created);
  });

  it("returns 401 when auth is invalid", async () => {
    (getAuthDataFromRequest as jest.Mock).mockReturnValueOnce({ isValid: false });

    const req = new Request(CATEGORIES_URL, { method: "POST", body: JSON.stringify({}) });
    const res = await categoriesPOST(req);

    expect(res.status).toBe(401);
  });
});

// ─── Quotes ──────────────────────────────────────────────────────────────────

const QUOTES_URL = "http://localhost:3000/api/financial/quotes";

describe("GET /api/financial/quotes", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with quotes list", async () => {
    const mockQuotes = [{ id: "q-1", client_name: "João", total: 30000, status: "pending" }];
    (fetchFromBackend as jest.Mock).mockResolvedValue(mockQuotes);

    const res = await quotesListGET(new Request(QUOTES_URL));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(mockQuotes);
  });

  it("returns 401 when auth is invalid", async () => {
    (getAuthDataFromRequest as jest.Mock).mockReturnValueOnce({ isValid: false });

    const res = await quotesListGET(new Request(QUOTES_URL));

    expect(res.status).toBe(401);
  });

  it("returns 500 when backend throws generic error", async () => {
    (fetchFromBackend as jest.Mock).mockRejectedValue(new Error("Erro interno"));

    const res = await quotesListGET(new Request(QUOTES_URL));

    expect(res.status).toBe(500);
  });
});

describe("POST /api/financial/quotes", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 201 with created quote", async () => {
    const created = { id: "q-2", client_name: "Maria", total: 50000, status: "pending" };
    (fetchFromBackend as jest.Mock).mockResolvedValue(created);

    const req = new Request(QUOTES_URL, {
      method: "POST",
      body: JSON.stringify({ client_name: "Maria", total: 50000 }),
    });
    const res = await quotesPOST(req);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual(created);
  });

  it("returns 401 when auth is invalid", async () => {
    (getAuthDataFromRequest as jest.Mock).mockReturnValueOnce({ isValid: false });

    const req = new Request(QUOTES_URL, { method: "POST", body: JSON.stringify({}) });
    const res = await quotesPOST(req);

    expect(res.status).toBe(401);
  });
});

// ─── Quotes [id] ─────────────────────────────────────────────────────────────

describe("GET /api/financial/quotes/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with single quote", async () => {
    const mockQuote = { id: "q-1", client_name: "João", total: 30000 };
    (fetchFromBackend as jest.Mock).mockResolvedValue(mockQuote);

    const res = await quoteIdGET(new Request(`${QUOTES_URL}/q-1`), { params: { id: "q-1" } });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe("q-1");
  });

  it("returns 401 when auth is invalid", async () => {
    (getAuthDataFromRequest as jest.Mock).mockReturnValueOnce({ isValid: false });

    const res = await quoteIdGET(new Request(`${QUOTES_URL}/q-1`), { params: { id: "q-1" } });

    expect(res.status).toBe(401);
  });

  it("returns 404 when quote is not found", async () => {
    (fetchFromBackend as jest.Mock).mockRejectedValue(
      new (BackendHttpError as never)(404, "Não encontrado"),
    );

    const res = await quoteIdGET(new Request(`${QUOTES_URL}/missing`), { params: { id: "missing" } });

    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/financial/quotes/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with updated quote status", async () => {
    const updated = { id: "q-1", status: "approved" };
    (fetchFromBackend as jest.Mock).mockResolvedValue(updated);

    const req = new Request(`${QUOTES_URL}/q-1`, {
      method: "PATCH",
      body: JSON.stringify({ status: "approved" }),
    });
    const res = await quoteIdPATCH(req, { params: { id: "q-1" } });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("approved");
  });

  it("returns 401 when auth is invalid", async () => {
    (getAuthDataFromRequest as jest.Mock).mockReturnValueOnce({ isValid: false });

    const req = new Request(`${QUOTES_URL}/q-1`, { method: "PATCH", body: JSON.stringify({}) });
    const res = await quoteIdPATCH(req, { params: { id: "q-1" } });

    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/financial/quotes/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 204 no content when quote is deleted", async () => {
    (fetchFromBackend as jest.Mock).mockResolvedValue(undefined);

    const res = await quoteIdDELETE(new Request(`${QUOTES_URL}/q-1`), { params: { id: "q-1" } });

    expect(res.status).toBe(204);
    expect(res.body).toBeNull();
  });

  it("returns 401 when auth is invalid", async () => {
    (getAuthDataFromRequest as jest.Mock).mockReturnValueOnce({ isValid: false });

    const res = await quoteIdDELETE(new Request(`${QUOTES_URL}/q-1`), { params: { id: "q-1" } });

    expect(res.status).toBe(401);
  });
});
