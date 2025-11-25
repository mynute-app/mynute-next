"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type {
  BranchAppointmentsResponse,
  BranchAppointmentsParams,
} from "../../../types/appointment";

interface UseBranchAppointmentsProps {
  branchId: string;
  page?: number;
  pageSize?: number;
  startDate?: string; // Formato: DD/MM/YYYY
  endDate?: string; // Formato: DD/MM/YYYY
  cancelled?: boolean;
  enabled?: boolean;
}

/**
 * Hook para buscar agendamentos de uma filial com paginação
 *
 * @example
 * ```tsx
 * const { appointments, totalCount, isLoading, refetch } = useBranchAppointments({
 *   branchId: '5e9002da-35ca-4df8-9ede-cb16eced6319',
 *   page: 1,
 *   pageSize: 10
 * });
 * ```
 */
export function useBranchAppointments({
  branchId,
  page = 1,
  pageSize = 10,
  startDate,
  endDate,
  cancelled,
  enabled = true,
}: UseBranchAppointmentsProps) {
  const [data, setData] = useState<BranchAppointmentsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAppointments = async () => {
    if (!branchId) {
      setError("Branch ID é obrigatório");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        timezone: "America/Sao_Paulo", // Timezone fixo por enquanto
      });

      // Adicionar parâmetros opcionais apenas se fornecidos
      if (startDate) queryParams.append("start_date", startDate);
      if (endDate) queryParams.append("end_date", endDate);
      if (cancelled !== undefined)
        queryParams.append("cancelled", cancelled.toString());

      const response = await fetch(
        `/api/branch/${branchId}/appointments?${queryParams.toString()}`,
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
          errorData.message || "Erro ao buscar agendamentos da filial"
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
    if (enabled && branchId) {
      fetchAppointments();
    }
  }, [branchId, page, pageSize, startDate, endDate, cancelled, enabled]);

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
