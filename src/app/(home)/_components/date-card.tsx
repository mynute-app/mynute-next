"use client";

import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
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
    <div className="rounded-xl border border-border bg-card shadow-[0_1px_3px_0_hsl(215_25%_15%/0.07)] overflow-hidden">
      {/* Header da data */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          {label && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold"
              style={
                brandColor
                  ? { backgroundColor: `${brandColor}18`, color: brandColor, border: `1px solid ${brandColor}30` }
                  : { backgroundColor: "hsl(var(--primary)/0.1)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary)/0.2)" }
              }
            >
              {label}
            </span>
          )}
          <p className="text-sm font-medium text-foreground capitalize">{formattedDate}</p>
        </div>
      </div>

      {/* Grid de horários */}
      <div className="p-4">
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {timeSlots.map(slot => {
            const isSelected =
              selectedSlot?.date === date && selectedSlot?.time === slot.time;
            const isOccupiedByClient = slot.occupied_by_client === true;

            return (
              <button
                key={slot.time}
                disabled={isOccupiedByClient}
                className={cn(
                  "relative h-9 rounded-lg text-xs font-medium transition-all duration-150",
                  "border focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
                  isOccupiedByClient && "opacity-40 cursor-not-allowed",
                  !isSelected && !isOccupiedByClient && "bg-background border-border text-foreground hover:border-primary/50 hover:bg-primary/5",
                )}
                style={
                  isSelected && !isOccupiedByClient
                    ? {
                        backgroundColor: brandColor || "hsl(var(--primary))",
                        borderColor: brandColor || "hsl(var(--primary))",
                        color: "#fff",
                      }
                    : undefined
                }
                title={isOccupiedByClient ? "Você já tem um agendamento neste horário" : undefined}
                onClick={() => !isOccupiedByClient && onSlotSelect(date, slot, branchId)}
              >
                {isOccupiedByClient && (
                  <Lock className="w-2.5 h-2.5 absolute top-1 right-1" />
                )}
                {slot.time}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
