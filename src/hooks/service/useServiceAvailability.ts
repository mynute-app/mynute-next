"use client";

import { useState, useEffect } from "react";

export interface ServiceAvailabilityParams {
  serviceId: string;
  companyId: string;
  timezone: string;
  dateForwardStart: number;
  dateForwardEnd: number;
}

export interface ServiceAvailability {
  // Ajustar esta interface baseada na resposta real da API
  [key: string]: any;
}

export const useServiceAvailability = () => {
  const [availability, setAvailability] = useState<ServiceAvailability | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = async (params: ServiceAvailabilityParams) => {
    try {
      setLoading(true);
      setError(null);

      const {
        serviceId,
        companyId,
        timezone,
        dateForwardStart,
        dateForwardEnd,
      } = params;

      const queryParams = new URLSearchParams({
        timezone,
        date_forward_start: dateForwardStart.toString(),
        date_forward_end: dateForwardEnd.toString(),
      });

      const url = `/api/service/${serviceId}/availability?${queryParams.toString()}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Company-ID": companyId,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage =
          errorData?.message || errorData?.error || `Erro HTTP: ${res.status}`;
        throw new Error(errorMessage);
      }

      const data: ServiceAvailability = await res.json();
      setAvailability(data);
      return data;
    } catch (e) {
      const errorMessage =
        e instanceof Error
          ? e.message
          : "Erro desconhecido ao buscar disponibilidade";
      setError(errorMessage);
      setAvailability(null);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAvailability(null);
    setError(null);
    setLoading(false);
  };

  return {
    availability,
    loading,
    error,
    fetchAvailability,
    reset,
  };
};

// Hook alternativo para busca automática com parâmetros
export const useServiceAvailabilityAuto = (
  params: ServiceAvailabilityParams | null,
  enabled: boolean = true
) => {
  const [availability, setAvailability] = useState<ServiceAvailability | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = async (fetchParams: ServiceAvailabilityParams) => {
    try {
      setLoading(true);
      setError(null);

      const {
        serviceId,
        companyId,
        timezone,
        dateForwardStart,
        dateForwardEnd,
      } = fetchParams;

      const queryParams = new URLSearchParams({
        timezone,
        date_forward_start: dateForwardStart.toString(),
        date_forward_end: dateForwardEnd.toString(),
      });

      const url = `/api/service/${serviceId}/availability?${queryParams.toString()}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Company-ID": companyId,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage =
          errorData?.message || errorData?.error || `Erro HTTP: ${res.status}`;
        throw new Error(errorMessage);
      }

      const data: ServiceAvailability = await res.json();
      setAvailability(data);
    } catch (e) {
      const errorMessage =
        e instanceof Error
          ? e.message
          : "Erro desconhecido ao buscar disponibilidade";
      setError(errorMessage);
      setAvailability(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params && enabled) {
      fetchAvailability(params);
    }
  }, [params, enabled]);

  const refetch = () => {
    if (params) {
      fetchAvailability(params);
    }
  };

  const reset = () => {
    setAvailability(null);
    setError(null);
    setLoading(false);
  };

  return {
    availability,
    loading,
    error,
    refetch,
    reset,
  };
};
