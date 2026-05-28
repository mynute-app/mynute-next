"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { CompanySupplier } from "@/types/company-supplier";

interface UseCompanySupplierDetailsProps {
  supplierId: string;
  enabled?: boolean;
}

export function useCompanySupplierDetails({
  supplierId,
  enabled = true,
}: UseCompanySupplierDetailsProps) {
  const [supplier, setSupplier] = useState<CompanySupplier | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSupplier = useCallback(async () => {
    if (!supplierId) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/company-supplier/${supplierId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao buscar fornecedor");
      }

      const data: CompanySupplier = await response.json();
      setSupplier(data);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toast({
        title: "Erro ao buscar fornecedor",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supplierId, toast]);

  useEffect(() => {
    if (enabled && supplierId) {
      fetchSupplier();
    }
  }, [fetchSupplier, supplierId, enabled]);

  return {
    supplier,
    isLoading,
    error,
    refetch: fetchSupplier,
  };
}
