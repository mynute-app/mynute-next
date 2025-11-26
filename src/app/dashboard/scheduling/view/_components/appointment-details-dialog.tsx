"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Appointment } from "../../../../../../types/appointment";

interface AppointmentDetailsDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppointmentDetailsDialog({
  appointment,
  open,
  onOpenChange,
}: AppointmentDetailsDialogProps) {
  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Agendamento</DialogTitle>
          <DialogDescription>
            Informações sobre o agendamento selecionado.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">ID do Agendamento:</h3>
            <p className="text-sm font-mono bg-muted p-3 rounded-md break-all">
              {appointment.id}
            </p>
          </div>

          {/* Outros campos virão aqui depois */}
          <p className="text-sm text-muted-foreground mt-4">
            Mais detalhes serão adicionados em breve...
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
