import { useState } from "react";
import { format, addDays, isSameDay, startOfToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface DateTimeSelectionProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelectDate: (date: Date) => void;
  onSelectTime: (time: string) => void;
  availableSlots?: TimeSlot[];
}

export const DateTimeSelection = ({
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  availableSlots
}: DateTimeSelectionProps) => {
  const today = startOfToday();
  const [weekOffset, setWeekOffset] = useState(0);
  
  // Generate next 7 days from current week offset
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i + (weekOffset * 7)));
  
  // Mock time slots if not provided
  const defaultSlots: TimeSlot[] = [
    { time: "08:00", available: true },
    { time: "08:30", available: true },
    { time: "09:00", available: false },
    { time: "09:30", available: true },
    { time: "10:00", available: true },
    { time: "10:30", available: true },
    { time: "11:00", available: false },
    { time: "11:30", available: true },
    { time: "14:00", available: true },
    { time: "14:30", available: true },
    { time: "15:00", available: true },
    { time: "15:30", available: false },
    { time: "16:00", available: true },
    { time: "16:30", available: true },
    { time: "17:00", available: true },
    { time: "17:30", available: true },
  ];
  
  const slots = availableSlots || defaultSlots;
  const availableSlotsOnly = slots.filter(s => s.available);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Escolha data e horário</h2>
        <p className="text-sm text-muted-foreground mt-1">Selecione quando deseja ser atendido</p>
      </div>

      {/* Date picker */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
            disabled={weekOffset === 0}
            className="h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <span className="text-sm font-medium text-muted-foreground">
            {format(days[0], "MMM yyyy", { locale: ptBR })}
          </span>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekOffset(weekOffset + 1)}
            disabled={weekOffset >= 3}
            className="h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((day) => {
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, today);
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => onSelectDate(day)}
                className={cn(
                  "flex flex-col items-center py-2.5 px-1 rounded-xl transition-all duration-200",
                  "hover:bg-primary/10",
                  isSelected 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-card border border-border",
                  isToday && !isSelected && "border-primary"
                )}
              >
                <span className={cn(
                  "text-[10px] uppercase font-medium",
                  isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                  {format(day, "EEE", { locale: ptBR })}
                </span>
                <span className={cn(
                  "text-lg font-semibold mt-0.5",
                  isSelected ? "text-primary-foreground" : "text-foreground"
                )}>
                  {format(day, "d")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="space-y-3 animate-in">
          <h3 className="text-sm font-medium text-muted-foreground px-1">
            Horários disponíveis para {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
          </h3>
          
          {availableSlotsOnly.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum horário disponível nesta data.</p>
              <p className="text-sm mt-1">Tente outra data.</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {availableSlotsOnly.map((slot) => {
                const isSelected = selectedTime === slot.time;
                
                return (
                  <button
                    key={slot.time}
                    onClick={() => onSelectTime(slot.time)}
                    className={cn(
                      "py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                      "hover:bg-primary/10 hover:border-primary/50",
                      isSelected 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-card border border-border text-foreground"
                    )}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
