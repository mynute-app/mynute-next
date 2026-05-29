"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { FinancialTransaction } from "@/types/financial";

interface UseCompanySupplierTransactionsProps {
  supplierId: string;
  enabled?: boolean;
}

export function useCompanySupplierTransactions({
  supplierId,
  enabled = true,
}: UseCompanySupplierTransactionsProps) {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!supplierId) return;

    // Abort any in-flight request before starting a new one
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/financial/transactions?supplier_id=${supplierId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erro ao buscar transações do fornecedor"
        );
      }

      const data: FinancialTransaction[] = await response.json();
      setTransactions(data);
      return data;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toast({
        title: "Erro ao buscar transações",
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
      fetchTransactions();
    }
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchTransactions, supplierId, enabled]);

  return {
    transactions,
    isLoading,
    error,
    refetch: fetchTransactions,
  };
}
