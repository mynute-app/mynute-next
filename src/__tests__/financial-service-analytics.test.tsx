/**
 * @jest-environment jsdom
 *
 * Tests for the ServiceSalesAnalyticsPage component.
 * Verifies rendering of ranking, trend and weekday pattern charts
 * with proper loading, error, and empty states.
 */

// URL.revokeObjectURL polyfill
if (typeof URL.revokeObjectURL === "undefined") {
  Object.defineProperty(URL, "revokeObjectURL", { value: () => {} });
}

// ── Mock recharts ──────────────────────────────────────────────────────────────
jest.mock("recharts", () => {
  const React = require("react");
  const mockComponent = (name: string) => {
    const MockComp = ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
      React.createElement("div", { "data-testid": `recharts-${name}`, ...props }, children);
    MockComp.displayName = name;
    return MockComp;
  };
  return {
    BarChart: mockComponent("BarChart"),
    LineChart: mockComponent("LineChart"),
    Bar: mockComponent("Bar"),
    Line: mockComponent("Line"),
    XAxis: mockComponent("XAxis"),
    YAxis: mockComponent("YAxis"),
    CartesianGrid: mockComponent("CartesianGrid"),
    Tooltip: mockComponent("Tooltip"),
    Legend: mockComponent("Legend"),
    ResponsiveContainer: ({ children }: React.PropsWithChildren<unknown>) =>
      React.createElement("div", { "data-testid": "recharts-ResponsiveContainer" }, children),
  };
});

// ── Mock hooks ────────────────────────────────────────────────────────────────
const mockUseServiceRankingReport = jest.fn();
const mockUseServiceTrendReport = jest.fn();
const mockUseServiceWeekdayPatternReport = jest.fn();
const mockRefetch = jest.fn();

const mockUseServiceByPeriodReport = jest.fn();

jest.mock("@/hooks/financial/use-financial-reports", () => ({
  useServiceRankingReport: (...args: unknown[]) => mockUseServiceRankingReport(...args),
  useServiceTrendReport: (...args: unknown[]) => mockUseServiceTrendReport(...args),
  useServiceWeekdayPatternReport: (...args: unknown[]) => mockUseServiceWeekdayPatternReport(...args),
  useServiceByPeriodReport: (...args: unknown[]) => mockUseServiceByPeriodReport(...args),
}));

jest.mock("@/app/dashboard/financeiro/_components/date-range-filter", () => ({
  DateRangeFilter: () => <div data-testid="date-range-filter" />,
}));

// ── Test data ─────────────────────────────────────────────────────────────────
const mockRankingData = {
  start_date: "2026-01-01",
  end_date: "2026-01-31",
  sort_by: "revenue",
  total_revenue: 5000,
  total_appointments: 10,
  items: [
    {
      service_id: "s1",
      service_name: "Corte de Cabelo",
      appointment_count: 6,
      total_revenue: 3000,
      avg_revenue_per_appointment: 500,
      revenue_share_percent: 60.0,
    },
    {
      service_id: "s2",
      service_name: "Barba",
      appointment_count: 4,
      total_revenue: 2000,
      avg_revenue_per_appointment: 500,
      revenue_share_percent: 40.0,
    },
  ],
};

const mockTrendData = {
  start_date: "2026-01-01",
  end_date: "2026-01-31",
  granularity: "week",
  service_id: null,
  service_name: "",
  points: [
    { period_label: "Semana 1", period_start: "2026-01-01", appointment_count: 5, total_revenue: 2500 },
    { period_label: "Semana 2", period_start: "2026-01-08", appointment_count: 5, total_revenue: 2500 },
  ],
};

const mockWeekdayData = {
  items: [
    {
      service_id: "s1",
      service_name: "Corte de Cabelo",
      by_weekday: [
        { weekday: 1, weekday_name: "Segunda", count: 3, revenue: 1500 },
        { weekday: 2, weekday_name: "Terça", count: 2, revenue: 1000 },
      ],
    },
  ],
};

const mockByPeriodData = {
  granularity: "month",
  periods: ["2026-03", "2026-04", "2026-05"],
  services: [
    {
      service_id: "s1",
      service_name: "Corte de Cabelo",
      data: [
        { period: "2026-03", count: 30, revenue: 90000 },
        { period: "2026-04", count: 38, revenue: 114000 },
        { period: "2026-05", count: 45, revenue: 135000 },
      ],
    },
  ],
};

