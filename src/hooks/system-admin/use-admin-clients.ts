"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import type { AdminClientListResponse } from "@/types/system-admin-client";

interface UseAdminClientsProps {
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

export function useAdminClients({
  page = 1,
  pageSize = 10,
  enabled = true,
}: UseAdminClientsProps = {}) {
  const [data, setData] = useState<AdminClientListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { data: session, status } = useSession();

  const fetchClients = useCallback(async () => {
    if (!session?.accessToken) return null;

    setIsLoading(true);
    setHasFetched(false);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      const response = await fetch(`/api/system-admin/clients?${queryParams}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sessão expirada. Faça login novamente.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || "Erro ao buscar clientes");
      }

      const responseData: AdminClientListResponse = await response.json();
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
    if (!enabled) return;
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
    clients: data?.clients || [],
    total: data?.total || 0,
    currentPage: data?.page || page,
    pageSize: data?.page_size || pageSize,
    isLoading: isLoading || status === "loading",
    hasFetched,
    error,
    refetch: fetchClients,
  };
}
