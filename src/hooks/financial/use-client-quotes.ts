"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createClientQuote,
  fetchClientQuotes,
  updateClientQuoteStatus,
} from "./use-financial-api";
import type {
  ClientQuote,
  CreateClientQuotePayload,
} from "@/types/financial";

export function useClientQuotes(params?: Record<string, string | number | boolean | undefined>) {
  const [data, setData] = useState<ClientQuote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paramsKey = JSON.stringify(params ?? null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchClientQuotes(params);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao buscar orçamentos");
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

export function useCreateClientQuote() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (payload: CreateClientQuotePayload) => {
    setIsLoading(true);
    setError(null);
    try {
      return await createClientQuote(payload);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao criar orçamento";
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useUpdateClientQuoteStatus() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (id: string, status: string) => {
    setIsLoading(true);
    setError(null);
    try {
      return await updateClientQuoteStatus(id, status);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao atualizar status";
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}
