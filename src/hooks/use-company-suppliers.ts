"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import type { CompanySupplierListResponse } from "@/types/company-supplier";

interface UseCompanySuppliersProps {
  page?: number;
  pageSize?: number;
  search?: string;
  enabled?: boolean;
}

export function useCompanySuppliers({
  page = 1,
  pageSize = 10,
  search = "",
  enabled = true,
}: UseCompanySuppliersProps = {}) {
  const [data, setData] = useState<CompanySupplierListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSuppliers = useCallback(async () => {
    if (!session?.accessToken) {
      return null;
    }

    // Abort any in-flight request before starting a new one
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setHasFetched(false);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (search) queryParams.set("search", search);

      const response = await fetch(
        `/api/company-supplier?${queryParams.toString()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.error ||
            errorData?.message ||
            "Erro ao buscar fornecedores"
        );
      }

      const responseData: CompanySupplierListResponse = await response.json();
      setData(responseData);
      return responseData;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return null;
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toast({
        title: "Erro ao buscar fornecedores",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, [page, pageSize, search, toast, session?.accessToken]);

  useEffect(() => {
    if (!enabled) return;

    if (status === "loading") {
      setIsLoading(true);
      return;
    }

    if (status === "unauthenticated") {
      setIsLoading(false);
      setHasFetched(true);
      return;
    }

    fetchSuppliers();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [enabled, status, fetchSuppliers]);

  return {
    data,
    suppliers: data?.company_suppliers || [],
    total: data?.total || 0,
    currentPage: data?.page || page,
    pageSize: data?.page_size || pageSize,
    isLoading: isLoading || status === "loading",
    hasFetched,
    error,
    refetch: fetchSuppliers,
  };
}
