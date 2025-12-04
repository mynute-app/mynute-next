"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
} from "lucide-react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useGetCompany } from "@/hooks/get-company";
import { useServiceAvailability } from "@/hooks/service/useServiceAvailability";
import { useCreateAppointment } from "@/hooks/appointment/useCreateAppointment";
import { useClientByEmail } from "@/hooks/use-client-by-email";
import { useCreateClient } from "@/hooks/use-create-client";
import { DateCard } from "@/app/(home)/_components/date-card";
import { Calendar } from "@/app/(home)/_components/calendar";
import { clientFormSchema, type ClientFormData } from "./client-form-schema";
import type { Service } from "../../../../../../types/company";
import type {
  ServiceAvailability,
  AvailableDate,
  TimeSlot,
} from "@/hooks/service/useServiceAvailability";

type Step = "service" | "datetime" | "employee" | "client";

interface FormData {
  serviceId: string;
  selectedDate: string | null;
  selectedTime: string | null;
  branchId: string | null;
  employeeId: string | null;
  clientEmail: string;
}

interface SelectedSlot {
  date: string;
  time: string;
  branchId: string;
  employees: string[];
}

interface CreateAppointmentDialogProps {
  onAppointmentCreated?: () => void;
}

export function CreateAppointmentDialog({
  onAppointmentCreated,
}: CreateAppointmentDialogProps = {}) {
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
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [showClientForm, setShowClientForm] = useState(false);

  const [availability, setAvailability] = useState<ServiceAvailability | null>(
    null
  );
  const [existingClient, setExistingClient] = useState<any>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      email: "",
      name: "",
      surname: "",
      phone: "",
    },
  });

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
    return formData.branchId || selectedSlot?.branchId || null;
  }, [formData.branchId, selectedSlot?.branchId]);

  const selectedBranchInfo = useMemo(() => {
    if (!selectedBranchId || !availability?.branch_info) return null;
    return availability.branch_info.find(b => b.id === selectedBranchId);
  }, [selectedBranchId, availability?.branch_info]);

  const availableEmployees = useMemo(() => {
    return selectedSlot?.employees || [];
  }, [selectedSlot]);

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
    const email = form.getValues("email");
    if (!email || email.length < 5) return;

    setIsCheckingEmail(true);
    setShowClientForm(false);
    try {
      await checkEmail(email);
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  useEffect(() => {
    if (client) {
      setExistingClient(client);
      setShowClientForm(false);
      // Preencher os campos se o cliente existir
      form.setValue("name", client.name || "");
      form.setValue("surname", client.surname || "");
      form.setValue("phone", client.phone || "");
    } else if (form.getValues("email") && !isCheckingEmail) {
      // Se não encontrou o cliente, mostrar o formulário
      setShowClientForm(true);
      setExistingClient(null);
    }
  }, [client, isCheckingEmail]);

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
      setSelectedSlot(null);
      setShowClientForm(false);
      form.reset();
    }
  }, [isOpen, form]);

  const handleSlotSelect = (date: string, slot: any, branchId: string) => {
    setSelectedSlot({
      date,
      time: slot.time,
      branchId,
      employees: slot.employees,
    });
    setFormData(prev => ({
      ...prev,
      selectedDate: date,
      selectedTime: slot.time,
      branchId: branchId,
      employeeId: null, // Reset employee when changing slot
    }));
  };

  const handleNext = () => {
    if (currentStep === "service") {
      if (!formData.serviceId) {
        toast({ title: "Selecione um serviço", variant: "destructive" });
        return;
      }
      setCurrentStep("datetime");
    } else if (currentStep === "datetime") {
      if (!formData.selectedDate || !formData.selectedTime) {
        toast({
          title: "Selecione data e horário",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep("employee");
    } else if (currentStep === "employee") {
      if (!formData.employeeId) {
        toast({
          title: "Selecione um funcionário",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep("client");
    }
  };

  const handleBack = () => {
    if (currentStep === "datetime") setCurrentStep("service");
    else if (currentStep === "employee") setCurrentStep("datetime");
    else if (currentStep === "client") setCurrentStep("employee");
  };

  const handleSubmit = async (clientFormData: ClientFormData) => {
    try {
      const [hours, minutes] = formData.selectedTime!.split(":").map(Number);
      const startDateTime = new Date(formData.selectedDate + "T00:00:00");
      startDateTime.setHours(hours, minutes, 0, 0);

      let clientId = existingClient?.id;

      if (!clientId) {
        const randomPassword = Math.random().toString(36).slice(-8) + "Aa1!";

        const newClient = await createClient({
          email: clientFormData.email,
          name: clientFormData.name,
          surname: clientFormData.surname,
          phone: clientFormData.phone,
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

      // Chamar callback para atualizar a lista
      if (onAppointmentCreated) {
        onAppointmentCreated();
      }
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
            {currentStep === "datetime" && "Escolha a data e horário"}
            {currentStep === "employee" && "Selecione o funcionário"}
            {currentStep === "client" && "Preencha o email do cliente"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge
              variant={currentStep === "service" ? "default" : "secondary"}
              className="text-xs"
            >
              1. Serviço
            </Badge>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <Badge
              variant={currentStep === "datetime" ? "default" : "secondary"}
              className="text-xs"
            >
              2. Data/Hora
            </Badge>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <Badge
              variant={currentStep === "employee" ? "default" : "secondary"}
              className="text-xs"
            >
              3. Funcionário
            </Badge>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <Badge
              variant={currentStep === "client" ? "default" : "secondary"}
              className="text-xs"
            >
              4. Cliente
            </Badge>
          </div>
        </div>

        <Separator />

        <ScrollArea className="max-h-[calc(90vh-280px)] pr-4">
          <div className="grid gap-6 py-4 px-2">
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
                {organizedDates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma data disponível
                  </div>
                ) : (
                  <>
                    {/* Calendário */}
                    <Calendar
                      selectedDate={
                        formData.selectedDate
                          ? new Date(formData.selectedDate + "T00:00:00")
                          : null
                      }
                      onDateSelect={date => {
                        const dateString = date.toISOString().split("T")[0];
                        setFormData(prev => ({
                          ...prev,
                          selectedDate: dateString,
                          selectedTime: null,
                          branchId: null,
                          employeeId: null,
                        }));
                        setSelectedSlot(null);
                      }}
                      availableDates={availability?.available_dates.map(
                        d => d.date
                      )}
                    />

                    {/* Horários disponíveis para a data selecionada */}
                    {formData.selectedDate && selectedDateSlots.length > 0 && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Horários Disponíveis
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {[...selectedDateSlots]
                              .sort((a: TimeSlot, b: TimeSlot) =>
                                a.time.localeCompare(b.time)
                              )
                              .map((slot: TimeSlot) => {
                                const isSelected =
                                  selectedSlot?.time === slot.time;

                                return (
                                  <Button
                                    key={slot.time}
                                    variant={isSelected ? "default" : "outline"}
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => {
                                      if (formData.selectedDate) {
                                        handleSlotSelect(
                                          formData.selectedDate,
                                          slot,
                                          organizedDates.find(
                                            d =>
                                              d.date === formData.selectedDate
                                          )?.branch_id || ""
                                        );
                                      }
                                    }}
                                  >
                                    {slot.time}
                                  </Button>
                                );
                              })}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {formData.selectedDate &&
                      selectedDateSlots.length === 0 && (
                        <Card>
                          <CardContent className="p-6 text-center">
                            <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Nenhum horário disponível para esta data.
                            </p>
                          </CardContent>
                        </Card>
                      )}

                    {selectedBranchInfo && formData.selectedTime && (
                      <div className="p-4 bg-muted rounded-lg space-y-2">
                        <h4 className="font-semibold text-sm">Filial</h4>
                        <p className="text-sm">{selectedBranchInfo.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedBranchInfo.street},{" "}
                          {selectedBranchInfo.number}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {currentStep === "employee" && (
              <div className="space-y-4">
                {selectedService && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <h4 className="font-semibold text-sm">
                      Resumo do Agendamento
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Serviço:</span>{" "}
                        {selectedService.name}
                      </p>
                      {formData.selectedDate && (
                        <p>
                          <span className="font-medium">Data:</span>{" "}
                          {new Intl.DateTimeFormat("pt-BR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          }).format(
                            new Date(formData.selectedDate + "T00:00:00")
                          )}
                        </p>
                      )}
                      {formData.selectedTime && (
                        <p>
                          <span className="font-medium">Horário:</span>{" "}
                          {formData.selectedTime}
                        </p>
                      )}
                      {selectedBranchInfo && (
                        <p>
                          <span className="font-medium">Filial:</span>{" "}
                          {selectedBranchInfo.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2 px-2">
                  <Label htmlFor="employee">Selecione o Funcionário *</Label>
                  {employeeOptions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum funcionário disponível para este horário
                    </div>
                  ) : (
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
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {emp.name} {emp.surname}
                              </span>
                              {emp.role && (
                                <span className="text-xs text-muted-foreground">
                                  {emp.role}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            )}

            {currentStep === "client" && (
              <div className="space-y-4">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email do Cliente *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="email"
                                placeholder="cliente@email.com"
                                {...field}
                                onBlur={e => {
                                  field.onBlur();
                                  handleEmailBlur();
                                }}
                                disabled={isCheckingEmail}
                              />
                              {isCheckingEmail && (
                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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

                    {showClientForm && !existingClient && (
                      <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            Preencha os dados do novo cliente
                          </p>
                          <Badge variant="outline">Novo Cliente</Badge>
                        </div>

                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nome do cliente"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="surname"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sobrenome *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Sobrenome do cliente"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="(11) 99999-9999"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </form>
                </Form>

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
                onClick={form.handleSubmit(handleSubmit)}
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
