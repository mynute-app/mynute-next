"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetCompany } from "@/hooks/get-company";
import { useBranchAppointments } from "@/hooks/branch/use-branch-appointments";
import { useEmployeeAppointments } from "@/hooks/employee/use-employee-appointments";
import {
  CalendarFiltersDrawer,
  type CalendarFilters,
} from "@/app/dashboard/scheduling/view/_components/calendar-filters-drawer";
import { AppointmentDetailsDialog } from "@/app/dashboard/scheduling/view/_components/appointment-details-dialog";
import { CreateAppointmentDialog } from "@/app/dashboard/scheduling/view/_components/create-appointment-dialog";
import { Appointment } from "../../../../../../types/appointment";


const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const SLOT_START = 7;
const SLOT_END = 18;
const HOURS = Array.from(
  { length: SLOT_END - SLOT_START + 1 },
  (_, i) => i + SLOT_START
);
const SLOT_HEIGHT = 64;
const EVENT_COLORS = [
  "bg-primary",
  "bg-accent",
  "bg-[hsl(var(--success))]",
  "bg-[hsl(var(--warning))]",
];

const PageShell = ({ children }: { children: ReactNode }) => (
  <div className="dashboard-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
    <div className="custom-scrollbar flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">{children}</div>
    </div>
  </div>
);

