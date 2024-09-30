import React, { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const hours = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 9, 1)); // October 2024
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

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
    setSelectedDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    );
    setSelectedHour(null);
  };

  const handleHourClick = (hour: string) => {
    setSelectedHour(hour);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected =
        selectedDate?.getDate() === i &&
        selectedDate?.getMonth() === currentDate.getMonth();
      days.push(
        <Button
          key={i}
          variant={isSelected ? "default" : "outline"}
          className={`p-2 w-full h-full aspect-square ${
            isSelected
              ? "bg-primary text-primary-foreground"
              : "hover:bg-primary hover:text-primary-foreground"
          }`}
          onClick={() => handleDateClick(i)}
        >
          {i}
        </Button>
      );
    }

    return days;
  };

  const renderHours = () => {
    return hours.map(hour => (
      <Button
        key={hour}
        variant={selectedHour === hour ? "default" : "outline"}
        className={`p-2 ${
          selectedHour === hour
            ? "bg-primary text-primary-foreground"
            : "hover:bg-primary hover:text-primary-foreground"
        }`}
        onClick={() => handleHourClick(hour)}
      >
        {hour}
      </Button>
    ));
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-background shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" onClick={handlePrevMonth}>
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {currentDate.toLocaleString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <Button variant="outline" onClick={handleNextMonth}>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center font-medium text-sm">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 mb-4">{renderCalendar()}</div>
      {selectedDate && (
        <div>
          <h3 className="font-semibold mb-2">Horário</h3>
          <div className="grid grid-cols-5 gap-2">{renderHours()}</div>
        </div>
      )}
      {!selectedDate && (
        <div className="text-center text-muted-foreground">
          Selecione a data
        </div>
      )}
      {selectedDate && selectedHour && (
        <div className="mt-4 text-center font-semibold">
          Data e hora selecionadas: {selectedDate.toLocaleDateString("pt-BR")}{" "}
          às {selectedHour}
        </div>
      )}
    </div>
  );
}