// ── Tests ─────────────────────────────────────────────────────────────────────
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ServiceSalesAnalyticsPage from "@/app/dashboard/financeiro/analytics/page";

beforeEach(() => {
  jest.clearAllMocks();
  mockUseServiceRankingReport.mockReturnValue({
    data: null, isLoading: false, error: null, refetch: mockRefetch,
  });
  mockUseServiceTrendReport.mockReturnValue({
    data: null, isLoading: false, error: null, refetch: mockRefetch,
  });
  mockUseServiceWeekdayPatternReport.mockReturnValue({
    data: null, isLoading: false, error: null, refetch: mockRefetch,
  });
  mockUseServiceByPeriodReport.mockReturnValue({
    data: null, isLoading: false, error: null, refetch: mockRefetch,
  });
});

describe("ServiceSalesAnalyticsPage — page structure", () => {
  it("renders page title and date range filter", () => {
    render(<ServiceSalesAnalyticsPage />);

    expect(screen.getByText(/analytics de serviços/i)).toBeInTheDocument();
    expect(screen.getByTestId("date-range-filter")).toBeInTheDocument();
  });

  it("renders section headings for ranking, trend and weekday charts", () => {
    render(<ServiceSalesAnalyticsPage />);

    expect(screen.getByText(/ranking de serviços/i)).toBeInTheDocument();
    expect(screen.getByText(/tendência de receita por período/i)).toBeInTheDocument();
    expect(screen.getByText(/padrão por dia da semana/i)).toBeInTheDocument();
  });
});

