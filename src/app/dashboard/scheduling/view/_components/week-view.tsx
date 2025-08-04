"use client";

import React from "react";
import { WeekHeader } from "./week-header";
import { TimeGrid } from "./time-grid";

interface WeekViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function WeekView({ currentDate, onDateChange }: WeekViewProps) {
  // Calcular o início da semana (domingo)
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  // Gerar os 7 dias da semana
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  return (
    <div className="flex flex-col h-full">
      <WeekHeader
        weekDays={weekDays}
        currentDate={currentDate}
        onDateChange={onDateChange}
      />
      <div className="flex-1 overflow-auto">
        <TimeGrid weekDays={weekDays} currentDate={currentDate} />
      </div>
    </div>
  );
}
