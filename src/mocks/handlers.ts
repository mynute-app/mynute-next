import { http, HttpResponse } from "msw";
import {
  mockCompany,
  mockBranchListResponse,
  mockBranch1,
  mockBranchAppointmentsResponse,
  mockBlockedDates,
  mockServiceListResponse,
  mockEmployeeListResponse,
  mockEmployee1,
  mockCompanyClientsResponse,
  mockCompanySuppliersResponse,
  mockUser,
  mockFinancialAccounts,
  mockFinancialAccountsResponse,
  mockFinancialCategories,
  mockFinancialCategoriesResponse,
  mockFinancialTransactions,
  mockFinancialTransactionsResponse,
  mockFinancialBudgets,
  mockFinancialBudgetsResponse,
  mockClientQuotes,
  mockClientQuotesResponse,
  mockCashFlowReport,
  mockFinancialSummary,
  mockDREReport,
  mockReceivablesReport,
  mockPayablesReport,
  mockAppointmentsRevenueReport,
  mockServiceRankingReport,
  mockServiceTrendReport,
  mockServiceByPeriodReport,
  mockServiceWeekdayPatternReport,
} from "./data";

/**
 * Helper: detect if a request wants the "empty" or "error" state via query param.
 * Usage in dev-preview URLs: /dev-preview/appointments?state=empty
 * The state is forwarded to all API calls via a custom header set by MockProvider.
 */
const getPreviewState = (request: Request): "populated" | "empty" | "error" => {
  // Check custom header set by MockProvider
  const headerState = request.headers.get("x-preview-state");
  if (headerState === "empty") return "empty";
  if (headerState === "error") return "error";
  return "populated";
};

/**
 * All MSW request handlers for internal Next.js API routes.
 * These intercept fetch() calls made by hooks in both:
 *  - Jest (via msw/node setupServer)
 *  - Browser (via msw service worker in dev-preview pages)
 */
