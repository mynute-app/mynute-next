"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CalendarFiltersProps {
  onFiltersChange: (filters: CalendarFilters) => void;
  employees?: Array<{ id: string; name: string }>;
  services?: Array<{ id: string; name: string }>;
  isLoadingEmployees?: boolean;
  isLoadingServices?: boolean;
}

export interface CalendarFilters {
  employeeId: string | null;
  serviceId: string | null;
}

export function CalendarFiltersDrawer({
  onFiltersChange,
  employees = [],
  services = [],
  isLoadingEmployees = false,
  isLoadingServices = false,
}: CalendarFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const handleApplyFilters = () => {
    onFiltersChange({
      employeeId: selectedEmployee,
      serviceId: selectedService,
    });
    setIsOpen(false);
  };

  const hasActiveFilters =
    selectedEmployee !== null || selectedService !== null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {[selectedEmployee, selectedService].filter(Boolean).length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Filtros do Calendário</SheetTitle>
          <SheetDescription>
            Filtre os agendamentos por funcionário ou serviço
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Filtro de Funcionário */}
          <div className="space-y-2">
            <Label htmlFor="employee-filter">Funcionário</Label>
            <Select
              value={selectedEmployee || "all"}
              onValueChange={value =>
                setSelectedEmployee(value === "all" ? null : value)
              }
              disabled={isLoadingEmployees}
            >
              <SelectTrigger id="employee-filter">
                <SelectValue placeholder="Todos os funcionários" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os funcionários</SelectItem>
                {isLoadingEmployees ? (
                  <SelectItem value="loading" disabled>
                    Carregando...
                  </SelectItem>
                ) : employees.length > 0 ? (
                  employees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="empty" disabled>
                    Nenhum funcionário disponível
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Serviço */}
          <div className="space-y-2">
            <Label htmlFor="service-filter">Serviço</Label>
            <Select
              value={selectedService || "all"}
              onValueChange={value =>
                setSelectedService(value === "all" ? null : value)
              }
              disabled={isLoadingServices}
            >
              <SelectTrigger id="service-filter">
                <SelectValue placeholder="Todos os serviços" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os serviços</SelectItem>
                {isLoadingServices ? (
                  <SelectItem value="loading" disabled>
                    Carregando...
                  </SelectItem>
                ) : services.length > 0 ? (
                  services.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="empty" disabled>
                    Nenhum serviço disponível
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="flex flex-col gap-2">
          <Button onClick={handleApplyFilters} className="w-full">
            Aplicar Filtros
          </Button>
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              Cancelar
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
