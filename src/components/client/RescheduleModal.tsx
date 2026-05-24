"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Appointment } from "./AppointmentCard";

interface RescheduleModalProps {
  appointment: Appointment;
  open: boolean;
  onClose: () => void;
  onSuccess: (startTime: string, endTime: string) => void;
}

export default function RescheduleModal({
  appointment,
  open,
  onClose,
  onSuccess,
}: RescheduleModalProps) {
  const toLocalDatetime = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [startTime, setStartTime] = useState(toLocalDatetime(appointment.start_time));
  const [endTime, setEndTime] = useState(toLocalDatetime(appointment.end_time));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/client/appointments/${appointment.id}/reschedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: appointment.company_id,
          new_start_time: new Date(startTime).toISOString(),
          new_end_time: new Date(endTime).toISOString(),
        }),
      });

      if (res.ok) {
        onSuccess(new Date(startTime).toISOString(), new Date(endTime).toISOString());
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body?.message ?? "Não foi possível reagendar. Tente novamente.");
      }
    } catch {
      setError("Erro de conexão. Verifique sua internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Reagendar agendamento</DialogTitle>
          <DialogDescription>
            {appointment.service_name} — {appointment.company_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="new-start">Nova data e hora de início</Label>
            <Input
              id="new-start"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-end">Nova data e hora de fim</Label>
            <Input
              id="new-end"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Reagendando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
