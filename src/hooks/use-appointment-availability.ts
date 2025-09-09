"use client";

import { useState, useMemo } from "react";
import { useServiceAvailabilityAuto } from "@/hooks/service/useServiceAvailability";
import { useCompanyByName } from "@/hooks/use-company-by-name";
import type { Service } from "../../types/company";
import type {
  AvailableDate,
  TimeSlot,
} from "@/hooks/service/useServiceAvailability";

interface UseAppointmentAvailabilityProps {
  service: Service;
}

export function useAppointmentAvailability({
  service,
}: UseAppointmentAvailabilityProps) {
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

  // Organizar dados por data com lógica corrigida
  const organizedDates = useMemo(() => {
    if (!availability?.available_dates)
      return { today: [], tomorrow: [], others: [] };

    // Garantir que estamos usando UTC para evitar problemas de timezone
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
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
      }).format(new Date(dateInfo.date + "T00:00:00")),
    });

    return {
      today: todayData ? [formatDateInfo(todayData, "Hoje")] : [],
      tomorrow: tomorrowData ? [formatDateInfo(tomorrowData, "Amanhã")] : [],
      others: othersData.map(d => formatDateInfo(d)),
    };
  }, [availability?.available_dates]);

  // Filtrar horários por filial e funcionário
  const getFilteredSlots = (
    selectedBranch: string | null,
    selectedEmployee: string | null
  ) => {
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
  };

  const loadMoreDays = () => {
    setDaysToLoad(30); // Carregar próximos 30 dias
  };

  const resetToInitialDays = () => {
    setDaysToLoad(2); // Voltar para hoje e amanhã
  };

  return {
    availability,
    loading,
    error,
    organizedDates,
    getFilteredSlots,
    loadMoreDays,
    resetToInitialDays,
    hasMoreDays: daysToLoad <= 2,
  };
}
