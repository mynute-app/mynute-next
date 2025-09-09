"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
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
      <Card>
        <CardContent className="p-6 text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Selecione uma data no calendário para ver os horários disponíveis.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base capitalize flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Horários para {formattedDate}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {sortedTimeSlots.map(slot => {
            const isSelected = selectedTime === slot.time;

            return (
              <Button
                key={slot.time}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className="text-xs"
                style={
                  isSelected && brandColor
                    ? {
                        backgroundColor: brandColor,
                        borderColor: brandColor,
                      }
                    : undefined
                }
                onClick={() => onTimeSelect(slot.time, slot, branchId)}
              >
                {slot.time}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
