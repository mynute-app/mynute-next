"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Plus,
  Search,
  User,
  Building2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ErrorState } from "@/components/ui/error-state";
import { useBranchAppointments } from "@/hooks/branch/use-branch-appointments";
import { useGetCompany } from "@/hooks/get-company";
import { useTenantSlug } from "@/hooks/use-tenant-slug";
import { buildTenantPath } from "@/lib/tenant";
import type { Appointment } from "../../../../types/appointment";

const PAGE_SIZE = 20;

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

const PageShell = ({ children }: { children: React.ReactNode }) => (
  <div className="dashboard-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
    <div className="custom-scrollbar flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">{children}</div>
    </div>
  </div>
);

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

const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return "-";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDateParam = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

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

export default function AgendamentosPage() {
  const tenant = useTenantSlug();
  const { company, loading: isCompanyLoading } = useGetCompany();

  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("all");
  const [selectedServiceId, setSelectedServiceId] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "cancelled">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [selectedBranchId, selectedEmployeeId, selectedServiceId, statusFilter, dateFilter]);

  useEffect(() => {
    if (!selectedBranchId && company?.branches?.length) {
      setSelectedBranchId(company.branches[0].id.toString());
    }
  }, [company?.branches, selectedBranchId]);

  const dateRange = useMemo(() => {
    if (dateFilter === "all") return { startDate: undefined, endDate: undefined };
    const today = new Date();
    if (dateFilter === "today") {
      const f = formatDateParam(today);
      return { startDate: f, endDate: f };
    }
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return { startDate: formatDateParam(startOfWeek), endDate: formatDateParam(endOfWeek) };
  }, [dateFilter]);

  const cancelledParam = useMemo(() => {
    if (statusFilter === "cancelled") return true;
    if (statusFilter === "active") return false;
    return undefined;
  }, [statusFilter]);

  const {
    appointments,
    clientInfo,
    serviceInfo,
    employeeInfo,
    totalCount,
    isLoading: isLoadingAppointments,
    error,
    refetch,
  } = useBranchAppointments({
    branchId: selectedBranchId,
    page,
    pageSize: PAGE_SIZE,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    cancelled: cancelledParam,
    employeeId: selectedEmployeeId !== "all" ? selectedEmployeeId : undefined,
    serviceId: selectedServiceId !== "all" ? selectedServiceId : undefined,
    enabled: !!selectedBranchId,
  });

  const clientById = useMemo(() => new Map(clientInfo.map(c => [c.id, c])), [clientInfo]);
  const serviceById = useMemo(() => new Map(serviceInfo.map(s => [s.id, s])), [serviceInfo]);
  const employeeById = useMemo(() => new Map(employeeInfo.map(e => [e.id, e])), [employeeInfo]);
  const branchById = useMemo(
    () => new Map(company?.branches?.map(b => [b.id.toString(), b]) || []),
    [company?.branches],
  );

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const rows = useMemo(() => {
    const sorted = [...appointments].sort((a, b) => {
      const tA = new Date(a.start_time).getTime();
      const tB = new Date(b.start_time).getTime();
      if (Number.isNaN(tA) || Number.isNaN(tB)) return 0;
      return tB - tA;
    });

    return sorted
      .map(appointment => {
        const client = clientById.get(appointment.client_id);
        const service = serviceById.get(appointment.service_id);
        const employee = employeeById.get(appointment.employee_id);
        const branch = branchById.get(appointment.branch_id);
        const status = resolveStatus(appointment);

        const clientName = client ? `${client.name} ${client.surname}`.trim() : "Cliente nao informado";
        const serviceName = service?.name || "Servico nao informado";
        const employeeName = employee ? `${employee.name} ${employee.surname}`.trim() : "Profissional nao informado";
        const branchName = branch?.name || "Filial nao informada";
        const searchStack = [clientName, serviceName, employeeName, branchName].join(" ").toLowerCase();

        return {
          id: appointment.id,
          clientName,
          serviceName,
          employeeName,
          branchName,
          status,
          dateLabel: formatDate(appointment.start_time),
          timeLabel: formatTime(appointment.start_time),
          priceLabel: formatCurrency(service?.price),
          searchStack,
        };
      })
      .filter(item => normalizedSearch ? item.searchStack.includes(normalizedSearch) : true);
  }, [appointments, clientById, serviceById, employeeById, branchById, normalizedSearch]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const isLoading = isCompanyLoading || isLoadingAppointments;
  const hasBranches = (company?.branches?.length ?? 0) > 0;
  const branches = company?.branches ?? [];
  const hasMultipleBranches = branches.length > 1;
  const branchLabel = branches[0]?.name || "Sem filial";

  const hasActiveFilters =
    selectedEmployeeId !== "all" ||
    selectedServiceId !== "all" ||
    statusFilter !== "all" ||
    dateFilter !== "all";

  const clearFilters = () => {
    setSelectedEmployeeId("all");
    setSelectedServiceId("all");
    setStatusFilter("all");
    setDateFilter("all");
    setSearchTerm("");
    setPage(1);
  };

  return (
    <PageShell>
      <div className="space-y-6 pb-12 lg:pt-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="page-header mb-0">
            <h1 className="page-title">Agendamentos</h1>
            <p className="page-description">
              {totalCount > 0
                ? `${totalCount} agendamento${totalCount !== 1 ? "s" : ""} encontrado${totalCount !== 1 ? "s" : ""}`
                : "Gerencie todos os agendamentos"}
            </p>
          </div>
          <Button className="btn-gradient" asChild>
            <Link href={buildTenantPath(tenant, "/dashboard/scheduling/view", "/dashboard/scheduling/view")}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Link>
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, servico ou profissional..."
                className="pl-9"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                disabled={isLoading || !hasBranches}
              />
            </div>

            {hasMultipleBranches ? (
              <Select
                value={selectedBranchId}
                onValueChange={v => { setSelectedBranchId(v); setSelectedEmployeeId("all"); setSelectedServiceId("all"); }}
                disabled={!hasBranches}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Selecione a filial" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>{branch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="w-[200px] rounded-md border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-foreground">
                {branchLabel}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              {(["all", "today", "week"] as const).map(item => (
                <Button
                  key={item}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 text-xs",
                    dateFilter === item
                      ? "bg-background text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => setDateFilter(item)}
                  disabled={!hasBranches}
                >
                  {item === "all" ? "Todos" : item === "today" ? "Hoje" : "Semana"}
                </Button>
              ))}
            </div>

            <Select
              value={statusFilter}
              onValueChange={v => setStatusFilter(v as "all" | "active" | "cancelled")}
              disabled={!hasBranches}
            >
              <SelectTrigger className="h-9 w-[150px] text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>

            {employeeInfo.length > 0 && (
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId} disabled={!hasBranches}>
                <SelectTrigger className="h-9 w-[170px] text-xs">
                  <SelectValue placeholder="Profissional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os profissionais</SelectItem>
                  {employeeInfo.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name} {emp.surname}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {serviceInfo.length > 0 && (
              <Select value={selectedServiceId} onValueChange={setSelectedServiceId} disabled={!hasBranches}>
                <SelectTrigger className="h-9 w-[150px] text-xs">
                  <SelectValue placeholder="Servico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os servicos</SelectItem>
                  {serviceInfo.map(svc => (
                    <SelectItem key={svc.id} value={svc.id}>{svc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="h-9 gap-1 text-xs text-muted-foreground" onClick={clearFilters}>
                <X className="h-3 w-3" />
                Limpar filtros
              </Button>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6">
              <div className="rounded-xl border border-border bg-muted/30 p-6">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">Carregando agendamentos...</span>
                </div>
                <div className="mt-6 space-y-3 animate-pulse">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 rounded-lg bg-muted/70" />
                  ))}
                </div>
              </div>
            </div>
          ) : !hasBranches ? (
            <div className="p-8 text-center text-muted-foreground">Nenhuma filial cadastrada.</div>
          ) : error ? (
            <div className="p-6"><ErrorState title="Erro ao carregar agendamentos" onRetry={refetch} /></div>
          ) : rows.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum agendamento encontrado{hasActiveFilters ? " para os filtros selecionados" : ""}.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold">Cliente</TableHead>
                  <TableHead className="font-semibold">Servico</TableHead>
                  <TableHead className="font-semibold">Filial</TableHead>
                  <TableHead className="font-semibold">Data/Hora</TableHead>
                  <TableHead className="font-semibold">Profissional</TableHead>
                  <TableHead className="font-semibold">Valor</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((appointment, index) => (
                  <TableRow
                    key={appointment.id}
                    className="table-row-hover animate-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium">{appointment.clientName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{appointment.serviceName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Building2 className="w-4 h-4" />
                        <span>{appointment.branchName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {appointment.dateLabel}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {appointment.timeLabel}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{appointment.employeeName}</TableCell>
                    <TableCell className="font-medium">{appointment.priceLabel}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", statusConfig[appointment.status].className)}>
                        {statusConfig[appointment.status].label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Pagina {page} de {totalPages} &nbsp;·&nbsp; {totalCount} agendamento{totalCount !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum =
                  totalPages <= 5 ? i + 1
                  : page <= 3 ? i + 1
                  : page >= totalPages - 2 ? totalPages - 4 + i
                  : page - 2 + i;
                return (
                  <Button key={pageNum} variant={page === pageNum ? "default" : "outline"} size="icon" className="h-8 w-8 text-xs" onClick={() => setPage(pageNum)}>
                    {pageNum}
                  </Button>
                );
              })}
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
