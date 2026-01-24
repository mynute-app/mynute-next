"use client";

import { useState, useEffect } from "react";
import { decodeJWTToken } from "@/utils/decode-jwt";
import { fetchWithCache } from "@/lib/cache/client-request-cache";

export interface ServiceAvailabilityParams {
  serviceId: string;
  companyId: string;
  timezone: string;
  dateForwardStart: number;
  dateForwardEnd: number;
}

export interface TimeSlot {
  time: string;
  employees: string[];
  occupied_by_client?: boolean; // Indica se este horário está ocupado pelo cliente logado
}

export interface AvailableDate {
  date: string;
  branch_id: string;
  time_slots: TimeSlot[];
}

export interface DesignColors {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
}

export interface DesignImage {
  alt: string;
  title: string;
  caption: string;
  url: string;
}

export interface DesignImages {
  profile: DesignImage;
  logo: DesignImage;
  banner: DesignImage;
  background: DesignImage;
  favicon: DesignImage;
}

export interface Design {
  colors: DesignColors;
  images: DesignImages;
}

export interface EmployeeInfo {
  id: string;
  company_id: string;
  name: string;
  surname: string;
  time_zone: string;
  total_service_density: number;
  design: Design;
}

export interface BranchInfo {
  id: string;
  company_id: string;
  name: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  zip_code: string;
  city: string;
  state: string;
  country: string;
  time_zone: string;
  total_service_density: number;
  design: Design;
}

export interface ServiceAvailability {
  service_id: string;
  available_dates: AvailableDate[];
  employee_info: EmployeeInfo[];
  branch_info: BranchInfo[];
}

export const useServiceAvailability = () => {
  const [availability, setAvailability] = useState<ServiceAvailability | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = async (
    params: ServiceAvailabilityParams,
    options?: { force?: boolean }
  ) => {
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

      // Tentar pegar client_id do token, se existir
      const clientToken = localStorage.getItem("client_token");
      if (clientToken) {
        const userData = decodeJWTToken(clientToken);
        if (userData?.id) {
          queryParams.append("client_id", userData.id);
        }
      }

      const url = `/api/service/${serviceId}/availability?${queryParams.toString()}`;
      const cacheKey = `service-availability:${serviceId}:${companyId}:${queryParams.toString()}`;
      const data = await fetchWithCache(
        cacheKey,
        async () => {
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
              errorData?.message ||
              errorData?.error ||
              `Erro HTTP: ${res.status}`;
            throw new Error(errorMessage);
          }

          return (await res.json()) as ServiceAvailability;
        },
        { ttlMs: 15 * 1000, force: options?.force }
      );
      const normalized: ServiceAvailability = {
        ...data,
        available_dates: Array.isArray(data.available_dates)
          ? data.available_dates
          : [],
        employee_info: Array.isArray(data.employee_info)
          ? data.employee_info
          : [],
        branch_info: Array.isArray(data.branch_info) ? data.branch_info : [],
      };
      setAvailability(normalized);
      return normalized;
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
  enabled: boolean = true,
) => {
  const [availability, setAvailability] = useState<ServiceAvailability | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = async (
    fetchParams: ServiceAvailabilityParams,
    options?: { force?: boolean }
  ) => {
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
      const cacheKey = `service-availability:${serviceId}:${companyId}:${queryParams.toString()}`;
      const data = await fetchWithCache(
        cacheKey,
        async () => {
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
              errorData?.message ||
              errorData?.error ||
              `Erro HTTP: ${res.status}`;
            throw new Error(errorMessage);
          }

          return (await res.json()) as ServiceAvailability;
        },
        { ttlMs: 15 * 1000, force: options?.force }
      );
      const normalized: ServiceAvailability = {
        ...data,
        available_dates: Array.isArray(data.available_dates)
          ? data.available_dates
          : [],
        employee_info: Array.isArray(data.employee_info)
          ? data.employee_info
          : [],
        branch_info: Array.isArray(data.branch_info) ? data.branch_info : [],
      };
      setAvailability(normalized);
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
      fetchAvailability(params, { force: true });
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
