"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import type { AdminCompany } from "@/types/system-admin-company";

export function useAdminCompany(id: string | null) {
  const [data, setData] = useState<AdminCompany | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { data: session, status } = useSession();

  const fetchCompany = useCallback(async () => {
    if (!id || !session?.accessToken) return null;

    setIsLoading(true);
    setHasFetched(false);
    setError(null);

    try {
      const response = await fetch(`/api/system-admin/companies/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Sessão expirada. Faça login novamente.");
        if (response.status === 404) throw new Error("Empresa não encontrada.");
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || "Erro ao buscar empresa");
      }

      const responseData: AdminCompany = await response.json();
      setData(responseData);
      return responseData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toast({
        title: "Erro ao buscar empresa",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, [id, toast, session?.accessToken]);

  useEffect(() => {
    if (!id) return;
    if (status === "loading") {
      setIsLoading(true);
      return;
    }
    if (status === "unauthenticated") {
      setIsLoading(false);
      setHasFetched(true);
      return;
    }
    fetchCompany();
  }, [id, status, fetchCompany]);

  return {
    company: data,
    isLoading: isLoading || status === "loading",
    hasFetched,
    error,
    refetch: fetchCompany,
  };
}
