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
  mockUser,
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
];
