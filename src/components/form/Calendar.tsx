import React, { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Gera dinamicamente os horários disponíveis
const generateHours = () => {
  const hours = [];
  let currentTime = new Date(2024, 0, 1, 9, 0); // Começa às 9:00
  const endTime = new Date(2024, 0, 1, 17, 0); // Termina às 17:00

  while (currentTime <= endTime) {
    const hour = currentTime.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    hours.push(hour);
    currentTime.setMinutes(currentTime.getMinutes() + 30); // Incrementa 30 minutos
  }
  return hours;
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [busySlots, setBusySlots] = useState<{ start: string; end: string }[]>(
    []
  );

  const hours = generateHours();

  useEffect(() => {
    async function fetchBusySlots() {
      // Define o intervalo baseado no mês atual exibido no calendário
      const timeMin = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      ).toISOString(); // Primeiro dia do mês exibido
      const timeMax = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
        23,
        59,
        59
      ).toISOString(); // Último dia do mês exibido

      try {
        const response = await fetch(
          `/api/calendar/busySlots?calendarId=vitoraugusto2010201078@gmail.com&timeMin=${timeMin}&timeMax=${timeMax}`
        );
        const data = await response.json();

        if (Array.isArray(data)) {
          setBusySlots(data);
        } else {
          console.error("Resposta inesperada da API:", data);
          setBusySlots([]);
        }
      } catch (error) {
        console.error("Erro ao buscar horários ocupados:", error);
        setBusySlots([]);
      }
    }

    fetchBusySlots();
  }, [currentDate]); // Atualiza ao mudar o mês exibido

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
    setSelectedDate(null);
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    );
    setSelectedHour(null);
  };

  const handleHourClick = (hour: string) => {
    setSelectedHour(hour);
  };

  const renderCalendar = () => {
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    ).getDay();
    const today = new Date();
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const currentDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        i
      );
      const isPast = currentDay < new Date(today.setHours(0, 0, 0, 0));
      const isSelected =
        selectedDate?.getDate() === i &&
        selectedDate?.getMonth() === currentDate.getMonth();

      days.push(
        <Button
          key={i}
          variant={isSelected ? "default" : "outline"}
          className={`w-full h-full aspect-square text-sm ${
            isSelected
              ? "bg-primary text-primary-foreground"
              : isPast
              ? "opacity-50 cursor-not-allowed bg-zinc-300"
              : "hover:bg-primary hover:text-primary-foreground"
          }`}
          onClick={() => !isPast && handleDateClick(i)}
          disabled={isPast}
        >
          {i}
        </Button>
      );
    }

    return days;
  };

  const renderHours = () => {
    if (!selectedDate) return null;

    return hours.map(hour => {
      const isBusy = busySlots.some(slot => {
        const slotStart = new Date(slot.start);
        const slotEnd = new Date(slot.end);

        // Verifica se o horário atual está dentro do intervalo ocupado
        const selectedTime = new Date(selectedDate);
        selectedTime.setHours(
          parseInt(hour.split(":")[0], 10),
          parseInt(hour.split(":")[1], 10)
        );

        return selectedTime >= slotStart && selectedTime < slotEnd;
      });

      return (
        <Button
          key={hour}
          variant={selectedHour === hour ? "default" : "outline"}
          className={`p-2 text-sm ${
            selectedHour === hour
              ? "bg-primary text-primary-foreground"
              : isBusy
              ? "opacity-50 cursor-not-allowed bg-zinc-300"
              : "hover:bg-primary hover:text-primary-foreground"
          }`}
          onClick={() => !isBusy && handleHourClick(hour)}
          disabled={isBusy}
        >
          {hour}
        </Button>
      );
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" className="p-1" onClick={handlePrevMonth}>
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold text-center">
          {currentDate.toLocaleString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <Button variant="outline" className="p-1" onClick={handleNextMonth}>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="font-medium">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 mb-4">{renderCalendar()}</div>
      {selectedDate && (
        <>
          <h3 className="text-center text-lg font-semibold">
            {selectedDate.toLocaleDateString("pt-BR")}
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-4">
            {renderHours()}
          </div>
        </>
      )}
      {selectedDate && selectedHour && (
        <div className="mt-4 text-center font-semibold text-sm">
          Data e hora selecionadas: {selectedDate.toLocaleDateString("pt-BR")}{" "}
          às {selectedHour}
        </div>
      )}
    </div>
  );
}
