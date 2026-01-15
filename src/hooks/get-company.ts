import { useEffect, useState, useCallback, useRef } from "react";
import { Company } from "../../types/company";

export const useGetCompany = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const getCacheKey = () => {
    if (typeof window === "undefined") return null;
    const host = window.location.hostname || "default";
    return `company_cache:${host}`;
  };

  const readCachedCompany = () => {
    const key = getCacheKey();
    if (!key) return null;
    try {
      const raw = window.sessionStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as Company;
    } catch {
      return null;
    }
  };

  const writeCachedCompany = (data: Company) => {
    const key = getCacheKey();
    if (!key) return;
    try {
      window.sessionStorage.setItem(key, JSON.stringify(data));
    } catch {}
  };

  const fetchCompany = useCallback(async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/company", { cache: "no-store" });
      if (!res.ok) throw new Error(`Erro ao buscar empresa: ${res.status}`);

      const data: Company = await res.json();
      setCompany(data);
      writeCachedCompany(data);
    } catch (e) {
      const cached = readCachedCompany();
      if (cached) {
        setCompany(cached);
      } else {
        setCompany(null);
      }
      setError(e instanceof Error ? e.message : "Erro desconhecido");
      hasFetched.current = false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const refetch = useCallback(() => {
    hasFetched.current = false;
    return fetchCompany();
  }, [fetchCompany]);

  return { company, loading, error, refetch };
};
