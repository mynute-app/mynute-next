"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AppointmentBlock } from "./appointment-block";

interface TimeGridProps {
  weekDays: Date[];
  currentDate: Date;
}

// Mock data para demonstração
const mockAppointments = [
  {
    id: "1",
    title: "Corte de Cabelo",
    client: "João Silva",
    time: "09:00",
    duration: 60,
    day: 1, // Segunda-feira
    employee: "Carlos Barbeiro",
  },
  {
    id: "2",
    title: "Barba",
    client: "Pedro Santos",
    time: "14:30",
    duration: 30,
    day: 1, // Segunda-feira
    employee: "Carlos Barbeiro",
  },
  {
    id: "3",
    title: "Corte + Barba",
    client: "Maria Oliveira",
    time: "10:00",
    duration: 90,
    day: 3, // Quarta-feira
    employee: "Ana Silva",
  },
];

export function TimeGrid({ weekDays, currentDate }: TimeGridProps) {
  // Gerar horários de 08:00 às 18:00 de 30 em 30 minutos
  const timeSlots = Array.from({ length: 20 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  });

  const getAppointmentsForDayAndTime = (dayIndex: number, time: string) => {
    return mockAppointments.filter(
      apt => apt.day === dayIndex && apt.time === time
    );
  };

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
            const appointments = getAppointmentsForDayAndTime(dayIndex, time);

            return (
              <div
                key={`${day.toISOString()}-${time}`}
                className={cn(
                  "h-12 border-b hover:bg-muted/30 cursor-pointer transition-colors relative",
                  dayIndex === 0 || dayIndex === 6 ? "bg-muted/20" : ""
                )}
              >
                {appointments.map(appointment => (
                  <AppointmentBlock
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
