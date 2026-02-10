"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { BranchAppointmentsResponse } from "../../../types/appointment";

interface UseCompanyClientAppointmentsProps {
  clientId: string;
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  cancelled?: boolean;
  timezone?: string;
  enabled?: boolean;
}

export function useCompanyClientAppointments({
  clientId,
  page = 1,
  pageSize = 10,
  startDate,
  endDate,
  cancelled,
  timezone = "America/Sao_Paulo",
  enabled = true,
}: UseCompanyClientAppointmentsProps) {
  const [data, setData] = useState<BranchAppointmentsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAppointments = async () => {
    if (!clientId) {
      setError("Client ID é obrigatório");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        timezone,
      });

      if (startDate) queryParams.append("start_date", startDate);
      if (endDate) queryParams.append("end_date", endDate);
      if (cancelled !== undefined)
        queryParams.append("cancelled", cancelled.toString());

      const response = await fetch(
        `/api/company-client/${clientId}/appointments?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erro ao buscar agendamentos do cliente",
        );
      }

      const responseData: BranchAppointmentsResponse = await response.json();
      if (process.env.NODE_ENV !== "production") setData(responseData);
      return responseData;
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

  useEffect(() => {
    if (enabled && clientId) {
      fetchAppointments();
    }
  }, [
    clientId,
    page,
    pageSize,
    startDate,
    endDate,
    cancelled,
    timezone,
    enabled,
  ]);

  return {
    data,
    appointments: data?.appointments || [],
    clientInfo: data?.client_info || [],
    serviceInfo: data?.service_info || [],
    employeeInfo: data?.employee_info || [],
    totalCount: data?.total_count || 0,
    currentPage: data?.page || page,
    pageSize: data?.page_size || pageSize,
    isLoading,
    error,
    refetch: fetchAppointments,
  };
}
