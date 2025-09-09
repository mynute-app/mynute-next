"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Clock, MapPin, User } from "lucide-react";
import type { Service } from "../../../../types/company";
import type {
  BranchInfo,
  EmployeeInfo,
} from "@/hooks/service/useServiceAvailability";

interface SelectedSlot {
  date: string;
  time: string;
  branchId: string;
  employeeId: string;
}

interface AppointmentSummaryProps {
  service: Service;
  selectedSlot: SelectedSlot | null;
  branches: BranchInfo[];
  employees: EmployeeInfo[];
  brandColor?: string;
  onConfirm: () => void;
}

export function AppointmentSummary({
  service,
  selectedSlot,
  branches,
  employees,
  brandColor,
  onConfirm,
}: AppointmentSummaryProps) {
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

  const getEmployeeInfo = (employeeId: string): EmployeeInfo | undefined => {
    return employees.find(emp => emp.id === employeeId);
  };

  const getBranchInfo = (branchId: string): BranchInfo | undefined => {
    return branches.find(branch => branch.id === branchId);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Agendamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {selectedSlot ? (
          <>
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

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Serviço:</span>
                <span className="font-medium text-xs">{service.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Duração:</span>
                <span className="text-xs">
                  {formatDuration(service.duration)}
                </span>
              </div>
              {service.price && (
                <div className="flex justify-between">
                  <span>Valor:</span>
                  <span className="font-medium text-xs">
                    {formatPrice(service.price)}
                  </span>
                </div>
              )}
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
              onClick={onConfirm}
            >
              Confirmar
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Selecione um horário para ver o resumo
          </p>
        )}
      </CardContent>
    </Card>
  );
}
