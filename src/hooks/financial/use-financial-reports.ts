"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchAppointmentsRevenueReport,
  fetchCashFlowReport,
  fetchDREReport,
  fetchPayablesReport,
  fetchReceivablesReport,
} from "./use-financial-api";
import type {
  AppointmentsRevenueReport,
  CashFlowReport,
  DREReport,
  PayablesReport,
  ReceivablesReport,
} from "@/types/financial";

function useReportData<T>(
  fetcher: (params?: Record<string, string | number | boolean | undefined>) => Promise<T>,
  params?: Record<string, string | number | boolean | undefined>,
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paramsKey = JSON.stringify(params ?? null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher(params);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao buscar relatório");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher, paramsKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

export function useCashFlowReport(params?: Record<string, string | number | boolean | undefined>) {
  return useReportData<CashFlowReport>(fetchCashFlowReport, params);
}

export function useDREReport(params?: Record<string, string | number | boolean | undefined>) {
  return useReportData<DREReport>(fetchDREReport, params);
}

export function useReceivablesReport(params?: Record<string, string | number | boolean | undefined>) {
  return useReportData<ReceivablesReport>(fetchReceivablesReport, params);
}

export function usePayablesReport(params?: Record<string, string | number | boolean | undefined>) {
  return useReportData<PayablesReport>(fetchPayablesReport, params);
}

export function useAppointmentsRevenueReport(params?: Record<string, string | number | boolean | undefined>) {
  return useReportData<AppointmentsRevenueReport>(fetchAppointmentsRevenueReport, params);
}
