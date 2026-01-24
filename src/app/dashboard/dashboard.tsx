"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, CalendarCheck, Check, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranchAppointments } from "@/hooks/branch/use-branch-appointments";
import { useGetCompany } from "@/hooks/get-company";
import { useServiceAvailabilityAuto } from "@/hooks/service/useServiceAvailability";
import { cn } from "@/lib/utils";
import { QuickActions } from "./_components/quick-actions";
import {
  RecentAppointments,
  type DashboardAppointment,
} from "./_components/recent-appointments";
import { StatCard } from "./_components/stat-card";
import { UpcomingSlots, type UpcomingSlot } from "./_components/upcoming-slots";
import type {
  Appointment,
  ClientInfo,
  EmployeeInfo,
  ServiceInfo,
} from "../../../types/appointment";

type BranchOption = {
  id: string;
  name: string;
  active?: boolean;
};

const normalizeBranches = (branches?: BranchOption[]): BranchOption[] => {
  if (!Array.isArray(branches) || branches.length === 0) return [];
  return branches.map((branch, index) => ({
    id: branch.id || `branch-${index + 1}`,
    name: branch.name?.trim() || `Filial ${index + 1}`,
    active: branch.active ?? true,
  }));
};

const formatDate = (date: Date) => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTime = (value: string, timeZone?: string) => {
  const date = new Date(value);
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timeZone || "America/Sao_Paulo",
  }).format(date);
};

const resolveAppointmentStatus = (
  appointment: Appointment,
): DashboardAppointment["status"] => {
  if (
    appointment.is_cancelled ||
    appointment.is_cancelled_by_client ||
    appointment.is_cancelled_by_employee ||
    appointment.cancelled
  ) {
    return "cancelled";
  }

  if (appointment.is_fulfilled) {
    return "completed";
  }

  if (appointment.is_confirmed_by_client) {
    return "confirmed";
  }

  return "pending";
};

const buildLookupMap = <T extends { id: string }>(items: T[]) =>
  new Map(items.map(item => [item.id, item]));

const DashboardShell = ({ children }: { children: React.ReactNode }) => (
  <div className="dashboard-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
    <div className="custom-scrollbar flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">{children}</div>
    </div>
  </div>
);

const DashboardSkeleton = () => (
  <DashboardShell>
    <div className="space-y-6 pb-12 lg:pt-0">
      <div className="space-y-3">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <Skeleton className="h-5 w-32" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <Skeleton className="h-5 w-40" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  </DashboardShell>
);

const StatCardSkeleton = () => (
  <div className="stat-card rounded-xl border border-border bg-card p-6 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-12 w-12 rounded-xl" />
    </div>
  </div>
);

