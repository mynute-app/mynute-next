"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Building2,
  Phone,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataPagination } from "@/components/ui/data-pagination";
import { ErrorState } from "@/components/ui/error-state";
import { cn } from "@/lib/utils";
import { useCompanyClientAppointments } from "@/hooks/company-client/use-company-client-appointments";
import type { Appointment } from "../../../../../types/appointment";

const statusConfig = {
  confirmed: {
    label: "Confirmado",
    className:
      "border-[hsl(var(--success)/0.2)] bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))]",
  },
  pending: {
    label: "Pendente",
    className:
      "border-[hsl(var(--warning)/0.2)] bg-[hsl(var(--warning)/0.12)] text-[hsl(var(--warning))]",
  },
  completed: {
    label: "Concluido",
    className: "border-border bg-muted text-muted-foreground",
  },
  cancelled: {
    label: "Cancelado",
    className: "border-destructive/20 bg-destructive/10 text-destructive",
  },
};

type StatusKey = keyof typeof statusConfig;

const resolveStatus = (appointment: Appointment): StatusKey => {
  const isCancelled =
    appointment.cancelled ||
    appointment.is_cancelled ||
    appointment.is_cancelled_by_client ||
    appointment.is_cancelled_by_employee;

  if (isCancelled) return "cancelled";
  if (appointment.is_fulfilled) return "completed";
  if (appointment.is_confirmed_by_client) return "confirmed";
  return "pending";
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
};

const formatTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateParam = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const PageShell = ({ children }: { children: React.ReactNode }) => (
  <div className="dashboard-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
    <div className="custom-scrollbar flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">{children}</div>
    </div>
  </div>
);

export default function ClienteDetalhesPage() {
  const params = useParams<{ id: string }>();
  const clientId = params?.id || "";
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState<"all" | "today" | "week">("all");
  const [cancelledFilter, setCancelledFilter] = useState<
    "all" | "true" | "false"
  >("all");

  const dateRange = useMemo(() => {
    if (filter === "all") return { startDate: undefined, endDate: undefined };

    const today = new Date();
    if (filter === "today") {
      const formatted = formatDateParam(today);
      return { startDate: formatted, endDate: formatted };
    }

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return {
      startDate: formatDateParam(startOfWeek),
      endDate: formatDateParam(endOfWeek),
    };
  }, [filter]);

  const cancelledValue =
    cancelledFilter === "all"
      ? undefined
      : cancelledFilter === "true";

  const {
    appointments,
    clientInfo,
    serviceInfo,
    employeeInfo,
    totalCount,
    isLoading,
    error,
    refetch,
  } = useCompanyClientAppointments({
    clientId,
    page,
    pageSize,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    cancelled: cancelledValue,
    enabled: !!clientId,
  });

  const clientMap = useMemo(
    () => new Map(clientInfo.map(client => [client.id, client])),
    [clientInfo]
  );
  const serviceMap = useMemo(
    () => new Map(serviceInfo.map(service => [service.id, service])),
    [serviceInfo]
  );
  const employeeMap = useMemo(
    () => new Map(employeeInfo.map(employee => [employee.id, employee])),
    [employeeInfo]
  );

  const client = clientMap.get(clientId) || clientInfo[0];

  const rows = useMemo(() => {
    return appointments.map(appointment => {
      const service = serviceMap.get(appointment.service_id);
      const employee = employeeMap.get(appointment.employee_id);
      const status = resolveStatus(appointment);

      return {
        id: appointment.id,
        serviceName: service?.name || "Serviço não informado",
        employeeName: employee
          ? `${employee.name} ${employee.surname}`.trim()
          : "Profissional não informado",
        status,
        dateLabel: formatDate(appointment.start_time),
        timeLabel: formatTime(appointment.start_time),
        duration: service?.duration,
        price: service?.price,
      };
    });
  }, [appointments, serviceMap, employeeMap]);

  return (
    <PageShell>
      <div className="space-y-6 pb-12 lg:pt-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="page-header mb-0">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard/clientes">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="page-title">
                  {client ? `${client.name} ${client.surname}` : "Cliente"}
                </h1>
                <p className="page-description">
                  Histórico de agendamentos e detalhes do cliente
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="text-lg font-semibold text-foreground">
                  {client ? `${client.name} ${client.surname}` : "—"}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{client?.email || "E-mail não informado"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{client?.phone || "Telefone não informado"}</span>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">
              Total de agendamentos
            </p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {totalCount}
            </p>
            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
              <p>Use os filtros para refinar o histórico.</p>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>Todos os serviços e profissionais</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {(["all", "today", "week"] as const).map(item => (
                <Button
                  key={item}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    filter === item
                      ? "bg-background text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => {
                    setFilter(item);
                    setPage(1);
                  }}
                >
                  {item === "all"
                    ? "Todos"
                    : item === "today"
                      ? "Hoje"
                      : "Semana"}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                className="w-[150px]"
                placeholder="DD/MM/AAAA"
                value={dateRange.startDate || ""}
                onChange={event => {
                  setFilter("all");
                }}
                disabled
              />
              <Input
                className="w-[150px]"
                placeholder="DD/MM/AAAA"
                value={dateRange.endDate || ""}
                onChange={event => {
                  setFilter("all");
                }}
                disabled
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCancelledFilter("all");
                  setPage(1);
                }}
              >
                Todos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCancelledFilter("false");
                  setPage(1);
                }}
              >
                Ativos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCancelledFilter("true");
                  setPage(1);
                }}
              >
                Cancelados
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm">
          {isLoading ? (
            <div className="p-6">
              <div className="rounded-xl border border-border bg-muted/30 p-6">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Carregando histórico...
                  </span>
                </div>
                <div className="mt-6 space-y-3 animate-pulse">
                  <div className="h-3 w-40 rounded-full bg-muted" />
                  <div className="h-10 rounded-lg bg-muted/70" />
                  <div className="h-10 rounded-lg bg-muted/70" />
                  <div className="h-10 rounded-lg bg-muted/70" />
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="p-6">
              <ErrorState
                title="Erro ao carregar histórico"
                description={error}
                onRetry={refetch}
              />
            </div>
          ) : rows.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum agendamento encontrado.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {rows.map((row, index) => (
                <div
                  key={row.id}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {row.serviceName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {row.employeeName}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {row.dateLabel}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {row.timeLabel}
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", statusConfig[row.status].className)}
                    >
                      {statusConfig[row.status].label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isLoading && !error && totalCount > 0 && (
          <DataPagination
            page={page}
            pageSize={pageSize}
            total={totalCount}
            onPageChange={setPage}
            onPageSizeChange={value => {
              setPageSize(value);
              setPage(1);
            }}
          />
        )}
      </div>
    </PageShell>
  );
}