describe("ServiceSalesAnalyticsPage — ranking section", () => {
  it("shows loading skeleton when ranking is loading", () => {
    mockUseServiceRankingReport.mockReturnValue({
      data: null, isLoading: true, error: null, refetch: mockRefetch,
    });

    render(<ServiceSalesAnalyticsPage />);

    expect(screen.getByTestId("ranking-loading")).toBeInTheDocument();
  });

  it("shows error message with retry button when ranking fails", () => {
    mockUseServiceRankingReport.mockReturnValue({
      data: null, isLoading: false, error: "Falha ao carregar", refetch: mockRefetch,
    });

    render(<ServiceSalesAnalyticsPage />);

    expect(screen.getByText(/falha ao carregar/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
  });

  it("shows empty state when ranking has no items", () => {
    mockUseServiceRankingReport.mockReturnValue({
      data: { ...mockRankingData, items: [] }, isLoading: false, error: null, refetch: mockRefetch,
    });

    render(<ServiceSalesAnalyticsPage />);

    expect(screen.getByTestId("ranking-empty")).toBeInTheDocument();
  });

  it("renders service names in ranking list", () => {
    mockUseServiceRankingReport.mockReturnValue({
      data: mockRankingData, isLoading: false, error: null, refetch: mockRefetch,
    });

    render(<ServiceSalesAnalyticsPage />);

    // Use getAllByText because the service name may also appear in the trend service selector dropdown
    expect(screen.getAllByText("Corte de Cabelo").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Barba").length).toBeGreaterThanOrEqual(1);
  });

  it("passes ranking params to hook when date changes", () => {
    render(<ServiceSalesAnalyticsPage />);

    // Hook must be called with non-empty ISO date strings where start < end
    const callArgs = mockUseServiceRankingReport.mock.calls[0][0];
    expect(callArgs.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(callArgs.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(callArgs.start_date < callArgs.end_date).toBe(true);
  });
});

describe("ServiceSalesAnalyticsPage — trend section", () => {
  it("shows loading state for trend chart", () => {
    mockUseServiceTrendReport.mockReturnValue({
      data: null, isLoading: true, error: null, refetch: mockRefetch,
    });

    render(<ServiceSalesAnalyticsPage />);

    expect(screen.getByTestId("trend-loading")).toBeInTheDocument();
  });

  it("shows error with retry for trend chart", () => {
    mockUseServiceTrendReport.mockReturnValue({
      data: null, isLoading: false, error: "Erro de rede", refetch: mockRefetch,
    });

    render(<ServiceSalesAnalyticsPage />);

    expect(screen.getByText(/erro de rede/i)).toBeInTheDocument();
  });

  it("renders trend points count when data is available", () => {
    mockUseServiceTrendReport.mockReturnValue({
      data: mockTrendData, isLoading: false, error: null, refetch: mockRefetch,
    });

    render(<ServiceSalesAnalyticsPage />);

    // Chart container should be present
    expect(screen.getByTestId("trend-chart")).toBeInTheDocument();
  });
});

describe("ServiceSalesAnalyticsPage — weekday pattern section", () => {
  it("shows loading state for weekday chart", () => {
    mockUseServiceWeekdayPatternReport.mockReturnValue({
      data: null, isLoading: true, error: null, refetch: mockRefetch,
    });

    render(<ServiceSalesAnalyticsPage />);

    expect(screen.getByTestId("weekday-loading")).toBeInTheDocument();
  });

  it("shows empty state when no weekday items", () => {
    mockUseServiceWeekdayPatternReport.mockReturnValue({
      data: { items: [] }, isLoading: false, error: null, refetch: mockRefetch,
    });

    render(<ServiceSalesAnalyticsPage />);

    expect(screen.getByTestId("weekday-empty")).toBeInTheDocument();
  });

  it("renders service name in weekday chart when data available", () => {
    mockUseServiceWeekdayPatternReport.mockReturnValue({
      data: mockWeekdayData, isLoading: false, error: null, refetch: mockRefetch,
    });

    render(<ServiceSalesAnalyticsPage />);

    expect(screen.getByText("Corte de Cabelo")).toBeInTheDocument();
  });
});

describe("ServiceSalesAnalyticsPage — ranking sort toggle (I6)", () => {
  it("renders Receita and Agendamentos sort buttons", () => {
    render(<ServiceSalesAnalyticsPage />);
    expect(screen.getByTestId("sort-revenue")).toBeInTheDocument();
    expect(screen.getByTestId("sort-count")).toBeInTheDocument();
  });

  it("calls ranking hook with sort_by=revenue by default", () => {
    render(<ServiceSalesAnalyticsPage />);
    const callArgs = mockUseServiceRankingReport.mock.calls[0][0];
    expect(callArgs.sort_by).toBe("revenue");
  });

  it("calls ranking hook with sort_by=count when count button clicked", () => {
    render(<ServiceSalesAnalyticsPage />);
    fireEvent.click(screen.getByTestId("sort-count"));
    const lastCall = mockUseServiceRankingReport.mock.calls[mockUseServiceRankingReport.mock.calls.length - 1][0];
    expect(lastCall.sort_by).toBe("count");
  });

  it("calls ranking hook with sort_by=revenue after toggling back", () => {
    render(<ServiceSalesAnalyticsPage />);
    fireEvent.click(screen.getByTestId("sort-count"));
    fireEvent.click(screen.getByTestId("sort-revenue"));
    const lastCall = mockUseServiceRankingReport.mock.calls[mockUseServiceRankingReport.mock.calls.length - 1][0];
    expect(lastCall.sort_by).toBe("revenue");
  });
});

describe("ServiceSalesAnalyticsPage — trend interactivity (I5)", () => {
  it("renders granularity toggle buttons Dia/Semana/Mês", () => {
    render(<ServiceSalesAnalyticsPage />);
    expect(screen.getByTestId("trend-granularity-day")).toBeInTheDocument();
    expect(screen.getByTestId("trend-granularity-week")).toBeInTheDocument();
    expect(screen.getByTestId("trend-granularity-month")).toBeInTheDocument();
  });

  it("calls trend hook with granularity=day by default", () => {
    render(<ServiceSalesAnalyticsPage />);
    const callArgs = mockUseServiceTrendReport.mock.calls[0][0];
    expect(callArgs.granularity).toBe("day");
  });

  it("calls trend hook with granularity=month when Mês button clicked", () => {
    render(<ServiceSalesAnalyticsPage />);
    fireEvent.click(screen.getByTestId("trend-granularity-month"));
    const lastCall = mockUseServiceTrendReport.mock.calls[mockUseServiceTrendReport.mock.calls.length - 1][0];
    expect(lastCall.granularity).toBe("month");
  });

  it("calls trend hook with granularity=day when Dia button clicked", () => {
    render(<ServiceSalesAnalyticsPage />);
    fireEvent.click(screen.getByTestId("trend-granularity-day"));
    const lastCall = mockUseServiceTrendReport.mock.calls[mockUseServiceTrendReport.mock.calls.length - 1][0];
    expect(lastCall.granularity).toBe("day");
  });

  it("shows service selector when ranking has items", () => {
    mockUseServiceRankingReport.mockReturnValue({
      data: mockRankingData, isLoading: false, error: null, refetch: mockRefetch,
    });
    render(<ServiceSalesAnalyticsPage />);
    expect(screen.getByTestId("trend-service-select")).toBeInTheDocument();
  });

  it("does not show service selector when ranking has no items", () => {
    mockUseServiceRankingReport.mockReturnValue({
      data: null, isLoading: false, error: null, refetch: mockRefetch,
    });
    render(<ServiceSalesAnalyticsPage />);
    expect(screen.queryByTestId("trend-service-select")).not.toBeInTheDocument();
  });

  it("calls trend hook with service_id when a service is selected", () => {
    mockUseServiceRankingReport.mockReturnValue({
      data: mockRankingData, isLoading: false, error: null, refetch: mockRefetch,
    });
    render(<ServiceSalesAnalyticsPage />);
    fireEvent.change(screen.getByTestId("trend-service-select"), { target: { value: "s1" } });
    const lastCall = mockUseServiceTrendReport.mock.calls[mockUseServiceTrendReport.mock.calls.length - 1][0];
    expect(lastCall.service_id).toBe("s1");
  });

  it("calls trend hook without service_id when 'Todos os serviços' selected", () => {
    mockUseServiceRankingReport.mockReturnValue({
      data: mockRankingData, isLoading: false, error: null, refetch: mockRefetch,
    });
    render(<ServiceSalesAnalyticsPage />);
    // select a service first, then deselect
    fireEvent.change(screen.getByTestId("trend-service-select"), { target: { value: "s1" } });
    fireEvent.change(screen.getByTestId("trend-service-select"), { target: { value: "" } });
    const lastCall = mockUseServiceTrendReport.mock.calls[mockUseServiceTrendReport.mock.calls.length - 1][0];
    expect(lastCall.service_id).toBeUndefined();
  });
});

describe("ServiceSalesAnalyticsPage — summary table by period (I4)", () => {
  it("renders 'Tabela Resumo por Período' section heading", () => {
    render(<ServiceSalesAnalyticsPage />);
    expect(screen.getByText(/tabela resumo por período/i)).toBeInTheDocument();
  });

  it("shows loading skeleton for summary table", () => {
    mockUseServiceByPeriodReport.mockReturnValue({
      data: null, isLoading: true, error: null, refetch: mockRefetch,
    });
    render(<ServiceSalesAnalyticsPage />);
    expect(screen.getByTestId("summary-table-loading")).toBeInTheDocument();
  });

  it("shows empty state when by-period has no services", () => {
    mockUseServiceByPeriodReport.mockReturnValue({
      data: { services: [], periods: [], granularity: "month" },
      isLoading: false, error: null, refetch: mockRefetch,
    });
    render(<ServiceSalesAnalyticsPage />);
    expect(screen.getByTestId("summary-table-empty")).toBeInTheDocument();
  });

  it("shows error with retry when by-period fails", () => {
    mockUseServiceByPeriodReport.mockReturnValue({
      data: null, isLoading: false, error: "Erro ao carregar tabela", refetch: mockRefetch,
    });
    render(<ServiceSalesAnalyticsPage />);
    expect(screen.getByText(/erro ao carregar tabela/i)).toBeInTheDocument();
  });

  it("renders period headers and service rows in summary table", () => {
    mockUseServiceByPeriodReport.mockReturnValue({
      data: mockByPeriodData, isLoading: false, error: null, refetch: mockRefetch,
    });
    render(<ServiceSalesAnalyticsPage />);
    expect(screen.getByTestId("summary-table")).toBeInTheDocument();
    expect(screen.getByText("2026-03")).toBeInTheDocument();
    expect(screen.getByText("2026-04")).toBeInTheDocument();
    expect(screen.getByText("2026-05")).toBeInTheDocument();
  });

  it("renders trend arrow for each service in summary table", () => {
    mockUseServiceByPeriodReport.mockReturnValue({
      data: mockByPeriodData, isLoading: false, error: null, refetch: mockRefetch,
    });
    render(<ServiceSalesAnalyticsPage />);
    expect(screen.getByTestId("trend-arrow-s1")).toBeInTheDocument();
  });

  it("shows up arrow when service revenue is growing", () => {
    mockUseServiceByPeriodReport.mockReturnValue({
      data: mockByPeriodData, isLoading: false, error: null, refetch: mockRefetch,
    });
    render(<ServiceSalesAnalyticsPage />);
    // mockByPeriodData has s1 going from 90000 to 135000 (growing)
    expect(screen.getByTestId("trend-arrow-s1").textContent).toContain("↑");
  });
});
