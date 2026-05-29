"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import type { AdminAdminListResponse } from "@/types/system-admin-admin";

interface UseAdminAdminsProps {
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

export function useAdminAdmins({
  page = 1,
  pageSize = 10,
  enabled = true,
}: UseAdminAdminsProps = {}) {
  const [data, setData] = useState<AdminAdminListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { data: session, status } = useSession();

  const fetchAdmins = useCallback(async () => {
    if (!session?.accessToken) return null;

    setIsLoading(true);
    setHasFetched(false);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      const response = await fetch(
        `/api/system-admin/admins?${queryParams}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sessão expirada. Faça login novamente.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || "Erro ao buscar administradores");
      }

      const responseData: AdminAdminListResponse = await response.json();
      setData(responseData);
      return responseData;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toast({
        title: "Erro ao buscar administradores",
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
    fetchAdmins();
  }, [enabled, status, fetchAdmins]);

  return {
    data,
    admins: data?.admins || [],
    total: data?.total || 0,
    currentPage: data?.page || page,
    pageSize: data?.page_size || pageSize,
    isLoading: isLoading || status === "loading",
    hasFetched,
    error,
    refetch: fetchAdmins,
  };
}
