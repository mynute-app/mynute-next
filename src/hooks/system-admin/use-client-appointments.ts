"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import type { AdminClientAppointmentsResponse } from "@/types/system-admin-client";

export function useClientAppointments(clientId: string | null) {
  const [data, setData] = useState<AdminClientAppointmentsResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { data: session } = useSession();

  const fetchAppointments = useCallback(async () => {
    if (!clientId || !session?.accessToken) return null;

    setIsLoading(true);
    setHasFetched(false);
    setError(null);

    try {
      const response = await fetch(
        `/api/system-admin/clients/${clientId}/appointments`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        if (response.status === 401)
          throw new Error("Sessão expirada. Faça login novamente.");
        if (response.status === 404) throw new Error("Cliente não encontrado.");
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || "Erro ao buscar agendamentos do cliente",
        );
      }

      const responseData: AdminClientAppointmentsResponse =
        await response.json();
      setData(responseData);
      return responseData;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toast({
        title: "Erro ao buscar agendamentos do cliente",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, [clientId, toast, session?.accessToken]);

  useEffect(() => {
    if (!clientId) {
      setData(null);
      setError(null);
      setHasFetched(false);
    } else {
      fetchAppointments();
    }
  }, [clientId, fetchAppointments]);

  return {
    data,
    companies: data?.companies || [],
    isLoading,
    hasFetched,
    error,
    refetch: fetchAppointments,
  };
}
