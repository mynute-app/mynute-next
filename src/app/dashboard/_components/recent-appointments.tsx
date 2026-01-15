import { Building2, Car, Clock, MoreHorizontal, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type DashboardAppointment = {
  id: string;
  clientName: string;
  service: string;
  vehicle?: string;
  time: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  professional?: string;
  branchId: string;
  branchName: string;
};

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

const weekDays = [
  "domingo",
  "segunda-feira",
  "terca-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sabado",
];

const months = [
  "janeiro",
  "fevereiro",
  "marco",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

const formatTodayLabel = () => {
  const today = new Date();
  const weekday = weekDays[today.getDay()] ?? "";
  const month = months[today.getMonth()] ?? "";
  const label = `${weekday}, ${today.getDate()} de ${month}`;
  return label.charAt(0).toUpperCase() + label.slice(1);
};

type RecentAppointmentsProps = {
  appointments: DashboardAppointment[];
  selectedBranchId?: string;
  isLoading?: boolean;
  emptyStateLabel?: string;
  emptyStateDescription?: string;
};

export function RecentAppointments({
  appointments,
  selectedBranchId = "all",
  isLoading = false,
  emptyStateLabel,
  emptyStateDescription,
}: RecentAppointmentsProps) {
  const filteredAppointments =
    selectedBranchId === "all"
      ? appointments
      : appointments.filter(item => item.branchId === selectedBranchId);

  const showBranchColumn = selectedBranchId === "all";
  const todayLabel = formatTodayLabel();

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Agendamentos de hoje
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {todayLabel}
              {selectedBranchId !== "all" && (
                <span className="text-primary"> - Filtrando por filial</span>
              )}
            </p>
          </div>
          <Button variant="outline" size="sm" type="button">
            Ver todos
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <Skeleton className="h-8 w-16" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <Clock className="mx-auto mb-2 h-10 w-10 opacity-50" />
          <p>{emptyStateLabel || "Nenhum agendamento para esta filial hoje"}</p>
          {emptyStateDescription && (
            <p className="mt-1 text-sm text-muted-foreground">
              {emptyStateDescription}
            </p>
          )}
        </div>
      ) : (
        <div className="divide-y divide-border">
          {filteredAppointments.map((appointment, index) => (
            <div
              key={appointment.id}
              className="p-4 table-row-hover animate-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 flex-shrink-0 text-center">
                  <div className="flex items-center justify-center gap-1 text-sm font-medium text-foreground">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {appointment.time}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">
                        {appointment.service}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {appointment.clientName}
                        </span>
                        {appointment.vehicle && (
                          <span className="flex items-center gap-1">
                            <Car className="h-3.5 w-3.5" />
                            {appointment.vehicle}
                          </span>
                        )}
                        {showBranchColumn && (
                          <span className="flex items-center gap-1 text-primary">
                            <Building2 className="h-3.5 w-3.5" />
                            {appointment.branchName}
                          </span>
                        )}
                      </div>
                      {appointment.professional && (
                        <p className="text-xs text-muted-foreground">
                          Profissional: {appointment.professional}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-medium",
                          statusConfig[appointment.status].className
                        )}
                      >
                        {statusConfig[appointment.status].label}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        type="button"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
