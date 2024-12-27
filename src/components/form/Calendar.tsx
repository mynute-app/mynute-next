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
      const timeMin = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      ).toISOString();
      const timeMax = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      ).toISOString();

      try {
        const response = await fetch(
          `/api/getBusySlots?calendarId=primary&timeMin=${timeMin}&timeMax=${timeMax}`
        );
        const data = await response.json();

        // Verifica se a resposta é um array antes de atualizar o estado
        if (Array.isArray(data)) {
          setBusySlots(data);
        } else {
          console.error("Resposta inesperada da API:", data);
          setBusySlots([]); // Define como array vazio em caso de erro
        }
      } catch (error) {
        console.error("Erro ao buscar horários ocupados:", error);
        setBusySlots([]); // Define como array vazio em caso de erro
      }
    }

    fetchBusySlots();
  }, [currentDate]);


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
      const isPast = currentDay < new Date(today.setHours(0, 0, 0, 0)); // Verifica se a data é passada
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
          onClick={() => !isPast && handleDateClick(i)} // Impede clique em datas passadas
          disabled={isPast} // Desabilita o botão
        >
          {i}
        </Button>
      );
    }

    return days;
  };

  const renderHours = () => {
    return hours.map(hour => {
      const isBusy =
        Array.isArray(busySlots) &&
        busySlots.some(slot => {
          const start = new Date(slot.start);
          const end = new Date(slot.end);
          const selectedTime = new Date(selectedDate as Date);
          selectedTime.setHours(
            parseInt(hour.split(":")[0]),
            parseInt(hour.split(":")[1])
          );
          return selectedTime >= start && selectedTime < end;
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
