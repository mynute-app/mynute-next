import { Clock, User, Car, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  clientName: string;
  service: string;
  vehicle: string;
  time: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  professional?: string;
}

const mockAppointments: Appointment[] = [
  {
    id: "1",
    clientName: "João Silva",
    service: "Lavagem Completa",
    vehicle: "Honda Civic - ABC-1234",
    time: "09:00",
    status: "confirmed",
    professional: "Carlos",
  },
  {
    id: "2",
    clientName: "Maria Santos",
    service: "Polimento",
    vehicle: "Toyota Corolla - DEF-5678",
    time: "10:30",
    status: "pending",
    professional: "Pedro",
  },
  {
    id: "3",
    clientName: "Pedro Oliveira",
    service: "Higienização Interna",
    vehicle: "VW Golf - GHI-9012",
    time: "14:00",
    status: "completed",
    professional: "Lucas",
  },
  {
    id: "4",
    clientName: "Ana Costa",
    service: "Lavagem Simples",
    vehicle: "Fiat Argo - JKL-3456",
    time: "15:30",
    status: "confirmed",
    professional: "Carlos",
  },
];

const statusConfig = {
  confirmed: {
    label: "Confirmado",
    className: "bg-success/10 text-success border-success/20",
  },
  pending: {
    label: "Pendente",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  completed: {
    label: "Concluído",
    className: "bg-muted text-muted-foreground border-border",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export function RecentAppointments() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Agendamentos de Hoje</h3>
            <p className="text-sm text-muted-foreground mt-1">Segunda-feira, 13 de Janeiro</p>
          </div>
          <Button variant="outline" size="sm">
            Ver todos
          </Button>
        </div>
      </div>
      <div className="divide-y divide-border">
        {mockAppointments.map((appointment, index) => (
          <div
            key={appointment.id}
            className="p-4 table-row-hover animate-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-16 text-center">
                <div className="flex items-center justify-center gap-1 text-sm font-medium text-foreground">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {appointment.time}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{appointment.service}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {appointment.clientName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Car className="w-3.5 h-3.5" />
                        {appointment.vehicle}
                      </span>
                    </div>
                    {appointment.professional && (
                      <p className="text-xs text-muted-foreground">
                        Profissional: {appointment.professional}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium",
                        statusConfig[appointment.status].className
                      )}
                    >
                      {statusConfig[appointment.status].label}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
