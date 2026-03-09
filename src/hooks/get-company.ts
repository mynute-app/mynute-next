import { useEffect, useState, useCallback } from "react";
import { Company } from "../../types/company";
import { extractTenantSlugFromPathname } from "@/lib/tenant";

let companyCache: Company | null = null;
let companyPromise: Promise<Company> | null = null;
let companyCacheTimestamp: number | null = null;
const COMPANY_CACHE_TTL_MS = 60 * 1000;

const getCacheKey = () => {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname || "default";
  const tenant = extractTenantSlugFromPathname(window.location.pathname);
  return tenant ? `company_cache:${host}:${tenant}` : `company_cache:${host}`;
};

type StoredCompanyCache = {
  data: Company;
  ts: number;
};

const readCachedCompany = () => {
  const key = getCacheKey();
  if (!key) return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredCompanyCache | Company;
    if (parsed && "data" in parsed && "ts" in parsed) {
      return parsed;
    }
    return { data: parsed as Company, ts: 0 };
  } catch {
    return null;
  }
};

const writeCachedCompany = (data: Company) => {
  const key = getCacheKey();
  if (!key) return;
  try {
    const payload: StoredCompanyCache = {
      data,
      ts: Date.now(),
    };
    window.sessionStorage.setItem(key, JSON.stringify(payload));
  } catch {}
};

const hydrateCompanyCache = () => {
  if (companyCache) return companyCache;
  const cached = readCachedCompany();
  if (cached) {
    companyCache = cached.data;
    companyCacheTimestamp = cached.ts;
  }
  return companyCache;
};

const isCompanyCacheFresh = () => {
  if (!companyCache || !companyCacheTimestamp) return false;
  return Date.now() - companyCacheTimestamp < COMPANY_CACHE_TTL_MS;
};

const fetchCompanyOnce = (force = false) => {
  if (!force) {
    const cached = hydrateCompanyCache();
    if (cached && isCompanyCacheFresh()) return Promise.resolve(cached);
    if (companyPromise) return companyPromise;
  }

  if (companyPromise) return companyPromise;

  companyPromise = fetch("/api/company", { cache: "no-store" })
    .then(async res => {
      if (!res.ok) {
        throw new Error(`Erro ao buscar empresa: ${res.status}`);
      }
      const data: Company = await res.json();
      companyCache = data;
      companyCacheTimestamp = Date.now();
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

    const shouldFetch = !cached || !isCompanyCacheFresh();
    if (!shouldFetch) {
      return () => {
        active = false;
      };
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
