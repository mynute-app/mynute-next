"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRangeFilter } from "@/app/dashboard/financeiro/_components/date-range-filter";
import {
  useServiceRankingReport,
  useServiceTrendReport,
  useServiceWeekdayPatternReport,
  useServiceByPeriodReport,
} from "@/hooks/financial/use-financial-reports";
import { formatFinancialCurrency } from "@/lib/financial-utils";

export default function ServiceSalesAnalyticsPage() {
  const [startDate, setStartDate] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1).toISOString().slice(0, 10);
  });
  const [rangeEndDate, setRangeEndDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );

  // I6 — ranking sort toggle
  const [sortBy, setSortBy] = useState<"revenue" | "count">("revenue");

  // I5 — trend interactivity
  const [trendGranularity, setTrendGranularity] = useState<"day" | "week" | "month">("day");
  const [trendServiceId, setTrendServiceId] = useState<string>("");

  const params = { start_date: startDate, end_date: rangeEndDate };

  const ranking = useServiceRankingReport({ ...params, sort_by: sortBy });
  const trend = useServiceTrendReport({
    ...params,
    granularity: trendGranularity,
    ...(trendServiceId ? { service_id: trendServiceId } : {}),
  });
  const weekday = useServiceWeekdayPatternReport(params);
  const byPeriodParams = useMemo(() => {
    const t = new Date();
    return {
      start_date: new Date(t.getFullYear(), t.getMonth() - 2, 1).toISOString().slice(0, 10),
      end_date: t.toISOString().slice(0, 10),
    };
  }, []);
  const byPeriod = useServiceByPeriodReport({
    ...byPeriodParams,
    granularity: "month",
  });

  const availableServices = ranking.data?.items ?? [];

  return (
    <div className="dashboard-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="custom-scrollbar flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl space-y-6 p-6 lg:p-8">
          <h1 className="text-2xl font-bold tracking-tight">Analytics de Serviços</h1>

          <DateRangeFilter
            startDate={startDate}
            endDate={rangeEndDate}
            onApply={(nextStart, nextEnd) => {
              setStartDate(nextStart);
              setRangeEndDate(nextEnd);
            }}
          />

          {/* Ranking de Serviços */}
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Ranking de Serviços</h2>
              <div className="flex gap-1 rounded-lg border p-1">
                <Button
                  size="sm"
                  variant={sortBy === "revenue" ? "default" : "ghost"}
                  onClick={() => setSortBy("revenue")}
                  data-testid="sort-revenue"
                >
                  Receita
                </Button>
                <Button
                  size="sm"
                  variant={sortBy === "count" ? "default" : "ghost"}
                  onClick={() => setSortBy("count")}
                  data-testid="sort-count"
                >
                  Agendamentos
                </Button>
              </div>
            </div>
            {ranking.isLoading ? (
              <Skeleton className="h-64 rounded-lg" data-testid="ranking-loading" />
            ) : ranking.error ? (
              <div className="flex items-center justify-between rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                <span>{ranking.error}</span>
                <Button variant="outline" size="sm" onClick={ranking.refetch}>
                  Tentar novamente
                </Button>
              </div>
            ) : !ranking.data || ranking.data.items.length === 0 ? (
              <div
                data-testid="ranking-empty"
                className="flex h-40 items-center justify-center text-sm text-muted-foreground"
              >
                Nenhum dado de serviço encontrado para o período.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-muted-foreground">Receita Total</p>
                    <p className="mt-1 text-xl font-bold">
                      {formatFinancialCurrency(ranking.data.total_revenue)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-muted-foreground">Total de Agendamentos</p>
                    <p className="mt-1 text-xl font-bold">{ranking.data.total_appointments}</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ranking.data.items} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="service_name" tick={{ fontSize: 12 }} angle={-30} textAnchor="end" />
                    <YAxis tickFormatter={(v: number) => formatFinancialCurrency(v)} width={80} />
                    <Tooltip formatter={(v) => typeof v === "number" ? formatFinancialCurrency(v) : String(v ?? "")} />
                    <Bar dataKey="total_revenue" name="Receita Total" fill="hsl(var(--chart-1))" />
                    <Bar dataKey="appointment_count" name="Agendamentos" fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 pr-4">Serviço</th>
                        <th className="pb-2 pr-4 text-right">Agendamentos</th>
                        <th className="pb-2 pr-4 text-right">Receita</th>
                        <th className="pb-2 text-right">% da Receita</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ranking.data.items.map((item) => (
                        <tr key={item.service_id} className="border-b last:border-0">
                          <td className="py-2 pr-4 font-medium">{item.service_name}</td>
                          <td className="py-2 pr-4 text-right">{item.appointment_count}</td>
                          <td className="py-2 pr-4 text-right">
                            {formatFinancialCurrency(item.total_revenue)}
                          </td>
                          <td className="py-2 text-right">{item.revenue_share_percent.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* Tendência de Receita */}
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Tendência de Receita por Período</h2>
              <div className="flex flex-wrap gap-2">
                <div className="flex gap-1 rounded-lg border p-1">
                  {(["day", "week", "month"] as const).map((g) => (
                    <Button
                      key={g}
                      size="sm"
                      variant={trendGranularity === g ? "default" : "ghost"}
                      onClick={() => setTrendGranularity(g)}
                      data-testid={`trend-granularity-${g}`}
                    >
                      {g === "day" ? "Dia" : g === "week" ? "Semana" : "Mês"}
                    </Button>
                  ))}
                </div>
                {availableServices.length > 0 && (
                  <select
                    value={trendServiceId}
                    onChange={(e) => setTrendServiceId(e.target.value)}
                    className="rounded-md border bg-background px-2 py-1 text-sm"
                    data-testid="trend-service-select"
                    aria-label="Filtrar por serviço"
                  >
                    <option value="">Todos os serviços</option>
                    {availableServices.map((svc) => (
                      <option key={svc.service_id} value={svc.service_id}>
                        {svc.service_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            {trend.isLoading ? (
              <Skeleton className="h-64 rounded-lg" data-testid="trend-loading" />
            ) : trend.error ? (
              <div className="flex items-center justify-between rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                <span>{trend.error}</span>
                <Button variant="outline" size="sm" onClick={trend.refetch}>
                  Tentar novamente
                </Button>
              </div>
            ) : !trend.data || trend.data.points.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                Nenhum dado de tendência encontrado para o período.
              </div>
            ) : (
              <div data-testid="trend-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={trend.data.points}
                    margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period_label" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v: number) => formatFinancialCurrency(v)} width={80} />
                    <Tooltip formatter={(v) => typeof v === "number" ? formatFinancialCurrency(v) : String(v ?? "")} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total_revenue"
                      name="Receita"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="appointment_count"
                      name="Agendamentos"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          {/* Padrão por Dia da Semana */}
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Padrão por Dia da Semana</h2>
            {weekday.isLoading ? (
              <Skeleton className="h-64 rounded-lg" data-testid="weekday-loading" />
            ) : weekday.error ? (
              <div className="flex items-center justify-between rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                <span>{weekday.error}</span>
                <Button variant="outline" size="sm" onClick={weekday.refetch}>
                  Tentar novamente
                </Button>
              </div>
            ) : !weekday.data || weekday.data.items.length === 0 ? (
              <div
                data-testid="weekday-empty"
                className="flex h-40 items-center justify-center text-sm text-muted-foreground"
              >
                Nenhum dado de padrão semanal encontrado para o período.
              </div>
            ) : (
              <div className="space-y-6">
                {weekday.data.items.map((service) => (
                  <div key={service.service_id}>
                    <h3 className="mb-2 font-medium">{service.service_name}</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={service.by_weekday}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="weekday_name" tick={{ fontSize: 12 }} />
                        <YAxis width={60} />
                        <Tooltip />
                        <Bar dataKey="count" name="Agendamentos" fill="hsl(var(--chart-3))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Tabela Resumo por Período */}
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Tabela Resumo por Período</h2>
            {byPeriod.isLoading ? (
              <Skeleton className="h-48 rounded-lg" data-testid="summary-table-loading" />
            ) : byPeriod.error ? (
              <div className="flex items-center justify-between rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                <span>{byPeriod.error}</span>
                <Button variant="outline" size="sm" onClick={byPeriod.refetch}>
                  Tentar novamente
                </Button>
              </div>
            ) : !byPeriod.data || byPeriod.data.services.length === 0 ? (
              <div
                data-testid="summary-table-empty"
                className="flex h-40 items-center justify-center text-sm text-muted-foreground"
              >
                Nenhum dado comparativo encontrado para o período.
              </div>
            ) : (
              <div data-testid="summary-table" className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4">Serviço</th>
                      {byPeriod.data.periods.map((p) => (
                        <th key={p} className="pb-2 pr-4 text-right">
                          {p}
                        </th>
                      ))}
                      <th className="pb-2 text-right">Tendência</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byPeriod.data.services.map((svc) => {
                      const firstRev = svc.data[0]?.revenue ?? 0;
                      const lastRev = svc.data[svc.data.length - 1]?.revenue ?? 0;
                      const variation =
                        firstRev > 0 ? ((lastRev - firstRev) / firstRev) * 100 : 0;
                      const isGrowing = variation > 0;
                      const isDecreasing = variation < 0;
                      return (
                        <tr key={svc.service_id} className="border-b last:border-0">
                          <td className="py-2 pr-4 font-medium">{svc.service_name}</td>
                          {svc.data.map((d) => (
                            <td key={d.period} className="py-2 pr-4 text-right">
                              {formatFinancialCurrency(d.revenue)}
                            </td>
                          ))}
                          <td className="py-2 text-right">
                            <span
                              className={
                                isGrowing
                                  ? "text-green-600"
                                  : isDecreasing
                                    ? "text-red-500"
                                    : "text-muted-foreground"
                              }
                              data-testid={`trend-arrow-${svc.service_id}`}
                            >
                              {isGrowing ? "↑" : isDecreasing ? "↓" : "→"}{" "}
                              {Math.abs(variation).toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
