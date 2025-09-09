"use client";

import { useMemo } from "react";
import { useServiceAvailabilityAuto } from "@/hooks/service/useServiceAvailability";
import { useCompanyByName } from "@/hooks/use-company-by-name";
import type { Service } from "../../types/company";
import type {
  AvailableDate,
  TimeSlot,
} from "@/hooks/service/useServiceAvailability";

interface UseAppointmentAvailabilityHybridProps {
  service: Service;
}

export function useAppointmentAvailabilityHybrid({
  service,
}: UseAppointmentAvailabilityHybridProps) {
  const { company } = useCompanyByName();

  // Parâmetros para buscar apenas hoje e amanhã
  const todayTomorrowParams = useMemo(() => {
    if (!service || !company) return null;

    return {
      serviceId: service.id,
      companyId: company.id,
      timezone: "America/Sao_Paulo",
      dateForwardStart: 0,
      dateForwardEnd: 2, // Sempre apenas hoje e amanhã
    };
  }, [service, company]);

  // Parâmetros para buscar todas as datas (para o calendário)
  const allDatesParams = useMemo(() => {
    if (!service || !company) return null;

    return {
      serviceId: service.id,
      companyId: company.id,
      timezone: "America/Sao_Paulo",
      dateForwardStart: 0,
      dateForwardEnd: 90, // 3 meses para o calendário
    };
  }, [service, company]);

  // Buscar hoje e amanhã
  const {
    availability: todayTomorrowAvailability,
    loading: todayTomorrowLoading,
    error: todayTomorrowError,
  } = useServiceAvailabilityAuto(todayTomorrowParams, !!todayTomorrowParams);

  // Buscar todas as datas (para calendário)
  const {
    availability: allDatesAvailability,
    loading: allDatesLoading,
    error: allDatesError,
  } = useServiceAvailabilityAuto(allDatesParams, !!allDatesParams);

  // Organizar dados de hoje e amanhã
  const organizedTodayTomorrow = useMemo(() => {
    if (!todayTomorrowAvailability?.available_dates)
      return { today: [], tomorrow: [] };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayStr = today.toISOString().split("T")[0];
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const todayData = todayTomorrowAvailability.available_dates.find(
      d => d.date === todayStr
    );
    const tomorrowData = todayTomorrowAvailability.available_dates.find(
      d => d.date === tomorrowStr
    );

    const formatDateInfo = (dateInfo: AvailableDate, label: string) => ({
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
    };
  }, [todayTomorrowAvailability?.available_dates]);

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
      today: organizedTodayTomorrow.today.map(filterSlots),
      tomorrow: organizedTodayTomorrow.tomorrow.map(filterSlots),
    };
  };

  return {
    // Dados para hoje e amanhã
    availability: todayTomorrowAvailability,
    loading: todayTomorrowLoading,
    error: todayTomorrowError,
    organizedTodayTomorrow,
    getFilteredSlots,

    // Dados completos para o calendário
    allDatesAvailability,
    allDatesLoading,
    allDatesError,
  };
}
