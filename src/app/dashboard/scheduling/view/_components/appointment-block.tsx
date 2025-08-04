"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Clock, User } from "lucide-react";

interface Appointment {
  id: string;
  title: string;
  client: string;
  time: string;
  duration: number;
  day: number;
  employee: string;
}

interface AppointmentBlockProps {
  appointment: Appointment;
}

export function AppointmentBlock({ appointment }: AppointmentBlockProps) {
  // Calcular altura baseada na duração (30min = 48px de altura)
  const height = (appointment.duration / 30) * 48;

  return (
    <div
      className={cn(
        "absolute left-1 right-1 bg-primary/90 text-primary-foreground rounded-md p-1 text-xs border border-primary overflow-hidden z-10",
        "hover:bg-primary transition-colors cursor-pointer"
      )}
      style={{ height: `${height - 2}px` }}
      title={`${appointment.title} - ${appointment.client}`}
    >
      <div className="font-medium truncate">{appointment.title}</div>
      <div className="flex items-center gap-1 text-xs opacity-90 mt-0.5">
        <User className="h-3 w-3" />
        <span className="truncate">{appointment.client}</span>
      </div>
      <div className="flex items-center gap-1 text-xs opacity-90">
        <Clock className="h-3 w-3" />
        <span>{appointment.time}</span>
      </div>
    </div>
  );
}
