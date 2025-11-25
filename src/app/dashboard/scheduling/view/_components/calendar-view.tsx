"use client";

import React, { useState } from "react";
import { CalendarToolbar } from "./calendar-toolbar";
import { CalendarHeader } from "./calendar-header";
import { WeekView } from "./week-view";
import { MonthView } from "./month-view";
import { useBranchAppointments } from "@/hooks/branch/use-branch-appointments";
import { useGetCompany } from "@/hooks/get-company";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";

type ViewType = "week" | "month" | "day";

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>("week");
  const { company, loading: loadingCompany } = useGetCompany();
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    company?.branches?.[0]?.id?.toString() || ""
  );

  // Atualizar branchId quando a empresa carregar
  React.useEffect(() => {
    if (company?.branches?.[0]?.id && !selectedBranchId) {
      setSelectedBranchId(company.branches[0].id.toString());
    }
  }, [company, selectedBranchId]);

  // Calcular datas de início e fim da semana para filtro da API (apenas para visualização semanal)
  const getWeekDates = React.useMemo(() => {
    if (viewType !== "week") {
      return { startDate: undefined, endDate: undefined };
    }

    // Calcular o início da semana (domingo)
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Calcular o fim da semana (sábado)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Formatar para DD/MM/YYYY
    const formatDate = (date: Date) => {
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    return {
      startDate: formatDate(startOfWeek),
      endDate: formatDate(endOfWeek),
    };
  }, [currentDate, viewType]);

  const { appointments, isLoading, error } = useBranchAppointments({
    branchId: selectedBranchId,
    page: 1,
    pageSize: 100,
    startDate: getWeekDates.startDate,
    endDate: getWeekDates.endDate,
    enabled: !!selectedBranchId,
  });

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  const handleViewChange = (view: ViewType) => {
    setViewType(view);
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewType === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else if (viewType === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else if (viewType === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Log para debug
  React.useEffect(() => {
    if (viewType === "week" && getWeekDates.startDate) {
      console.log("📅 Semana atual - Filtros de data:");
      console.log("  Start Date:", getWeekDates.startDate);
      console.log("  End Date:", getWeekDates.endDate);
    }
  }, [getWeekDates, viewType]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Seletor de Filial */}
      <div className="border-b p-4">
        <div className="flex items-center gap-3 max-w-xs">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma filial" />
            </SelectTrigger>
            <SelectContent>
              {company?.branches?.map((branch: any) => (
                <SelectItem key={branch.id} value={branch.id.toString()}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <CalendarToolbar
        viewType={viewType}
        onViewChange={handleViewChange}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
      />

      <CalendarHeader currentDate={currentDate} viewType={viewType} />

      <div className="flex-1 overflow-hidden">
        {viewType === "week" && (
          <WeekView
            currentDate={currentDate}
            onDateChange={handleDateChange}
            appointments={appointments}
            isLoading={isLoading}
            services={company?.services || []}
          />
        )}
        {viewType === "month" && (
          <MonthView
            currentDate={currentDate}
            onDateChange={handleDateChange}
          />
        )}
      </div>
    </div>
  );
}
