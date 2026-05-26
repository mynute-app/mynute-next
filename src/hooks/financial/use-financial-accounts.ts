"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createFinancialAccount,
  deleteFinancialAccount,
  fetchFinancialAccounts,
} from "./use-financial-api";
import type {
  CreateFinancialAccountPayload,
  FinancialAccount,
} from "@/types/financial";

export function useFinancialAccounts(params?: Record<string, string | number | boolean | undefined>) {
  const [data, setData] = useState<FinancialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paramsKey = JSON.stringify(params ?? null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFinancialAccounts(params);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao buscar contas");
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

export function useCreateFinancialAccount() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (payload: CreateFinancialAccountPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      return await createFinancialAccount(payload);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao criar conta";
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useDeleteFinancialAccount() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteFinancialAccount(id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao excluir conta";
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}
