"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  Clock,
  Filter,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  User,
  Building2,
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
import { useBranchAppointments } from "@/hooks/branch/use-branch-appointments";
import { useGetCompany } from "@/hooks/get-company";
import type { Appointment } from "../../../../types/appointment";

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
  const { company, loading: isCompanyLoading } = useGetCompany();
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "today" | "week">("all");

  useEffect(() => {
    if (!selectedBranchId && company?.branches?.length) {
      setSelectedBranchId(company.branches[0].id.toString());
    }
  }, [company?.branches, selectedBranchId]);

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

  const {
    appointments,
    clientInfo,
    serviceInfo,
    employeeInfo,
    isLoading: isLoadingAppointments,
    error,
    refetch,
  } = useBranchAppointments({
    branchId: selectedBranchId,
    page: 1,
    pageSize: 200,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    enabled: !!selectedBranchId,
  });

  const clientById = useMemo(
    () => new Map(clientInfo.map(client => [client.id, client])),
    [clientInfo],
  );
  const serviceById = useMemo(
    () => new Map(serviceInfo.map(service => [service.id, service])),
    [serviceInfo],
  );
  const employeeById = useMemo(
    () => new Map(employeeInfo.map(employee => [employee.id, employee])),
    [employeeInfo],
  );
  const branchById = useMemo(
    () =>
      new Map(
        company?.branches?.map(branch => [branch.id.toString(), branch]) || [],
      ),
    [company?.branches],
  );

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const rows = useMemo(() => {
    const sortedAppointments = [...appointments].sort((a, b) => {
      const timeA = new Date(a.start_time).getTime();
      const timeB = new Date(b.start_time).getTime();
      if (Number.isNaN(timeA) || Number.isNaN(timeB)) return 0;
      return timeB - timeA;
    });

    return sortedAppointments
      .map(appointment => {
        const client = clientById.get(appointment.client_id);
        const service = serviceById.get(appointment.service_id);
        const employee = employeeById.get(appointment.employee_id);
        const branch = branchById.get(appointment.branch_id);
        const status = resolveStatus(appointment);

        const clientName = client
          ? `${client.name} ${client.surname}`.trim()
          : "Cliente nao informado";
        const serviceName = service?.name || "Servico nao informado";
        const employeeName = employee
          ? `${employee.name} ${employee.surname}`.trim()
          : "Profissional nao informado";
        const branchName = branch?.name || "Filial nao informada";

        const searchStack = [clientName, serviceName, employeeName, branchName]
          .join(" ")
          .toLowerCase();

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
      .filter(item =>
        normalizedSearch ? item.searchStack.includes(normalizedSearch) : true,
      );
  }, [
    appointments,
    clientById,
    serviceById,
    employeeById,
    branchById,
    normalizedSearch,
  ]);

  const isLoading = isCompanyLoading || isLoadingAppointments;
  const hasBranches = (company?.branches?.length ?? 0) > 0;
  const branches = company?.branches ?? [];
  const hasMultipleBranches = branches.length > 1;
  const branchLabel = branches[0]?.name || "Sem filial";
  const handleRetry = () => {
    refetch();
  };

  return (
    <PageShell>
      <div className="space-y-6 pt-12 lg:pt-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="page-header mb-0">
            <h1 className="page-title">Agendamentos</h1>
            <p className="page-description">Gerencie todos os agendamentos</p>
          </div>
          <Button className="btn-gradient" asChild>
            <Link href="/dashboard/scheduling/view">
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Link>
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, servico ou filial..."
                className="pl-9"
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                disabled={isLoading || !hasBranches}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {hasMultipleBranches ? (
                <Select
                  value={selectedBranchId}
                  onValueChange={setSelectedBranchId}
                  disabled={!hasBranches}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Selecione a filial" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="w-[200px] rounded-md border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-foreground">
                  {branchLabel}
                </div>
              )}

              <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                {(["all", "today", "week"] as const).map(item => (
                  <Button
                    key={item}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      filter === item
                        ? "bg-background text-foreground shadow-sm border border-border"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => setFilter(item)}
                    disabled={!hasBranches}
                  >
                    {item === "all"
                      ? "Todos"
                      : item === "today"
                        ? "Hoje"
                        : "Semana"}
                  </Button>
                ))}
              </div>

              {/* <Button variant="outline" size="icon" disabled>
                <Filter className="w-4 h-4" />
              </Button> */}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6">
              <div className="rounded-xl border border-border bg-muted/30 p-6">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">
                    Carregando agendamentos...
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
          ) : !hasBranches ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhuma filial cadastrada.
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
                <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
                <p className="mt-2 text-sm font-semibold text-destructive">
                  Erro ao carregar agendamentos
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={handleRetry}
                >
                  Tentar novamente
                </Button>
              </div>
            </div>
          ) : rows.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum agendamento encontrado.
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
                  <TableHead className="w-10"></TableHead>
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
                        <span className="font-medium">
                          {appointment.clientName}
                        </span>
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
                    <TableCell className="font-medium">
                      {appointment.priceLabel}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          statusConfig[appointment.status].className,
                        )}
                      >
                        {statusConfig[appointment.status].label}
                      </Badge>
                    </TableCell>
                    {/* <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </PageShell>
  );
}
