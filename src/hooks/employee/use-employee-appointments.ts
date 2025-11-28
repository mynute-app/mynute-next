"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { BranchAppointmentsResponse } from "../../../types/appointment";

interface UseEmployeeAppointmentsProps {
  employeeId: string;
  page?: number;
  pageSize?: number;
  startDate?: string; // Formato: DD/MM/YYYY
  endDate?: string; // Formato: DD/MM/YYYY
  cancelled?: boolean;
  branchId?: string;
  serviceId?: string;
  enabled?: boolean;
}

/**
 * Hook para buscar agendamentos de um funcionário com paginação e filtros
 *
 * @example
 * ```tsx
 * const { appointments, totalCount, isLoading, refetch } = useEmployeeAppointments({
 *   employeeId: '6850b078-b7ce-468d-9606-95ba54fd27d0',
 *   page: 1,
 *   pageSize: 10,
 *   serviceId: 'service-id-optional'
 * });
 * ```
 */
export function useEmployeeAppointments({
  employeeId,
  page = 1,
  pageSize = 10,
  startDate,
  endDate,
  cancelled,
  branchId,
  serviceId,
  enabled = true,
}: UseEmployeeAppointmentsProps) {
  const [data, setData] = useState<BranchAppointmentsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAppointments = async () => {
    if (!employeeId) {
      setError("Employee ID é obrigatório");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        timezone: "America/Sao_Paulo",
      });

      // Adicionar parâmetros opcionais apenas se fornecidos
      if (startDate) queryParams.append("start_date", startDate);
      if (endDate) queryParams.append("end_date", endDate);
      if (cancelled !== undefined)
        queryParams.append("cancelled", cancelled.toString());
      if (branchId) queryParams.append("branch_id", branchId);
      if (serviceId) queryParams.append("service_id", serviceId);

      const response = await fetch(
        `/api/employee/${employeeId}/appointments?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erro ao buscar agendamentos do funcionário"
        );
      }

      const appointmentsData: BranchAppointmentsResponse =
        await response.json();
      setData(appointmentsData);
      return appointmentsData;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toast({
        title: "Erro ao buscar agendamentos",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Busca automática quando o hook é montado (se enabled === true)
  useEffect(() => {
    if (enabled && employeeId) {
      fetchAppointments();
    }
  }, [
    employeeId,
    page,
    pageSize,
    startDate,
    endDate,
    cancelled,
    branchId,
    serviceId,
    enabled,
  ]);

  return {
    data,
    appointments: data?.appointments || [],
    totalCount: data?.total_count || 0,
    currentPage: data?.page || page,
    pageSize: data?.page_size || pageSize,
    isLoading,
    error,
    refetch: fetchAppointments,
  };
}