export function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const { company, loading: loadingCompany } = useGetCompany();
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    company?.branches?.[0]?.id?.toString() || ""
  );
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [filters, setFilters] = useState<CalendarFilters>({
    employeeId: null,
    serviceId: null,
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [initialSlot, setInitialSlot] = useState<{
    date: string;
    time: string;
    branchId?: string;
  } | null>(null);

  useEffect(() => {
    if (company?.branches?.[0]?.id && !selectedBranchId) {
      setSelectedBranchId(company.branches[0].id.toString());
    }
  }, [company, selectedBranchId]);

  const formatDayKey = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const formatRangeDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const monthLabel = useMemo(() => {
    const label = new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
    }).format(currentDate);
    const normalized = label.replace(" de ", " ");
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }, [currentDate]);

  const dateRange = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return {
      startDate: formatRangeDate(startOfWeek),
      endDate: formatRangeDate(endOfWeek),
    };
  }, [currentDate]);

  const {
    appointments: branchAppointments,
    clientInfo: branchClientInfo,
    serviceInfo: branchServiceInfo,
    employeeInfo: branchEmployeeInfo,
    isLoading: isLoadingBranch,
    error: errorBranch,
    refetch: refetchBranch,
  } = useBranchAppointments({
    branchId: selectedBranchId,
    page: 1,
    pageSize: 200,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    enabled: !!selectedBranchId && !filters.employeeId,
  });

  const {
    appointments: employeeAppointments,
    clientInfo: employeeClientInfo,
    serviceInfo: employeeServiceInfo,
    employeeInfo: employeeEmployeeInfo,
    isLoading: isLoadingEmployee,
    error: errorEmployee,
    refetch: refetchEmployee,
  } = useEmployeeAppointments({
    employeeId: filters.employeeId || "",
    page: 1,
    pageSize: 200,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    branchId: selectedBranchId,
    serviceId: filters.serviceId || undefined,
    enabled: !!filters.employeeId,
  });

  const appointments = filters.employeeId
    ? employeeAppointments
    : branchAppointments;
  const clientInfo = filters.employeeId ? employeeClientInfo : branchClientInfo;
  const serviceInfo = filters.employeeId
    ? employeeServiceInfo
    : branchServiceInfo;
  const employeeInfo = filters.employeeId
    ? employeeEmployeeInfo
    : branchEmployeeInfo;
  const isLoading = filters.employeeId ? isLoadingEmployee : isLoadingBranch;
  const error = filters.employeeId ? errorEmployee : errorBranch;

  const serviceIndexMap = useMemo(() => {
    return new Map(serviceInfo.map((service, index) => [service.id, index]));
  }, [serviceInfo]);

  const serviceMap = useMemo(() => {
    return new Map(serviceInfo.map(service => [service.id, service]));
  }, [serviceInfo]);

  const clientMap = useMemo(() => {
    return new Map(clientInfo.map(client => [client.id, client]));
  }, [clientInfo]);

  const events = useMemo(() => {
    return appointments.map(appointment => {
      const start = new Date(appointment.start_time);
      const end = appointment.end_time
        ? new Date(appointment.end_time)
        : null;
      const service = serviceMap.get(appointment.service_id);
      const client = clientMap.get(appointment.client_id);
      const durationMinutes =
        end && end > start
          ? (end.getTime() - start.getTime()) / (1000 * 60)
          : service?.duration || 30;
      const serviceIndex = serviceIndexMap.get(appointment.service_id) ?? 0;
      const colorClass = EVENT_COLORS[serviceIndex % EVENT_COLORS.length];

      return {
        id: appointment.id,
        appointment,
        title: service?.name || "Servico",
        clientName: client
          ? `${client.name} ${client.surname}`
          : "Cliente",
        startHour: start.getHours(),
        startMinute: start.getMinutes(),
        durationMinutes,
        dayKey: formatDayKey(start),
        colorClass,
        isCancelled: appointment.cancelled || appointment.is_cancelled,
      };
    });
  }, [appointments, clientMap, serviceIndexMap, serviceMap]);

  const eventsBySlot = useMemo(() => {
    const map = new Map<string, Map<number, typeof events>>();
    events.forEach(event => {
      if (event.startHour < SLOT_START || event.startHour > SLOT_END) return;
      const daySlots = map.get(event.dayKey) ?? new Map<number, typeof events>();
      const slotEvents = daySlots.get(event.startHour) ?? [];
      slotEvents.push(event);
      daySlots.set(event.startHour, slotEvents);
      map.set(event.dayKey, daySlots);
    });
    return map;
  }, [events]);

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsDialogOpen(true);
  };

  const handleFiltersChange = (newFilters: CalendarFilters) => {
    setFilters(newFilters);
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleSlotClick = (date: Date, hour: number) => {
    if (!selectedBranchId) return;
    const dayKey = formatDayKey(date);
    const time = `${hour.toString().padStart(2, "0")}:00`;
    setInitialSlot({
      date: dayKey,
      time,
      branchId: selectedBranchId,
    });
    setCreateDialogOpen(true);
  };

  const handleCreateDialogChange = (open: boolean) => {
    setCreateDialogOpen(open);
    if (!open) {
      setInitialSlot(null);
    }
  };

  const handleAppointmentUpdated = () => {
    if (filters.employeeId) {
      refetchEmployee();
    } else {
      refetchBranch();
    }
  };

  const todayKey = formatDayKey(new Date());

  const legendItems = useMemo(() => {
    return serviceInfo.slice(0, 4).map((service, index) => ({
      id: service.id,
      label: service.name,
      colorClass: EVENT_COLORS[index % EVENT_COLORS.length],
    }));
  }, [serviceInfo]);

  return (
    <PageShell>
      <div className="space-y-6 pt-12 lg:pt-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="page-header mb-0">
            <h1 className="page-title">Agenda</h1>
            <p className="page-description">
              Visualize e gerencie seus agendamentos
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CalendarFiltersDrawer
              onFiltersChange={handleFiltersChange}
              employees={
                company?.employees?.map(emp => ({
                  id: emp.id.toString(),
                  name: `${emp.name} ${emp.surname}`,
                })) || []
              }
              services={company?.services || []}
              isLoadingEmployees={loadingCompany}
              isLoadingServices={loadingCompany}
            />
            <span className="text-xs text-muted-foreground">
              Clique em um horario para criar
            </span>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handlePrevious}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold text-foreground min-w-[180px] text-center">
                {monthLabel}
              </h2>
              <Button variant="ghost" size="icon" onClick={handleNext}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Hoje
              </Button>
              <div className="flex items-center gap-2 sm:ml-4">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={selectedBranchId}
                  onValueChange={setSelectedBranchId}
                >
                  <SelectTrigger className="w-full min-w-[180px]">
                    <SelectValue placeholder="Selecione uma filial" />
                  </SelectTrigger>
                  <SelectContent>
                    {company?.branches?.map((branch: any) => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              {(["day", "week", "month"] as const).map(value => (
                <Button
                  key={value}
                  variant={view === value ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "capitalize",
                    view === value && "bg-background shadow-sm"
                  )}
                  onClick={() => setView(value)}
                >
                  {value === "day" ? "Dia" : value === "week" ? "Semana" : "Mes"}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Carregando agendamentos...
            </div>
          ) : error ? (
            <div className="p-6 text-center text-sm text-destructive">
              {error}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-8 border-b border-border">
                  <div className="p-3 text-center text-sm font-medium text-muted-foreground border-r border-border">
                    Hora
                  </div>
                  {weekDays.map(date => {
                    const dayKey = formatDayKey(date);
                    const isToday = dayKey === todayKey;
                    return (
                      <div
                        key={dayKey}
                        className={cn(
                          "p-3 text-center border-r border-border last:border-r-0",
                          isToday && "bg-primary/5"
                        )}
                      >
                        <p className="text-sm font-medium text-muted-foreground">
                          {DAYS_OF_WEEK[date.getDay()]}
                        </p>
                        <p
                          className={cn(
                            "text-lg font-semibold",
                            isToday ? "text-primary" : "text-foreground"
                          )}
                        >
                          {date.getDate()}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="relative">
                  {HOURS.map(hour => (
                    <div
                      key={hour}
                      className="grid grid-cols-8 border-b border-border last:border-b-0"
                    >
                      <div className="p-2 text-center text-sm text-muted-foreground border-r border-border h-16 flex items-start justify-center">
                        {hour.toString().padStart(2, "0")}:00
                      </div>
                      {weekDays.map(date => {
                        const dayKey = formatDayKey(date);
                        const isToday = dayKey === todayKey;
                        const slotEvents =
                          eventsBySlot.get(dayKey)?.get(hour) || [];

                        return (
                          <div
                            key={`${dayKey}-${hour}`}
                            className={cn(
                              "border-r border-border last:border-r-0 h-16 relative",
                              isToday && "bg-primary/5"
                            )}
                            onClick={() => handleSlotClick(date, hour)}
                          >
                            {slotEvents.map((event, index) => {
                              const totalInSlot = slotEvents.length;
                              const width =
                                totalInSlot > 1
                                  ? `calc(${100 / totalInSlot}% - 4px)`
                                  : "calc(100% - 8px)";
                              const left =
                                totalInSlot > 1
                                  ? `calc(${index * (100 / totalInSlot)}% + 2px)`
                                  : "4px";
                              const height = Math.max(
                                24,
                                (event.durationMinutes / 60) * SLOT_HEIGHT - 4
                              );

                              return (
                                <div
                                  key={event.id}
                                  className={cn(
                                    "absolute rounded-lg p-2 text-xs cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md",
                                    event.isCancelled
                                      ? "bg-muted text-muted-foreground line-through"
                                      : event.colorClass,
                                    !event.isCancelled && "text-white"
                                  )}
                                  style={{
                                    height: `${height}px`,
                                    top: `${
                                      (event.startMinute / 60) * SLOT_HEIGHT
                                    }px`,
                                    left,
                                    right: totalInSlot > 1 ? "auto" : "4px",
                                    width,
                                    zIndex: 10,
                                  }}
                                  title={`${event.title} - ${event.clientName}`}
                                  onClick={eventClick => {
                                    eventClick.stopPropagation();
                                    handleAppointmentClick(event.appointment);
                                  }}
                                >
                                  <p className="font-medium truncate">
                                    {event.title}
                                  </p>
                                  <p className="opacity-80 truncate">
                                    {event.clientName}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {legendItems.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {legendItems.map(item => (
              <div key={item.id} className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-full", item.colorClass)} />
                <span className="text-sm text-muted-foreground">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateAppointmentDialog
        open={createDialogOpen}
        onOpenChange={handleCreateDialogChange}
        hideTrigger
        initialSlot={initialSlot}
        onAppointmentCreated={handleAppointmentUpdated}
      />

      <AppointmentDetailsDialog
        appointment={selectedAppointment}
        clientInfo={clientInfo}
        serviceInfo={serviceInfo}
        employeeInfo={employeeInfo}
        companyEmployees={company?.employees || []}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        onAppointmentDeleted={handleAppointmentUpdated}
      />
    </PageShell>
  );
}
