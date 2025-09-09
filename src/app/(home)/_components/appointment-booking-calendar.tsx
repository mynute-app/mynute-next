"use client";

import { useState, useMemo } from "react";
import { Separator } from "@/components/ui/separator";

import { ServiceHeader } from "@/app/(home)/_components/service-header";
import { FilterSidebar } from "@/app/(home)/_components/filter-sidebar";
import { AppointmentSummary } from "@/app/(home)/_components/appointment-summary";
import { Calendar } from "@/app/(home)/_components/calendar";
import { TimeSlotPicker } from "@/app/(home)/_components/time-slot-picker";
import { useAppointmentAvailability } from "@/hooks/use-appointment-availability";

import type { Service } from "../../../../types/company";
import type { TimeSlot } from "@/hooks/service/useServiceAvailability";

interface AppointmentBookingWithCalendarProps {
  service: Service;
  onBack: () => void;
  brandColor?: string;
}

interface SelectedSlot {
  date: string;
  time: string;
  branchId: string;
  employeeId: string;
}

export function AppointmentBookingWithCalendar({
  service,
  onBack,
  brandColor,
}: AppointmentBookingWithCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  const { availability, loading, error } = useAppointmentAvailability({
    service,
  });

  // Obter listas únicas de filiais e funcionários
  const branches = availability?.branch_info || [];
  const employees = availability?.employee_info || [];

  // Obter todas as datas disponíveis para o calendário
  const availableDates = useMemo(() => {
    if (!availability?.available_dates) return [];
    return availability.available_dates.map(dateInfo => dateInfo.date);
  }, [availability?.available_dates]);

  // Obter horários disponíveis para a data selecionada
  const availableTimeSlotsForDate = useMemo(() => {
    if (!selectedDate || !availability?.available_dates) {
      return { timeSlots: [], branchId: "" };
    }

    const dateString = selectedDate.toISOString().split("T")[0];
    const dateInfo = availability.available_dates.find(
      d => d.date === dateString
    );

    if (!dateInfo) {
      return { timeSlots: [], branchId: "" };
    }

    let timeSlots = dateInfo.time_slots;

    // Filtrar por filial se selecionada
    if (selectedBranch && dateInfo.branch_id !== selectedBranch) {
      return { timeSlots: [], branchId: dateInfo.branch_id };
    }

    // Filtrar por funcionário se selecionado
    if (selectedEmployee) {
      timeSlots = timeSlots.filter(slot =>
        slot.employees.includes(selectedEmployee)
      );
    }

    return {
      timeSlots,
      branchId: dateInfo.branch_id,
    };
  }, [
    selectedDate,
    availability?.available_dates,
    selectedBranch,
    selectedEmployee,
  ]);

  // Criar slot selecionado completo
  const selectedSlot: SelectedSlot | null = useMemo(() => {
    if (!selectedDate || !selectedTime || !availableTimeSlotsForDate.branchId)
      return null;

    const dateString = selectedDate.toISOString().split("T")[0];
    const slot = availableTimeSlotsForDate.timeSlots.find(
      (s: TimeSlot) => s.time === selectedTime
    );

    if (!slot) return null;

    // Se tiver funcionário específico selecionado, usar ele, senão o primeiro disponível
    const employeeId = selectedEmployee || slot.employees[0];

    return {
      date: dateString,
      time: selectedTime,
      branchId: availableTimeSlotsForDate.branchId,
      employeeId,
    };
  }, [selectedDate, selectedTime, availableTimeSlotsForDate, selectedEmployee]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  };

  const handleTimeSelect = (time: string, slot: TimeSlot, branchId: string) => {
    setSelectedTime(time);
  };

  const handleConfirmAppointment = () => {
    if (!selectedSlot) return;

    console.log("Agendamento confirmado:", {
      service,
      slot: selectedSlot,
      employee: employees.find(emp => emp.id === selectedSlot.employeeId),
      branch: branches.find(branch => branch.id === selectedSlot.branchId),
    });
  };

  // Configurar data mínima e máxima para o calendário
  const minDate = new Date(); // Hoje
  const maxDate = useMemo(() => {
    const max = new Date();
    max.setDate(max.getDate() + 90); // 3 meses no futuro
    return max;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header com informações do serviço */}
      <ServiceHeader service={service} onBack={onBack} />

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filtros */}
        <div className="space-y-4">
          <FilterSidebar
            branches={branches}
            employees={employees}
            selectedBranch={selectedBranch}
            selectedEmployee={selectedEmployee}
            brandColor={brandColor}
            onBranchSelect={setSelectedBranch}
            onEmployeeSelect={setSelectedEmployee}
          />

          {/* Resumo da seleção */}
          <AppointmentSummary
            service={service}
            selectedSlot={selectedSlot}
            branches={branches}
            employees={employees}
            brandColor={brandColor}
            onConfirm={handleConfirmAppointment}
          />
        </div>

        {/* Calendário e horários */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendário */}
            <div>
              <h3 className="font-medium mb-4">Selecione uma data</h3>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-64 bg-muted rounded-lg"></div>
                </div>
              ) : error ? (
                <div className="text-center p-6 text-destructive">
                  Erro ao carregar calendário: {error}
                </div>
              ) : (
                <Calendar
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  availableDates={availableDates}
                  minDate={minDate}
                  maxDate={maxDate}
                />
              )}
            </div>

            {/* Horários */}
            <div>
              <h3 className="font-medium mb-4">Selecione um horário</h3>
              <TimeSlotPicker
                selectedDate={selectedDate}
                timeSlots={availableTimeSlotsForDate.timeSlots}
                selectedTime={selectedTime}
                branchId={availableTimeSlotsForDate.branchId}
                brandColor={brandColor}
                onTimeSelect={handleTimeSelect}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
