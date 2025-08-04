"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MonthViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function MonthView({ currentDate, onDateChange }: MonthViewProps) {
  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Primeiro dia do mês
  const firstDayOfMonth = new Date(year, month, 1);
  // Último dia do mês
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Primeiro dia da semana que contém o primeiro dia do mês
  const firstDayOfWeek = new Date(firstDayOfMonth);
  firstDayOfWeek.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

  // Último dia da semana que contém o último dia do mês
  const lastDayOfWeek = new Date(lastDayOfMonth);
  lastDayOfWeek.setDate(
    lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay())
  );

  // Gerar todas as datas do calendário
  const calendarDays = [];
  const currentDay = new Date(firstDayOfWeek);

  while (currentDay <= lastDayOfWeek) {
    calendarDays.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
  }

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Mock data para agendamentos por dia
  const appointmentsPerDay: Record<string, number> = {
    "2024-08-05": 3,
    "2024-08-06": 1,
    "2024-08-07": 5,
    "2024-08-08": 2,
  };

  const getAppointmentCount = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return appointmentsPerDay[dateStr] || 0;
  };

  return (
    <div className="p-4">
      {/* Header dos dias da semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(dayName => (
          <div
            key={dayName}
            className="p-2 text-center text-sm font-medium text-muted-foreground"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Grid do calendário */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(date => {
          const isToday = date.toDateString() === today.toDateString();
          const isCurrentMonth = date.getMonth() === month;
          const isSelected = date.toDateString() === currentDate.toDateString();
          const appointmentCount = getAppointmentCount(date);

          return (
            <div
              key={date.toISOString()}
              className={cn(
                "min-h-[80px] p-2 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                !isCurrentMonth && "text-muted-foreground bg-muted/20",
                isSelected && "bg-primary/10 border-primary",
                isToday && "bg-blue-50 border-blue-200"
              )}
              onClick={() => onDateChange(date)}
            >
              <div
                className={cn(
                  "text-sm font-medium w-6 h-6 rounded-full flex items-center justify-center",
                  isToday && "bg-blue-500 text-white"
                )}
              >
                {date.getDate()}
              </div>

              {appointmentCount > 0 && (
                <div className="mt-1">
                  <div className="text-xs bg-primary/20 text-primary px-1 py-0.5 rounded truncate">
                    {appointmentCount} agendamento
                    {appointmentCount > 1 ? "s" : ""}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
