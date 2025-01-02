import React, { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/context/useWizardStore";

const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

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
  const { selectedCalendarDate, setSelectedCalendarDate } = useWizardStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [busySlots, setBusySlots] = useState<{ start: string; end: string }[]>(
    []
  );

  const hours = generateHours();

  useEffect(() => {
    async function fetchBusySlots() {
      const timeMin = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      ).toISOString();
      const timeMax = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
        23,
        59,
        59
      ).toISOString();

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
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedCalendarDate({
      start: {
        dateTime: selectedDate.toISOString(),
        timeZone: "America/Sao_Paulo",
      },
      end: {
        dateTime: "", // Reseta o horário inicialmente
        timeZone: "America/Sao_Paulo",
      },
    });
  };

  const handleHourClick = (hour: string) => {
    if (selectedCalendarDate) {
      const startDate = new Date(selectedCalendarDate.start.dateTime);
      const [hourPart, minutePart] = hour.split(":").map(Number);
      startDate.setHours(hourPart, minutePart);

      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + 30); // Incrementa 30 minutos

      setSelectedCalendarDate({
        start: {
          dateTime: startDate.toISOString(),
          timeZone: "America/Sao_Paulo",
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: "America/Sao_Paulo",
        },
      });
    }
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
        selectedCalendarDate?.start.dateTime &&
        new Date(selectedCalendarDate.start.dateTime).getDate() === i &&
        currentDate.getMonth() ===
          new Date(selectedCalendarDate.start.dateTime).getMonth();

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
    if (!selectedCalendarDate?.start.dateTime) return null;

    return hours.map(hour => {
      const isBusy = busySlots.some(slot => {
        const slotStart = new Date(slot.start);
        const slotEnd = new Date(slot.end);

        const selectedTime = new Date(selectedCalendarDate.start.dateTime);
        const [hourPart, minutePart] = hour.split(":").map(Number);
        selectedTime.setHours(hourPart, minutePart);

        return selectedTime >= slotStart && selectedTime < slotEnd;
      });

      return (
        <Button
          key={hour}
          variant={
            selectedCalendarDate.start.dateTime &&
            new Date(selectedCalendarDate.start.dateTime).toLocaleTimeString(
              "pt-BR",
              { hour: "2-digit", minute: "2-digit" }
            ) === hour
              ? "default"
              : "outline"
          }
          className={`p-2 text-sm ${
            isBusy
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
      {selectedCalendarDate?.start.dateTime && (
        <>
          <h3 className="text-center text-lg font-semibold">
            {new Date(selectedCalendarDate.start.dateTime).toLocaleDateString(
              "pt-BR"
            )}
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-4">
            {renderHours()}
          </div>
        </>
      )}
    </div>
  );
}
// end
// : 
// {dateTime: '2025-01-06T19:30:00.000Z', timeZone: 'America/Sao_Paulo'}
// start
// : 
// {dateTime: '2025-01-06T19:00:00.000Z', timeZone: 'America/Sao_Paulo'}
// [[Prototype]]
// : 
// Object
