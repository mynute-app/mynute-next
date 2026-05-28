/**
 * Tests for financial report hooks (CashFlow, DRE, Receivables, Payables, AppointmentsRevenue).
 * All use the shared useReportData pattern.
 */
import { renderHook, waitFor } from "@testing-library/react";
import {
  useAppointmentsRevenueReport,
  useCashFlowReport,
  useDREReport,
  usePayablesReport,
  useReceivablesReport,
} from "@/hooks/financial/use-financial-reports";

jest.mock("@/hooks/financial/use-financial-api", () => ({
  fetchCashFlowReport: jest.fn(),
  fetchDREReport: jest.fn(),
  fetchReceivablesReport: jest.fn(),
  fetchPayablesReport: jest.fn(),
  fetchAppointmentsRevenueReport: jest.fn(),
}));

import * as api from "@/hooks/financial/use-financial-api";

describe("useCashFlowReport", () => {
  beforeEach(() => jest.clearAllMocks());

  it("starts with null data and loading=false, then populates on success", async () => {
    const mockReport = { total_income: 100000, total_expense: 40000, net: 60000, months: [] };
    (api.fetchCashFlowReport as jest.Mock).mockResolvedValue(mockReport);

    const { result } = renderHook(() => useCashFlowReport({ year: "2026" }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockReport);
    expect(result.current.error).toBeNull();
    // Verify params are actually forwarded to the API call
    expect(api.fetchCashFlowReport).toHaveBeenCalledWith({ year: "2026" });
  });

  it("sets error when fetch fails", async () => {
    (api.fetchCashFlowReport as jest.Mock).mockRejectedValue(new Error("Sem dados"));

    const { result } = renderHook(() => useCashFlowReport());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Sem dados");
    expect(result.current.data).toBeNull();
  });

  it("uses generic error message for non-Error throws", async () => {
    (api.fetchCashFlowReport as jest.Mock).mockRejectedValue("raw string");

    const { result } = renderHook(() => useCashFlowReport());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Erro ao buscar relatório");
  });

  it("does not re-fetch when params reference changes but values are identical", async () => {
    (api.fetchCashFlowReport as jest.Mock).mockResolvedValue({ months: [] });

    const { rerender } = renderHook(
      ({ p }) => useCashFlowReport(p),
      { initialProps: { p: { year: "2026" } } },
    );

    await waitFor(() =>
      expect(api.fetchCashFlowReport).toHaveBeenCalledTimes(1),
    );

    rerender({ p: { year: "2026" } });

    expect(api.fetchCashFlowReport).toHaveBeenCalledTimes(1);
  });
});

describe("useDREReport", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns DRE data on success", async () => {
    const mockDRE = { gross_revenue: 50000, net_profit: 20000, categories: [] };
    (api.fetchDREReport as jest.Mock).mockResolvedValue(mockDRE);

    const { result } = renderHook(() => useDREReport({ month: "2026-01" }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockDRE);
    expect(result.current.error).toBeNull();
    // Verify params are actually forwarded to the API call
    expect(api.fetchDREReport).toHaveBeenCalledWith({ month: "2026-01" });
  });

  it("sets error when DRE fetch fails", async () => {
    (api.fetchDREReport as jest.Mock).mockRejectedValue(new Error("Periodo inválido"));

    const { result } = renderHook(() => useDREReport());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Periodo inválido");
  });
});

describe("useReceivablesReport", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns receivables data on success", async () => {
    const mockReceivables = { total: 10000, items: [] };
    (api.fetchReceivablesReport as jest.Mock).mockResolvedValue(mockReceivables);

    const { result } = renderHook(() => useReceivablesReport());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockReceivables);
  });

  it("sets error when receivables fetch fails", async () => {
    (api.fetchReceivablesReport as jest.Mock).mockRejectedValue(new Error("Falha"));

    const { result } = renderHook(() => useReceivablesReport());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Falha");
  });
});

describe("usePayablesReport", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns payables data on success", async () => {
    const mockPayables = { total: 5000, items: [] };
    (api.fetchPayablesReport as jest.Mock).mockResolvedValue(mockPayables);

    const { result } = renderHook(() => usePayablesReport());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockPayables);
  });

  it("sets error when payables fetch fails", async () => {
    (api.fetchPayablesReport as jest.Mock).mockRejectedValue(new Error("Timeout"));

    const { result } = renderHook(() => usePayablesReport());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Timeout");
  });
});

describe("useAppointmentsRevenueReport", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns appointments revenue on success", async () => {
    const mockRevenue = { total: 75000, appointments: [] };
    (api.fetchAppointmentsRevenueReport as jest.Mock).mockResolvedValue(mockRevenue);

    const { result } = renderHook(() => useAppointmentsRevenueReport({ month: "2026-06" }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockRevenue);
  });

  it("sets error when revenue report fetch fails", async () => {
    (api.fetchAppointmentsRevenueReport as jest.Mock).mockRejectedValue(
      new Error("Acesso negado"),
    );

    const { result } = renderHook(() => useAppointmentsRevenueReport());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Acesso negado");
  });
});
