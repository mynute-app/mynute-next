"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Calendar as CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { ServiceHeader } from "@/app/(home)/_components/service-header";
import { DateCard } from "@/app/(home)/_components/date-card";
import { TimeSlotPicker } from "@/app/(home)/_components/time-slot-picker";
import { BranchSelection } from "@/app/(home)/_components/branch-selection";
import {
  ClientDetailsForm,
  ClientData,
} from "@/app/(home)/_components/client-details-form";
import { AppointmentConfirmation } from "@/app/(home)/_components/appointment-confirmation";
import { useServiceAvailabilityAuto } from "@/hooks/service/useServiceAvailability";
import { useCompanyByName } from "@/hooks/use-company-by-name";
import { useCreateAppointment } from "@/hooks/appointment/useCreateAppointment";

import type { Service } from "../../../../types/company";
import type { TimeSlot } from "@/hooks/service/useServiceAvailability";
import { EmployeeSelection } from "./employee-selection-improved";
import { Calendar } from "./calendar";

interface AppointmentBookingProps {
  service: Service;
  onBack: () => void;
  brandColor?: string;
  initialAvailabilityData?: any;
}

interface SelectedSlot {
  date: string;
  time: string;
  branchId: string;
  employeeId: string;
}

interface SelectedTimeSlot {
  date: string;
  time: string;
  branchId: string;
  availableEmployees: string[];
}

interface SelectedAppointment {
  date: string;
  time: string;
  branchId: string;
  employeeId: string;
}

