"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useGetCompany } from "@/hooks/get-company";
import { useServiceAvailability } from "@/hooks/service/useServiceAvailability";
import { useCreateAppointment } from "@/hooks/appointment/useCreateAppointment";
import { useClientByEmail } from "@/hooks/use-client-by-email";
import { useCreateClient } from "@/hooks/use-create-client";
import type { Service } from "../../../../../../types/company";
import type {
  ServiceAvailability,
  AvailableDate,
  TimeSlot,
} from "@/hooks/service/useServiceAvailability";

type Step = "service" | "datetime" | "client";

interface FormData {
  serviceId: string;
  selectedDate: string | null;
  selectedTime: string | null;
  branchId: string | null;
  employeeId: string | null;
  clientEmail: string;
}

export function CreateAppointmentDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>("service");
  const [formData, setFormData] = useState<FormData>({
    serviceId: "",
    selectedDate: null,
    selectedTime: null,
    branchId: null,
    employeeId: null,
    clientEmail: "",
  });

  const [availability, setAvailability] = useState<ServiceAvailability | null>(
    null
  );
  const [existingClient, setExistingClient] = useState<any>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const { toast } = useToast();
  const { company, loading: loadingCompany } = useGetCompany();
  const {
    availability: fetchedAvailability,
    loading: loadingAvailability,
    fetchAvailability,
  } = useServiceAvailability();
  const { createAppointment, loading: creatingAppointment } =
    useCreateAppointment();
  const { client, checkEmail } = useClientByEmail();
  const { createClient, loading: creatingClient } = useCreateClient();

  const selectedService = useMemo(() => {
    if (!company?.services || !formData.serviceId) return null;
    return company.services.find((s: any) => s.id === formData.serviceId);
  }, [company?.services, formData.serviceId]);

  const organizedDates = useMemo(() => {
    if (!availability?.available_dates) return [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return availability.available_dates.map((dateInfo: AvailableDate) => {
      const dateObj = new Date(dateInfo.date + "T00:00:00");
      const isToday =
        dateObj.toISOString().split("T")[0] ===
        today.toISOString().split("T")[0];
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const isTomorrow =
        dateObj.toISOString().split("T")[0] ===
        tomorrow.toISOString().split("T")[0];

      return {
        ...dateInfo,
        label: isToday ? "Hoje" : isTomorrow ? "Amanhã" : null,
        formattedDate: new Intl.DateTimeFormat("pt-BR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }).format(dateObj),
      };
    });
  }, [availability?.available_dates]);

  const selectedDateSlots = useMemo(() => {
    if (!formData.selectedDate || !organizedDates.length) return [];
    const dateData = organizedDates.find(d => d.date === formData.selectedDate);
    return dateData?.time_slots || [];
  }, [formData.selectedDate, organizedDates]);

  const selectedBranchId = useMemo(() => {
    if (!formData.selectedDate || !organizedDates.length) return null;
    const dateData = organizedDates.find(d => d.date === formData.selectedDate);
    return dateData?.branch_id || null;
  }, [formData.selectedDate, organizedDates]);

  const selectedBranchInfo = useMemo(() => {
    if (!selectedBranchId || !availability?.branch_info) return null;
    return availability.branch_info.find(b => b.id === selectedBranchId);
  }, [selectedBranchId, availability?.branch_info]);

  const availableEmployees = useMemo(() => {
    if (!formData.selectedTime || !selectedDateSlots.length) return [];
    const timeSlot = selectedDateSlots.find(
      (slot: TimeSlot) => slot.time === formData.selectedTime
    );
    return timeSlot?.employees || [];
  }, [formData.selectedTime, selectedDateSlots]);

  const employeeOptions = useMemo(() => {
    if (!availableEmployees.length || !availability?.employee_info) return [];
    return availability.employee_info.filter(emp =>
      availableEmployees.includes(emp.id)
    );
  }, [availableEmployees, availability?.employee_info]);

  const handleServiceSelect = async (serviceId: string) => {
    setFormData({
      serviceId,
      selectedDate: null,
      selectedTime: null,
      branchId: null,
      employeeId: null,
      clientEmail: "",
    });

    if (!serviceId || !company?.id) return;

    try {
      const data = await fetchAvailability({
        serviceId,
        companyId: company.id,
        timezone: "America/Sao_Paulo",
        dateForwardStart: 0,
        dateForwardEnd: 30,
      });

      setAvailability(data);
    } catch (error) {
      toast({
        title: "Erro ao buscar disponibilidade",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

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

  useEffect(() => {
    if (client) {
      setExistingClient(client);
    }
  }, [client]);

  // Debug company and services
  useEffect(() => {
    console.log("Company:", company);
    console.log("Services:", company?.services);
    console.log("Loading Company:", loadingCompany);
  }, [company, loadingCompany]);

  // Reset all state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        serviceId: "",
        selectedDate: null,
        selectedTime: null,
        branchId: null,
        employeeId: null,
        clientEmail: "",
      });
      setAvailability(null);
      setExistingClient(null);
      setCurrentStep("service");
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep === "service") {
      if (!formData.serviceId) {
        toast({ title: "Selecione um serviço", variant: "destructive" });
        return;
      }
      setCurrentStep("datetime");
    } else if (currentStep === "datetime") {
      if (
        !formData.selectedDate ||
        !formData.selectedTime ||
        !formData.employeeId
      ) {
        toast({
          title: "Selecione data, horário e funcionário",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep("client");
    }
  };

  const handleBack = () => {
    if (currentStep === "datetime") setCurrentStep("service");
    else if (currentStep === "client") setCurrentStep("datetime");
  };

  const handleSubmit = async () => {
    if (!formData.clientEmail) {
      toast({
        title: "Email obrigatório",
        description: "Preencha o email do cliente",
        variant: "destructive",
      });
      return;
    }

    try {
      const [hours, minutes] = formData.selectedTime!.split(":").map(Number);
      const startDateTime = new Date(formData.selectedDate + "T00:00:00");
      startDateTime.setHours(hours, minutes, 0, 0);

      let clientId = existingClient?.id;

      if (!clientId) {
        const emailName = formData.clientEmail.split("@")[0];
        const randomPassword = Math.random().toString(36).slice(-8);

        const newClient = await createClient({
          email: formData.clientEmail,
          name: emailName,
          surname: "Cliente",
          phone: "+5511999999999",
          password: randomPassword,
        });

        if (!newClient) throw new Error("Erro ao criar cliente");
        clientId = newClient.id;
      }

      await createAppointment({
        branch_id: selectedBranchId!,
        client_id: clientId,
        company_id: company?.id || "",
        employee_id: formData.employeeId!,
        service_id: formData.serviceId,
        start_time: startDateTime.toISOString(),
      });

      toast({
        title: "Agendamento criado!",
        description: "O agendamento foi criado com sucesso.",
      });
      handleReset();
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

  const handleReset = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            {currentStep === "service" &&
              "Selecione o serviço para verificar disponibilidade"}
            {currentStep === "datetime" &&
              "Escolha data, horário e funcionário"}
            {currentStep === "client" && "Preencha o email do cliente"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge
              variant={currentStep === "service" ? "default" : "secondary"}
            >
              1. Serviço
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge
              variant={currentStep === "datetime" ? "default" : "secondary"}
            >
              2. Data/Hora
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant={currentStep === "client" ? "default" : "secondary"}>
              3. Cliente
            </Badge>
          </div>
        </div>

        <Separator />

        <ScrollArea className="max-h-[calc(90vh-280px)] pr-4">
          <div className="grid gap-6 py-4">
            {currentStep === "service" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="service">Serviço *</Label>
                  <Select
                    value={formData.serviceId}
                    onValueChange={handleServiceSelect}
                    disabled={loadingCompany || loadingAvailability}
                  >
                    <SelectTrigger id="service">
                      <SelectValue
                        placeholder={
                          loadingCompany
                            ? "Carregando serviços..."
                            : "Selecione o serviço"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="z-[10001]" position="popper">
                      {loadingCompany ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : !company?.services ||
                        company.services.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Nenhum serviço cadastrado
                        </div>
                      ) : (
                        company.services.map((service: any) => (
                          <SelectItem key={service.id} value={service.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {service.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {service.duration}min - R${" "}
                                {service.price.toFixed(2)}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {loadingAvailability && (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Buscando disponibilidade...
                    </span>
                  </div>
                )}

                {selectedService && availability && !loadingAvailability && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <h4 className="font-semibold">Serviço Selecionado</h4>
                    <p className="text-sm">{selectedService.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {availability.available_dates.length} datas disponíveis
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentStep === "datetime" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data *</Label>
                  <Select
                    value={formData.selectedDate || ""}
                    onValueChange={value =>
                      setFormData(prev => ({
                        ...prev,
                        selectedDate: value,
                        selectedTime: null,
                        employeeId: null,
                      }))
                    }
                  >
                    <SelectTrigger id="date">
                      <SelectValue placeholder="Selecione a data" />
                    </SelectTrigger>
                    <SelectContent className="z-[10001]" position="popper">
                      {organizedDates.map((dateInfo: any) => (
                        <SelectItem key={dateInfo.date} value={dateInfo.date}>
                          {dateInfo.label && (
                            <Badge variant="outline" className="mr-2">
                              {dateInfo.label}
                            </Badge>
                          )}
                          {dateInfo.formattedDate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.selectedDate && (
                  <div className="space-y-2">
                    <Label htmlFor="time">Horário *</Label>
                    <Select
                      value={formData.selectedTime || ""}
                      onValueChange={value =>
                        setFormData(prev => ({
                          ...prev,
                          selectedTime: value,
                          employeeId: null,
                        }))
                      }
                    >
                      <SelectTrigger id="time">
                        <SelectValue placeholder="Selecione o horário" />
                      </SelectTrigger>
                      <SelectContent className="z-[10001]" position="popper">
                        {selectedDateSlots.map((slot: TimeSlot) => (
                          <SelectItem key={slot.time} value={slot.time}>
                            {slot.time} ({slot.employees.length} funcionário
                            {slot.employees.length > 1 ? "s" : ""} disponível
                            {slot.employees.length > 1 ? "is" : ""})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.selectedTime && (
                  <div className="space-y-2">
                    <Label htmlFor="employee">Funcionário *</Label>
                    <Select
                      value={formData.employeeId || ""}
                      onValueChange={value =>
                        setFormData(prev => ({ ...prev, employeeId: value }))
                      }
                    >
                      <SelectTrigger id="employee">
                        <SelectValue placeholder="Selecione o funcionário" />
                      </SelectTrigger>
                      <SelectContent className="z-[10001]" position="popper">
                        {employeeOptions.map((emp: any) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name} {emp.surname}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedBranchInfo && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <h4 className="font-semibold text-sm">Filial</h4>
                    <p className="text-sm">{selectedBranchInfo.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedBranchInfo.street}, {selectedBranchInfo.number}
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentStep === "client" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email do Cliente *</Label>
                  <div className="relative">
                    <Input
                      id="clientEmail"
                      type="email"
                      placeholder="cliente@email.com"
                      value={formData.clientEmail}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          clientEmail: e.target.value,
                        }))
                      }
                      onBlur={handleEmailBlur}
                      disabled={isCheckingEmail}
                    />
                    {isCheckingEmail && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                    )}
                  </div>
                  {existingClient && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-800 font-medium">
                        ✓ Cliente encontrado no sistema
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        {existingClient.name} {existingClient.surname}
                      </p>
                    </div>
                  )}
                  {formData.clientEmail &&
                    !existingClient &&
                    !isCheckingEmail && (
                      <p className="text-xs text-amber-600">
                        Cliente não encontrado. Será criado automaticamente.
                      </p>
                    )}
                </div>

                <Separator />
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <h4 className="font-semibold">Resumo do Agendamento</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Serviço:</span>{" "}
                      {selectedService?.name}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Data:</span>{" "}
                      {
                        organizedDates.find(
                          d => d.date === formData.selectedDate
                        )?.formattedDate
                      }
                    </p>
                    <p>
                      <span className="text-muted-foreground">Horário:</span>{" "}
                      {formData.selectedTime}
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        Funcionário:
                      </span>{" "}
                      {
                        employeeOptions.find(e => e.id === formData.employeeId)
                          ?.name
                      }{" "}
                      {
                        employeeOptions.find(e => e.id === formData.employeeId)
                          ?.surname
                      }
                    </p>
                    <p>
                      <span className="text-muted-foreground">Filial:</span>{" "}
                      {selectedBranchInfo?.name}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex justify-between">
          <div>
            {currentStep !== "service" && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              Cancelar
            </Button>

            {currentStep !== "client" ? (
              <Button onClick={handleNext} disabled={!formData.serviceId}>
                Avançar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={
                  creatingAppointment || creatingClient || isCheckingEmail
                }
              >
                {creatingAppointment || creatingClient ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {creatingClient ? "Criando cliente..." : "Criando..."}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Criar Agendamento
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
