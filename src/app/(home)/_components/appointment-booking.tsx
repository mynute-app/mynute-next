"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useServiceAvailabilityAuto } from "@/hooks/service/useServiceAvailability";
import { useCompanyByName } from "@/hooks/use-company-by-name";
import type { Service } from "../../../../types/company";
import type {
  AvailableDate,
  TimeSlot,
  EmployeeInfo,
  BranchInfo,
} from "@/hooks/service/useServiceAvailability";
import Image from "next/image";

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
  const [daysToLoad, setDaysToLoad] = useState(2); // Começar com hoje e amanhã
  const { company } = useCompanyByName();

  const availabilityParams = useMemo(() => {
    if (!service || !company) return null;

    return {
      serviceId: service.id,
      companyId: company.id,
      timezone: "America/Sao_Paulo",
      dateForwardStart: 0,
      dateForwardEnd: daysToLoad,
    };
  }, [service, company, daysToLoad]);

  const { availability, loading, error } = useServiceAvailabilityAuto(
    availabilityParams,
    !!availabilityParams
  );

  // Organizar dados por data
  const organizedDates = useMemo(() => {
    if (!availability?.available_dates)
      return { today: [], tomorrow: [], others: [] };

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const todayStr = today.toISOString().split("T")[0];
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const todayData = availability.available_dates.find(
      d => d.date === todayStr
    );
    const tomorrowData = availability.available_dates.find(
      d => d.date === tomorrowStr
    );
    const othersData = availability.available_dates.filter(
      d => d.date !== todayStr && d.date !== tomorrowStr
    );

    const formatDateInfo = (dateInfo: AvailableDate, label?: string) => ({
      ...dateInfo,
      label,
      time_slots: [...dateInfo.time_slots].sort((a, b) =>
        a.time.localeCompare(b.time)
      ),
      formattedDate: new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date(dateInfo.date)),
    });

    return {
      today: todayData ? [formatDateInfo(todayData, "Hoje")] : [],
      tomorrow: tomorrowData ? [formatDateInfo(tomorrowData, "Amanhã")] : [],
      others: othersData.map(d => formatDateInfo(d)),
    };
  }, [availability?.available_dates]);

  // Filtrar horários por filial e funcionário selecionados
  const filteredSlots = useMemo(() => {
    const filterSlots = (dateInfo: any) => {
      if (!selectedBranch && !selectedEmployee) return dateInfo;

      let filtered = { ...dateInfo };

      if (selectedBranch && dateInfo.branch_id !== selectedBranch) {
        return { ...dateInfo, time_slots: [] };
      }

      if (selectedEmployee) {
        filtered.time_slots = dateInfo.time_slots.filter((slot: TimeSlot) =>
          slot.employees.includes(selectedEmployee)
        );
      }

      return filtered;
    };

    return {
      today: organizedDates.today.map(filterSlots),
      tomorrow: organizedDates.tomorrow.map(filterSlots),
      others: organizedDates.others.map(filterSlots),
    };
  }, [organizedDates, selectedBranch, selectedEmployee]);

  // Obter listas únicas de filiais e funcionários
  const branches = useMemo(
    () => availability?.branch_info || [],
    [availability?.branch_info]
  );
  const employees = useMemo(
    () => availability?.employee_info || [],
    [availability?.employee_info]
  );

  // Função para obter informações do funcionário
  const getEmployeeInfo = (employeeId: string): EmployeeInfo | undefined => {
    return employees.find(emp => emp.id === employeeId);
  };

  // Função para obter informações da filial
  const getBranchInfo = (branchId: string): BranchInfo | undefined => {
    return branches.find(branch => branch.id === branchId);
  };

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
      employee: getEmployeeInfo(selectedSlot.employeeId),
      branch: getBranchInfo(selectedSlot.branchId),
    });
  };

  const formatPrice = (value: unknown) => {
    const num = typeof value === "number" ? value : Number(value ?? 0);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num);
  };

  const formatDuration = (value?: string | number) => {
    const n = typeof value === "string" ? parseInt(value) : value ?? 0;
    return `${n} min`;
  };

  const renderTimeSlots = (dateInfo: any) => {
    if (dateInfo.time_slots.length === 0) return null;

    return (
      <Card key={dateInfo.date}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base capitalize flex items-center gap-2">
            {dateInfo.label && (
              <Badge variant="outline" className="text-xs">
                {dateInfo.label}
              </Badge>
            )}
            {dateInfo.formattedDate}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {dateInfo.time_slots.map((slot: TimeSlot) => {
              const isSelected =
                selectedSlot?.date === dateInfo.date &&
                selectedSlot?.time === slot.time;

              return (
                <Button
                  key={slot.time}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  style={
                    isSelected && brandColor
                      ? {
                          backgroundColor: brandColor,
                          borderColor: brandColor,
                        }
                      : undefined
                  }
                  onClick={() =>
                    handleSlotSelect(dateInfo.date, slot, dateInfo.branch_id)
                  }
                >
                  {slot.time}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header com informações do serviço */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="shrink-0 mt-1"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>

        <div className="flex items-start gap-3 flex-1">
          <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted shrink-0">
            {(service as any)?.design?.images?.profile?.url ? (
              <Image
                src={(service as any).design.images.profile.url}
                alt={service.name || "Imagem do serviço"}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            ) : (
              <Image
                src="/placeholder.svg"
                alt="Imagem não disponível"
                width={48}
                height={48}
                className="object-cover w-full h-full opacity-80"
              />
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold">{service.name}</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(service.duration)}
              </span>
              {service.price && (
                <span className="flex items-center gap-1">
                  <span>💰</span>
                  {formatPrice(service.price)}
                </span>
              )}
            </div>
            {service.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {service.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filtros */}
        <div className="space-y-4">
          <h3 className="font-medium">Filtros</h3>

          {/* Seleção de Filial */}
          {branches.length > 1 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Local</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={!selectedBranch ? "default" : "outline"}
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => setSelectedBranch(null)}
                >
                  Todos os locais
                </Button>
                {branches.map(branch => (
                  <Button
                    key={branch.id}
                    variant={
                      selectedBranch === branch.id ? "default" : "outline"
                    }
                    size="sm"
                    className="w-full justify-start text-xs"
                    style={
                      selectedBranch === branch.id && brandColor
                        ? {
                            backgroundColor: brandColor,
                            borderColor: brandColor,
                          }
                        : undefined
                    }
                    onClick={() => setSelectedBranch(branch.id)}
                  >
                    <MapPin className="w-3 h-3 mr-1" />
                    {branch.name}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Seleção de Funcionário */}
          {employees.length > 1 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Profissional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={!selectedEmployee ? "default" : "outline"}
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => setSelectedEmployee(null)}
                >
                  Qualquer profissional
                </Button>
                {employees.map(employee => (
                  <Button
                    key={employee.id}
                    variant={
                      selectedEmployee === employee.id ? "default" : "outline"
                    }
                    size="sm"
                    className="w-full justify-start text-xs"
                    style={
                      selectedEmployee === employee.id && brandColor
                        ? {
                            backgroundColor: brandColor,
                            borderColor: brandColor,
                          }
                        : undefined
                    }
                    onClick={() => setSelectedEmployee(employee.id)}
                  >
                    <User className="w-3 h-3 mr-1" />
                    {employee.name} {employee.surname}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Resumo da seleção */}
          {selectedSlot && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Agendamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {new Intl.DateTimeFormat("pt-BR", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      }).format(new Date(selectedSlot.date))}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedSlot.time}</span>
                  </div>

                  {(() => {
                    const employee = getEmployeeInfo(selectedSlot.employeeId);
                    return employee ? (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs">
                          {employee.name} {employee.surname}
                        </span>
                      </div>
                    ) : null;
                  })()}

                  {(() => {
                    const branch = getBranchInfo(selectedSlot.branchId);
                    return branch ? (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs">{branch.name}</span>
                      </div>
                    ) : null;
                  })()}
                </div>

                <Button
                  className="w-full"
                  size="sm"
                  style={
                    brandColor
                      ? {
                          backgroundColor: brandColor,
                          borderColor: brandColor,
                        }
                      : undefined
                  }
                  onClick={handleConfirmAppointment}
                >
                  Confirmar
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Horários disponíveis */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="font-medium">Horários disponíveis</h3>

          {loading && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-6 gap-2">
                      {Array.from({ length: 12 }).map((_, j) => (
                        <div key={j} className="h-8 bg-muted rounded"></div>
                      ))}
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
              {filteredSlots.today.map(renderTimeSlots)}
              {filteredSlots.tomorrow.map(renderTimeSlots)}

              {/* Mais dias */}
              {filteredSlots.others.length > 0 && (
                <>
                  <div className="flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (showMoreDates) {
                          setShowMoreDates(false);
                        } else {
                          setDaysToLoad(30); // Carregar mais 30 dias
                          setShowMoreDates(true);
                        }
                      }}
                      className="gap-2"
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

                  {showMoreDates && (
                    <div className="space-y-4">
                      {filteredSlots.others.map(renderTimeSlots)}
                    </div>
                  )}
                </>
              )}

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
