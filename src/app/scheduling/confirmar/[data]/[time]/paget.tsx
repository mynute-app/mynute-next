"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const timeSlots = [
  ["9:00", "9:15"],
  ["9:30", "9:45"],
  ["10:00", "10:15"],
  ["10:30", "10:45"],
  ["11:00", "11:15"],
  ["11:30", "11:45"],
  ["12:00", "12:15"],
  ["12:30", "12:45"],
  ["13:00", "13h15"],
  ["13h30", "13h45"],
  ["14:00", "14h15"],
];

const services = {
  sobrancelha: {
    name: "Sobrancelha",
    duration: "10 minutos",
    price: "R$ 20",
    provider: "Augusto",
  },
  testador: {
    name: "Testador",
    duration: "20 minutos",
    price: "R$ 50",
    provider: "Vitor Augusto",
  },
};

export default function AgendarPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.service as string;
  const service = services[serviceId as keyof typeof services];

  const [selectedDate, setSelectedDate] = useState(10);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  if (!service) {
    return <div className="p-4">Serviço não encontrado</div>;
  }

  const daysOfWeek = ["S", "T", "Q", "Q", "S", "S", "D"];
  const currentMonth = "Abril de 2025";
  const selectedDayText = "Quinta-feira 10 de abril";

  // Generate calendar days
  const calendarDays = [
    [31, 1, 2, 3, 4, 5, 6],
    [7, 8, 9, 10, 11, 12, 13],
    [14, 15, 16, 17, 18, 19, 20],
    [21, 22, 23, 24, 25, 26, 27],
    [28, 29, 30, 1, 2, 3, 4],
    [5, 6, 7, 8, 9, 10, 11],
  ];

  // Determine which days are in the current month vs. previous/next month
  const isCurrentMonth = (day: number, weekIndex: number) => {
    if (weekIndex === 0 && day > 7) return false; // Previous month
    if (weekIndex >= 4 && day < 15) return false; // Next month
    return true;
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleContinue = () => {
    if (selectedTime) {
      // Format the date as YYYY-MM-DD
      const formattedDate = `2025-04-${selectedDate
        .toString()
        .padStart(2, "0")}`;
      // Format the time for the URL (replace : with -)
      const formattedTime = selectedTime.replace(":", "-");
      router.push(`/confirmar/${serviceId}/${formattedDate}/${formattedTime}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 p-4">
        <div className="container mx-auto flex items-center">
          <Link href="/" className="flex items-center text-zinc-300">
            <ChevronLeft className="h-5 w-5 mr-2" />
            <span>Selecione um horário</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:flex md:gap-8">
        {/* Left Column - Calendar */}
        <div className="md:w-2/3 mb-8 md:mb-0">
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <h2 className="text-xl font-bold mb-6">{service.name}</h2>

            {/* Month Navigation */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg">{currentMonth}</h3>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Calendar */}
            <div className="mb-6">
              {/* Days of week */}
              <div className="grid grid-cols-7 mb-2">
                {daysOfWeek.map((day, i) => (
                  <div key={i} className="text-center text-zinc-500 text-sm">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              {calendarDays.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 mb-2">
                  {week.map((day, dayIndex) => {
                    const isInMonth = isCurrentMonth(day, weekIndex);
                    const isSelected = day === selectedDate && isInMonth;

                    return (
                      <button
                        key={dayIndex}
                        className={`h-10 w-10 rounded-full mx-auto flex items-center justify-center text-sm
                          ${!isInMonth ? "text-zinc-700" : ""}
                          ${isSelected ? "bg-white text-black" : ""}
                          ${isInMonth && !isSelected ? "hover:bg-zinc-800" : ""}
                        `}
                        onClick={() => isInMonth && setSelectedDate(day)}
                        disabled={!isInMonth}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Time Zone */}
            <div className="mb-6">
              <p className="text-sm text-zinc-400 mb-2">Fuso horário</p>
              <Select defaultValue="brasil-sp">
                <SelectTrigger className="bg-zinc-900 border-zinc-700">
                  <SelectValue placeholder="Selecione o fuso horário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brasil-sp">Brasil - São Paulo</SelectItem>
                  <SelectItem value="brasil-rj">
                    Brasil - Rio de Janeiro
                  </SelectItem>
                  <SelectItem value="brasil-df">Brasil - Brasília</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </div>

        {/* Right Column - Time Slots and Summary */}
        <div className="md:w-1/3">
          {/* Selected Date */}
          <div className="mb-4 text-lg font-medium">{selectedDayText}</div>

          {/* Time Slots */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {timeSlots.map((row, rowIndex) =>
              row.map((time, colIndex) => {
                const timeKey = `${rowIndex}-${colIndex}`;
                const isSelected = selectedTime === time;

                return (
                  <Button
                    key={timeKey}
                    variant="outline"
                    className={`border-zinc-700 hover:bg-zinc-800 hover:text-white justify-center py-6
                      ${
                        isSelected
                          ? "bg-white text-black hover:bg-white hover:text-black"
                          : "bg-zinc-900"
                      }
                    `}
                    onClick={() => handleTimeSelect(time)}
                  >
                    {time.includes("h") ? time : `${time} da manhã`}
                  </Button>
                );
              })
            )}
          </div>

          {/* Provider Card */}
          <Card className="bg-zinc-900 border-zinc-800 p-4 mb-4">
            <h3 className="text-lg font-medium text-center">Vitor</h3>
          </Card>

          {/* Summary Card */}
          <Card className="bg-zinc-900 border-zinc-800 p-4 mb-4">
            <h3 className="text-lg font-medium mb-4">Resumo</h3>

            <div className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <p>{service.name}</p>
                  <p className="text-sm text-zinc-400">
                    {service.duration} · com {service.provider}
                  </p>
                </div>
                <p>{service.price}</p>
              </div>

              <div className="border-t border-zinc-800 pt-4 flex justify-between font-medium">
                <p>Total a pagar</p>
                <p>{service.price}</p>
              </div>
            </div>
          </Card>

          {/* Continue Button */}
          {selectedTime && (
            <Button
              className="w-full rounded-full bg-white text-black hover:bg-zinc-200"
              onClick={handleContinue}
            >
              Continuar
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
