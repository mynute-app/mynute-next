"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  availableDates?: string[]; // Array de datas disponíveis no formato 'YYYY-MM-DD'
  minDate?: Date;
  maxDate?: Date;
}

export function Calendar({
  selectedDate,
  onDateSelect,
  availableDates = [],
  minDate,
  maxDate,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { days, monthYear } = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1);
    // Último dia do mês
    const lastDay = new Date(year, month + 1, 0);

    // Dia da semana do primeiro dia (0 = domingo, 1 = segunda, etc.)
    const startingDayOfWeek = firstDay.getDay();

    // Dias para mostrar
    const daysArray = [];

    // Dias do mês anterior (para preencher o início)
    for (let i = startingDayOfWeek; i > 0; i--) {
      const prevDate = new Date(year, month, 1 - i);
      daysArray.push({
        date: prevDate,
        isCurrentMonth: false,
        dateString: prevDate.toISOString().split("T")[0],
      });
    }

    // Dias do mês atual
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      daysArray.push({
        date,
        isCurrentMonth: true,
        dateString: date.toISOString().split("T")[0],
      });
    }

    // Dias do próximo mês (para preencher o final)
    const remainingDays = 42 - daysArray.length; // 6 semanas * 7 dias
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      daysArray.push({
        date: nextDate,
        isCurrentMonth: false,
        dateString: nextDate.toISOString().split("T")[0],
      });
    }

    return {
      days: daysArray,
      monthYear: firstDay.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      }),
    };
  }, [currentMonth]);

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev.getFullYear(), prev.getMonth() - 1);
      const today = new Date();
      const currentMonthYear = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

      // Não permitir voltar para meses anteriores ao mês atual
      if (newMonth < currentMonthYear) {
        return prev; // Mantém o mês atual
      }

      return newMonth;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const isDateDisabled = (
    date: Date,
    dateString: string,
    isCurrentMonth: boolean
  ) => {
    if (!isCurrentMonth) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Data no passado
    if (date < today) return true;

    // Antes da data mínima
    if (minDate && date < minDate) return true;

    // Depois da data máxima
    if (maxDate && date > maxDate) return true;

    // Não está na lista de datas disponíveis (se fornecida e não vazia)
    // Se availableDates estiver vazio, permite qualquer data futura válida
    if (availableDates.length > 0 && !availableDates.includes(dateString)) {
      return true;
    }

    return false;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isDateAvailable = (dateString: string) => {
    // Se availableDates estiver vazio, considera todas as datas futuras como disponíveis
    if (availableDates.length === 0) {
      return true;
    }
    return availableDates.includes(dateString);
  };

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Verificar se é possível navegar para o mês anterior
  const canGoToPreviousMonth = useMemo(() => {
    const today = new Date();
    const currentMonthYear = new Date(today.getFullYear(), today.getMonth(), 1);
    const displayedMonthYear = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );

    return displayedMonthYear > currentMonthYear;
  }, [currentMonth]);

  // Verificar se é possível navegar para o próximo mês (baseado em maxDate)
  const canGoToNextMonth = useMemo(() => {
    if (!maxDate) return true;

    const nextMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1
    );
    const maxMonthYear = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

    return nextMonth <= maxMonthYear;
  }, [currentMonth, maxDate]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base capitalize">{monthYear}</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPreviousMonth}
              disabled={!canGoToPreviousMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNextMonth}
              disabled={!canGoToNextMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        {/* Header dos dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grid dos dias */}
        <div className="grid grid-cols-7 gap-1 items-center justify-items-center">
          {days.map(({ date, isCurrentMonth, dateString }, index) => {
            const disabled = isDateDisabled(date, dateString, isCurrentMonth);
            const selected = isDateSelected(date);
            const available = isDateAvailable(dateString);

            return (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 text-xs font-normal flex items-center justify-center",
                  !isCurrentMonth && "text-muted-foreground opacity-30",
                  selected &&
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                  available &&
                    isCurrentMonth &&
                    !selected &&
                    "border border-green-300 bg-green-50/30 hover:bg-green-50/50",
                  disabled &&
                    "opacity-30 cursor-not-allowed hover:bg-transparent"
                )}
                disabled={disabled}
                onClick={() => !disabled && onDateSelect(date)}
              >
                {date.getDate()}
              </Button>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
            <span>Disponível</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-primary"></div>
            <span>Selecionado</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
