"use client";

import { useState } from "react";
import AppointmentCard, { type Appointment } from "@/components/client/AppointmentCard";
import { Button } from "@/components/ui/button";

interface AppointmentsListProps {
  initialAppointments: Appointment[];
  totalCount: number;
  clientId: string;
  authToken: string;
}

export default function AppointmentsList({
  initialAppointments,
  totalCount,
  clientId: _clientId,
  authToken: _authToken,
}: AppointmentsListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past" | "cancelled">("all");

  const handleCancel = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, is_cancelled: true, is_cancelled_by_client: true } : a
      )
    );
  };

  const handleReschedule = (id: string, startTime: string, endTime: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, start_time: startTime, end_time: endTime } : a))
    );
  };

  const now = new Date();

  const filtered = appointments.filter((a) => {
    if (filter === "cancelled") return a.is_cancelled;
    if (filter === "upcoming") return !a.is_cancelled && new Date(a.start_time) >= now;
    if (filter === "past") return !a.is_cancelled && new Date(a.start_time) < now;
    return true;
  });

  if (appointments.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">Nenhum agendamento encontrado</p>
        <p className="text-sm mt-1">Seus agendamentos aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {(
          [
            { key: "all", label: `Todos (${totalCount})` },
            { key: "upcoming", label: "Próximos" },
            { key: "past", label: "Passados" },
            { key: "cancelled", label: "Cancelados" },
          ] as const
        ).map(({ key, label }) => (
          <Button
            key={key}
            variant={filter === key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhum agendamento nesta categoria.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onCancel={handleCancel}
              onReschedule={handleReschedule}
            />
          ))}
        </div>
      )}
    </div>
  );
}
