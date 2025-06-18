import { useEffect, useState } from "react";
import { Company } from "../../types/company";

export const useGetCompany = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/company`);

        if (!response.ok) {
          throw new Error(`Erro ao buscar empresa: ${response.status}`);
        }

        const data: Company = await response.json();
        console.log("🏢 Dados da empresa carregados:", data);

        setCompany(data);
      } catch (err) {
        console.error("❌ Erro ao buscar dados da empresa:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  return { company, loading, error };
};
