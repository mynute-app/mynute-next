"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Clock, User } from "lucide-react";
import type { Appointment } from "../../../../../../types/appointment";
import type { Service } from "../../../../../../types/company";

interface AppointmentBlockProps {
  appointment: Appointment;
  services: Service[];
  onAppointmentClick: (appointment: Appointment) => void;
}

export function AppointmentBlock({
  appointment,
  services,
  onAppointmentClick,
}: AppointmentBlockProps) {
  // Calcular duração em minutos
  const startTime = new Date(appointment.start_time);
  const endTime = new Date(appointment.end_time);
  const durationMinutes =
    (endTime.getTime() - startTime.getTime()) / (1000 * 60);

  // Calcular altura baseada na duração (30min = 48px de altura)
  const height = (durationMinutes / 30) * 48;

  // Formatar hora
  const timeString = `${startTime
    .getHours()
    .toString()
    .padStart(2, "0")}:${startTime.getMinutes().toString().padStart(2, "0")}`;

  // Buscar nome do serviço
  const service = services.find(s => s.id === appointment.service_id);
  const serviceName = service?.name || "Serviço não encontrado";

  // Manter ID do cliente por enquanto (sem rota disponível)
  const clientName = `Cliente ${appointment.client_id.slice(0, 8)}...`;

  return (
    <div
      className={cn(
        "absolute left-1 right-1 bg-primary/90 text-primary-foreground rounded-md p-1 text-xs border border-primary overflow-hidden z-10",
        "hover:bg-primary transition-colors cursor-pointer"
      )}
      style={{ height: `${height - 2}px` }}
      title={`${serviceName} - ${clientName}`}
      onClick={e => {
        e.stopPropagation();
        onAppointmentClick(appointment);
      }}
    >
      <div className="font-medium truncate">{serviceName}</div>
      <div className="flex items-center gap-1 text-xs opacity-90 mt-0.5">
        <User className="h-3 w-3" />
        <span className="truncate">{clientName}</span>
      </div>
      <div className="flex items-center gap-1 text-xs opacity-90">
        <Clock className="h-3 w-3" />
        <span>{timeString}</span>
      </div>
    </div>
  );
}
