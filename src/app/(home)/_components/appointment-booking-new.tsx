"use client";

/**
 * AppointmentBookingNew - Nova versão do fluxo de agendamento
 * Integrado com BookingProvider para gerenciamento de estado centralizado
 * Responsável apenas pela seleção de data/hora
 */

import { useState, useMemo } from "react";
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
  const { selectDateTime } = useBooking();

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date | null>(
    null
  );
  const [showCalendarTimeSlots, setShowCalendarTimeSlots] = useState(false);

  // Usar dados de disponibilidade
  const availability = initialAvailabilityData;
  const loading = !initialAvailabilityData;

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

  const handleCalendarOpenChange = (open: boolean) => {
    setCalendarOpen(open);
    if (!open) {
      setCalendarSelectedDate(null);
      setShowCalendarTimeSlots(false);
    }
  };

  const minDate = new Date();
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
                    availableDates={availableDates}
                    minDate={minDate}
                    maxDate={maxDate}
                  />
                </div>

                {/* Horários para data selecionada no calendário */}
                <div>
                  <h4 className="font-medium mb-4">Horários disponíveis</h4>
                  {showCalendarTimeSlots ? (
                    <TimeSlotPicker
                      selectedDate={calendarSelectedDate}
                      timeSlots={calendarTimeSlots.timeSlots}
                      selectedTime={null}
                      branchId={calendarTimeSlots.branchId}
                      brandColor={brandColor}
                      onTimeSelect={(time, slot, branchId) => {
                        const date =
                          calendarSelectedDate?.toISOString().split("T")[0] ||
                          "";
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
