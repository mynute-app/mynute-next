"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createFinancialBudget,
  fetchFinancialBudgets,
} from "./use-financial-api";
import type {
  CreateFinancialBudgetPayload,
  FinancialBudget,
} from "@/types/financial";

export function useFinancialBudgets() {
  const [data, setData] = useState<FinancialBudget[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFinancialBudgets();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao buscar budgets");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

export function useCreateFinancialBudget() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (payload: CreateFinancialBudgetPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      return await createFinancialBudget(payload);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao criar budget";
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}
