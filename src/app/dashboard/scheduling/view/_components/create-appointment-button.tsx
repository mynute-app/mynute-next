"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useGetCompany } from "@/hooks/get-company";
import { useCreateAppointment } from "@/hooks/appointment/useCreateAppointment";
import { useClientByEmail } from "@/hooks/use-client-by-email";
import { useCreateClient } from "@/hooks/use-create-client";
import { Calendar } from "@/app/(home)/_components/calendar";
import { TimeSlotPicker } from "@/app/(home)/_components/time-slot-picker";
import { useAppointmentAvailabilitySpecificDate } from "@/hooks/use-appointment-availability-specific-date";
import type { Service } from "../../../../../../types/company";

interface CreateAppointmentFormData {
  branchId: string;
  serviceId: string;
  employeeId: string;
  clientEmail: string;
  clientName: string;
  clientSurname: string;
  clientPhone: string;
  selectedDate: Date | null;
  selectedTime: string | null;
}

interface Client {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  verified: boolean;
}

export function CreateAppointmentButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateAppointmentFormData>({
    branchId: "",
    serviceId: "",
    employeeId: "",
    clientEmail: "",
    clientName: "",
    clientSurname: "",
    clientPhone: "",
    selectedDate: null,
    selectedTime: null,
  });

  const [existingClient, setExistingClient] = useState<Client | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const { toast } = useToast();
  const { company, loading: loadingCompany } = useGetCompany();
  const { createAppointment, loading: creatingAppointment } =
    useCreateAppointment();
  const { client, checkEmail } = useClientByEmail();
  const { createClient, loading: creatingClient } = useCreateClient();

  // Filtrar funcionários da branch selecionada
  const branchEmployees = useMemo(() => {
    if (!company?.employees || !formData.branchId) return [];

    return company.employees.filter(emp =>
      emp.branches?.some(
        branch =>
          branch.id.toString() === formData.branchId ||
          branch.id === Number(formData.branchId)
      )
    );
  }, [company?.employees, formData.branchId]);

  // Serviço selecionado para buscar disponibilidade
  const selectedService = useMemo(() => {
    if (!company?.services || !formData.serviceId) return null;
    return company.services.find(s => s.id === formData.serviceId);
  }, [company?.services, formData.serviceId]);

  // Hook para buscar disponibilidade de horários
  const { specificDateData, loading: loadingSlots } =
    useAppointmentAvailabilitySpecificDate({
      service: selectedService as Service,
      selectedDate: formData.selectedDate,
      enabled:
        !!formData.serviceId && !!formData.selectedDate && !!selectedService,
    });

  // Buscar cliente quando email for preenchido
  const handleEmailBlur = async () => {
    if (!formData.clientEmail || formData.clientEmail.length < 5) return;

    setIsCheckingEmail(true);
    try {
      await checkEmail(formData.clientEmail);
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Atualizar campos quando cliente for encontrado
  useEffect(() => {
    if (client) {
      setExistingClient(client);
      setFormData(prev => ({
        ...prev,
        clientName: client.name,
        clientSurname: client.surname,
        clientPhone: client.phone,
      }));
    } else {
      setExistingClient(null);
    }
  }, [client]);

  const handleSubmit = async () => {
    // Validações básicas
    if (!formData.branchId) {
      toast({
        title: "Erro",
        description: "Selecione uma filial",
        variant: "destructive",
      });
      return;
    }

    if (!formData.serviceId) {
      toast({
        title: "Erro",
        description: "Selecione um serviço",
        variant: "destructive",
      });
      return;
    }

    if (!formData.employeeId) {
      toast({
        title: "Erro",
        description: "Selecione um funcionário",
        variant: "destructive",
      });
      return;
    }

    if (
      !formData.clientEmail ||
      !formData.clientName ||
      !formData.clientSurname ||
      !formData.clientPhone
    ) {
      toast({
        title: "Erro",
        description: "Preencha todos os dados do cliente",
        variant: "destructive",
      });
      return;
    }

    if (!formData.selectedDate || !formData.selectedTime) {
      toast({
        title: "Erro",
        description: "Selecione data e horário",
        variant: "destructive",
      });
      return;
    }

    try {
      // Montar start_time em formato ISO 8601
      const [hours, minutes] = formData.selectedTime.split(":").map(Number);
      const startDateTime = new Date(formData.selectedDate);
      startDateTime.setHours(hours, minutes, 0, 0);

      // Buscar ou criar cliente
      let clientId = existingClient?.id;

      if (!clientId) {
        // Criar novo cliente se não existir
        const newClient = await createClient({
          email: formData.clientEmail,
          name: formData.clientName,
          surname: formData.clientSurname,
          phone: formData.clientPhone,
          password: "temp123", // Senha temporária
        });

        if (!newClient) {
          throw new Error("Erro ao criar cliente");
        }

        clientId = newClient.id;
      }

      // Criar agendamento
      await createAppointment({
        branch_id: formData.branchId,
        client_id: clientId,
        company_id: company?.id || "",
        employee_id: formData.employeeId,
        service_id: formData.serviceId,
        start_time: startDateTime.toISOString(),
      });

      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso!",
      });

      // Reset form e fechar dialog
      setFormData({
        branchId: "",
        serviceId: "",
        employeeId: "",
        clientEmail: "",
        clientName: "",
        clientSurname: "",
        clientPhone: "",
        selectedDate: null,
        selectedTime: null,
      });
      setExistingClient(null);
      setIsDialogOpen(false);

      // Recarregar página para atualizar calendário
      window.location.reload();
    } catch (error) {
      toast({
        title: "Erro ao criar agendamento",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Criar Agendamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Criar Novo Agendamento</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para criar um novo agendamento no sistema.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <div className="grid gap-6 py-4">
            {/* Filial */}
            <div className="space-y-2">
              <Label htmlFor="branch">Filial *</Label>
              <Select
                value={formData.branchId}
                onValueChange={value => {
                  setFormData({
                    ...formData,
                    branchId: value,
                    employeeId: "", // Reset employee quando mudar branch
                  });
                }}
                disabled={loadingCompany}
              >
                <SelectTrigger id="branch">
                  <SelectValue placeholder="Selecione a filial" />
                </SelectTrigger>
                <SelectContent>
                  {company?.branches?.map((branch: any) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Serviço */}
            <div className="space-y-2">
              <Label htmlFor="service">Serviço *</Label>
              <Select
                value={formData.serviceId}
                onValueChange={value =>
                  setFormData({
                    ...formData,
                    serviceId: value,
                    selectedDate: null,
                    selectedTime: null,
                  })
                }
                disabled={loadingCompany}
              >
                <SelectTrigger id="service">
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {company?.services?.map((service: any) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - {service.duration}min - R${" "}
                      {service.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Funcionário */}
            <div className="space-y-2">
              <Label htmlFor="employee">Funcionário *</Label>
              <Select
                value={formData.employeeId}
                onValueChange={value =>
                  setFormData({ ...formData, employeeId: value })
                }
                disabled={!formData.branchId || branchEmployees.length === 0}
              >
                <SelectTrigger id="employee">
                  <SelectValue placeholder="Selecione o funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {branchEmployees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.name} {emp.surname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dados do Cliente */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-sm">Dados do Cliente</h3>

              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email *</Label>
                <div className="relative">
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="joao@email.com"
                    value={formData.clientEmail}
                    onChange={e =>
                      setFormData({ ...formData, clientEmail: e.target.value })
                    }
                    onBlur={handleEmailBlur}
                    disabled={isCheckingEmail}
                  />
                  {isCheckingEmail && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                {existingClient && (
                  <p className="text-xs text-green-600">
                    ✓ Cliente encontrado no sistema
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Nome *</Label>
                  <Input
                    id="clientName"
                    placeholder="João"
                    value={formData.clientName}
                    onChange={e =>
                      setFormData({ ...formData, clientName: e.target.value })
                    }
                    disabled={!!existingClient}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientSurname">Sobrenome *</Label>
                  <Input
                    id="clientSurname"
                    placeholder="Silva"
                    value={formData.clientSurname}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        clientSurname: e.target.value,
                      })
                    }
                    disabled={!!existingClient}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientPhone">Telefone *</Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.clientPhone}
                  onChange={e =>
                    setFormData({ ...formData, clientPhone: e.target.value })
                  }
                  disabled={!!existingClient}
                />
              </div>
            </div>

            {/* Data e Horário */}
            {formData.serviceId && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-sm">Data e Horário</h3>

                <div className="space-y-2">
                  <Label>Selecione a Data *</Label>
                  <Calendar
                    selectedDate={formData.selectedDate}
                    onDateSelect={date =>
                      setFormData({
                        ...formData,
                        selectedDate: date,
                        selectedTime: null,
                      })
                    }
                    minDate={new Date()}
                  />
                </div>

                {formData.selectedDate && (
                  <div className="space-y-2">
                    <Label>Selecione o Horário *</Label>
                    {loadingSlots ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : specificDateData?.time_slots ? (
                      <TimeSlotPicker
                        selectedDate={formData.selectedDate}
                        timeSlots={specificDateData.time_slots}
                        selectedTime={formData.selectedTime}
                        branchId={formData.branchId}
                        onTimeSelect={time =>
                          setFormData({ ...formData, selectedTime: time })
                        }
                      />
                    ) : (
                      <div className="text-center text-sm text-muted-foreground p-4">
                        Nenhum horário disponível para esta data
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={creatingAppointment || creatingClient}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={creatingAppointment || creatingClient || isCheckingEmail}
          >
            {creatingAppointment || creatingClient ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {creatingClient
                  ? "Criando cliente..."
                  : "Criando agendamento..."}
              </>
            ) : (
              "Criar Agendamento"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
