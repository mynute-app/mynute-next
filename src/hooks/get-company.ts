import { useEffect, useState } from "react";

export const useCompany = (id?: string) => {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const endpoint = id ? `/api/company/${id}` : `/api/company`;
        const response = await fetch(endpoint);
        const data = await response.json();
        setCompany(data);
      } catch (error) {
        console.error("Erro ao buscar dados da empresa:", error);
        setCompany({});
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [id]);

  return { company, loading };
};
