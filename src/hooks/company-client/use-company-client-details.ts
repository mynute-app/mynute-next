"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { CompanyClient } from "@/types/company-client";

interface UseCompanyClientDetailsProps {
  clientId: string;
  enabled?: boolean;
}

export function useCompanyClientDetails({
  clientId,
  enabled = true,
}: UseCompanyClientDetailsProps) {
  const [client, setClient] = useState<CompanyClient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchClient = async () => {
    if (!clientId) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/company-client/${clientId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao buscar cliente");
      }

      const data: CompanyClient = await response.json();
      setClient(data);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toast({
        title: "Erro ao buscar cliente",
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
      fetchClient();
    }
  }, [clientId, enabled]);

  return {
    client,
    isLoading,
    error,
    refetch: fetchClient,
  };
}
