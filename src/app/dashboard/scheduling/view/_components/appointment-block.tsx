"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Clock, User, Users } from "lucide-react";
import type {
  Appointment,
  ClientInfo,
  ServiceInfo,
  EmployeeInfo,
} from "../../../../../../types/appointment";
import type { Service } from "../../../../../../types/company";

interface AppointmentBlockProps {
  appointment: Appointment;
  clientInfo: ClientInfo[];
  serviceInfo: ServiceInfo[];
  employeeInfo: EmployeeInfo[];
  services: Service[];
  onAppointmentClick: (appointment: Appointment) => void;
  totalInSlot?: number;
  indexInSlot?: number;
}

export function AppointmentBlock({
  appointment,
  clientInfo,
  serviceInfo,
  employeeInfo,
  services,
  onAppointmentClick,
  totalInSlot = 1,
  indexInSlot = 0,
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

  // Buscar nome do serviço na resposta da API
  const service = serviceInfo.find(s => s.id === appointment.service_id);
  const serviceName = service?.name || "Serviço não encontrado";

  // Buscar nome do cliente na resposta da API
  const client = clientInfo.find(c => c.id === appointment.client_id);
  const clientName = client
    ? `${client.name} ${client.surname}`
    : `Cliente ${appointment.client_id.slice(0, 8)}...`;

  // Calcular largura e posição quando há múltiplos agendamentos
  const hasMultiple = totalInSlot > 1;
  const widthPercentage = hasMultiple ? 100 / totalInSlot : 100;
  const leftPercentage = hasMultiple ? indexInSlot * widthPercentage : 0;

  // Cores diferentes para diferenciar visualmente múltiplos agendamentos
  const colors = [
    "bg-primary/90 border-primary",
    "bg-blue-500/90 border-blue-500",
    "bg-purple-500/90 border-purple-500",
    "bg-green-500/90 border-green-500",
    "bg-orange-500/90 border-orange-500",
    "bg-pink-500/90 border-pink-500",
  ];

  const colorClass = hasMultiple
    ? colors[indexInSlot % colors.length]
    : colors[0];

  return (
    <div
      className={cn(
        "absolute text-primary-foreground rounded-md p-1 text-xs border overflow-hidden z-10",
        "hover:brightness-110 transition-all cursor-pointer",
        colorClass,
        hasMultiple && "shadow-sm"
      )}
      style={{
        height: `${height - 2}px`,
        width: hasMultiple
          ? `calc(${widthPercentage}% - 2px)`
          : "calc(100% - 8px)",
        left: hasMultiple ? `calc(${leftPercentage}% + 1px)` : "4px",
        right: hasMultiple ? "auto" : "4px",
      }}
      title={`${serviceName} - ${clientName}${
        hasMultiple ? ` (${indexInSlot + 1}/${totalInSlot})` : ""
      }`}
      onClick={e => {
        e.stopPropagation();
        onAppointmentClick(appointment);
      }}
    >
      {/* Badge indicando múltiplos agendamentos (apenas no primeiro) */}
      {hasMultiple && indexInSlot === 0 && (
        <div className="absolute -top-1 -left-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow-sm z-20">
          {totalInSlot}
        </div>
      )}

      <div className="font-medium truncate text-[10px]">{serviceName}</div>
      <div className="flex items-center gap-1 text-[10px] opacity-90 mt-0.5">
        <User className="h-2.5 w-2.5 flex-shrink-0" />
        <span className="truncate">{clientName}</span>
      </div>
      <div className="flex items-center gap-1 text-[10px] opacity-90">
        <Clock className="h-2.5 w-2.5 flex-shrink-0" />
        <span>{timeString}</span>
      </div>
    </div>
  );
}
