"use client";

import { useCallback, useEffect, useState } from "react";
import {
  cancelFinancialTransaction,
  createFinancialTransaction,
  fetchFinancialTransactions,
  payFinancialTransaction,
} from "./use-financial-api";
import type {
  CreateFinancialTransactionPayload,
  FinancialTransaction,
  PayFinancialTransactionPayload,
} from "@/types/financial";

export function useFinancialTransactions(params?: Record<string, string | number | boolean | undefined>) {
  const [data, setData] = useState<FinancialTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Serialize params to a stable string to avoid re-creating refetch when a new
  // object with the same values is passed on every render (infinite loop guard).
  const paramsKey = JSON.stringify(params ?? null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFinancialTransactions(params);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao buscar transações");
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

export function useCreateFinancialTransaction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (payload: CreateFinancialTransactionPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      return await createFinancialTransaction(payload);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao criar transação";
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function usePayFinancialTransaction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (id: string, payload: PayFinancialTransactionPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      return await payFinancialTransaction(id, payload);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao registrar pagamento";
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useCancelFinancialTransaction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await cancelFinancialTransaction(id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao cancelar transação";
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}
