"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, User, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EmployeeInfo } from "../types";

interface EmployeeSelectionStepProps {
  employees: EmployeeInfo[];
  selectedDate: string;
  selectedTime: string;
  selectedBranchId?: string | null;
  availableEmployeeIds: string[];
  onEmployeeSelect: (employeeId: string) => void;
  onBack: () => void;
  brandColor?: string;
}

export function EmployeeSelectionStep({
  employees,
  selectedDate,
  selectedTime,
  selectedBranchId,
  availableEmployeeIds,
  onEmployeeSelect,
  onBack,
  brandColor,
}: EmployeeSelectionStepProps) {
  const availableEmployees = employees.filter(emp =>
    availableEmployeeIds.includes(emp.id),
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0 h-8 w-8 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <header>
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            Escolha o profissional
          </h1>
          <p className="text-sm text-muted-foreground">
            {selectedDate && selectedTime
              ? `${selectedDate} Ã s ${selectedTime}`
              : "Selecione quem irÃ¡ atender vocÃª"}
          </p>
        </header>
      </div>

      {/* Lista de funcionÃ¡rios */}
      <div className="space-y-2">
        {availableEmployees.map(employee => (
          <button
            key={employee.id}
            type="button"
            onClick={() => onEmployeeSelect(employee.id)}
            className={cn(
              "group w-full flex items-center gap-4 p-4 rounded-xl text-left",
              "bg-card border border-border",
              "transition-all duration-200 ease-out hover:-translate-y-0.5",
              "shadow-[0_1px_3px_0_hsl(215_25%_15%/0.07)] hover:shadow-[0_6px_16px_-4px_hsl(215_25%_15%/0.12)]",
              "active:scale-[0.98]",
            )}
          >
            <Avatar className="w-12 h-12 shrink-0 ring-2 ring-border group-hover:ring-primary/30 transition-colors">
              <AvatarImage
                src={employee.meta?.design?.images?.profile?.url}
                alt={`${employee.name} ${employee.surname}`}
                className="object-cover"
              />
              <AvatarFallback
                className="text-sm font-semibold"
                style={
                  brandColor
                    ? { backgroundColor: `${brandColor}18`, color: brandColor }
                    : undefined
                }
              >
                {employee.name.charAt(0)}
                {employee.surname?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base text-foreground group-hover:text-primary transition-colors truncate">
                {employee.name} {employee.surname}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                DisponÃ­vel
              </p>
            </div>

            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </button>
        ))}

        {availableEmployees.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 text-center rounded-xl border border-border bg-card">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">
              Nenhum profissional disponÃ­vel
            </p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Tente selecionar outro horÃ¡rio
              {selectedBranchId ? " ou local" : ""}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