export function AppointmentBooking({
  service,
  onBack,
  brandColor,
  initialAvailabilityData,
}: AppointmentBookingProps) {
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] =
    useState<SelectedTimeSlot | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<SelectedAppointment | null>(null);
  const [showEmployeeSelection, setShowEmployeeSelection] = useState(false);
  const [showBranchSelection, setShowBranchSelection] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date | null>(
    null
  );
  const [showCalendarTimeSlots, setShowCalendarTimeSlots] = useState(false);
  const [shouldFetchCalendarData, setShouldFetchCalendarData] = useState(false);

  // Hook para obter dados da empresa
  const { company } = useCompanyByName();

  // Hook para criar agendamento
  const {
    appointment,
    loading: creatingAppointment,
    error: appointmentError,
    createAppointment,
    reset: resetAppointment,
  } = useCreateAppointment();

  // Efeito para controlar quando buscar dados do calendário
  useEffect(() => {
    if (calendarOpen) {
      setShouldFetchCalendarData(true);
    }
  }, [calendarOpen]); // Só depende de calendarOpen

  // Usar dados iniciais do ServiceList (3 dias: hoje, amanhã, depois de amanhã)
  const availability = initialAvailabilityData;
  const loading = !initialAvailabilityData;
  const error = null;

  // Organizar os 3 dias de dados
  const organizedTodayTomorrow = useMemo(() => {
    if (!availability?.available_dates) return { today: [], tomorrow: [] };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayStr = today.toISOString().split("T")[0];
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const todayData = availability.available_dates.find(
      (d: any) => d.date === todayStr
    );
    const tomorrowData = availability.available_dates.find(
      (d: any) => d.date === tomorrowStr
    );

    const formatDateInfo = (dateInfo: any, label: string) => ({
      ...dateInfo,
      label,
      time_slots: [...dateInfo.time_slots].sort((a: any, b: any) =>
        a.time.localeCompare(b.time)
      ),
      formattedDate: new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date(dateInfo.date + "T00:00:00")),
    });

    return {
      today: todayData ? [formatDateInfo(todayData, "Hoje")] : [],
      tomorrow: tomorrowData ? [formatDateInfo(tomorrowData, "Amanhã")] : [],
    };
  }, [availability?.available_dates]);

  // Para o calendário, buscar 30 dias de uma vez quando necessário
  const calendarParams = useMemo(() => {
    if (service && company && shouldFetchCalendarData) {
      return {
        serviceId: service.id,
        companyId: company.id,
        timezone: "America/Sao_Paulo",
        dateForwardStart: 0,
        dateForwardEnd: 31, // Buscar 30 dias de uma vez
      };
    }
    return null;
  }, [service?.id, company?.id, shouldFetchCalendarData]);

  const {
    availability: allDatesAvailability,
    loading: allDatesLoading,
    error: allDatesError,
  } = useServiceAvailabilityAuto(calendarParams);

  // Hook para buscar dados dos 30 dias quando calendário abrir (removido hook individual)

  // Aplicar filtros simples diretamente (sem filtros por enquanto)
  const getFilteredTodayTomorrow = useMemo(() => {
    if (!organizedTodayTomorrow) return { today: [], tomorrow: [] };

    // Por enquanto, não aplicar filtros para evitar erros
    return organizedTodayTomorrow;
  }, [organizedTodayTomorrow]);

  // Obter listas únicas de filiais e funcionários
  const branches = availability?.branch_info || [];
  const employees = availability?.employee_info || [];

  // Para seleção de funcionários, usar dados da disponibilidade
  const employeesForSelection = useMemo(() => {
    if (selectedTimeSlot && availability?.employee_info) {
      return availability.employee_info.filter((emp: any) =>
        selectedTimeSlot.availableEmployees.includes(emp.id)
      );
    }
    return [];
  }, [selectedTimeSlot, availability?.employee_info]);

  // Obter todas as datas disponíveis para o calendário (dos 30 dias buscados)
  const availableDates = useMemo(() => {
    if (!allDatesAvailability?.available_dates) return [];
    return allDatesAvailability.available_dates.map(
      (dateInfo: any) => dateInfo.date
    );
  }, [allDatesAvailability?.available_dates]);

  // Obter horários para a data selecionada no calendário (usando dados dos 30 dias)
  const calendarTimeSlots = useMemo(() => {
    if (
      !showCalendarTimeSlots ||
      !calendarSelectedDate ||
      !allDatesAvailability?.available_dates
    ) {
      return { timeSlots: [], branchId: "" };
    }

    const selectedDateStr = calendarSelectedDate.toISOString().split("T")[0];
    const dateData = allDatesAvailability.available_dates.find(
      (d: any) => d.date === selectedDateStr
    );

    if (!dateData) {
      return { timeSlots: [], branchId: "" };
    }

    let timeSlots = dateData.time_slots;

    // Filtrar por filial se selecionada
    if (selectedBranch && dateData.branch_id !== selectedBranch) {
      return { timeSlots: [], branchId: dateData.branch_id };
    }

    // Filtrar por funcionário se selecionado
    if (selectedEmployee) {
      timeSlots = timeSlots.filter((slot: any) =>
        slot.employees.includes(selectedEmployee)
      );
    }

    return {
      timeSlots,
      branchId: dateData.branch_id,
    };
  }, [
    showCalendarTimeSlots,
    calendarSelectedDate,
    allDatesAvailability?.available_dates,
    selectedBranch,
    selectedEmployee,
  ]);

  const handleSlotSelect = (date: string, slot: TimeSlot, branchId: string) => {
    // Ao invés de definir o funcionário imediatamente, vamos para seleção de funcionários
    setSelectedTimeSlot({
      date,
      time: slot.time,
      branchId,
      availableEmployees: slot.employees,
    });
    setShowEmployeeSelection(true);

    // Se veio do calendário, fechar modal
    if (showCalendarTimeSlots) {
      setCalendarOpen(false);
      setShowCalendarTimeSlots(false);
    }
  };

  const handleEmployeeSelect = (employeeId: string) => {
    if (!selectedTimeSlot) return;

    // Ao invés de finalizar, ir para seleção de local
    setSelectedAppointment({
      date: selectedTimeSlot.date,
      time: selectedTimeSlot.time,
      branchId: selectedTimeSlot.branchId,
      employeeId,
    });
    setShowEmployeeSelection(false);
    setShowBranchSelection(true);
  };

  const handleBranchSelect = (branchId: string) => {
    if (!selectedAppointment) return;

    // Ir para formulário do cliente ao invés de finalizar
    setSelectedSlot({
      date: selectedAppointment.date,
      time: selectedAppointment.time,
      branchId,
      employeeId: selectedAppointment.employeeId,
    });
    setShowBranchSelection(false);
    setShowClientForm(true);
  };

  const handleBackToTimeSelection = () => {
    setShowEmployeeSelection(false);
    setSelectedTimeSlot(null);
  };

  const handleBackToEmployeeSelection = () => {
    setShowBranchSelection(false);
    setShowEmployeeSelection(true);
    setSelectedAppointment(null);
  };

  const handleBackToBranchSelection = () => {
    setShowClientForm(false);
    setShowBranchSelection(true);
  };

  const handleClientFormSubmit = (data: ClientData) => {
    setClientData(data);
    setShowClientForm(false);
    setShowConfirmation(true);
  };

  const handleBackToClientForm = () => {
    setShowConfirmation(false);
    setShowClientForm(true);
  };

  const handleCalendarDateSelect = (date: Date) => {
    setCalendarSelectedDate(date);
    setShowCalendarTimeSlots(true);
  };

  const handleCalendarOpenChange = (open: boolean) => {
    setCalendarOpen(open);
    if (!open) {
      // Reset quando fechar o calendário
      setCalendarSelectedDate(null);
      setShowCalendarTimeSlots(false);
      setShouldFetchCalendarData(false);
    }
  };

  const handleConfirmAppointment = async () => {
    if (!selectedSlot || !clientData || !company?.id) return;

    try {
      // Converter data e hora para ISO string (start_time)
      const startTime = new Date(
        `${selectedSlot.date}T${selectedSlot.time}:00`
      ).toISOString();

      // TODO: Implementar criação de cliente antes de criar o agendamento
      // Por enquanto, vamos usar um client_id placeholder
      const clientId = "00000000-0000-0000-0000-000000000000"; // Placeholder

      const appointmentParams = {
        branch_id: selectedSlot.branchId,
        client_id: clientId, // TODO: Criar cliente primeiro e usar o ID real
        company_id: company.id,
        employee_id: selectedSlot.employeeId,
        service_id: service.id,
        start_time: startTime,
        // time_zone já é injetado automaticamente como "America/Sao_Paulo"
      };

      console.log("📤 DADOS QUE VOU ENVIAR:");
      console.log("Company ID:", company.id);
      console.log("Params:", JSON.stringify(appointmentParams, null, 2));

      await createAppointment(appointmentParams);

      // Se chegou aqui, o agendamento foi criado com sucesso
      console.log("✅ Agendamento criado com sucesso!");

      // TODO: Mostrar tela de sucesso ou redirecionar
    } catch (error) {
      console.error("❌ Erro ao criar agendamento:", error);
      // TODO: Mostrar mensagem de erro para o usuário
    }
  };

  const minDate = new Date();
  const maxDate = useMemo(() => {
    const max = new Date();
    max.setDate(max.getDate() + 30); // 30 dias no futuro
    return max;
  }, []);

  return (
    <div className="space-y-6">
      {showConfirmation && selectedSlot && clientData ? (
        // Tela de confirmação final
        <AppointmentConfirmation
          service={service}
          selectedSlot={selectedSlot}
          clientData={clientData}
          branches={branches}
          employees={employees}
          brandColor={brandColor}
          onConfirm={handleConfirmAppointment}
          onBack={handleBackToClientForm}
          loading={creatingAppointment}
          error={appointmentError}
        />
      ) : showClientForm && selectedSlot ? (
        // Tela de formulário de dados do cliente
        <ClientDetailsForm
          service={service}
          selectedSlot={selectedSlot}
          branches={branches}
          employees={employees}
          brandColor={brandColor}
          onSubmit={handleClientFormSubmit}
          onBack={handleBackToBranchSelection}
        />
      ) : showBranchSelection && selectedAppointment ? (
        // Tela de seleção de local
        <BranchSelection
          selectedAppointment={selectedAppointment}
          branches={branches}
          employees={employees}
          brandColor={brandColor}
          onBranchSelect={handleBranchSelect}
          onBack={handleBackToEmployeeSelection}
        />
      ) : showEmployeeSelection && selectedTimeSlot ? (
        // Tela de seleção de funcionários
        <EmployeeSelection
          selectedTimeSlot={selectedTimeSlot}
          employees={employeesForSelection}
          branches={branches}
          brandColor={brandColor}
          onEmployeeSelect={handleEmployeeSelect}
          onBack={handleBackToTimeSelection}
        />
      ) : (
        // Tela principal de seleção de horários
        <>
          {/* Header com informações do serviço */}
          <ServiceHeader service={service} onBack={onBack} />

          <Separator />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filtros */}
            <div className="space-y-4">
              {/* Filtros removidos temporariamente para evitar erro de backend */}
            </div>

            {/* Horários disponíveis */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Horários disponíveis</h3>

                {/* Botão para abrir calendário */}
                <Dialog
                  open={calendarOpen}
                  onOpenChange={handleCalendarOpenChange}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      Outras datas
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Escolher outra data</DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Calendário */}
                      <div>
                        <h4 className="font-medium mb-4">Selecione uma data</h4>
                        <Calendar
                          selectedDate={calendarSelectedDate}
                          onDateSelect={handleCalendarDateSelect}
                          availableDates={availableDates} // Mostrar quais datas têm horários
                          minDate={minDate}
                          maxDate={maxDate}
                        />
                      </div>

                      {/* Horários para data selecionada no calendário */}
                      <div>
                        <h4 className="font-medium mb-4">
                          Horários disponíveis
                          {calendarSelectedDate && (
                            <div className="text-xs text-muted-foreground mt-1">
                              <div>
                                {(() => {
                                  const today = new Date();
                                  const diffTime =
                                    calendarSelectedDate.getTime() -
                                    today.getTime();
                                  const diffDays = Math.ceil(
                                    diffTime / (1000 * 60 * 60 * 24)
                                  );
                                  const daysFromToday = Math.max(
                                    0,
                                    Math.min(30, diffDays)
                                  );

                                  return daysFromToday === 0
                                    ? "Hoje"
                                    : daysFromToday === 1
                                    ? "Amanhã"
                                    : `${daysFromToday} dias à frente`;
                                })()}
                              </div>
                              <div className="font-mono mt-1">
                                Dados carregados: 30 dias (API:
                                date_forward_start=0, date_forward_end=31)
                              </div>
                            </div>
                          )}
                        </h4>
                        {allDatesLoading ? (
                          <Card>
                            <CardContent className="p-6 text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                              <p className="text-muted-foreground mt-4">
                                Carregando 30 dias de horários...
                              </p>
                            </CardContent>
                          </Card>
                        ) : allDatesError ? (
                          <Card>
                            <CardContent className="p-6 text-center">
                              <p className="text-destructive">
                                Erro ao carregar horários
                              </p>
                            </CardContent>
                          </Card>
                        ) : showCalendarTimeSlots ? (
                          <TimeSlotPicker
                            selectedDate={calendarSelectedDate}
                            timeSlots={calendarTimeSlots.timeSlots}
                            selectedTime={null}
                            branchId={calendarTimeSlots.branchId}
                            brandColor={brandColor}
                            onTimeSelect={(time, slot, branchId) => {
                              const date =
                                calendarSelectedDate
                                  ?.toISOString()
                                  .split("T")[0] || "";
                              handleSlotSelect(date, slot, branchId);
                            }}
                          />
                        ) : (
                          <Card>
                            <CardContent className="p-6 text-center">
                              <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                              <p className="text-muted-foreground">
                                Selecione uma data no calendário
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {loading && (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="grid grid-cols-6 gap-2">
                            {Array.from({ length: 12 }).map((_, j) => (
                              <div
                                key={j}
                                className="h-8 bg-muted rounded"
                              ></div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {error && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-destructive">
                      Erro ao carregar horários: {error}
                    </p>
                  </CardContent>
                </Card>
              )}

              {!loading && !error && (
                <div className="space-y-4">
                  {/* Hoje e Amanhã sempre visíveis */}
                  {getFilteredTodayTomorrow.today.map((dateInfo: any) => (
                    <DateCard
                      key={dateInfo.date}
                      date={dateInfo.date}
                      label={dateInfo.label}
                      formattedDate={dateInfo.formattedDate}
                      timeSlots={dateInfo.time_slots}
                      selectedSlot={selectedSlot}
                      branchId={dateInfo.branch_id}
                      brandColor={brandColor}
                      onSlotSelect={handleSlotSelect}
                    />
                  ))}

                  {getFilteredTodayTomorrow.tomorrow.map((dateInfo: any) => (
                    <DateCard
                      key={dateInfo.date}
                      date={dateInfo.date}
                      label={dateInfo.label}
                      formattedDate={dateInfo.formattedDate}
                      timeSlots={dateInfo.time_slots}
                      selectedSlot={selectedSlot}
                      branchId={dateInfo.branch_id}
                      brandColor={brandColor}
                      onSlotSelect={handleSlotSelect}
                    />
                  ))}

                  {/* Estado vazio */}
                  {getFilteredTodayTomorrow.today.length === 0 &&
                    getFilteredTodayTomorrow.tomorrow.length === 0 && (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <CalendarDays className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            Nenhum horário disponível para hoje e amanhã com os
                            filtros selecionados.
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Tente usar o botão "Outras datas" para ver mais
                            opções.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
