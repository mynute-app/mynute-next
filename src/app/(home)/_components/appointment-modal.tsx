"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Clock, MapPin, User } from "lucide-react";
import { useServiceAvailabilityAuto } from "@/hooks/service/useServiceAvailability";
import { useCompanyByName } from "@/hooks/use-company-by-name";
import { AppointmentModalSkeleton } from "@/app/(home)/_components/appointment-modal-skeleton";
import type { Service } from "../../../../types/company";
import type {
  AvailableDate,
  TimeSlot,
  EmployeeInfo,
  BranchInfo,
} from "@/hooks/service/useServiceAvailability";
import Image from "next/image";

interface AppointmentModalProps {
  service: Service | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandColor?: string;
}

interface SelectedSlot {
  date: string;
  time: string;
  branchId: string;
  employeeId: string;
}

export function AppointmentModal({
  service,
  open,
  onOpenChange,
  brandColor,
}: AppointmentModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const { company } = useCompanyByName();

  const availabilityParams = useMemo(() => {
    if (!service || !company) return null;

    return {
      serviceId: service.id,
      companyId: company.id,
      timezone: "America/Sao_Paulo",
      dateForwardStart: 0,
      dateForwardEnd: 30, // Próximos 30 dias
    };
  }, [service, company]);

  const { availability, loading, error } = useServiceAvailabilityAuto(
    availabilityParams,
    open && !!availabilityParams
  );

  // Organizar dados por data
  const organizedDates = useMemo(() => {
    if (!availability?.available_dates) return [];

    return availability.available_dates.map(dateInfo => {
      // Ordenar horários
      const sortedSlots = [...dateInfo.time_slots].sort((a, b) =>
        a.time.localeCompare(b.time)
      );

      return {
        ...dateInfo,
        time_slots: sortedSlots,
        formattedDate: new Intl.DateTimeFormat("pt-BR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(new Date(dateInfo.date)),
      };
    });
  }, [availability?.available_dates]);

  // Função para obter informações do funcionário
  const getEmployeeInfo = (employeeId: string): EmployeeInfo | undefined => {
    return availability?.employee_info.find(emp => emp.id === employeeId);
  };

  // Função para obter informações da filial
  const getBranchInfo = (branchId: string): BranchInfo | undefined => {
    return availability?.branch_info.find(branch => branch.id === branchId);
  };

  const handleSlotSelect = (date: string, slot: TimeSlot, branchId: string) => {
    // Por simplicidade, pegamos o primeiro funcionário disponível
    const employeeId = slot.employees[0];

    setSelectedSlot({
      date,
      time: slot.time,
      branchId,
      employeeId,
    });
  };

  const handleConfirmAppointment = () => {
    if (!selectedSlot) return;

    // Aqui você implementaria a lógica para confirmar o agendamento
    console.log("Agendamento confirmado:", {
      service,
      slot: selectedSlot,
      employee: getEmployeeInfo(selectedSlot.employeeId),
      branch: getBranchInfo(selectedSlot.branchId),
    });

    // Fechar modal e resetar estado
    onOpenChange(false);
    setSelectedSlot(null);
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

  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-md overflow-hidden bg-muted shrink-0">
              {(service as any)?.design?.images?.profile?.url ? (
                <Image
                  src={(service as any).design.images.profile.url}
                  alt={service.name || "Imagem do serviço"}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Image
                  src="/placeholder.svg"
                  alt="Imagem não disponível"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full opacity-80"
                />
              )}
            </div>
            <div>
              <h3 className="font-semibold">{service.name}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {loading ? (
            <AppointmentModalSkeleton />
          ) : (
            <>
              {/* Lista de horários disponíveis */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="font-medium">Horários disponíveis</h4>

                {error && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-destructive">
                        Erro ao carregar horários: {error}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {!error && organizedDates.length === 0 && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <CalendarDays className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Nenhum horário disponível encontrado para este serviço.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {organizedDates.map(dateInfo => (
                  <Card key={dateInfo.date}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base capitalize">
                        {dateInfo.formattedDate}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {dateInfo.time_slots.map(slot => {
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
                                handleSlotSelect(
                                  dateInfo.date,
                                  slot,
                                  dateInfo.branch_id
                                )
                              }
                            >
                              {slot.time}
                            </Button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Resumo do agendamento */}
              <div className="space-y-4">
                <h4 className="font-medium">Resumo do agendamento</h4>

                <Card>
                  <CardContent className="p-4 space-y-4">
                    {selectedSlot ? (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <CalendarDays className="w-4 h-4 text-muted-foreground" />
                            <span>
                              {new Intl.DateTimeFormat("pt-BR", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }).format(new Date(selectedSlot.date))}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{selectedSlot.time}</span>
                          </div>

                          {(() => {
                            const employee = getEmployeeInfo(
                              selectedSlot.employeeId
                            );
                            return employee ? (
                              <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span>
                                  {employee.name} {employee.surname}
                                </span>
                              </div>
                            ) : null;
                          })()}

                          {(() => {
                            const branch = getBranchInfo(selectedSlot.branchId);
                            return branch ? (
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>{branch.name}</span>
                              </div>
                            ) : null;
                          })()}
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Serviço:</span>
                            <span className="font-medium">{service.name}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Duração:</span>
                            <span>{formatDuration(service.duration)}</span>
                          </div>
                          {service.price && (
                            <div className="flex justify-between text-sm">
                              <span>Valor:</span>
                              <span className="font-medium">
                                {formatPrice(service.price)}
                              </span>
                            </div>
                          )}
                        </div>

                        <Button
                          className="w-full"
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
                          Confirmar agendamento
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Selecione um horário para ver o resumo
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
