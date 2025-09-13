import { useEffect, useState, useCallback, useRef } from "react";
import { Company } from "../../types/company";

export const useGetCompany = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const fetchCompany = useCallback(async () => {
    // Evita múltiplas chamadas simultâneas
    if (hasFetched.current) return;
    hasFetched.current = true;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/company", { cache: "no-store" });
      if (!res.ok) throw new Error(`Erro ao buscar empresa: ${res.status}`);

      const data: Company = await res.json();
      setCompany(data);
    } catch (e) {
      setCompany(null);
      setError(e instanceof Error ? e.message : "Erro desconhecido");
      hasFetched.current = false; // Permite tentar novamente em caso de erro
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
