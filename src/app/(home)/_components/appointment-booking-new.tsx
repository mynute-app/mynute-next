"use client";

/**
 * AppointmentBookingNew - Nova versão do fluxo de agendamento
 * Integrado com BookingProvider para gerenciamento de estado centralizado
 * Responsável apenas pela seleção de data/hora
 */

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useServiceAvailability } from "@/hooks/service/useServiceAvailability";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { ServiceHeader } from "./service-header";
import { DateCard } from "./date-card";
import { TimeSlotPicker } from "./time-slot-picker";
import { Calendar } from "./calendar";
import { useBooking } from "./booking";
import type { Service } from "../../../../types/company";
import type { TimeSlot } from "@/hooks/service/useServiceAvailability";

interface AppointmentBookingNewProps {
  service: Service;
  onBack: () => void;
  brandColor?: string;
  initialAvailabilityData?: any;
}

export function AppointmentBookingNew({
  service,
  onBack,
  brandColor,
  initialAvailabilityData,
}: AppointmentBookingNewProps) {
  const { selectDateTime, companyId, updateAvailabilityData } = useBooking();
  const { fetchAvailability, loading: extendedLoading } =
    useServiceAvailability();

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date | null>(
    null
  );
  const [showCalendarTimeSlots, setShowCalendarTimeSlots] = useState(false);
  const [extendedAvailability, setExtendedAvailability] = useState<any>(null);

  // Usar dados de disponibilidade (estendida para calendário ou inicial para hoje/amanhã)
  // IMPORTANTE: Sempre mesclar employee_info e branch_info do initial com o extended
  const availability = useMemo(() => {
    if (!extendedAvailability) {
      return initialAvailabilityData;
    }

    // Mesclar dados: usar datas do extended mas manter employee/branch info completos
    return {
      ...extendedAvailability,
      employee_info:
        initialAvailabilityData?.employee_info ||
        extendedAvailability?.employee_info ||
        [],
      branch_info:
        initialAvailabilityData?.branch_info ||
        extendedAvailability?.branch_info ||
        [],
    };
  }, [extendedAvailability, initialAvailabilityData]);

  const loading =
    (!initialAvailabilityData && !extendedAvailability) || extendedLoading;

  // Organizar os 3 primeiros dias (hoje, amanhã, depois de amanhã)
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

  // Obter datas disponíveis para o calendário
  const availableDates = useMemo(() => {
    if (!availability?.available_dates) return [];
    return availability.available_dates.map((dateInfo: any) => dateInfo.date);
  }, [availability?.available_dates]);

  // Obter horários para a data selecionada no calendário
  const calendarTimeSlots = useMemo(() => {
    if (
      !showCalendarTimeSlots ||
      !calendarSelectedDate ||
      !availability?.available_dates
    ) {
      return { timeSlots: [], branchId: "" };
    }

    const selectedDateStr = calendarSelectedDate.toISOString().split("T")[0];
    const dateData = availability.available_dates.find(
      (d: any) => d.date === selectedDateStr
    );

    if (!dateData) {
      return { timeSlots: [], branchId: "" };
    }

    return {
      timeSlots: dateData.time_slots,
      branchId: dateData.branch_id,
    };
  }, [
    showCalendarTimeSlots,
    calendarSelectedDate,
    availability?.available_dates,
  ]);

  const handleSlotSelect = (date: string, slot: TimeSlot, branchId: string) => {
    // Ao selecionar horário, avançar para próximo step
    selectDateTime(date, slot.time, branchId);

    // Se veio do calendário, fechar modal
    if (showCalendarTimeSlots) {
      setCalendarOpen(false);
      setShowCalendarTimeSlots(false);
    }
  };

  const handleCalendarDateSelect = (date: Date) => {
    setCalendarSelectedDate(date);
    setShowCalendarTimeSlots(true);
  };

  const handleCalendarOpenChange = async (open: boolean) => {
    setCalendarOpen(open);

    if (open && !extendedAvailability && companyId) {
      try {
        const data = await fetchAvailability({
          serviceId: service.id,
          companyId: companyId,
          timezone: "America/Sao_Paulo",
          dateForwardStart: 0,
          dateForwardEnd: 31,
        });

        // Enriquecer com dados de employee e branch
        const enrichedData = {
          ...data,
          employee_info:
            data?.employee_info || initialAvailabilityData?.employee_info || [],
          branch_info:
            data?.branch_info || initialAvailabilityData?.branch_info || [],
        };

        setExtendedAvailability(enrichedData);
        // Atualizar o contexto com a disponibilidade estendida mesclada
        updateAvailabilityData(enrichedData as any);
      } catch (error) {
        console.error("Erro ao buscar disponibilidade estendida:", error);
      }
    }

    if (!open) {
      setCalendarSelectedDate(null);
      setShowCalendarTimeSlots(false);
    }
  };

  const minDate = useMemo(() => {
    const min = new Date();
    min.setHours(0, 0, 0, 0); // Zerar hora para começar do início do dia
    return min;
  }, []);

  const maxDate = useMemo(() => {
    const max = new Date();
    max.setDate(max.getDate() + 30);
    return max;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header com informações do serviço */}
      <ServiceHeader service={service} onBack={onBack} />

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Horários disponíveis</h3>

          {/* Botão para abrir calendário */}
          <Dialog open={calendarOpen} onOpenChange={handleCalendarOpenChange}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <CalendarIcon className="w-4 h-4" />
                Outras datas
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[90vh] sm:h-auto max-h-[90vh] p-0 gap-0 flex flex-col">
              <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b sticky top-0 bg-background z-10">
                <div className="flex items-center justify-between">
                  <DialogTitle>Escolher outra data</DialogTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCalendarOpen(false)}
                    className="sm:hidden -mr-2"
                  >
                    Fechar
                  </Button>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
                {extendedLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 sm:py-20">
                    <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-primary mb-4" />
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Carregando disponibilidade...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
                    {/* Calendário */}
                    <div className="flex-shrink-0">
                      <h4 className="font-medium mb-4 text-sm sm:text-base">
                        Selecione uma data
                      </h4>
                      <Calendar
                        selectedDate={calendarSelectedDate}
                        onDateSelect={handleCalendarDateSelect}
                        availableDates={availableDates}
                        minDate={minDate}
                        maxDate={maxDate}
                      />
                    </div>

                    {/* Horários para data selecionada no calendário */}
                    <div className="flex-1">
                      <div className="sticky top-0 bg-background pb-4 mb-2 border-b lg:border-none">
                        <h4 className="font-medium text-sm sm:text-base">
                          Horários disponíveis
                        </h4>
                        {calendarSelectedDate && (
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            {new Intl.DateTimeFormat("pt-BR", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            }).format(calendarSelectedDate)}
                          </p>
                        )}
                      </div>
                      {showCalendarTimeSlots ? (
                        <div className="pb-4">
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
                        </div>
                      ) : (
                        <Card>
                          <CardContent className="p-6 text-center">
                            <CalendarIcon className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
                            <p className="text-sm sm:text-base text-muted-foreground">
                              Selecione uma data no calendário
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                )}
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
                        <div key={j} className="h-8 bg-muted rounded"></div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && (
          <div className="space-y-4">
            {/* Hoje e Amanhã sempre visíveis */}
            {organizedTodayTomorrow.today.map((dateInfo: any) => (
              <DateCard
                key={dateInfo.date}
                date={dateInfo.date}
                label={dateInfo.label}
                formattedDate={dateInfo.formattedDate}
                timeSlots={dateInfo.time_slots}
                selectedSlot={null}
                branchId={dateInfo.branch_id}
                brandColor={brandColor}
                onSlotSelect={handleSlotSelect}
              />
            ))}

            {organizedTodayTomorrow.tomorrow.map((dateInfo: any) => (
              <DateCard
                key={dateInfo.date}
                date={dateInfo.date}
                label={dateInfo.label}
                formattedDate={dateInfo.formattedDate}
                timeSlots={dateInfo.time_slots}
                selectedSlot={null}
                branchId={dateInfo.branch_id}
                brandColor={brandColor}
                onSlotSelect={handleSlotSelect}
              />
            ))}

            {/* Estado vazio */}
            {organizedTodayTomorrow.today.length === 0 &&
              organizedTodayTomorrow.tomorrow.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <CalendarDays className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Nenhum horário disponível para hoje e amanhã.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Tente usar o botão "Outras datas" para ver mais opções.
                    </p>
                  </CardContent>
                </Card>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
