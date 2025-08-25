"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PublicCompany } from "../../types/public-company";

type Options = {
  // Optional explicit name. If omitted, derives from window.location.hostname
  name?: string;
  // Disable auto-fetch on mount
  disabled?: boolean;
};

function deriveNameFromHost(hostname: string): string | null {
  if (!hostname) return null;
  const host = hostname.split(":")[0];
  const firstLabel = host.split(".")[0];
  if (!firstLabel || firstLabel.toLowerCase() === "localhost") return null;
  return decodeURIComponent(firstLabel).replace(/-/g, " ");
}

export function useCompanyByName(opts: Options = {}) {
  const { name: providedName, disabled } = opts;

  const [company, setCompany] = useState<PublicCompany | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveName = useMemo(() => {
    if (providedName && providedName.trim()) return providedName.trim();
    if (typeof window === "undefined") return null;
    return deriveNameFromHost(window.location.hostname);
  }, [providedName]);

  const fetchCompany = useCallback(async () => {
    if (!effectiveName) {
      setError(
        "Nome da empresa ausente. Forneça 'name' ou acesse via subdomínio válido."
      );
      setCompany(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `/api/company/name/${encodeURIComponent(effectiveName)}`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        let message = `Erro ao buscar empresa: ${res.status}`;
        try {
          const data = await res.json();
          message = data?.error || message;
        } catch {}
        throw new Error(message);
      }
      const data: PublicCompany = await res.json();
      setCompany(data);
    } catch (e) {
      setCompany(null);
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [effectiveName]);

  useEffect(() => {
    if (disabled) return;
    // Avoid running on SSR when name needs host
    if (providedName || typeof window !== "undefined") {
      void fetchCompany();
    }
  }, [fetchCompany, providedName, disabled]);

  return {
    company,
    loading,
    error,
    refetch: fetchCompany,
    name: effectiveName,
  } as const;
}
