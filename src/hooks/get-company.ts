import { useEffect, useState, useCallback } from "react";
import { Company } from "../../types/company";

let companyCache: Company | null = null;
let companyPromise: Promise<Company> | null = null;

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

const hydrateCompanyCache = () => {
  if (companyCache) return companyCache;
  const cached = readCachedCompany();
  if (cached) {
    companyCache = cached;
  }
  return companyCache;
};

const fetchCompanyOnce = (force = false) => {
  if (!force) {
    const cached = hydrateCompanyCache();
    if (cached) return Promise.resolve(cached);
    if (companyPromise) return companyPromise;
  }

  if (companyPromise) return companyPromise;

  companyCache = null;
  companyPromise = fetch("/api/company", { cache: "no-store" })
    .then(async res => {
      if (!res.ok) {
        throw new Error(`Erro ao buscar empresa: ${res.status}`);
      }
      const data: Company = await res.json();
      companyCache = data;
      writeCachedCompany(data);
      return data;
    })
    .finally(() => {
      companyPromise = null;
    });

  return companyPromise;
};

export const useGetCompany = () => {
  const [company, setCompany] = useState<Company | null>(() => companyCache);
  const [loading, setLoading] = useState<boolean>(() => !companyCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const cached = hydrateCompanyCache();
    if (cached && active) {
      setCompany(cached);
      setLoading(false);
      setError(null);
    }

    fetchCompanyOnce(true)
      .then(data => {
        if (!active) return;
        setCompany(data);
        setError(null);
      })
      .catch(e => {
        if (!active) return;
        const cached = hydrateCompanyCache();
        setCompany(cached ?? null);
        setError(e instanceof Error ? e.message : "Erro desconhecido");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCompanyOnce(true);
      setCompany(data);
      return data;
    } catch (e) {
      const cached = hydrateCompanyCache();
      setCompany(cached ?? null);
      setError(e instanceof Error ? e.message : "Erro desconhecido");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { company, loading, error, refetch };
};
