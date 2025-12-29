"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimeSlot } from "@/hooks/service/useServiceAvailability";

interface TimeSlotPickerProps {
  selectedDate: Date | null;
  timeSlots: TimeSlot[];
  selectedTime: string | null;
  branchId: string;
  brandColor?: string;
  onTimeSelect: (time: string, slot: TimeSlot, branchId: string) => void;
}

export function TimeSlotPicker({
  selectedDate,
  timeSlots,
  selectedTime,
  branchId,
  brandColor,
  onTimeSelect,
}: TimeSlotPickerProps) {
  if (!selectedDate) {
    return (
      <Card className="border-0 sm:border shadow-none sm:shadow-sm">
        <CardContent className="p-4 sm:p-6 text-center">
          <Clock className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
          <p className="text-sm sm:text-base text-muted-foreground">
            Selecione uma data no calendário para ver os horários disponíveis.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <Card className="border-0 sm:border shadow-none sm:shadow-sm">
        <CardContent className="p-4 sm:p-6 text-center">
          <Clock className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
          <p className="text-sm sm:text-base text-muted-foreground">
            Nenhum horário disponível para{" "}
            {selectedDate.toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
            .
          </p>
        </CardContent>
      </Card>
    );
  }

  const formattedDate = selectedDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const sortedTimeSlots = [...timeSlots].sort((a, b) =>
    a.time.localeCompare(b.time)
  );

  return (
    <Card className="border-0 sm:border shadow-none sm:shadow-sm">
      <CardContent className="p-0 sm:p-6">
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {sortedTimeSlots.map(slot => {
            const isSelected = selectedTime === slot.time;
            const isOccupiedByClient = slot.occupied_by_client === true;

            return (
              <Button
                key={slot.time}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                disabled={isOccupiedByClient}
                className={cn(
                  "text-xs sm:text-sm relative h-9 sm:h-10 touch-manipulation",
                  isOccupiedByClient && "opacity-40 cursor-not-allowed",
                  isSelected && "ring-2 ring-offset-2"
                )}
                style={
                  isSelected && brandColor && !isOccupiedByClient
                    ? {
                        backgroundColor: brandColor,
                        borderColor: brandColor,
                        color: "white",
                      }
                    : undefined
                }
                onClick={() =>
                  !isOccupiedByClient && onTimeSelect(slot.time, slot, branchId)
                }
                title={
                  isOccupiedByClient
                    ? "Você já tem um agendamento neste horário"
                    : undefined
                }
              >
                {isOccupiedByClient && (
                  <Lock className="w-3 h-3 absolute top-0.5 right-0.5" />
                )}
                {slot.time}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
