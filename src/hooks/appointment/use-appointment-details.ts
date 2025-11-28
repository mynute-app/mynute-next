"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface AppointmentDetails {
  id: string;
  service_id: string;
  employee_id: string;
  client_id: string;
  branch_id: string;
  company_id: string;
  payment_id: string;
  cancelled_employee_id: string;
  start_time: string;
  end_time: string;
  time_zone: string;
  rescheduled: boolean;
  cancelled: boolean;
  cancel_time: string;
  is_fulfilled: boolean;
  is_cancelled: boolean;
  is_cancelled_by_client: boolean;
  is_cancelled_by_employee: boolean;
  is_confirmed_by_client: boolean;
  history: {
    field_changes: any | null;
  };
  comments: string | null;
}

interface UseAppointmentDetailsProps {
  appointmentId: string | null;
  enabled?: boolean;
}

/**
 * Hook para buscar detalhes completos de um agendamento
 *
 * @example
 * ```tsx
 * const { appointment, isLoading, refetch } = useAppointmentDetails({
 *   appointmentId: '3f1c21cd-bd89-440f-b764-6bfc40a19a30',
 *   enabled: true
 * });
 * ```
 */
export function useAppointmentDetails({
  appointmentId,
  enabled = true,
}: UseAppointmentDetailsProps) {
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAppointmentDetails = async () => {
    if (!appointmentId) {
      setError("ID do agendamento é obrigatório");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/appointment/${appointmentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erro ao buscar detalhes do agendamento"
        );
      }

      const appointmentData: AppointmentDetails = await response.json();
      setAppointment(appointmentData);
      return appointmentData;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toast({
        title: "Erro ao buscar agendamento",
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
    if (enabled && appointmentId) {
      fetchAppointmentDetails();
    }
  }, [appointmentId, enabled]);

  return {
    appointment,
    isLoading,
    error,
    refetch: fetchAppointmentDetails,
  };
}
