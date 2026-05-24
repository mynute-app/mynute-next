"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, Tag, X, RefreshCw } from "lucide-react";
import RescheduleModal from "./RescheduleModal";

export interface Appointment {
  id: string;
  company_id: string;
  company_name: string;
  company_slug: string;
  branch_id: string;
  branch_name: string;
  service_id: string;
  service_name: string;
  service_price: number;
  employee_id: string;
  employee_name: string;
  employee_surname: string;
  start_time: string;
  end_time: string;
  time_zone: string;
  is_cancelled: boolean;
  is_fulfilled: boolean;
  is_cancelled_by_client: boolean;
  is_approved_by_employee: boolean;
}

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel: (id: string) => void;
  onReschedule: (id: string, startTime: string, endTime: string) => void;
}

export default function AppointmentCard({
  appointment,
  onCancel,
  onReschedule,
}: AppointmentCardProps) {
  const [cancelling, setCancelling] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatPrice = (cents: number) =>
    (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const statusBadge = () => {
    if (appointment.is_cancelled) {
      return <Badge variant="destructive">Cancelado</Badge>;
    }
    if (appointment.is_fulfilled) {
      return <Badge variant="secondary">Concluído</Badge>;
    }
    if (appointment.is_approved_by_employee) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmado</Badge>;
    }
    return <Badge variant="outline">Pendente</Badge>;
  };

  const canCancel =
    !appointment.is_cancelled &&
    !appointment.is_fulfilled &&
    new Date(appointment.start_time) > new Date();

  const canReschedule = canCancel;

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch(
        `/api/client/appointments/${appointment.id}/cancel?company_id=${appointment.company_id}`,
        { method: "DELETE" }
      );
      if (res.ok || res.status === 204) {
        onCancel(appointment.id);
      }
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <div className="rounded-lg border bg-card p-4 shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm">{appointment.company_name}</p>
            <p className="text-xs text-muted-foreground">{appointment.branch_name}</p>
          </div>
          {statusBadge()}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Tag className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{appointment.service_name}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {appointment.employee_name} {appointment.employee_surname}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{formatDateTime(appointment.start_time)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>
              {new Date(appointment.end_time).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          {appointment.branch_name && (
            <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{appointment.branch_name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="font-medium text-sm">
            {formatPrice(appointment.service_price)}
          </span>

          {(canCancel || canReschedule) && (
            <div className="flex gap-2">
              {canReschedule && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 h-8 text-xs"
                  onClick={() => setShowReschedule(true)}
                >
                  <RefreshCw className="h-3 w-3" />
                  Reagendar
                </Button>
              )}
              {canCancel && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 h-8 text-xs text-destructive hover:text-destructive"
                      disabled={cancelling}
                    >
                      <X className="h-3 w-3" />
                      Cancelar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancelar agendamento?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Você está prestes a cancelar o agendamento de{" "}
                        <strong>{appointment.service_name}</strong> em{" "}
                        <strong>{appointment.company_name}</strong>. Esta ação não pode
                        ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Voltar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancel}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Confirmar cancelamento
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>
      </div>

      {showReschedule && (
        <RescheduleModal
          appointment={appointment}
          open={showReschedule}
          onClose={() => setShowReschedule(false)}
          onSuccess={(startTime, endTime) => {
            setShowReschedule(false);
            onReschedule(appointment.id, startTime, endTime);
          }}
        />
      )}
    </>
  );
}
