"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AppointmentBlock } from "./appointment-block";
import { MultipleAppointmentsCard } from "./multiple-appointments-card";
import type { Appointment } from "../../../../../../types/appointment";
import type { Service } from "../../../../../../types/company";

interface TimeGridProps {
  weekDays: Date[];
  currentDate: Date;
  appointments: Appointment[];
  isLoading: boolean;
  services: Service[];
  onAppointmentClick: (appointment: Appointment) => void;
}

export function TimeGrid({
  weekDays,
  currentDate,
  appointments,
  isLoading,
  services,
  onAppointmentClick,
}: TimeGridProps) {
  // Gerar horários de 08:00 às 18:00 de 30 em 30 minutos
  const timeSlots = Array.from({ length: 20 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  });

  // Função para verificar se um agendamento está em determinado dia e horário
  const getAppointmentsForDayAndTime = (day: Date, time: string) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.start_time);
      const aptTime = `${aptDate
        .getHours()
        .toString()
        .padStart(2, "0")}:${aptDate.getMinutes().toString().padStart(2, "0")}`;

      // Comparar data (apenas dia, mês e ano)
      const isSameDay =
        aptDate.getDate() === day.getDate() &&
        aptDate.getMonth() === day.getMonth() &&
        aptDate.getFullYear() === day.getFullYear();

      return isSameDay && aptTime === time;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando agendamentos...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-8 relative">
      {/* Coluna dos horários */}
      <div className="border-r bg-background">
        {timeSlots.map(time => (
          <div
            key={time}
            className="h-12 px-2 py-1 border-b text-xs text-muted-foreground flex items-center justify-end"
          >
            {time}
          </div>
        ))}
      </div>

      {/* Colunas dos dias */}
      {weekDays.map((day, dayIndex) => (
        <div key={day.toISOString()} className="border-r relative">
          {timeSlots.map(time => {
            const dayAppointments = getAppointmentsForDayAndTime(day, time);
            const hasMultiple = dayAppointments.length > 1;

            return (
              <div
                key={`${day.toISOString()}-${time}`}
                className={cn(
                  "h-12 border-b hover:bg-muted/30 cursor-pointer transition-colors relative",
                  dayIndex === 0 || dayIndex === 6 ? "bg-muted/20" : ""
                )}
              >
                {hasMultiple ? (
                  // Mostrar card especial quando houver múltiplos agendamentos
                  <MultipleAppointmentsCard
                    appointments={dayAppointments}
                    services={services}
                    height={48}
                    onAppointmentClick={onAppointmentClick}
                  />
                ) : (
                  // Mostrar agendamento único normalmente
                  dayAppointments.map((appointment, index) => (
                    <AppointmentBlock
                      key={appointment.id}
                      appointment={appointment}
                      services={services}
                      onAppointmentClick={onAppointmentClick}
                      totalInSlot={dayAppointments.length}
                      indexInSlot={index}
                    />
                  ))
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
