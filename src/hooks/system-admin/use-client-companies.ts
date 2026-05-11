"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import type { AdminClientCompaniesResponse } from "@/types/system-admin-client";

export function useClientCompanies(clientId: string | null) {
  const [data, setData] = useState<AdminClientCompaniesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { data: session, status } = useSession();

  const fetchCompanies = useCallback(async () => {
    if (!clientId || !session?.accessToken) return null;

    setIsLoading(true);
    setHasFetched(false);
    setError(null);

    try {
      const response = await fetch(
        `/api/system-admin/clients/${clientId}/companies`,
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
          errorData?.message || "Erro ao buscar empresas do cliente",
        );
      }

      const responseData: AdminClientCompaniesResponse = await response.json();
      setData(responseData);
      return responseData;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toast({
        title: "Erro ao buscar empresas do cliente",
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
      return;
    }
    if (status === "loading") {
      setIsLoading(true);
      return;
    }
    if (status === "unauthenticated") {
      setIsLoading(false);
      setHasFetched(true);
      return;
    }
    fetchCompanies();
  }, [clientId, status, fetchCompanies]);

  return {
    data,
    companies: data?.companies || [],
    clientEmail: data?.client_email || null,
    isLoading: isLoading || status === "loading",
    hasFetched,
    error,
    refetch: fetchCompanies,
  };
}
