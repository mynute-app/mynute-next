"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { formatPhone } from "@/utils/format-cnpj";
import { Clock, User, Ban, Calendar, Phone, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type {
  Appointment,
  ClientInfo,
  ServiceInfo,
  EmployeeInfo,
} from "../../../../../../types/appointment";
import type { Service } from "../../../../../../types/company";

interface DayViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  appointments: Appointment[];
  clientInfo: ClientInfo[];
  serviceInfo: ServiceInfo[];
  employeeInfo: EmployeeInfo[];
  isLoading: boolean;
  services: Service[];
  onAppointmentClick: (appointment: Appointment) => void;
}

export function DayView({
  currentDate,
  onDateChange,
  appointments,
  clientInfo,
  serviceInfo,
  employeeInfo,
  isLoading,
  services,
  onAppointmentClick,
}: DayViewProps) {
  // Filtrar agendamentos do dia atual
  const dayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.start_time);
    return (
      aptDate.getDate() === currentDate.getDate() &&
      aptDate.getMonth() === currentDate.getMonth() &&
      aptDate.getFullYear() === currentDate.getFullYear()
    );
  });

  // Ordenar por horário
  const sortedAppointments = [...dayAppointments].sort((a, b) => {
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });

  // Formatar hora
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  // Calcular duração
  const getDuration = (start: string, end: string) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const minutes = Math.round((endTime - startTime) / (1000 * 60));

    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0
        ? `${hours}h ${remainingMinutes}min`
        : `${hours}h`;
    }
    return `${minutes}min`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground text-sm">
            Carregando agendamentos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-muted/20">
      {/* Cabeçalho do dia */}
      <div className="bg-background border-b px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold capitalize">
                  {currentDate.toLocaleDateString("pt-BR", { weekday: "long" })}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground pl-8">
                {currentDate.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {sortedAppointments.length}
              </div>
              <div className="text-xs text-muted-foreground">
                {sortedAppointments.length === 1
                  ? "agendamento"
                  : "agendamentos"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de agendamentos */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-3">
          {sortedAppointments.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="space-y-3">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">Nenhum agendamento</h3>
                <p className="text-sm text-muted-foreground">
                  Não há agendamentos para este dia.
                </p>
              </div>
            </Card>
          ) : (
            sortedAppointments.map((appointment, index) => {
              const client = clientInfo.find(
                c => c.id === appointment.client_id
              );
              const service = serviceInfo.find(
                s => s.id === appointment.service_id
              );
              const employee = employeeInfo.find(
                e => e.id === appointment.employee_id
              );

              const isCancelled =
                appointment.cancelled || appointment.is_cancelled;

              return (
                <Card
                  key={appointment.id}
                  className={cn(
                    "p-4 hover:shadow-md transition-all cursor-pointer border-l-4",
                    isCancelled
                      ? "border-l-gray-400 bg-gray-50/50 opacity-70"
                      : "border-l-primary hover:border-l-primary/80"
                  )}
                  onClick={() => onAppointmentClick(appointment)}
                >
                  <div className="flex gap-4">
                    {/* Horário */}
                    <div className="flex flex-col items-center justify-center min-w-[80px] border-r pr-4">
                      <div
                        className={cn(
                          "text-2xl font-bold",
                          isCancelled ? "text-gray-400" : "text-primary"
                        )}
                      >
                        {formatTime(appointment.start_time)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(appointment.end_time)}
                      </div>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {getDuration(
                          appointment.start_time,
                          appointment.end_time
                        )}
                      </Badge>
                    </div>

                    {/* Detalhes */}
                    <div className="flex-1 space-y-2">
                      {/* Status e Serviço */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1">
                          <h3
                            className={cn(
                              "font-semibold text-base",
                              isCancelled && "line-through text-gray-500"
                            )}
                          >
                            {service?.name || "Serviço não encontrado"}
                          </h3>
                          {service?.price && (
                            <p className="text-sm text-muted-foreground">
                              R$ {service.price.toFixed(2)}
                            </p>
                          )}
                        </div>
                        {isCancelled && (
                          <Badge variant="destructive" className="gap-1">
                            <Ban className="h-3 w-3" />
                            Cancelado
                          </Badge>
                        )}
                      </div>

                      <Separator />

                      {/* Cliente */}
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {client
                            ? `${client.name} ${client.surname}`
                            : "Cliente não encontrado"}
                        </span>
                        {client?.phone && (
                          <>
                            <Separator orientation="vertical" className="h-4" />
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {formatPhone(client.phone)}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Funcionário */}
                      {employee && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            Com {employee.name} {employee.surname}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
