"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createFinancialCategory,
  fetchFinancialCategories,
} from "./use-financial-api";
import type {
  CreateFinancialCategoryPayload,
  FinancialCategory,
} from "@/types/financial";

export function useFinancialCategories(params?: Record<string, string | number | boolean | undefined>) {
  const [data, setData] = useState<FinancialCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paramsKey = JSON.stringify(params ?? null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFinancialCategories(params);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao buscar categorias");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

export function useCreateFinancialCategory() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (payload: CreateFinancialCategoryPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      return await createFinancialCategory(payload);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao criar categoria";
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}
