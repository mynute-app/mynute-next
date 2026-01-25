"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Briefcase,
  Ban,
  Edit,
  Save,
  X,
  Mail,
  Phone,
  Loader2,
} from "lucide-react";
import type {
  Appointment,
  ClientInfo,
  ServiceInfo,
  EmployeeInfo,
} from "../../../../../../types/appointment";
import { Calendar } from "@/app/(home)/_components/calendar";
import { TimeSlotPicker } from "@/app/(home)/_components/time-slot-picker";
import { useAppointmentAvailabilitySpecificDate } from "@/hooks/use-appointment-availability-specific-date";
import { useDeleteAppointment } from "@/hooks/appointment/useDeleteAppointment";
import type { Employee, Service } from "../../../../../../types/company";
import { ServiceDescription } from "@/components/services/service-description";

interface AppointmentDetailsDialogProps {
  appointment: Appointment | null;
  clientInfo: ClientInfo[];
  serviceInfo: ServiceInfo[];
  employeeInfo: EmployeeInfo[];
  companyEmployees: Employee[]; // Funcionários da empresa
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppointmentDeleted?: () => void;
}

export function AppointmentDetailsDialog({
  appointment,
  clientInfo,
  serviceInfo,
  employeeInfo,
  companyEmployees,
  open,
  onOpenChange,
  onAppointmentDeleted,
}: AppointmentDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmployeeId, setEditedEmployeeId] = useState<string>("");
  const [editedDate, setEditedDate] = useState<Date | null>(null);
  const [editedTime, setEditedTime] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { toast } = useToast();
  const { deleteAppointment, loading: deletingAppointment } =
    useDeleteAppointment();

  // Buscar informações do cliente, serviço e funcionário
  const client = clientInfo.find(c => c.id === appointment?.client_id);
  const service = serviceInfo.find(s => s.id === appointment?.service_id);
  const employee = employeeInfo.find(e => e.id === appointment?.employee_id);

  // Filtrar funcionários que trabalham na branch do agendamento
  const branchEmployees = useMemo(() => {
    if (!companyEmployees || companyEmployees.length === 0) return [];
    if (!appointment?.branch_id) return companyEmployees; // Se não tem branch, mostra todos

    // Filtrar funcionários que têm a branch do agendamento
    const filtered = companyEmployees.filter(emp =>
      emp.branches?.some(
        branch =>
          branch.id.toString() === appointment.branch_id ||
          branch.id === Number(appointment.branch_id)
      )
    );

    // Se não encontrou nenhum funcionário na branch, retorna todos
    // (pode ser que a estrutura de dados não tenha branches preenchidas)
    if (filtered.length === 0) {
      console.log(
        "⚠️ Nenhum funcionário encontrado para branch, mostrando todos"
      );
      return companyEmployees;
    }

    // Se o funcionário atual não estiver na lista, adicionar ele
    const currentEmployeeInList = filtered.find(
      emp => emp.id.toString() === appointment.employee_id
    );

    if (!currentEmployeeInList && employee) {
      const currentEmployee: Employee = {
        id: Number(appointment.employee_id) || 0,
        name: employee.name,
        surname: employee.surname,
        email: employee.email,
        phone: "",
        permission: "",
        role: "",
        branches: [],
        services: [],
        work_schedule: null,
      };
      return [currentEmployee, ...filtered];
    }

    return filtered;
  }, [
    appointment?.branch_id,
    appointment?.employee_id,
    companyEmployees,
    employee,
  ]);

  // Hook para buscar disponibilidade de horários para a data específica
  const { specificDateData, loading: loadingSlots } =
    useAppointmentAvailabilitySpecificDate({
      service: service as Service,
      selectedDate: editedDate,
      enabled: isEditing && !!editedDate && !!service,
    });

  // Reset edit mode when dialog closes
  useEffect(() => {
    if (!open) {
      setIsEditing(false);
      setEditedDate(null);
      setEditedTime(null);
    }
  }, [open]);

  // Debug: verificar funcionários
  useEffect(() => {
    if (isEditing) {
      console.log("🔍 Debug - Funcionários:");
      console.log("  Total funcionários da empresa:", companyEmployees?.length);
      console.log("  Branch ID do agendamento:", appointment?.branch_id);
      console.log("  Funcionários filtrados:", branchEmployees.length);
      console.log("  Funcionários:", branchEmployees);
    }
  }, [isEditing, branchEmployees, companyEmployees, appointment?.branch_id]);

  // Initialize edit values when appointment changes
  useEffect(() => {
    if (appointment) {
      setEditedEmployeeId(appointment.employee_id);
      const startDate = new Date(appointment.start_time);
      setEditedDate(startDate);
      setEditedTime(formatTime(appointment.start_time));
    }
  }, [appointment]);

  const handleCancelAppointment = async () => {
    if (!appointment?.id) return;

    try {
      await deleteAppointment(appointment.id);

      toast({
        title: "Agendamento cancelado",
        description: "O agendamento foi cancelado com sucesso.",
      });

      setShowCancelDialog(false);
      onOpenChange(false);

      // Chamar callback para atualizar a lista
      if (onAppointmentDeleted) {
        onAppointmentDeleted();
      }
    } catch (error) {
      toast({
        title: "Erro ao cancelar agendamento",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleSaveEdit = () => {
    if (!editedDate || !editedTime) {
      console.error("Data ou horário não selecionado");
      return;
    }

    // Calcular horário de término baseado na duração do serviço
    const [hours, minutes] = editedTime.split(":").map(Number);
    const startDateTime = new Date(editedDate);
    startDateTime.setHours(hours, minutes, 0, 0);

    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + (service?.duration || 0));

    // TODO: Implementar atualização do agendamento
    console.log("Salvar edição:", {
      appointmentId: appointment?.id,
      employeeId: editedEmployeeId,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    // Reset valores
    if (appointment) {
      setEditedEmployeeId(appointment.employee_id);
      const startDate = new Date(appointment.start_time);
      setEditedDate(startDate);
      setEditedTime(formatTime(appointment.start_time));
    }
    setIsEditing(false);
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[650px] max-h-[90vh] sm:max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl pr-8">
            {isEditing ? "Editar Agendamento" : "Detalhes do Agendamento"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize o horário ou funcionário do agendamento"
              : "Informações completas sobre o agendamento selecionado"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] sm:max-h-[calc(85vh-200px)]">
          <div className="grid gap-4 sm:gap-6 py-3 sm:py-4 pr-2 sm:pr-4">
            {/* Status */}
            <div className="flex items-center gap-2">
              {appointment.cancelled ? (
                <Badge variant="destructive" className="text-sm">
                  Cancelado
                </Badge>
              ) : appointment.is_fulfilled ? (
                <Badge variant="secondary" className="text-sm">
                  Concluído
                </Badge>
              ) : appointment.is_confirmed_by_client ? (
                <Badge variant="default" className="text-sm">
                  Confirmado
                </Badge>
              ) : (
                <Badge variant="outline" className="text-sm">
                  Pendente
                </Badge>
              )}
              {appointment.rescheduled && (
                <Badge variant="outline" className="text-sm">
                  Reagendado
                </Badge>
              )}
            </div>

            <Separator />

            {/* Serviço */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                    Serviço
                  </h3>
                  <p className="text-base font-medium">
                    {service?.name || "Serviço não encontrado"}
                  </p>
                  <ServiceDescription
                    description={service?.description}
                    maxItemsCollapsed={3}
                    className="mt-1"
                    introClassName="text-sm text-muted-foreground"
                    listClassName="text-sm text-muted-foreground"
                    toggleClassName="text-xs text-muted-foreground"
                  />
                  {service && (
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-muted-foreground">
                        Duração: <strong>{service.duration} min</strong>
                      </span>
                      <span className="text-muted-foreground">
                        Valor: <strong>{formatPrice(service.price)}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Cliente */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                    Cliente
                  </h3>
                  <p className="text-base font-medium">
                    {client
                      ? `${client.name} ${client.surname}`
                      : "Cliente não encontrado"}
                  </p>
                  {client && (
                    <div className="space-y-1 mt-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{client.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{client.phone}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Funcionário - Editável */}
            {isEditing ? (
              <div className="space-y-2">
                <Label htmlFor="employee" className="text-sm font-semibold">
                  Funcionário
                </Label>
                <Select
                  value={editedEmployeeId}
                  onValueChange={value => {
                    setEditedEmployeeId(value);
                    // Reset data e hora quando mudar funcionário
                    setEditedDate(null);
                    setEditedTime(null);
                  }}
                >
                  <SelectTrigger id="employee">
                    <SelectValue placeholder="Selecione um funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    {branchEmployees.map(emp => {
                      const isCurrent =
                        emp.id.toString() === appointment.employee_id;
                      return (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.name} {emp.surname}
                          {isCurrent && (
                            <span className="text-xs text-muted-foreground ml-2">
                              (Atual)
                            </span>
                          )}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                      Funcionário
                    </h3>
                    <p className="text-base font-medium">
                      {employee
                        ? `${employee.name} ${employee.surname}`
                        : "Funcionário não encontrado"}
                    </p>
                    {employee && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {employee.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Data e Horário - Editável */}
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Selecione a Data
                  </Label>
                  <Calendar
                    selectedDate={editedDate}
                    onDateSelect={setEditedDate}
                    minDate={new Date()}
                  />
                </div>
                {editedDate && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      Selecione o Horário
                    </Label>
                    {loadingSlots ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : specificDateData?.time_slots ? (
                      <TimeSlotPicker
                        selectedDate={editedDate}
                        timeSlots={specificDateData.time_slots}
                        selectedTime={editedTime}
                        branchId={appointment.branch_id}
                        onTimeSelect={time => setEditedTime(time)}
                      />
                    ) : (
                      <div className="text-center text-sm text-muted-foreground p-4">
                        Nenhum horário disponível para esta data
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                      Data e Horário
                    </h3>
                    <p className="text-base font-medium">
                      {formatDateTime(appointment.start_time)}
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
                      {formatTime(appointment.start_time)} →{" "}
                      {formatTime(appointment.end_time)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Informações Adicionais */}
            {!isEditing && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Informações Adicionais
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Timezone:</span>
                    <p className="font-medium">{appointment.time_zone}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Confirmado:</span>
                    <p className="font-medium">
                      {appointment.is_confirmed_by_client ? "Sim" : "Não"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Concluído:</span>
                    <p className="font-medium">
                      {appointment.is_fulfilled ? "Sim" : "Não"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cancelado:</span>
                    <p className="font-medium">
                      {appointment.cancelled ? "Sim" : "Não"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Comentários */}
            {!isEditing && appointment.comments && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    Comentários
                  </h3>
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {appointment.comments}
                  </p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
              {!appointment.cancelled && (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Cancelar Agendamento
                  </Button>
                </>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="z-[10001]">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar este agendamento? Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não, manter agendamento</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelAppointment}
              disabled={deletingAppointment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingAppointment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Sim, cancelar agendamento"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
