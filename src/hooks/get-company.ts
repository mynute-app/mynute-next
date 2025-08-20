import { useEffect, useState } from "react";
import { Company } from "../../types/company";

export const useGetCompany = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompany = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const refetch = () => fetchCompany();

  return { company, loading, error, refetch };
};
