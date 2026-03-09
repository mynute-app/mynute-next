"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import type { CompanyClientListResponse } from "@/types/company-client";

interface UseCompanyClientsProps {
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

export function useCompanyClients({
  page = 1,
  pageSize = 10,
  enabled = true,
}: UseCompanyClientsProps) {
  const [data, setData] = useState<CompanyClientListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { data: session, status } = useSession();

  const fetchClients = useCallback(async () => {
    if (!session?.accessToken) {
      return null;
    }
    setIsLoading(true);
    setHasFetched(false);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      const response = await fetch(
        `/api/company-client?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.error ||
            errorData?.message ||
            "Erro ao buscar clientes da empresa"
        );
      }

      const responseData: CompanyClientListResponse = await response.json();
      setData(responseData);
      return responseData;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toast({
        title: "Erro ao buscar clientes",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, [page, pageSize, toast, session?.accessToken]);

  useEffect(() => {
    if (!enabled) {
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

    fetchClients();
  }, [enabled, status, fetchClients]);

  return {
    data,
    clients: data?.company_clients || [],
    total: data?.total || 0,
    currentPage: data?.page || page,
    pageSize: data?.page_size || pageSize,
    isLoading: isLoading || status === "loading",
    hasFetched,
    error,
    refetch: fetchClients,
  };
}
