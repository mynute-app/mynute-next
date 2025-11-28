"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Calendar, Clock, User, MapPin, Ban } from "lucide-react";
import { useAppointmentDetails } from "@/hooks/appointment/use-appointment-details";
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
  const { appointment: details, isLoading } = useAppointmentDetails({
    appointmentId: appointment?.id || null,
    enabled: open && !!appointment?.id,
  });

  const handleCancelAppointment = () => {
    // TODO: Implementar cancelamento
    console.log("Cancelar agendamento:", details?.id);
  };

  if (!appointment) return null;

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${day}/${month}/${year} às ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Detalhes do Agendamento
          </DialogTitle>
          <DialogDescription>
            Informações completas sobre o agendamento selecionado.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : details ? (
          <ScrollArea className="max-h-[calc(85vh-200px)]">
            <div className="grid gap-6 py-4 pr-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                {details.cancelled ? (
                  <Badge variant="destructive" className="text-sm">
                    Cancelado
                  </Badge>
                ) : details.is_fulfilled ? (
                  <Badge variant="secondary" className="text-sm">
                    Concluído
                  </Badge>
                ) : details.is_confirmed_by_client ? (
                  <Badge variant="default" className="text-sm">
                    Confirmado
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-sm">
                    Pendente
                  </Badge>
                )}
                {details.rescheduled && (
                  <Badge variant="outline" className="text-sm">
                    Reagendado
                  </Badge>
                )}
              </div>

              <Separator />

              {/* Data e Horário */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                      Data e Horário
                    </h3>
                    <p className="text-base font-medium">
                      {formatDateTime(details.start_time)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                      Duração
                    </h3>
                    <p className="text-base font-medium">
                      {formatTime(details.start_time)} →{" "}
                      {formatTime(details.end_time)}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* IDs */}
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                    ID do Agendamento
                  </h3>
                  <p className="text-xs font-mono bg-muted p-2 rounded-md break-all">
                    {details.id}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                    ID do Serviço
                  </h3>
                  <p className="text-xs font-mono bg-muted p-2 rounded-md break-all">
                    {details.service_id}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                    ID do Funcionário
                  </h3>
                  <p className="text-xs font-mono bg-muted p-2 rounded-md break-all">
                    {details.employee_id}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                    ID do Cliente
                  </h3>
                  <p className="text-xs font-mono bg-muted p-2 rounded-md break-all">
                    {details.client_id}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                    ID da Filial
                  </h3>
                  <p className="text-xs font-mono bg-muted p-2 rounded-md break-all">
                    {details.branch_id}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Informações Adicionais */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Informações Adicionais
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Timezone:</span>
                    <p className="font-medium">{details.time_zone}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Confirmado:</span>
                    <p className="font-medium">
                      {details.is_confirmed_by_client ? "Sim" : "Não"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Concluído:</span>
                    <p className="font-medium">
                      {details.is_fulfilled ? "Sim" : "Não"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cancelado:</span>
                    <p className="font-medium">
                      {details.cancelled ? "Sim" : "Não"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Comentários */}
              {details.comments && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground">
                      Comentários
                    </h3>
                    <p className="text-sm bg-muted p-3 rounded-md">
                      {details.comments}
                    </p>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Erro ao carregar detalhes do agendamento
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {details && !details.cancelled && (
            <Button
              variant="destructive"
              onClick={handleCancelAppointment}
              disabled={isLoading}
            >
              <Ban className="h-4 w-4 mr-2" />
              Cancelar Agendamento
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
