"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TimeSlot } from "@/hooks/service/useServiceAvailability";

interface DateCardProps {
  date: string;
  label?: string;
  formattedDate: string;
  timeSlots: TimeSlot[];
  selectedSlot: { date: string; time: string } | null;
  branchId: string;
  brandColor?: string;
  onSlotSelect: (date: string, slot: TimeSlot, branchId: string) => void;
}

export function DateCard({
  date,
  label,
  formattedDate,
  timeSlots,
  selectedSlot,
  branchId,
  brandColor,
  onSlotSelect,
}: DateCardProps) {
  if (timeSlots.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base capitalize flex items-center gap-2">
          {label && (
            <Badge variant="outline" className="text-xs">
              {label}
            </Badge>
          )}
          {formattedDate}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {timeSlots.map(slot => {
            const isSelected =
              selectedSlot?.date === date && selectedSlot?.time === slot.time;

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
                onClick={() => onSlotSelect(date, slot, branchId)}
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
