"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Loader2,
  ArrowLeft,
  Check,
  Clock,
  User,
  Scissors,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { useGetCompany } from "@/hooks/get-company";
import { useServiceAvailability } from "@/hooks/service/useServiceAvailability";
import { useCreateAppointment } from "@/hooks/appointment/useCreateAppointment";
import { useClientByEmail } from "@/hooks/use-client-by-email";
import { useCreateClient } from "@/hooks/use-create-client";
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
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
  initialSlot?: {
    date: string;
    time: string;
    branchId?: string;
  } | null;
}

export function CreateAppointmentDialog({
  onAppointmentCreated,
  open,
  onOpenChange,
  hideTrigger,
  initialSlot,
}: CreateAppointmentDialogProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const isControlled = typeof open === "boolean";
  const dialogOpen = isControlled ? open : isOpen;
  const setDialogOpen = (value: boolean) => {
    if (!isControlled) {
      setIsOpen(value);
    }
    onOpenChange?.(value);
  };
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
    null,
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
      availableEmployees.includes(emp.id),
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
    } catch {
      // erro tratado no hook (toast)
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

  // Reset all state when dialog closes
  useEffect(() => {
    if (!dialogOpen) {
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
  }, [dialogOpen, form]);

  useEffect(() => {
    if (!dialogOpen || !initialSlot) return;
    setFormData(prev => ({
      ...prev,
      selectedDate: initialSlot.date,
      selectedTime: initialSlot.time,
      branchId: initialSlot.branchId ?? null,
    }));
    setSelectedSlot(null);
  }, [dialogOpen, initialSlot?.date, initialSlot?.time, initialSlot?.branchId]);

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
    setDialogOpen(false);
  };

  const steps: { key: Step; label: string }[] = [
    { key: "service", label: "Serviço" },
    { key: "datetime", label: "Data e hora" },
    { key: "employee", label: "Profissional" },
    { key: "client", label: "Cliente" },
  ];
  const stepIndex = steps.findIndex(s => s.key === currentStep);

  const selectedEmployee = employeeOptions.find(
    e => e.id === formData.employeeId,
  );

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Criar Agendamento
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="p-0 gap-0 sm:max-w-[680px] max-h-[92vh] overflow-hidden rounded-2xl">
        {/* Header estilo Google Calendar */}
        <div className="flex flex-col gap-0">
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 className="text-lg font-semibold tracking-tight">
              Novo agendamento
            </h2>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-0 px-6 pb-5">
            {steps.map((step, i) => {
              const isDone = i < stepIndex;
              const isActive = i === stepIndex;
              return (
                <div key={step.key} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={[
                        "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-colors",
                        isDone
                          ? "bg-primary text-primary-foreground"
                          : isActive
                            ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                            : "bg-muted text-muted-foreground",
                      ].join(" ")}
                    >
                      {isDone ? <Check className="h-3 w-3" /> : i + 1}
                    </div>
                    <span
                      className={[
                        "text-xs font-medium hidden sm:block",
                        isActive
                          ? "text-foreground"
                          : isDone
                            ? "text-muted-foreground"
                            : "text-muted-foreground/60",
                      ].join(" ")}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={[
                        "mx-2 h-px flex-1 w-8 transition-colors",
                        i < stepIndex ? "bg-primary" : "bg-border",
                      ].join(" ")}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="h-px bg-border" />
        </div>

        {/* Conteúdo por step */}
        <ScrollArea className="flex-1 max-h-[calc(92vh-220px)]">
          <div className="px-6 py-5 space-y-4">
            {/* ── STEP 1: SERVIÇO ── */}
            {currentStep === "service" && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Selecione o serviço para verificar a disponibilidade.
                </p>

                {loadingCompany ? (
                  <div className="flex items-center gap-2 py-6 justify-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Carregando serviços...</span>
                  </div>
                ) : !company?.services || company.services.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum serviço cadastrado
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {company.services.map((service: any) => {
                      const isSelected = formData.serviceId === service.id;
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => handleServiceSelect(service.id)}
                          className={[
                            "w-full text-left flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-all",
                            isSelected
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-border hover:border-primary/40 hover:bg-muted/50",
                          ].join(" ")}
                        >
                          <div
                            className={[
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground",
                            ].join(" ")}
                          >
                            <Scissors className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {service.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {service.duration} min &nbsp;·&nbsp; R${" "}
                              {service.price.toFixed(2)}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {loadingAvailability && (
                  <div className="flex items-center gap-2 pt-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Buscando disponibilidade...</span>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 2: DATA E HORA ── */}
            {currentStep === "datetime" && (
              <div className="space-y-4">
                {organizedDates.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Nenhuma data disponível para este serviço
                  </div>
                ) : (
                  <>
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
                        d => d.date,
                      )}
                    />

                    {formData.selectedDate && selectedDateSlots.length > 0 && (
                      <div className="space-y-2">
                        <p className="flex items-center gap-1.5 text-sm font-medium">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          Horários disponíveis
                        </p>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                          {[...selectedDateSlots]
                            .sort((a: TimeSlot, b: TimeSlot) =>
                              a.time.localeCompare(b.time),
                            )
                            .map((slot: TimeSlot) => {
                              const isSelected =
                                selectedSlot?.time === slot.time;
                              return (
                                <button
                                  key={slot.time}
                                  type="button"
                                  onClick={() => {
                                    if (formData.selectedDate) {
                                      handleSlotSelect(
                                        formData.selectedDate,
                                        slot,
                                        organizedDates.find(
                                          d => d.date === formData.selectedDate,
                                        )?.branch_id || "",
                                      );
                                    }
                                  }}
                                  className={[
                                    "rounded-lg py-2 text-xs font-medium transition-all",
                                    isSelected
                                      ? "bg-primary text-primary-foreground shadow-sm"
                                      : "border border-border hover:border-primary/50 hover:bg-muted/60 text-foreground",
                                  ].join(" ")}
                                >
                                  {slot.time}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {formData.selectedDate &&
                      selectedDateSlots.length === 0 && (
                        <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                          <Clock className="h-8 w-8 opacity-40" />
                          <p className="text-sm">
                            Nenhum horário disponível para esta data
                          </p>
                        </div>
                      )}

                    {selectedBranchInfo && formData.selectedTime && (
                      <div className="flex items-start gap-3 rounded-xl border bg-muted/40 px-4 py-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium">
                            {selectedBranchInfo.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {selectedBranchInfo.street},{" "}
                            {selectedBranchInfo.number}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── STEP 3: PROFISSIONAL ── */}
            {currentStep === "employee" && (
              <div className="space-y-4">
                {/* Mini-resumo */}
                {selectedService && (
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 rounded-full border px-2.5 py-1 bg-muted/50">
                      <Scissors className="h-3 w-3" />
                      {selectedService.name}
                    </span>
                    {formData.selectedDate && formData.selectedTime && (
                      <span className="flex items-center gap-1 rounded-full border px-2.5 py-1 bg-muted/50">
                        <Clock className="h-3 w-3" />
                        {new Intl.DateTimeFormat("pt-BR", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        }).format(
                          new Date(formData.selectedDate + "T00:00:00"),
                        )}{" "}
                        às {formData.selectedTime}
                      </span>
                    )}
                    {selectedBranchInfo && (
                      <span className="flex items-center gap-1 rounded-full border px-2.5 py-1 bg-muted/50">
                        <MapPin className="h-3 w-3" />
                        {selectedBranchInfo.name}
                      </span>
                    )}
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  Selecione o profissional disponível para este horário.
                </p>

                {employeeOptions.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum profissional disponível para este horário
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {employeeOptions.map((emp: any) => {
                      const isSelected = formData.employeeId === emp.id;
                      const initials =
                        `${emp.name?.[0] ?? ""}${emp.surname?.[0] ?? ""}`.toUpperCase();
                      return (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() =>
                            setFormData(prev => ({
                              ...prev,
                              employeeId: emp.id,
                            }))
                          }
                          className={[
                            "w-full text-left flex items-center gap-4 rounded-xl border px-4 py-3 transition-all",
                            isSelected
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-border hover:border-primary/40 hover:bg-muted/50",
                          ].join(" ")}
                        >
                          <div
                            className={[
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground",
                            ].join(" ")}
                          >
                            {initials || <User className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">
                              {emp.name} {emp.surname}
                            </p>
                            {emp.role && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {emp.role}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 4: CLIENTE ── */}
            {currentStep === "client" && (
              <div className="space-y-4">
                {/* Resumo final */}
                <div className="rounded-xl border bg-muted/30 divide-y">
                  {[
                    {
                      icon: <Scissors className="h-4 w-4" />,
                      label: selectedService?.name,
                      sub: selectedService
                        ? `${selectedService.duration} min · R$ ${selectedService.price.toFixed(2)}`
                        : null,
                    },
                    {
                      icon: <Clock className="h-4 w-4" />,
                      label: formData.selectedDate
                        ? new Intl.DateTimeFormat("pt-BR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          }).format(
                            new Date(formData.selectedDate + "T00:00:00"),
                          )
                        : null,
                      sub: formData.selectedTime,
                    },
                    {
                      icon: <User className="h-4 w-4" />,
                      label: selectedEmployee
                        ? `${selectedEmployee.name} ${selectedEmployee.surname}`
                        : null,
                      sub: selectedEmployee?.role || null,
                    },
                    {
                      icon: <MapPin className="h-4 w-4" />,
                      label: selectedBranchInfo?.name || null,
                      sub: selectedBranchInfo
                        ? `${selectedBranchInfo.street}, ${selectedBranchInfo.number}`
                        : null,
                    },
                  ]
                    .filter(row => row.label)
                    .map((row, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-3">
                        <span className="text-muted-foreground mt-0.5 shrink-0">
                          {row.icon}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{row.label}</p>
                          {row.sub && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {row.sub}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>

                <div className="h-px bg-border" />

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
                          <FormLabel>Email do cliente</FormLabel>
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
                                className="pr-9"
                              />
                              {isCheckingEmail && (
                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {existingClient && (
                      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40 px-4 py-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                          {`${existingClient.name?.[0] ?? ""}${existingClient.surname?.[0] ?? ""}`.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                            {existingClient.name} {existingClient.surname}
                          </p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                            Cliente encontrado no sistema
                          </p>
                        </div>
                        <Check className="ml-auto h-4 w-4 text-emerald-600 shrink-0" />
                      </div>
                    )}

                    {showClientForm && !existingClient && (
                      <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Novo cliente</p>
                          <span className="text-xs text-muted-foreground rounded-full border px-2.5 py-0.5">
                            Será criado automaticamente
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome</FormLabel>
                                <FormControl>
                                  <Input placeholder="João" {...field} />
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
                                <FormLabel>Sobrenome</FormLabel>
                                <FormControl>
                                  <Input placeholder="Silva" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone</FormLabel>
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
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer com botões de navegação */}
        <div className="flex items-center justify-between border-t px-6 py-4 bg-background">
          <div>
            {currentStep !== "service" && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Voltar
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Cancelar
            </Button>

            {currentStep !== "client" ? (
              <Button
                size="sm"
                onClick={handleNext}
                disabled={
                  (currentStep === "service" &&
                    (!formData.serviceId || loadingAvailability)) ||
                  (currentStep === "datetime" &&
                    (!formData.selectedDate || !formData.selectedTime)) ||
                  (currentStep === "employee" && !formData.employeeId)
                }
              >
                Continuar
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={form.handleSubmit(handleSubmit)}
                disabled={
                  creatingAppointment || creatingClient || isCheckingEmail
                }
              >
                {creatingAppointment || creatingClient ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    {creatingClient ? "Criando cliente..." : "Salvando..."}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1.5" />
                    Confirmar agendamento
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