export const handlers = [
  // ─── Company ──────────────────────────────────────────────────────────────

  http.get("/api/company", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "error") return HttpResponse.json({ message: "Server error" }, { status: 500 });
    return HttpResponse.json(mockCompany);
  }),

  http.get("/api/company/name/:name", () => {
    return HttpResponse.json({ available: true });
  }),

  http.get("/api/company/subdomain/:subdomain", () => {
    return HttpResponse.json({ available: true });
  }),

  http.get("/api/company/:company_id/design/colors", () => {
    return HttpResponse.json({
      primary: "#7c3aed",
      secondary: "#a78bfa",
      tertiary: "#ede9fe",
      quaternary: "#4c1d95",
    });
  }),

  http.get("/api/company/design/images", () => {
    return HttpResponse.json(mockCompany.design?.images ?? {});
  }),

  http.patch("/api/company", () => {
    return HttpResponse.json(mockCompany);
  }),

  // ─── Branches ─────────────────────────────────────────────────────────────

  http.get("/api/branch", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "error") return HttpResponse.json({ message: "Server error" }, { status: 500 });
    if (state === "empty") return HttpResponse.json({ branches: [], total: 0, page: 1, page_size: 20 });
    return HttpResponse.json(mockBranchListResponse);
  }),

  http.get("/api/branch/:branch_id", ({ params }) => {
    const branch = mockBranchListResponse.branches.find(
      (b) => b.id === params.branch_id
    );
    return HttpResponse.json(branch ?? mockBranch1);
  }),

  http.get("/api/branch/:branch_id/appointments", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "error") return HttpResponse.json({ message: "Server error" }, { status: 500 });
    if (state === "empty") {
      return HttpResponse.json({
        appointments: [],
        client_info: [],
        service_info: [],
        employee_info: [],
        total_count: 0,
        page: 1,
        page_size: 10,
      });
    }
    return HttpResponse.json(mockBranchAppointmentsResponse);
  }),

  http.get("/api/branch/:branch_id/blocked-dates", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "empty") return HttpResponse.json([]);
    return HttpResponse.json(mockBlockedDates);
  }),

  http.get("/api/branch/:branch_id/work_schedule", () => {
    return HttpResponse.json({ work_schedule: [] });
  }),

  http.post("/api/branch", () => {
    return HttpResponse.json(mockBranch1, { status: 201 });
  }),

  http.patch("/api/branch/:branch_id", () => {
    return HttpResponse.json(mockBranch1);
  }),

  // ─── Services ─────────────────────────────────────────────────────────────

  http.get("/api/service", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "error") return HttpResponse.json({ message: "Server error" }, { status: 500 });
    if (state === "empty") return HttpResponse.json({ services: [], total: 0, page: 1, page_size: 20 });
    return HttpResponse.json(mockServiceListResponse);
  }),

  http.get("/api/service/:id", () => {
    return HttpResponse.json(mockServiceListResponse.services[0]);
  }),

  http.post("/api/service", () => {
    return HttpResponse.json(mockServiceListResponse.services[0], { status: 201 });
  }),

  http.patch("/api/service/:id", () => {
    return HttpResponse.json(mockServiceListResponse.services[0]);
  }),

  http.delete("/api/service/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // ─── Employees ────────────────────────────────────────────────────────────

  http.get("/api/employee", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "error") return HttpResponse.json({ message: "Server error" }, { status: 500 });
    if (state === "empty") return HttpResponse.json({ employees: [], total: 0, page: 1, page_size: 20 });
    return HttpResponse.json(mockEmployeeListResponse);
  }),

  http.get("/api/employee/:employee_id", () => {
    return HttpResponse.json(mockEmployee1);
  }),

  http.get("/api/employee/other/:id", () => {
    return HttpResponse.json(mockEmployee1);
  }),

  http.get("/api/employee/:employee_id/appointments", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "empty") {
      return HttpResponse.json({ appointments: [], total_count: 0, page: 1, page_size: 10 });
    }
    return HttpResponse.json(mockBranchAppointmentsResponse);
  }),

  http.get("/api/employee/:employee_id/blocked-dates", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "empty") return HttpResponse.json([]);
    return HttpResponse.json(mockBlockedDates);
  }),

  http.get("/api/employee/:employee_id/work_schedule", () => {
    return HttpResponse.json({ work_schedule: [] });
  }),

  http.post("/api/employee", () => {
    return HttpResponse.json(mockEmployee1, { status: 201 });
  }),

  http.patch("/api/employee/:employee_id", () => {
    return HttpResponse.json(mockEmployee1);
  }),

  // ─── Appointments ─────────────────────────────────────────────────────────

  http.get("/api/appointment/:id", () => {
    return HttpResponse.json(mockBranchAppointmentsResponse.appointments[0]);
  }),

  http.post("/api/appointment", () => {
    return HttpResponse.json(mockBranchAppointmentsResponse.appointments[0], { status: 201 });
  }),

  http.patch("/api/appointment/:id", () => {
    return HttpResponse.json(mockBranchAppointmentsResponse.appointments[0]);
  }),

  http.post("/api/appointment/:id/approve", () => {
    return HttpResponse.json({ success: true });
  }),

  // ─── Company Clients ──────────────────────────────────────────────────────

  http.get("/api/company-client", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "error") return HttpResponse.json({ message: "Server error" }, { status: 500 });
    if (state === "empty") return HttpResponse.json({ clients: [], total: 0, page: 1, page_size: 20 });
    return HttpResponse.json(mockCompanyClientsResponse);
  }),

  http.get("/api/company-client/:id", () => {
    return HttpResponse.json(mockCompanyClientsResponse.clients[0]);
  }),

  http.get("/api/company-client/:id/appointments", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "empty") return HttpResponse.json({ appointments: [], total_count: 0 });
    return HttpResponse.json(mockBranchAppointmentsResponse);
  }),

  http.post("/api/company-client", () => {
    return HttpResponse.json(mockCompanyClientsResponse.clients[0], { status: 201 });
  }),

  http.delete("/api/company-client/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // ─── Company Suppliers ──────────────────────────────────────────────────────

  http.get("/api/company-supplier", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "error") return HttpResponse.json({ message: "Server error" }, { status: 500 });
    if (state === "empty") return HttpResponse.json({ company_suppliers: [], total: 0, page: 1, page_size: 20 });
    return HttpResponse.json(mockCompanySuppliersResponse);
  }),

  http.get("/api/company-supplier/:id", ({ params }) => {
    const { id } = params as { id: string };
    const supplier = mockCompanySuppliersResponse.company_suppliers.find((s) => s.id === id)
      ?? mockCompanySuppliersResponse.company_suppliers[0];
    return HttpResponse.json(supplier);
  }),

  http.post("/api/company-supplier", () => {
    return HttpResponse.json(mockCompanySuppliersResponse.company_suppliers[0], { status: 201 });
  }),

  http.patch("/api/company-supplier/:id", () => {
    return HttpResponse.json(mockCompanySuppliersResponse.company_suppliers[0]);
  }),

  http.delete("/api/company-supplier/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.post("/api/company-supplier/merge", () => {
    return HttpResponse.json({
      message: "Suppliers merged successfully",
      kept_id: "00000000-0000-0000-0000-000000000001",
      deleted_id: "00000000-0000-0000-0000-000000000002",
    });
  }),

  // ─── Client (public) ──────────────────────────────────────────────────────

  http.get("/api/client", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "empty") return HttpResponse.json({ clients: [], total: 0 });
    return HttpResponse.json(mockCompanyClientsResponse);
  }),

  http.get("/api/client/email/:email", () => {
    return HttpResponse.json(mockCompanyClientsResponse.clients[0]);
  }),

  // ─── User Profile ─────────────────────────────────────────────────────────

  http.get("/api/user", () => {
    return HttpResponse.json(mockUser);
  }),

  http.patch("/api/user", () => {
    return HttpResponse.json(mockUser);
  }),

  // ─── Subdomain ────────────────────────────────────────────────────────────

  http.get("/api/subdomain", () => {
    return HttpResponse.json({ subdomain: "beleza-total", available: true });
  }),

  // ─── Work Schedule ────────────────────────────────────────────────────────

  http.get("/api/work_schedule/:id", () => {
    return HttpResponse.json({ id: "ws-001", work_ranges: [] });
  }),

  http.patch("/api/work_schedule/:id", () => {
    return HttpResponse.json({ id: "ws-001", work_ranges: [] });
  }),

  // ─── Service Availability ─────────────────────────────────────────────────

  http.get("/api/service/:id/availability", () => {
    return HttpResponse.json({ slots: [], available: true });
  }),

  // ─── Financial — Accounts ─────────────────────────────────────────────────

  http.get("/api/financial/accounts", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "error") return HttpResponse.json({ message: "Server error" }, { status: 500 });
    if (state === "empty") return HttpResponse.json([]);
    return HttpResponse.json(mockFinancialAccounts);
  }),

  http.get("/api/financial/accounts/:id", ({ params }) => {
    const account = mockFinancialAccountsResponse.accounts.find((a) => a.id === params.id);
    return HttpResponse.json(account ?? mockFinancialAccountsResponse.accounts[0]);
  }),

  http.post("/api/financial/accounts", () => {
    return HttpResponse.json(mockFinancialAccountsResponse.accounts[0], { status: 201 });
  }),

  http.put("/api/financial/accounts/:id", () => {
    return HttpResponse.json(mockFinancialAccountsResponse.accounts[0]);
  }),

  http.delete("/api/financial/accounts/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // ─── Financial — Categories ───────────────────────────────────────────────

  http.get("/api/financial/categories", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "error") return HttpResponse.json({ message: "Server error" }, { status: 500 });
    if (state === "empty") return HttpResponse.json([]);
    return HttpResponse.json(mockFinancialCategories);
  }),

  http.get("/api/financial/categories/:id", () => {
    return HttpResponse.json(mockFinancialCategoriesResponse.categories[0]);
  }),

  http.post("/api/financial/categories", () => {
    return HttpResponse.json(mockFinancialCategoriesResponse.categories[0], { status: 201 });
  }),

  http.put("/api/financial/categories/:id", () => {
    return HttpResponse.json(mockFinancialCategoriesResponse.categories[0]);
  }),

  http.delete("/api/financial/categories/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // ─── Financial — Transactions ─────────────────────────────────────────────

  http.get("/api/financial/transactions", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "error") return HttpResponse.json({ message: "Server error" }, { status: 500 });
    if (state === "empty") return HttpResponse.json([]);
    return HttpResponse.json(mockFinancialTransactions);
  }),

  http.get("/api/financial/transactions/:id", ({ params }) => {
    const txn = mockFinancialTransactions.find((t) => t.id === params.id);
    return HttpResponse.json(txn ?? mockFinancialTransactions[0]);
  }),

  http.post("/api/financial/transactions", () => {
    return HttpResponse.json(mockFinancialTransactions[0], { status: 201 });
  }),

  http.put("/api/financial/transactions/:id", () => {
    return HttpResponse.json(mockFinancialTransactions[0]);
  }),

  http.delete("/api/financial/transactions/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.post("/api/financial/transactions/:id/pay", () => {
    return HttpResponse.json({ ...mockFinancialTransactions[0], status: "paid", payment_date: "2026-05-26" });
  }),

  // ─── Financial — Budgets ──────────────────────────────────────────────────

  http.get("/api/financial/budgets", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "error") return HttpResponse.json({ message: "Server error" }, { status: 500 });
    if (state === "empty") return HttpResponse.json([]);
    return HttpResponse.json(mockFinancialBudgets);
  }),

  http.get("/api/financial/budgets/:id", () => {
    return HttpResponse.json(mockFinancialBudgetsResponse.budgets[0]);
  }),

  http.post("/api/financial/budgets", () => {
    return HttpResponse.json(mockFinancialBudgetsResponse.budgets[0], { status: 201 });
  }),

  http.put("/api/financial/budgets/:id", () => {
    return HttpResponse.json(mockFinancialBudgetsResponse.budgets[0]);
  }),

  http.delete("/api/financial/budgets/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // ─── Financial — Quotes ───────────────────────────────────────────────────

  http.get("/api/financial/quotes", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "error") return HttpResponse.json({ message: "Server error" }, { status: 500 });
    if (state === "empty") return HttpResponse.json([]);
    return HttpResponse.json(mockClientQuotes);
  }),

  http.get("/api/financial/quotes/:id", ({ params }) => {
    const quote = mockClientQuotes.find((q) => q.id === params.id);
    return HttpResponse.json(quote ?? mockClientQuotes[0]);
  }),

  http.post("/api/financial/quotes", () => {
    return HttpResponse.json(mockClientQuotes[0], { status: 201 });
  }),

  http.put("/api/financial/quotes/:id", () => {
    return HttpResponse.json(mockClientQuotes[0]);
  }),

  http.delete("/api/financial/quotes/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch("/api/financial/quotes/:id/status", () => {
    return HttpResponse.json({ ...mockClientQuotes[0], status: "approved" });
  }),

  // ─── Financial — Reports ──────────────────────────────────────────────────

  http.get("/api/financial/reports/cashflow", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "error") return HttpResponse.json({ message: "Server error" }, { status: 500 });
    if (state === "empty") return HttpResponse.json({ total_income: 0, total_expense: 0, net: 0, entries: [] });
    return HttpResponse.json(mockCashFlowReport);
  }),

  http.get("/api/financial/reports/dre", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "error") return HttpResponse.json({ message: "Server error" }, { status: 500 });
    if (state === "empty") return HttpResponse.json({ gross_revenue: 0, total_expenses: 0, net_profit: 0, period_start: "", period_end: "" });
    return HttpResponse.json(mockDREReport);
  }),

  http.get("/api/financial/reports/receivables", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "error") return HttpResponse.json({ message: "Server error" }, { status: 500 });
    if (state === "empty") return HttpResponse.json({ total: 0, items: [] });
    return HttpResponse.json(mockReceivablesReport);
  }),

  http.get("/api/financial/reports/payables", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "error") return HttpResponse.json({ message: "Server error" }, { status: 500 });
    if (state === "empty") return HttpResponse.json({ total: 0, items: [] });
    return HttpResponse.json(mockPayablesReport);
  }),

  http.get("/api/financial/reports/appointments-revenue", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "error") return HttpResponse.json({ message: "Server error" }, { status: 500 });
    if (state === "empty") return HttpResponse.json({ total_revenue: 0, appointment_count: 0, entries: [] });
    return HttpResponse.json(mockAppointmentsRevenueReport);
  }),

  http.get("/api/financial/reports/services/ranking", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "error") return HttpResponse.json({ message: "Server error" }, { status: 500 });
    if (state === "empty") return HttpResponse.json({ start_date: "", end_date: "", sort_by: "revenue", items: [], total_revenue: 0, total_appointments: 0 });
    return HttpResponse.json(mockServiceRankingReport);
  }),

  http.get("/api/financial/reports/services/trend", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "error") return HttpResponse.json({ message: "Server error" }, { status: 500 });
    if (state === "empty") return HttpResponse.json({ start_date: "", end_date: "", granularity: "week", service_id: null, service_name: "", points: [] });
    return HttpResponse.json(mockServiceTrendReport);
  }),

  http.get("/api/financial/reports/services/by-period", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "error") return HttpResponse.json({ message: "Server error" }, { status: 500 });
    if (state === "empty") return HttpResponse.json({ granularity: "month", periods: [], services: [] });
    return HttpResponse.json(mockServiceByPeriodReport);
  }),

  http.get("/api/financial/reports/services/weekday-pattern", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "error") return HttpResponse.json({ message: "Server error" }, { status: 500 });
    if (state === "empty") return HttpResponse.json({ items: [] });
    return HttpResponse.json(mockServiceWeekdayPatternReport);
  }),

  // ─── Financial — Summary ──────────────────────────────────────────────────

  http.get("/api/financial/summary", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "error") return HttpResponse.json({ message: "Server error" }, { status: 500 });
    if (state === "empty") return HttpResponse.json({ monthly_income: 0, monthly_expense: 0, net_balance: 0, pending_receivables: 0 });
    return HttpResponse.json(mockFinancialSummary);
  }),

  // ─── System Admin — WhatsApp ───────────────────────────────────────────────

  http.get("/api/admin/whatsapp/status", ({ request }) => {
    const state = getPreviewState(request);
    // error state: return connected=false so the QR code endpoint gets polled and shows its error
    if (state === "error") return HttpResponse.json({ connected: false, status: "error" });
    if (state === "empty") return HttpResponse.json({ connected: false, status: "disconnected" });
    return HttpResponse.json({ connected: true, status: "open" });
  }),

  http.get("/api/admin/whatsapp/qr-code", ({ request }) => {
    const state = getPreviewState(request);
    if (state === "error") return HttpResponse.json({ error: "Erro ao buscar QR code" }, { status: 500 });
    // Returns a mock QR code image (shown when status.connected === false)
    return HttpResponse.json({
      qrCode:
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0id2hpdGUiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+PHRleHQgeD0iMTAwIiB5PSI5MCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZmlsbD0iIzMzMyI+UVIgQ29kZTwvdGV4dD48dGV4dCB4PSIxMDAiIHk9IjExMCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZmlsbD0iIzY2NiI+KG1vY2spPC90ZXh0Pjwvc3ZnPg==",
    });
  }),

  http.post("/api/admin/whatsapp/disconnect", () => {
    return HttpResponse.json({ success: true });
  }),
];