export default function DashboardPage() {
  const { company, loading, error } = useGetCompany();
  const [selectedBranchId, setSelectedBranchId] = useState("all");

  const branches = useMemo(() => {
    const companyBranches = company?.branches?.map(branch => ({
      id: String(branch.id),
      name: branch.name,
      active: (branch as { active?: boolean })?.active ?? true,
    }));
    return normalizeBranches(companyBranches);
  }, [company?.branches]);

  const hasMultipleBranches = branches.length > 1;

  useEffect(() => {
    if (loading) return;

    if (branches.length === 0) {
      setSelectedBranchId("all");
      return;
    }

    if (branches.length === 1 && selectedBranchId === "all") {
      setSelectedBranchId(branches[0].id);
      return;
    }

    const branchIds = new Set(branches.map(branch => branch.id));
    if (selectedBranchId !== "all" && !branchIds.has(selectedBranchId)) {
      setSelectedBranchId("all");
    }
  }, [branches, loading, selectedBranchId]);

  const todayRange = useMemo(() => {
    const today = new Date();
    return {
      startDate: formatDate(today),
      endDate: formatDate(today),
    };
  }, []);

  const branchIdForAppointments =
    selectedBranchId === "all" ? "" : selectedBranchId;

  const {
    appointments: branchAppointments,
    clientInfo,
    serviceInfo,
    employeeInfo,
    totalCount,
    isLoading: isLoadingAppointments,
    error: appointmentsError,
  } = useBranchAppointments({
    branchId: branchIdForAppointments,
    page: 1,
    pageSize: 20,
    startDate: todayRange.startDate,
    endDate: todayRange.endDate,
    enabled: !!branchIdForAppointments,
  });

  const appointments = useMemo(() => {
    if (!branchIdForAppointments) return [];

    const clientMap = buildLookupMap<ClientInfo>(clientInfo);
    const serviceMap = buildLookupMap<ServiceInfo>(serviceInfo);
    const employeeMap = buildLookupMap<EmployeeInfo>(employeeInfo);
    const branchNameMap = new Map(
      branches.map(branch => [branch.id, branch.name]),
    );

    return branchAppointments
      .map(appointment => {
        const client = clientMap.get(appointment.client_id);
        const service = serviceMap.get(appointment.service_id);
        const employee = employeeMap.get(appointment.employee_id);
        const branchName = branchNameMap.get(appointment.branch_id) || "Filial";

        return {
          id: appointment.id,
          clientName: client
            ? `${client.name} ${client.surname}`.trim()
            : "Cliente nao informado",
          service: service?.name || "Servico nao informado",
          time: formatTime(appointment.start_time, appointment.time_zone),
          status: resolveAppointmentStatus(appointment),
          professional: employee
            ? `${employee.name} ${employee.surname}`.trim()
            : undefined,
          branchId: appointment.branch_id,
          branchName,
        };
      })
      .slice(0, 5);
  }, [
    branchAppointments,
    branchIdForAppointments,
    branches,
    clientInfo,
    employeeInfo,
    serviceInfo,
  ]);

  const appointmentStats = useMemo(() => {
    if (!branchIdForAppointments) return null;

    const counts = {
      confirmed: 0,
      pending: 0,
      completed: 0,
      cancelled: 0,
    };

    branchAppointments.forEach(appointment => {
      const status = resolveAppointmentStatus(appointment);
      counts[status] += 1;
    });

    const confirmedTotal = counts.confirmed + counts.completed;
    const pendingTotal = counts.pending;
    const total = totalCount || branchAppointments.length;
    const hasFullData = totalCount <= branchAppointments.length;

    return {
      total,
      confirmed: confirmedTotal,
      pending: pendingTotal,
      hasFullData,
    };
  }, [branchAppointments, branchIdForAppointments, totalCount]);

  const defaultService = useMemo(() => {
    if (!company?.services || company.services.length === 0) return null;
    return (
      company.services.find(service => !service.hidden) || company.services[0]
    );
  }, [company?.services]);

  const availabilityBranchId =
    selectedBranchId === "all" ? null : selectedBranchId;

  const availabilityParams = useMemo(() => {
    if (!defaultService || !company?.id) return null;
    return {
      serviceId: String(defaultService.id),
      companyId: company.id,
      timezone: "America/Sao_Paulo",
      dateForwardStart: 0,
      dateForwardEnd: 1,
    };
  }, [company?.id, defaultService]);

  const {
    availability,
    loading: isLoadingAvailability,
    error: availabilityError,
  } = useServiceAvailabilityAuto(availabilityParams, !!availabilityParams);

  const upcomingSlots = useMemo<UpcomingSlot[]>(() => {
    if (!availability?.available_dates) return [];

    const todayKey = formatIsoDate(new Date());
    const slotMap = new Map<string, number>();

    availability.available_dates.forEach(dateInfo => {
      if (dateInfo.date !== todayKey) return;
      if (availabilityBranchId && dateInfo.branch_id !== availabilityBranchId)
        return;

      dateInfo.time_slots.forEach(slot => {
        const slotCount = Array.isArray(slot.employees)
          ? slot.employees.length
          : 0;
        slotMap.set(slot.time, (slotMap.get(slot.time) ?? 0) + slotCount);
      });
    });

    return Array.from(slotMap.entries())
      .map(([time, count]) => ({
        time,
        slots: count,
        available: count > 0,
      }))
      .sort((a, b) => a.time.localeCompare(b.time))
      .slice(0, 5);
  }, [availability?.available_dates, availabilityBranchId]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!company) {
    return (
      <DashboardShell>
        <div className="pt-12 lg:pt-0">
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            {error || "Empresa nao encontrada."}
          </div>
        </div>
      </DashboardShell>
    );
  }

  const currentBranch = branches.find(branch => branch.id === selectedBranchId);
  const companyName =
    company.trading_name || company.name || company.legal_name;
  const appointmentsEmptyLabel = appointmentsError
    ? "Nao foi possivel carregar os agendamentos"
    : !branchIdForAppointments
      ? "Selecione uma filial para ver os agendamentos"
      : undefined;
  const appointmentStatsValue =
    appointmentsError || !branchIdForAppointments
      ? "--"
      : (appointmentStats?.total ?? 0);
  const appointmentStatsSubtitle = appointmentsError
    ? "Nao foi possivel carregar os agendamentos"
    : !branchIdForAppointments
      ? "Selecione uma filial para ver os agendamentos"
      : appointmentStats && appointmentStats.hasFullData
        ? `${appointmentStats.confirmed} confirmados, ${appointmentStats.pending} pendentes`
        : "Agendamentos do dia";
  const upcomingSlotsEmptyLabel = availabilityError
    ? "Nao foi possivel carregar os horarios"
    : !defaultService
      ? "Cadastre um servico para ver horarios"
      : "Nenhum horario disponivel hoje";
  const upcomingSlotsContextLabel = defaultService
    ? `Servico base: ${defaultService.name}`
    : undefined;
  const showBranchHint = hasMultipleBranches && selectedBranchId !== "all";

  return (
    <DashboardShell>
      <div className="space-y-8 pb-12 lg:pt-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="page-header mb-0">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-description">
              Bem-vindo{companyName ? `, ${companyName}` : ""}! Aqui esta um
              resumo do seu negocio.
            </p>
          </div>

          {hasMultipleBranches && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="min-w-[200px] justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="truncate">
                      {selectedBranchId === "all"
                        ? "Todas as filiais"
                        : currentBranch?.name}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[220px]">
                <DropdownMenuItem
                  onClick={() => setSelectedBranchId("all")}
                  className={cn(
                    "gap-2",
                    selectedBranchId === "all" && "bg-accent",
                  )}
                >
                  <Building2 className="h-4 w-4" />
                  <span className="flex-1">Todas as filiais</span>
                  {selectedBranchId === "all" && (
                    <Check className="ml-auto h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {branches.map(branch => {
                  const isActive = branch.active !== false;
                  return (
                    <DropdownMenuItem
                      key={branch.id}
                      onClick={() => setSelectedBranchId(branch.id)}
                      className={cn(
                        "gap-2",
                        selectedBranchId === branch.id && "bg-accent",
                      )}
                    >
                      <Building2 className="h-4 w-4" />
                      <span className="flex-1">{branch.name}</span>
                      {!isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Inativa
                        </Badge>
                      )}
                      {selectedBranchId === branch.id && (
                        <Check className="ml-auto h-4 w-4 text-primary" />
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {hasMultipleBranches && selectedBranchId !== "all" && currentBranch && (
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className="gap-1.5 py-1">
              <Building2 className="h-3.5 w-3.5" />
              Exibindo dados de:
              <span className="font-semibold">{currentBranch.name}</span>
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-muted-foreground"
              onClick={() => setSelectedBranchId("all")}
            >
              Ver todas
            </Button>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
          {isLoadingAppointments && branchIdForAppointments ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              title="Agendamentos hoje"
              value={appointmentStatsValue}
              subtitle={appointmentStatsSubtitle}
              icon={CalendarCheck}
              variant="primary"
            />
          )}
          {/* TODO: add other metric cards when backend data is available. */}
        </div>
        <QuickActions />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentAppointments
              appointments={appointments}
              selectedBranchId={selectedBranchId}
              isLoading={isLoadingAppointments}
              emptyStateLabel={appointmentsEmptyLabel}
              emptyStateDescription={appointmentsError || undefined}
            />
          </div>
          {/* <UpcomingSlots
            slots={upcomingSlots}
            showBranchHint={showBranchHint}
            isLoading={isLoadingAvailability}
            emptyStateLabel={upcomingSlotsEmptyLabel}
            emptyStateDescription={availabilityError || undefined}
            contextLabel={upcomingSlotsContextLabel}
          /> */}
        </div>
        {/*
        TODO: branch summary depends on backend dashboard metrics.
        {hasMultipleBranches && selectedBranchId === "all" && (
          <div />
        )}
        */}
      </div>
    </DashboardShell>
  );
}
