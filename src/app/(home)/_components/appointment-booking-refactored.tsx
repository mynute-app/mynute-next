"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, ChevronDown, ChevronUp } from "lucide-react";

import { ServiceHeader } from "@/app/(home)/_components/service-header";
import { FilterSidebar } from "@/app/(home)/_components/filter-sidebar";
import { AppointmentSummary } from "@/app/(home)/_components/appointment-summary";
import { DateCard } from "@/app/(home)/_components/date-card";
import { useAppointmentAvailability } from "@/hooks/use-appointment-availability";

import type { Service } from "../../../../types/company";
import type { TimeSlot } from "@/hooks/service/useServiceAvailability";

interface AppointmentBookingProps {
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

export function AppointmentBooking({
  service,
  onBack,
  brandColor,
}: AppointmentBookingProps) {
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [showMoreDates, setShowMoreDates] = useState(false);

  const {
    availability,
    loading,
    error,
    getFilteredSlots,
    loadMoreDays,
    resetToInitialDays,
    hasMoreDays,
  } = useAppointmentAvailability({ service });

  // Obter dados filtrados
  const filteredSlots = getFilteredSlots(selectedBranch, selectedEmployee);

  // Obter listas únicas de filiais e funcionários
  const branches = availability?.branch_info || [];
  const employees = availability?.employee_info || [];

  const handleSlotSelect = (date: string, slot: TimeSlot, branchId: string) => {
    // Se tiver funcionário específico selecionado, usar ele, senão o primeiro disponível
    const employeeId = selectedEmployee || slot.employees[0];

    setSelectedSlot({
      date,
      time: slot.time,
      branchId,
      employeeId,
    });
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

  const handleToggleMoreDates = () => {
    if (showMoreDates) {
      setShowMoreDates(false);
      resetToInitialDays();
    } else {
      setShowMoreDates(true);
      loadMoreDays();
    }
  };

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

        {/* Horários disponíveis */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="font-medium">Horários disponíveis</h3>

          {loading && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
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
              {/* Hoje e Amanhã em destaque */}
              {filteredSlots.today.map(dateInfo => (
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

              {filteredSlots.tomorrow.map(dateInfo => (
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

              {/* Botão para carregar mais dias */}
              {(hasMoreDays || filteredSlots.others.length > 0) && (
                <div className="flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleMoreDates}
                    className="gap-2"
                    disabled={loading}
                  >
                    {showMoreDates ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Ocultar mais datas
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Ver mais datas
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Mais dias */}
              {showMoreDates && (
                <div className="space-y-4">
                  {filteredSlots.others.map(dateInfo => (
                    <DateCard
                      key={dateInfo.date}
                      date={dateInfo.date}
                      formattedDate={dateInfo.formattedDate}
                      timeSlots={dateInfo.time_slots}
                      selectedSlot={selectedSlot}
                      branchId={dateInfo.branch_id}
                      brandColor={brandColor}
                      onSlotSelect={handleSlotSelect}
                    />
                  ))}
                </div>
              )}

              {/* Estado vazio */}
              {filteredSlots.today.length === 0 &&
                filteredSlots.tomorrow.length === 0 &&
                filteredSlots.others.length === 0 && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <CalendarDays className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Nenhum horário disponível encontrado com os filtros
                        selecionados.
                      </p>
                    </CardContent>
                  </Card>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
