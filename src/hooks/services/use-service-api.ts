import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { fetchWithCache } from "@/lib/cache/client-request-cache";
import type { Service, ServiceListResponse } from "../../../types/company";

const parseErrorMessage = async (res: Response, fallback: string) => {
  const text = await res.text();
  if (!text) return fallback;
  try {
    const data = JSON.parse(text);
    if (typeof data?.message === "string") return data.message;
    if (typeof data?.error === "string") return data.error;
  } catch {
    return text;
  }
  return fallback;
};

const normalizeService = (s: Service): Service => ({
  ...s,
  is_active:
    typeof s.is_active === "boolean"
      ? s.is_active
      : typeof s.hidden === "boolean"
        ? !s.hidden
        : undefined,
});

export function useServiceApi() {
  const fetchServices = useCallback(
    async (
      page = 1,
      pageSize = 50,
      force = false,
    ): Promise<ServiceListResponse | null> => {
      try {
        const cacheKey = `services:${page}:${pageSize}`;
        const result = await fetchWithCache(
          cacheKey,
          async () => {
            const queryParams = new URLSearchParams({
              page: page.toString(),
              page_size: pageSize.toString(),
            });

            const res = await fetch(`/api/service?${queryParams.toString()}`);

            if (!res.ok) {
              const message = await parseErrorMessage(
                res,
                "Erro ao buscar serviços",
              );
              throw new Error(message);
            }

            return res.json();
          },
          { ttlMs: 30 * 1000, force },
        );

        return {
          ...result,
          services: Array.isArray(result.services)
            ? result.services.map((s: Service) => normalizeService(s))
            : [],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erro ao buscar serviços";
        toast({
          title: "Erro",
          description: message,
          variant: "destructive",
        });
        return null;
      }
    },
    [],
  );

  return { fetchServices };
}
