"use client";

import React from "react";

type ViewType = "week" | "month" | "day";

interface CalendarHeaderProps {
  currentDate: Date;
  viewType: ViewType;
}

export function CalendarHeader({ currentDate, viewType }: CalendarHeaderProps) {
  const getTitle = () => {
    const months = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    if (viewType === "month") {
      return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (viewType === "week") {
      // Para semana, vamos mostrar o intervalo de datas
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return `${startOfWeek.getDate()} ${
        months[startOfWeek.getMonth()]
      } - ${endOfWeek.getDate()} ${
        months[endOfWeek.getMonth()]
      } ${endOfWeek.getFullYear()}`;
    } else {
      return `${currentDate.getDate()} ${
        months[currentDate.getMonth()]
      } ${currentDate.getFullYear()}`;
    }
  };

  return (
    <div className="px-4 py-3 border-b bg-background">
      <h2 className="text-xl font-semibold">{getTitle()}</h2>
    </div>
  );
}
