"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import type { Appointment } from "../../../../../../types/appointment";
import type { Service } from "../../../../../../types/company";
import { MultipleAppointmentsModal } from "./multiple-appointments-modal";

interface MultipleAppointmentsCardProps {
  appointments: Appointment[];
  services: Service[];
  height: number;
  onAppointmentClick: (appointment: Appointment) => void;
}

export function MultipleAppointmentsCard({
  appointments,
  services,
  height,
  onAppointmentClick,
}: MultipleAppointmentsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const count = appointments.length;

  // Pegar o horário do primeiro agendamento
  const startTime = new Date(appointments[0].start_time);
  const timeString = `${startTime
    .getHours()
    .toString()
    .padStart(2, "0")}:${startTime.getMinutes().toString().padStart(2, "0")}`;

  return (
    <>
      <div
        className={cn(
          "absolute left-1 right-1 bg-gradient-to-br from-primary/90 to-primary/70 text-primary-foreground rounded-md p-2 text-xs border border-primary overflow-hidden z-10",
          "hover:from-primary hover:to-primary/80 transition-all cursor-pointer shadow-md",
          "flex flex-col items-center justify-center"
        )}
        style={{ height: `${height - 2}px` }}
        onClick={e => {
          e.stopPropagation();
          setIsModalOpen(true);
        }}
        title={`${count} agendamentos às ${timeString} - Clique para ver todos`}
      >
        <Users className="h-5 w-5" />
        <div className="font-bold text-lg mt-3">+{count}</div>
        <div className="text-[10px] opacity-90">agendamentos</div>
        <div className="text-[10px] font-medium">{timeString}</div>
      </div>

      <MultipleAppointmentsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appointments={appointments}
        services={services}
        onAppointmentClick={(appointment: Appointment) => {
          setIsModalOpen(false);
          onAppointmentClick(appointment);
        }}
      />
    </>
  );
}
