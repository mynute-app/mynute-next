"use client";

import { useState, useEffect, useMemo } from "react";
import { useServiceAvailabilityAuto } from "@/hooks/service/useServiceAvailability";
import { useCompanyByName } from "@/hooks/use-company-by-name";
import type { Service } from "../../types/company";

interface UseAppointmentAvailabilitySpecificDateProps {
  service: Service;
  selectedDate: Date | null;
  enabled?: boolean;
}

export function useAppointmentAvailabilitySpecificDate({
  service,
  selectedDate,
  enabled = true,
}: UseAppointmentAvailabilitySpecificDateProps) {
  const { company } = useCompanyByName();

  // Calcular quantos dias à frente a data selecionada está
  const daysForward = useMemo(() => {
    if (!selectedDate) return null;

    const today = new Date();
    const todayUTC = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const selectedUTC = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );

    const diffTime = selectedUTC.getTime() - todayUTC.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays); // Não pode ser negativo
  }, [selectedDate]);

  // Parâmetros para buscar a data específica
  const params = useMemo(() => {
    if (!service || !company || daysForward === null) return null;

    return {
      serviceId: service.id,
      companyId: company.id,
      timezone: "America/Sao_Paulo",
      dateForwardStart: daysForward,
      dateForwardEnd: daysForward + 1, // Buscar apenas essa data específica
    };
  }, [service, company, daysForward]);

  // Buscar disponibilidade para a data específica
  const { availability, loading, error, refetch } = useServiceAvailabilityAuto(
    params,
    enabled && !!params
  );

  // Processar dados da data específica
  const specificDateData = useMemo(() => {
    if (!availability?.available_dates || !selectedDate) return null;

    const dateString = selectedDate.toISOString().split("T")[0];
    const dateInfo = availability.available_dates.find(
      (d: any) => d.date === dateString
    );

    if (!dateInfo) return null;

    return {
      ...dateInfo,
      time_slots: [...dateInfo.time_slots].sort((a, b) =>
        a.time.localeCompare(b.time)
      ),
      formattedDate: new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(selectedDate),
    };
  }, [availability?.available_dates, selectedDate]);

  return {
    availability,
    loading,
    error,
    specificDateData,
    daysForward,
    refetch,
  };
}
