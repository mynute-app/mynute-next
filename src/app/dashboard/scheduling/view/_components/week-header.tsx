"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface WeekHeaderProps {
  weekDays: Date[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function WeekHeader({
  weekDays,
  currentDate,
  onDateChange,
}: WeekHeaderProps) {
  const today = new Date();
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="grid grid-cols-8 border-b bg-muted/20">
      {/* Coluna vazia para os horários */}
      <div className="p-2 border-r bg-background">
        <div className="h-12"></div>
      </div>

      {/* Colunas dos dias */}
      {weekDays.map((day, index) => {
        const isToday = day.toDateString() === today.toDateString();
        const isSelected = day.toDateString() === currentDate.toDateString();

        return (
          <div
            key={day.toISOString()}
            className={cn(
              "p-2 border-r cursor-pointer hover:bg-muted/50 transition-colors",
              isSelected && "bg-primary/10"
            )}
            onClick={() => onDateChange(day)}
          >
            <div className="text-center">
              <div className="text-xs text-muted-foreground font-medium">
                {dayNames[index]}
              </div>
              <div
                className={cn(
                  "text-sm font-medium mt-1 w-8 h-8 rounded-full flex items-center justify-center mx-auto",
                  isToday && "bg-primary text-primary-foreground",
                  isSelected && !isToday && "bg-muted"
                )}
              >
                {day.getDate()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
