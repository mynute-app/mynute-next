"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, User, Briefcase } from "lucide-react";
import type {
  Appointment,
  ClientInfo,
  ServiceInfo,
  EmployeeInfo,
} from "../../../../../../types/appointment";
import type { Service } from "../../../../../../types/company";

interface MultipleAppointmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  clientInfo: ClientInfo[];
  serviceInfo: ServiceInfo[];
  employeeInfo: EmployeeInfo[];
  services: Service[];
  onAppointmentClick: (appointment: Appointment) => void;
}

export function MultipleAppointmentsModal({
  isOpen,
  onClose,
  appointments,
  clientInfo,
  serviceInfo,
  employeeInfo,
  services,
  onAppointmentClick,
}: MultipleAppointmentsModalProps) {
  if (!appointments.length) return null;

  // Pegar horário do primeiro agendamento para o título
  const startTime = new Date(appointments[0].start_time);
  const timeString = `${startTime
    .getHours()
    .toString()
    .padStart(2, "0")}:${startTime.getMinutes().toString().padStart(2, "0")}`;

  const dateString = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(startTime);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agendamentos às {timeString}</DialogTitle>
          <DialogDescription>
            {dateString} - {appointments.length} agendamento
            {appointments.length > 1 ? "s" : ""} neste horário
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {appointments.map((appointment, index) => {
            // Buscar nome do serviço na resposta da API
            const service = serviceInfo.find(
              s => s.id === appointment.service_id
            );
            const serviceName = service?.name || "Serviço não encontrado";

            // Buscar nome do cliente na resposta da API
            const client = clientInfo.find(c => c.id === appointment.client_id);
            const clientName = client
              ? `${client.name} ${client.surname}`
              : `Cliente ${appointment.client_id.slice(0, 8)}...`;

            const colors = [
              "border-primary bg-primary/5 hover:bg-primary/10",
              "border-blue-500 bg-blue-500/5 hover:bg-blue-500/10",
              "border-purple-500 bg-purple-500/5 hover:bg-purple-500/10",
              "border-green-500 bg-green-500/5 hover:bg-green-500/10",
              "border-orange-500 bg-orange-500/5 hover:bg-orange-500/10",
              "border-pink-500 bg-pink-500/5 hover:bg-pink-500/10",
            ];

            const colorClass = colors[index % colors.length];

            return (
              <Card
                key={appointment.id}
                className={`cursor-pointer transition-all border-l-4 ${colorClass}`}
                onClick={() => onAppointmentClick(appointment)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-semibold">{serviceName}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4 flex-shrink-0" />
                        <span>{clientName}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span>
                          {timeString} -{" "}
                          {(() => {
                            const end = new Date(appointment.end_time);
                            return `${end
                              .getHours()
                              .toString()
                              .padStart(2, "0")}:${end
                              .getMinutes()
                              .toString()
                              .padStart(2, "0")}`;
                          })()}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      #{index + 1}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
